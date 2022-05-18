import { Message } from "../hooks/useChat";

const SHARE_URL = "https://dream.deeppavlov.ai/shared";

export interface SharedMessage {
  /**
   * Not utternace IDs, but the index indicating the message's place in the
   * dialog, starting from 0.
   */
  idx: number;

  /**
   * Nested list of character ranges to be blurred out. Not supported yet.
   * @ignore
   */
  blur?: [number, number][];
}

interface ShareParams extends Record<string, string> {
  /**
   * Dialog ID
   */
  d: string;

  /**
   * Utterance indices
   */
  m: string;
}

/**
 * Takes a list of indices or index ranges, extracts the longest possible
 * consecutive ranges and returns them as strings in the format "start-end".
 * All ranges are inclusive on both ends.
 */
const extractRanges = (indices: number[] | [number, number][]) => {
  const sortedIdxs = Array.isArray(indices[0])
    ? [...(indices as [number, number][])].sort(([a, _], [b, __]) => a - b)
    : [...indices].sort();
  let rangeStart = Array.isArray(sortedIdxs[0])
      ? sortedIdxs[0][0]
      : sortedIdxs[0],
    rangeEnd = -2;
  const ranges: string[] = [];
  sortedIdxs.forEach((idx, isNotFirst) => {
    const [start, end] = Array.isArray(idx) ? idx : [idx, idx];
    if (isNotFirst && idx > rangeEnd + 1) {
      ranges.push(
        `${rangeStart}${rangeStart === rangeEnd ? "" : "-" + rangeEnd}`
      );
      rangeStart = start;
    }
    rangeEnd = end;
  });
  ranges.push(`${rangeStart}${rangeStart === rangeEnd ? "" : "-" + rangeEnd}`);
  return ranges;
};

/**
 * Get the permalink for sharing the selected messages from a dialog.
 * All ranges are **inclusive on both sides**.
 *
 * @param dialogId Dialog ID
 * @param shareMessages
 * List of utterances (messages) to share. The `idx`s are not utternace IDs,
 * just the index indicating the message's place in the dialog, starting from 0.
 * @returns URL
 */
export const getShareUrl = (
  dialogId: string,
  shareMessages: SharedMessage[]
) => {
  const params: ShareParams = {
    d: dialogId,
    m: extractRanges(shareMessages.map((m) => m.idx)).join("."),
  };

  return SHARE_URL + "?" + new URLSearchParams(params).toString();
};
