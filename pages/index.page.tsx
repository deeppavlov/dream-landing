import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  FC,
} from "react";
import ReactTextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";
import cn from "classnames";

import useChat from "../hooks/useChat";
import styles from "./chat.module.css";
import Sidebar from "../components/Sidebar";
import StarsRating from "../components/StarsRating";
import FeedbackPopup from "../components/FeedbackPopup";
import DisclaimerPopup from "../components/DisclaimerPopup";
import { usePopup } from "../components/Popup";
import { ReactionsPopup } from "../components/MessageReaction";
import { Icon } from "@iconify/react";
import { withGa } from "../utils/analytics";
import ActionBtn from "../components/ActionBtn";
import { getShareUrl } from "../utils/shareUrl";
import SharePopup from "../components/SharePopup";
import MessageHistory from "../components/MessageHistory";
import useOnSmallerScreen from "../hooks/useOnSmallerScreen";

const BubbleClass = "chatbubble";
const MsgScrollContClass = "chatscroll";
const getVisibleBubbles = () => {
  const cont = document.querySelector<HTMLDivElement>(
    "." + MsgScrollContClass
  )!;
  const bubbles = document.querySelectorAll<HTMLDivElement>("." + BubbleClass);
  const { offsetHeight, scrollTop } = cont;
  const scrollBottom = scrollTop + offsetHeight;
  const visible: number[] = [];
  bubbles.forEach((bubble) => {
    const midY = bubble.offsetTop + bubble.offsetHeight / 2;
    if (midY > scrollTop && midY < scrollBottom) {
      const idx = parseInt(bubble.dataset.idx!);
      visible.push(idx);
    }
  });
  return visible;
};

const SendBtn: FC<{
  onClick?: () => void;
  btnHeight?: number | null;
  disabled?: boolean;
}> = ({ onClick, btnHeight, disabled }) => {
  const isMobile = useOnSmallerScreen({ width: 500 });

  return (
    <button
      onClick={onClick}
      style={btnHeight ? { height: `${btnHeight}px` } : undefined}
      disabled={disabled}
    >
      {isMobile ? <Icon icon="fa-solid:play" /> : "Send"}
    </button>
  );
};

const Page: FC = () => {
  const {
    messages,
    loading,
    error,
    sendMsg,
    reset,
    setRating,
    rating,
    userId,
    dialogId,
    setMsgReaction,
  } = useChat();

  // When it becomes available, set the userId on the tracker
  useEffect(() => {
    if (!userId) return;
    gtag("set", { user_id: userId });
    gtag("event", "login");
  }, [userId]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [btnHeight, setBtnHeight] = useState<undefined | number>();
  const onInputHeightChange: TextareaAutosizeProps["onHeightChange"] = (
    height,
    meta
  ) => {
    if (btnHeight === undefined) {
      // Fix the send button's height to the input's first height
      setBtnHeight(inputRef.current?.offsetHeight);
      // Force focus hack
      inputRef.current?.focus();
    }
  };

  const [msgDraft, setMsgDraft] = useState("");
  const onClickSend = useCallback(() => {
    gtag("event", "sent message", { event_category: "Messages" });
    !loading &&
      msgDraft.replace(/\W/gi, "") !== "" &&
      (sendMsg(msgDraft), setMsgDraft(""), inputRef.current?.focus());
  }, [loading, msgDraft, sendMsg]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectingMode, setSelectingMode] = useState(false);
  const [selectedMessages, setSelectedMsgs] = useState<number[]>([]);
  useEffect(() => {
    if (selectingMode) {
      setSidebarOpen(false);
      setSelectedMsgs([]);
    }
  }, [selectingMode]);
  const onSelectMessage = (msg: number) => {
    if (!selectingMode) return;
    setSelectedMsgs((selected) => {
      const idx = selected.indexOf(msg);
      if (idx === -1) return [...selected, msg];
      return [...selected.slice(0, idx), ...selected.slice(idx + 1)];
    });
  };

  const { show } = usePopup();
  const shareDialog = (shared: number[]) => {
    if (!dialogId || shared.length === 0) return;
    const url = getShareUrl(
      dialogId,
      shared.map((idx) => ({ idx })),
      window.location.hostname
    );
    gtag("event", "shared dialog", {
      event_category: "Panel",
      event_label: url,
    });
    show("share", url);
  };

  return (
    <div className={`page ${styles["chat-page"]}`}>
      <div className={styles["top-bar"]}>
        <div
          className={styles["hamburger"]}
          onClick={withGa("Panel", "pressed hamburger", () =>
            setSidebarOpen((open) => !open)
          )}
        >
          <Icon icon="fa6-solid:bars" />
        </div>

        <StarsRating
          rating={rating}
          setRating={withGa("Topbar", "pressed star", setRating)}
          animate={
            rating === -1 && messages.length % 10 === 0 && messages.length !== 0
          }
          canRate={!!dialogId}
          showFeedbackLink
          compactOnMobile
        />
      </div>

      <FeedbackPopup
        userId={userId}
        dialogId={dialogId}
        rating={rating}
        setRating={setRating}
      />
      <DisclaimerPopup onDisagree={reset} />
      <ReactionsPopup onReact={setMsgReaction} />
      <SharePopup />

      <div className={styles["content"]}>
        <div className={styles["sidebar-holder"]}>
          <Sidebar
            open={sidebarOpen}
            disableShare={!dialogId || selectingMode}
            onClose={() => setSidebarOpen(false)}
            onShareVisible={() => (
              setSidebarOpen(false), shareDialog(getVisibleBubbles())
            )}
            onStartSelect={() => setSelectingMode(true)}
            onReset={() => (
              setSidebarOpen(false), setSelectingMode(false), reset()
            )}
          />
        </div>

        <div className={styles["chat-cont"]}>
          {error && <div style={{ color: "red" }}>{error}</div>}

          <div
            className={styles["messages-cont"]}
            style={{ userSelect: selectingMode ? "none" : "initial" }}
          >
            {selectingMode && (
              <div
                className={cn(
                  styles["floating-btn"],
                  messages[messages.length - 1].sender === "bot" &&
                    styles["floating-right"]
                )}
              >
                <ActionBtn
                  icon="fa6-solid:camera"
                  disabled={selectedMessages.length === 0}
                  onClick={() => (
                    setSelectingMode(false), shareDialog(selectedMessages)
                  )}
                >
                  Share selected
                </ActionBtn>

                {selectedMessages.length === 0 ? (
                  <ActionBtn
                    icon="fa6-solid:square-check"
                    onClick={() => setSelectedMsgs(messages.map((_, i) => i))}
                  >
                    Select all
                  </ActionBtn>
                ) : (
                  <ActionBtn
                    icon="fa6-regular:square"
                    onClick={() => setSelectedMsgs([])}
                  >
                    Deselect all
                  </ActionBtn>
                )}
                <ActionBtn
                  icon="fa-solid:ban"
                  onClick={() => setSelectingMode(false)}
                >
                  Cancel
                </ActionBtn>
              </div>
            )}

            <MessageHistory
              bubbleClassname={BubbleClass}
              wrapperClassname={MsgScrollContClass}
              {...{
                loading,
                messages,
                onSelectMessage,
                selectedMessages,
                selectingMode,
                setMsgReaction,
              }}
            />

            {/* <DisclaimerHover
                showBig={showBigDisclaimer}
                onOk={() => setBigDisclaimer(false)}
              /> */}
          </div>
          <div className={styles["input-cont"]}>
            <ReactTextareaAutosize
              ref={inputRef}
              onHeightChange={onInputHeightChange}
              minRows={1}
              maxRows={5}
              className={styles["input-area"]}
              placeholder="Type your message here..."
              value={msgDraft}
              onInput={(ev) => (
                setMsgDraft((ev.target as HTMLTextAreaElement).value), true
              )}
              onKeyDown={(ev) =>
                ev.key === "Enter" &&
                !ev.shiftKey &&
                (onClickSend(), ev.preventDefault())
              }
              disabled={!!error || selectingMode}
            />

            <SendBtn
              onClick={onClickSend}
              btnHeight={btnHeight}
              disabled={msgDraft.replace(/\W/gi, "") === "" || selectingMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Page as Chat };
