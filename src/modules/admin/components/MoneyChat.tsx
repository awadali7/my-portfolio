import { useRouter } from 'next/router';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { FiMessageSquare, FiRotateCcw, FiSend, FiX } from 'react-icons/fi';

import { formatRupees, toCycle } from '@/common/helpers/emi';

type ProposalKind =
  | 'expense'
  | 'income'
  | 'emi'
  | 'borrowing'
  | 'clarify'
  | 'unknown';

type Proposal = {
  kind: ProposalKind;
  reply: string;
  fields: Record<string, unknown> | null;
  missing: string[];
};

type Bubble = {
  from: 'bot' | 'you';
  text: string;
  /** Attached to a bot bubble when it is proposing a record. */
  proposal?: Proposal;
};

/** Where a confirmed proposal gets written, and the body each endpoint wants. */
const SUBMIT: Record<
  string,
  { url: string; toBody: (f: Record<string, unknown>) => unknown }
> = {
  expense: {
    url: '/api/admin/expenses',
    toBody: (f) => ({
      label: f.label,
      amount: f.amount,
      cycle: f.cycle,
      category: f.category ?? null,
      notes: null,
    }),
  },
  income: {
    url: '/api/admin/income',
    toBody: (f) => ({ label: f.label, amount: f.amount, cycle: f.cycle }),
  },
  emi: {
    url: '/api/admin/emis',
    toBody: (f) => ({
      name: f.name,
      category: f.category ?? 'Uncategorised',
      type: f.type ?? 'emi',
      amount: f.amount,
      dueDay: f.dueDay ?? null,
      endOfMonth: false,
      installmentsPaid: null,
      installmentsTotal: null,
      installmentsLeft: null,
      startCycle: null,
      lastPaidCycle: null,
      archived: false,
    }),
  },
  borrowing: {
    url: '/api/admin/borrowings',
    toBody: (f) => ({
      lender: f.lender,
      amount: f.amount,
      startDate: f.startDate,
      dueDate: f.dueDate,
      notes: null,
    }),
  },
};

const MENU: { kind: string; label: string }[] = [
  { kind: 'emi', label: 'EMI' },
  { kind: 'borrowing', label: 'Borrow' },
  { kind: 'income', label: 'Income' },
  { kind: 'expense', label: 'Expense' },
];

const GREETING: Bubble = {
  from: 'bot',
  text: 'Elloo Kuttappi inn entha oppicheee?',
};

/** Human summary of a proposal, so the operator confirms real values. */
const describe = (proposal: Proposal): string | null => {
  const f = proposal.fields;
  if (!f) return null;
  const amount =
    typeof f.amount === 'number' ? formatRupees(f.amount) : String(f.amount);

  switch (proposal.kind) {
    case 'expense':
      return `${amount} · ${f.label} · ${f.category ?? 'Uncategorised'} · ${f.cycle}`;
    case 'income':
      return `${amount} · ${f.label} · ${f.cycle ? f.cycle : 'every month'}`;
    case 'emi':
      return `${amount} · ${f.name} · ${f.category ?? '—'} · day ${f.dueDay ?? '—'}`;
    case 'borrowing':
      return `${amount} from ${f.lender} · ${f.startDate} → ${f.dueDate}`;
    default:
      return null;
  }
};

const MoneyChat = ({ cycle }: { cycle?: string }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([GREETING]);
  const [draft, setDraft] = useState('');
  const [pickedKind, setPickedKind] = useState<string | undefined>();
  const [isBusy, setIsBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Hidden entirely when the server has no Azure key, rather than offering a
  // button that can only fail.
  useEffect(() => {
    fetch('/api/admin/assistant/status')
      .then((r) => (r.ok ? r.json() : { configured: false }))
      .then((d) => setIsEnabled(Boolean(d.configured)))
      .catch(() => setIsEnabled(false));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [bubbles, isOpen]);

  const say = (bubble: Bubble) => setBubbles((prev) => [...prev, bubble]);

  const clearChat = () => {
    setBubbles([GREETING]);
    setPickedKind(undefined);
    setDraft('');
  };

  const send = async (text: string, kind?: string) => {
    say({ from: 'you', text });
    setDraft('');
    setIsBusy(true);
    try {
      const response = await fetch('/api/admin/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: text,
          cycle: cycle ?? toCycle(),
          kind: kind ?? pickedKind,
        }),
      });
      // The menu pick steers one message, then clears. Leaving it set meant a
      // wrong tap forced every later message into that kind with no way out.
      setPickedKind(undefined);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        say({
          from: 'bot',
          text:
            response.status === 503
              ? 'The assistant is not switched on for this server yet.'
              : body.message || 'Something went wrong.',
        });
        return;
      }
      const proposal = (await response.json()) as Proposal;
      say({
        from: 'bot',
        text: proposal.reply,
        proposal: proposal.fields ? proposal : undefined,
      });
    } catch {
      say({ from: 'bot', text: 'Could not reach the assistant.' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || isBusy) return;
    void send(draft.trim());
  };

  const confirm = async (proposal: Proposal) => {
    const target = SUBMIT[proposal.kind];
    if (!target || !proposal.fields) return;

    setIsBusy(true);
    try {
      const response = await fetch(target.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(target.toBody(proposal.fields)),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        say({ from: 'bot', text: body.message || 'Could not save that.' });
        return;
      }
      say({ from: 'bot', text: 'Saved. Anything else?' });
      setPickedKind(undefined);
      // Re-run getServerSideProps so the page behind the chat reflects the new row.
      await router.replace(router.asPath, undefined, { scroll: false });
    } catch {
      say({ from: 'bot', text: 'Could not save that.' });
    } finally {
      setIsBusy(false);
    }
  };

  if (isEnabled === false) return null;

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
        className='fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 text-neutral-50 shadow-lg transition-transform hover:scale-105 dark:bg-neutral-100 dark:text-neutral-900'
      >
        {isOpen ? <FiX size={18} /> : <FiMessageSquare size={18} />}
      </button>

      {isOpen && (
        <div className='fixed bottom-20 right-5 z-40 flex h-[26rem] w-[21rem] flex-col rounded-xl border border-neutral-300 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900'>
          <div className='flex items-start justify-between gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800'>
            <div>
              <p className='text-sm font-medium'>Assistant</p>
            </div>
            <button
              type='button'
              onClick={clearChat}
              disabled={isBusy || bubbles.length === 1}
              title='Start over'
              className='flex shrink-0 items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800'
            >
              <FiRotateCcw size={12} /> Clear
            </button>
          </div>

          <div className='flex-1 space-y-3 overflow-y-auto px-4 py-3'>
            {bubbles.map((bubble, index) => (
              <div
                key={index}
                className={bubble.from === 'you' ? 'text-right' : ''}
              >
                <span
                  className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-left text-sm ${
                    bubble.from === 'you'
                      ? 'bg-neutral-800 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900'
                      : 'bg-neutral-100 dark:bg-neutral-800'
                  }`}
                >
                  {bubble.text}
                </span>

                {bubble.proposal && (
                  <div className='mt-2 rounded-lg border border-neutral-300 p-2.5 text-left dark:border-neutral-700'>
                    <p className='text-xs text-neutral-500'>
                      {bubble.proposal.kind}
                    </p>
                    <p className='mt-0.5 text-sm'>
                      {describe(bubble.proposal)}
                    </p>
                    {bubble.proposal.missing.length > 0 && (
                      <p className='mt-1 text-xs text-amber-600 dark:text-amber-400'>
                        Still needs: {bubble.proposal.missing.join(', ')}
                      </p>
                    )}
                    <button
                      type='button'
                      onClick={() => confirm(bubble.proposal as Proposal)}
                      disabled={isBusy || bubble.proposal.missing.length > 0}
                      className='mt-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50'
                    >
                      Save it
                    </button>
                  </div>
                )}
              </div>
            ))}

            {bubbles.length === 1 && (
              <div className='flex flex-wrap gap-2'>
                {MENU.map((item) => (
                  <button
                    key={item.kind}
                    type='button'
                    onClick={() => {
                      setPickedKind(item.kind);
                      say({ from: 'you', text: item.label });
                      say({
                        from: 'bot',
                        text:
                          item.kind === 'borrowing'
                            ? 'Who from, how much, and when is it due?'
                            : item.kind === 'emi'
                              ? 'What is it, how much a month, and which day is it due?'
                              : `What was it and how much?`,
                      });
                    }}
                    className='rounded-full border border-neutral-300 px-3 py-1 text-xs transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {pickedKind && (
              <p className='flex items-center gap-2 text-xs text-neutral-500'>
                Next message read as <strong>{pickedKind}</strong>
                <button
                  type='button'
                  onClick={() => setPickedKind(undefined)}
                  className='underline underline-offset-2'
                >
                  clear
                </button>
              </p>
            )}

            {isBusy && <p className='text-xs text-neutral-500'>Thinking…</p>}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className='flex gap-2 border-t border-neutral-200 p-3 dark:border-neutral-800'
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder=':-)'
              className='min-w-0 flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700'
            />
            <button
              type='submit'
              disabled={isBusy || !draft.trim()}
              aria-label='Send'
              className='rounded-lg bg-neutral-800 px-3 text-neutral-50 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900'
            >
              <FiSend size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default MoneyChat;
