import { Message } from "../hooks/useChat";
import { getShareUrl, SharedMessage } from "./shareUrl";

describe("getShareUrl", () => {
  const msg = (idx: number): SharedMessage => ({
    idx,
  });
  const msgs = (start: number = 0, length: number = 1) =>
    Array.from({ length }).map((_, idx) => msg(start + idx));

  it("prepends correct url", () => {
    const url = getShareUrl("dialogId", msgs());
    expect(url.startsWith("https://dream.deeppavlov.ai/shared?")).toBeTruthy();
  });

  it("includes dialog id", () => {
    const url = getShareUrl("dialogId", msgs());
    expect(url).toContain("d=dialogId");
  });

  it("shortens consecutive ranges", () => {
    const url = getShareUrl("dialogId", msgs(0, 3));
    expect(url).toMatch(/.*m=0\-2.*/);
  });

  it("handles multiple ranges", () => {
    const url = getShareUrl("dialogId", [...msgs(0, 3), msg(5), ...msgs(7, 3)]);
    expect(url).toMatch(/.*m=0\-2.5.7\-9.*/);
  });
});
