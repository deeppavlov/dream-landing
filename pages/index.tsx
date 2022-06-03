import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  FC,
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faPlay } from "@fortawesome/free-solid-svg-icons";
import { withGa } from "../utils/analytics";
import useOnSmallerScreen from "../hooks/useOnSmallerScreen";

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
      {isMobile ? <FontAwesomeIcon icon={faPlay} /> : "Send"}
    </button>
  );
};

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

  const chatRef = useRef<HTMLDivElement>(null);
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
      // Hack
      const avatar = document.getElementById("avatar");
      if (!avatar) return;
      avatar.style.background = "url(/logo.png)";
      avatar.style.backgroundSize = "contain";
      avatar.style.backgroundRepeat = "no-repeat";
    });
  };

  const [msgDraft, setMsgDraft] = useState("");
  const onClickSend = useCallback(() => {
    gtag("event", "sent message", { event_category: "Messages" });
    !loading &&
      msgDraft.replace(/\W/gi, "") !== "" &&
      (sendMsg(msgDraft), setMsgDraft(""), inputRef.current?.focus());
  }, [loading, msgDraft, sendMsg]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PopupProvider>
      <div className={`page ${styles["chat-page"]}`}>
        <div className={styles["top-bar"]}>
          <div
            className={styles["hamburger"]}
            onClick={withGa("Panel", "pressed hamburger", () =>
              setSidebarOpen((open) => !open)
            )}
          >
            <FontAwesomeIcon icon={faBars} />
          </div>

          <StarsRating
            rating={rating}
            setRating={withGa("Topbar", "pressed star", setRating)}
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
        <DisclaimerPopup onDisagree={reset} />
        <ReactionsPopup onReact={setMsgReaction} />

        <div className={styles["content"]}>
          <div className={styles["sidebar-holder"]}>
            <Sidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onScreenshot={withGa(
                "Panel",
                "pressed screenshot",
                `${messages.slice(-1)?.[0]?.utteranceId ?? ""}`,
                getChatPic
              )}
              onReset={() => (setSidebarOpen(false), reset())}
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
                disabled={!!error}
              />

              <SendBtn
                onClick={onClickSend}
                btnHeight={btnHeight}
                disabled={msgDraft.replace(/\W/gi, "") === ""}
              />
            </div>
          </div>
        </div>
      </div>
    </PopupProvider>
  );
};

export default Chat;
