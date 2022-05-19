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

export interface ShareParams extends Record<string, string> {
  /**
   * Dialog ID
   */
  d: string;

  /**
   * Utterance indices
   */
  m: string;
}

interface ApiResponse {
  utterances: {
    utt_id: string;
    text: string;
    user: {
      user_type: "human" | "bot";
    };
  }[];
}

const API_URL = "https://7019.deeppavlov.ai/api/dialogs/";

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

const expandRange = (range: string) => {
  const [startStr, endStr = null] = range.split("-");
  const start = parseInt(startStr);
  if (endStr === null) return start;
  const end = parseInt(endStr);
  return Array.from({ length: end - start + 1 }).map((_, idx) => idx + start);
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

/**
 * Parse URL params created with {@link getShareUrl}.
 * @returns params Object with parsed parameters.
 * @returns params.dialogId The dialog ID
 * @returns params.messageIdxs
 * List of message indices to show. `null`s are inserted where messages are skipped.
 */
export const parseShareUrl = (params: ShareParams) => {
  const idxsWithEllipsis: (number | null)[] = [];
  const idxs = params.m.split(".").flatMap(expandRange).sort();
  let prevIdx = idxs[0];
  idxs.forEach((idx) => {
    if (idx > prevIdx + 1) idxsWithEllipsis.push(null);
    prevIdx = idx;
    idxsWithEllipsis.push(idx);
  });
  return {
    dialogId: params.d,
    messageIdxs: idxsWithEllipsis,
  };
};

/**
 * Parse and fetch the shared message history from the URL parameters.
 */
export const fetchSharedMessages = async (
  params: ShareParams
): Promise<Message[]> => {
  const { dialogId, messageIdxs } = parseShareUrl(params);
  const resp = await fetch(API_URL + dialogId);
  const { utterances }: ApiResponse = await resp.json();
  const messages: Message[] = utterances
    .map(({ text, user, utt_id }) => ({
      type: "text" as "text",
      sender: (user.user_type === "human" ? "user" : "bot") as "user" | "bot",
      content: text,
      utteranceId: utt_id,
    }))
    .filter((_, idx) => messageIdxs.includes(idx));
  return messages;
};
