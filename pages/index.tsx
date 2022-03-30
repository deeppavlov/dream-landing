import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import type { NextPage } from "next";
import ReactTextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";
import html2canvas from "html2canvas";

import useChat from "../hooks/useChat";
import styles from "./chat.module.css";
import Sidebar from "../components/Sidebar";
import MessageBubble, {
  DisclaimerBubble,
  ThinkingBubble,
} from "../components/MessageBubble";
import StarsRating from "../components/StarsRating";
import FeedbackPopup from "../components/FeedbackPopup";
import DisclaimerPopup from "../components/DisclaimerPopup";
import { PopupProvider } from "../components/Popup";
import { ReactionsPopup } from "../components/MessageReaction";
// import DisclaimerHover from "../components/DisclaimerHover";
import useStored from "../hooks/useStored";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export const TextareaAutosize = React.forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps & { onRerenderProperly?: () => void }
>(function TexareaAutosize({ onRerenderProperly, ...props }, ref) {
  const [isRerendered, setIsRerendered] = useState(false);
  useEffect(() => {
    const handler = setTimeout(() => {
      setIsRerendered(true);
    }, 50);
    return () => clearTimeout(handler);
  }, []);

  useLayoutEffect(() => {
    if (isRerendered && onRerenderProperly) onRerenderProperly();
  }, [isRerendered, onRerenderProperly]);
  return <ReactTextareaAutosize {...props} ref={ref} />;
});

const Chat: NextPage = () => {
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

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const getChatPic = () => {
    if (!chatRef.current) return;
    const watermark = document.createElement("div");
    watermark.innerHTML = "dream.deeppavlov.ai";
    watermark.classList.add(styles["watermark"]);
    html2canvas(chatRef.current, {
      onclone: (_, el) => el.appendChild(watermark),
    }).then((canvas) => {
      const imgDataUrl = canvas.toDataURL();
      const a = document.createElement("a");
      a.download = "canvas_image.png";
      a.href = imgDataUrl;
      a.click();
    });
  };

  const [showBigDisclaimer, setBigDisclaimer] = useStored<boolean>(
    "bigdisc",
    true
  );

  const [msgDraft, setMsgDraft] = useState("");
  const onClickSend = useCallback(
    () =>
      !loading &&
      msgDraft.replace(/\W/gi, "") !== "" &&
      (sendMsg(msgDraft), setMsgDraft(""), inputRef.current?.focus()),
    [loading, msgDraft, sendMsg]
  );

  // Fix the send button's height to the input's first value
  const [btnHeight, setBtnHeight] = useState<undefined | number>();
  const onInputRenderedProperly = useCallback(() => {
    if (!inputRef.current) return;
    setBtnHeight(inputRef.current.offsetHeight);
    inputRef.current?.focus();
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PopupProvider>
      <div className={`page ${styles["chat-page"]}`}>
        <div className={styles["top-bar"]}>
          <div
            className={styles["hamburger"]}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <FontAwesomeIcon icon={faBars} />
          </div>

          <StarsRating
            rating={rating}
            setRating={setRating}
            animate={
              rating === -1 &&
              messages.length % 10 === 0 &&
              messages.length !== 0
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
        <DisclaimerPopup />
        <ReactionsPopup onReact={setMsgReaction} />

        <div className={styles["content"]}>
          <div className={styles["sidebar-holder"]}>
            <Sidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onScreenshot={getChatPic}
              onReset={reset}
            ></Sidebar>
          </div>

          <div className={styles["chat-cont"]}>
            {error && <div style={{ color: "red" }}>{error}</div>}

            <div className={styles["messages-cont"]}>
              <div ref={chatRef} className={styles["messages-scroll"]}>
                <DisclaimerBubble />
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    msg={msg}
                    isNew={i === messages.length - 1 && !loading}
                    onReact={setMsgReaction}
                  />
                ))}
                {loading && <ThinkingBubble />}
              </div>

              {/* <DisclaimerHover
                showBig={showBigDisclaimer}
                onOk={() => setBigDisclaimer(false)}
              /> */}
            </div>
            <div className={styles["input-cont"]}>
              <TextareaAutosize
                onRerenderProperly={onInputRenderedProperly}
                ref={inputRef}
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
                disabled={!!error || showBigDisclaimer}
              />
              <button
                onClick={() => onClickSend()}
                style={btnHeight ? { height: `${btnHeight}px` } : undefined}
                disabled={
                  msgDraft.replace(/\W/gi, "") === "" || showBigDisclaimer
                }
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </PopupProvider>
  );
};

export default Chat;
