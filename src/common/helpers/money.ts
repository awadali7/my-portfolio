import { toCycle } from './emi';

/** Reads `?cycle=YYYY-MM` from a page query, falling back to this month. */
export const cycleFromQuery = (
  value: string | string[] | undefined,
): string => {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && /^\d{4}-(0[1-9]|1[0-2])$/.test(candidate)
    ? candidate
    : toCycle();
};
