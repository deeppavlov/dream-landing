import { Message } from "../hooks/useChat";

const SHARE_URL = "https://dream.deeppavlov.ai/shared";

export const getShareUrl = (
  messageHistory: Message[],
  sharedIdxs: number[]
) => {
  if (sharedIdxs.length === 0) return SHARE_URL;

  const getId = (idx: number) =>
    messageHistory[idx].utteranceId ??
    (messageHistory[idx + 1].utteranceId as string) + "~1";

  let lastIdx = sharedIdxs[0];
  let rangeStart = getId(lastIdx);
  let rangeEnd = rangeStart;
  const ranges: [string, string][] = [];
  sharedIdxs.slice(1).forEach((idx) => {
    const curId = getId(idx);
    if (idx !== lastIdx + 1) {
      ranges.push([rangeStart, rangeEnd]);
      rangeStart = curId;
    }
    lastIdx = idx;
    rangeEnd = curId;
  });
  ranges.push([rangeStart, rangeEnd]);

  return (
    SHARE_URL +
    "?" +
    new URLSearchParams({ uttIds: JSON.stringify(ranges) }).toString()
  );
};
