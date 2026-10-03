import { ClipboardEvent, DragEvent, useEffect, useRef, useState } from 'react';
import { FiImage } from 'react-icons/fi';

import {
  IMAGE_ALT_PLACEHOLDER,
  insertAtSelection,
} from '@/common/helpers/blog';
import {
  ACCEPTED_IMAGE_TYPES,
  uploadImageFile,
} from '@/common/libs/blog-image-upload';
import cn from '@/common/libs/cn';
import ArticleBody from '@/modules/blog/components/ArticleBody';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
};

const NUMBER = new Intl.NumberFormat('en-US');

const imageFiles = (files: FileList | null | undefined) =>
  Array.from(files ?? []).filter((file) => file.type.startsWith('image/'));

/**
 * A plain textarea with a preview tab. Plain on purpose: it works the same on
 * a phone inside the installed app, and the preview uses the public page's
 * renderer, so what you see is what readers get.
 *
 * Images can be added with the Image button, or pasted or dropped into the
 * text. Each is uploaded to the server and inserted where the cursor was, as
 * its own paragraph, with the alt text selected so it can be typed over.
 */
const MarkdownEditor = ({
  value,
  onChange,
  maxLength,
}: MarkdownEditorProps) => {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Uploads finish after typing may have moved on, so they read the latest text.
  const valueRef = useRef(value);
  const pendingSelection = useRef<[number, number] | null>(null);

  useEffect(() => {
    valueRef.current = value;
    const selection = pendingSelection.current;
    const textarea = textareaRef.current;
    // Used once, even when the Preview tab is showing, so a later keystroke
    // never jumps the cursor back to an old image.
    pendingSelection.current = null;
    if (selection && textarea) {
      textarea.focus();
      textarea.setSelectionRange(selection[0], selection[1]);
    }
  }, [value]);

  const insertImages = async (files: File[], at: number) => {
    if (files.length === 0) return;
    setUploadError(null);
    let position = at;

    // One at a time, so several images land in the order they were chosen.
    for (const file of files) {
      setUploading((count) => count + 1);
      try {
        const { url } = await uploadImageFile(file);
        const inserted = insertAtSelection(
          valueRef.current,
          position,
          position,
          `![${IMAGE_ALT_PLACEHOLDER}](${url})`,
          { block: true },
        );
        const altStart = inserted.insertStart + 2;
        pendingSelection.current = [
          altStart,
          altStart + IMAGE_ALT_PLACEHOLDER.length,
        ];
        valueRef.current = inserted.value;
        onChange(inserted.value);
        position = inserted.insertEnd;
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : 'The upload failed',
        );
      } finally {
        setUploading((count) => count - 1);
      }
    }
  };

  const cursor = () =>
    textareaRef.current?.selectionStart ?? valueRef.current.length;

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = imageFiles(event.clipboardData.files);
    if (files.length === 0) return;
    event.preventDefault();
    void insertImages(files, event.currentTarget.selectionStart);
  };

  const handleDrop = (event: DragEvent<HTMLTextAreaElement>) => {
    const files = imageFiles(event.dataTransfer.files);
    if (files.length === 0) return;
    event.preventDefault();
    void insertImages(files, event.currentTarget.selectionStart);
  };

  return (
    <div className='overflow-hidden rounded-xl border border-neutral-300 dark:border-neutral-700'>
      <div className='flex items-center justify-between gap-2 border-b border-neutral-200 px-2 dark:border-neutral-800'>
        <div role='tablist' aria-label='Post body' className='flex'>
          {(['write', 'preview'] as const).map((key) => (
            <button
              key={key}
              type='button'
              role='tab'
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                'border-b-2 px-3 py-2 text-sm transition-colors',
                tab === key
                  ? 'border-neutral-800 font-medium text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200',
              )}
            >
              {key === 'write' ? 'Write' : 'Preview'}
            </button>
          ))}
        </div>
        <div className='flex items-center gap-3'>
          {tab === 'write' && (
            <>
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading > 0}
                className='flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-60 dark:text-neutral-300 dark:hover:bg-neutral-800'
              >
                <FiImage size={14} aria-hidden='true' />
                {uploading > 0 ? 'Uploading…' : 'Image'}
              </button>
              <input
                ref={fileInputRef}
                type='file'
                accept={ACCEPTED_IMAGE_TYPES}
                multiple
                hidden
                onChange={(event) => {
                  const files = imageFiles(event.target.files);
                  event.target.value = '';
                  void insertImages(files, cursor());
                }}
              />
            </>
          )}
          <span className='text-xs tabular-nums text-neutral-500'>
            {NUMBER.format(value.length)} / {NUMBER.format(maxLength)}
          </span>
        </div>
      </div>

      {tab === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onPaste={handlePaste}
          onDrop={handleDrop}
          maxLength={maxLength}
          rows={24}
          aria-label='Post body in markdown'
          placeholder='Write in markdown. Each ## heading becomes an entry in the table of contents. Paste or drop an image to upload it.'
          className='block w-full resize-y bg-transparent p-4 font-mono text-sm leading-6 outline-none'
        />
      ) : (
        <div className='max-h-screen overflow-y-auto p-4 sm:p-6'>
          {value.trim() ? (
            <ArticleBody content={value} />
          ) : (
            <p className='text-sm text-neutral-500'>Nothing to preview yet.</p>
          )}
        </div>
      )}

      <div className='border-t border-neutral-200 px-4 py-2 text-xs leading-relaxed dark:border-neutral-800'>
        {uploading > 0 && (
          <p role='status' className='text-neutral-600 dark:text-neutral-300'>
            {uploading === 1
              ? 'Uploading image…'
              : `Uploading ${uploading} images…`}
          </p>
        )}
        {uploadError && (
          <p role='alert' className='text-red-500'>
            {uploadError}
          </p>
        )}
        <p className='text-neutral-500'>
          ## section · ### subsection · **bold** · `code` · ```ts for a code
          block · Image button, paste or drop to add a picture
        </p>
      </div>
    </div>
  );
};

export default MarkdownEditor;
