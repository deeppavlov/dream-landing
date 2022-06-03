import { UIEvent } from "react";

/**
 * Log all calls to the wrapped function to GA.
 */
export function withGa<T extends (...args: any) => any>(
  eventCategory: string,
  eventAction: string,
  eventLabel: string,
  func?: T
): (...args: Parameters<T>) => void;
export function withGa<T extends (...args: any) => any>(
  eventCategory: string,
  eventAction: string,
  func?: T
): (...args: Parameters<T>) => void;
export function withGa<T extends (...args: any) => any>(
  eventCategory: string,
  eventAction: string,
  funcOrLabel?: T | string,
  funcOrUndef?: T
): (...args: Parameters<T>) => void {
  const eventLabel = typeof funcOrLabel === "string" ? funcOrLabel : undefined;
  const func = funcOrUndef ?? (funcOrLabel as () => any) ?? (() => {});
  return _withGa(eventCategory, eventAction, eventLabel, false, func);
}

/**
 * Log all calls to the wrapped function to GA.
 *
 * Function is only called after hit is sent, or, if that fails, after 150ms.
 */
export function withGaSync(
  eventCategory: string,
  eventAction: string,
  eventLabel: string,
  func: () => any
): () => void;
export function withGaSync(
  eventCategory: string,
  eventAction: string,
  func: () => any
): () => void;
export function withGaSync(
  eventCategory: string,
  eventAction: string,
  funcOrLabel: (() => any) | string,
  funcOrUndef?: () => any
): () => void {
  const eventLabel = typeof funcOrLabel === "string" ? funcOrLabel : undefined;
  const func = funcOrUndef ?? (funcOrLabel as () => any);
  return _withGa(eventCategory, eventAction, eventLabel, true, func);
}

/**
 * Log all calls to GA, then navigates to href.
 *
 * Only navigates after hit is sent, or, if that fails, after 150ms.
 */
export function withGaThenNavigate(
  eventCategory: string,
  eventAction: string,
  eventLabel: string,
  href: string
): (ev?: UIEvent) => void;
export function withGaThenNavigate(
  eventCategory: string,
  eventAction: string,
  href: string
): (ev?: UIEvent) => void;
export function withGaThenNavigate(
  eventCategory: string,
  eventAction: string,
  hrefOrLabel: string,
  hrefOrUndef?: string
): (ev?: UIEvent) => void {
  const eventLabel = typeof hrefOrUndef === "string" ? hrefOrLabel : undefined;
  const href = hrefOrUndef ?? hrefOrLabel;
  const navigate = (ev?: UIEvent) => {
    if (ev) ev.preventDefault();
    window.location.href = href;
  };
  return _withGa(eventCategory, eventAction, eventLabel, true, navigate);
}

/**
 * Log to GA and wait for hit.
 *
 * Only resolves after hit is sent, or, if that fails, after 150ms.
 */
export function gaSync(
  eventCategory: string,
  eventAction: string,
  eventLabel?: string
): Promise<void> {
  return new Promise<void>((resolve, _) => {
    _withGa(eventCategory, eventAction, eventLabel, true, resolve)();
  });
}

function _withGa<T extends (...args: any) => any>(
  eventCategory: string,
  eventAction: string,
  eventLabel: string | undefined,
  sync: boolean,
  func: T
): (...args: Parameters<T>) => void {
  const gaArgs: Record<string, any> = {
    event_category: eventCategory,
  };
  if (typeof eventLabel === "string") gaArgs.event_label = eventLabel;

  let called = false;
  const wrapped = (...fargs: Parameters<T>) => {
    if (called) return;
    called = true;
    func(...fargs);
  };
  if (sync) gaArgs.hitCallback = wrapped;

  return (...fargs: Parameters<T>) => {
    if (sync) setTimeout(() => wrapped(...fargs), 150);
    gtag("event", eventAction, gaArgs);
    if (!sync) func(...fargs);
  };
}
