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
import { PopupProvider, usePopup } from "../components/Popup";
import { ReactionsPopup } from "../components/MessageReaction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCamera } from "@fortawesome/free-solid-svg-icons";
import { withGa } from "../utils/analytics";
import ActionBtn from "../components/ActionBtn";
import { getShareUrl } from "../utils/shareUrl";
import SharePopup from "../components/SharePopup";

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
    ga((tracker) => {
      if (!tracker.get("userId")) {
        ga("set", "userId", userId);
        ga("send", "event", "authentication", "user-id available");
      }
    });
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
  // const getChatPic = () => {
  //   if (!chatRef.current) return;
  //   const watermark = document.createElement("div");
  //   watermark.innerHTML = "dream.deeppavlov.ai";
  //   watermark.classList.add(styles["watermark"]);
  //   html2canvas(chatRef.current, {
  //     onclone: (_, el) => el.appendChild(watermark),
  //   }).then((canvas) => {
  //     const imgDataUrl = canvas.toDataURL();
  //     const a = document.createElement("a");
  //     a.download = "canvas_image.png";
  //     a.href = imgDataUrl;
  //     a.click();
  //     // Hack
  //     const avatar = document.getElementById("avatar");
  //     if (!avatar) return;
  //     avatar.style.background = "url(/logo.png)";
  //     avatar.style.backgroundSize = "contain";
  //     avatar.style.backgroundRepeat = "no-repeat";
  //   });
  // };

  const [msgDraft, setMsgDraft] = useState("");
  const onClickSend = useCallback(() => {
    ga("send", "event", "Messages", "sent message");
    if (!loading && msgDraft.replace(/\W/gi, "") !== "") {
      setSelectingMode(false);
      sendMsg(msgDraft);
      setMsgDraft("");
      inputRef.current?.focus();
    }
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

  const { show } = usePopup();
  const shareDialog = (shared: number[]) => {
    if (shared.length === 0) return;
    const url = getShareUrl(messages, shared);
    show("share", url);
  };

  return (
    <div
      className={`page ${styles["chat-page"]}`}
      onClick={() => selectingMode && setSelectingMode(false)}
    >
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
      <DisclaimerPopup />
      <ReactionsPopup onReact={setMsgReaction} />
      <SharePopup />

      <div className={styles["content"]}>
        <div className={styles["sidebar-holder"]}>
          <Sidebar
            open={sidebarOpen}
            disableShare={selectingMode}
            onClose={() => setSidebarOpen(false)}
            // onShareVisible={withGa(
            //   "Panel",
            //   "pressed screenshot",
            //   `${messages.slice(-1)?.[0]?.utteranceId ?? ""}`,
            //   getChatPic
            // )}
            onStartSelect={() => setSelectingMode(true)}
            onReset={reset}
          />
        </div>

        <div className={styles["chat-cont"]}>
          {error && <div style={{ color: "red" }}>{error}</div>}

          <div
            className={styles["messages-cont"]}
            style={{ userSelect: selectingMode ? "none" : "initial" }}
          >
            {selectingMode && (
              <div className={styles["floating-btn"]}>
                <ActionBtn
                  icon={faCamera}
                  onClick={() => (
                    setSelectingMode(false), shareDialog(selectedMessages)
                  )}
                >
                  Share selected
                </ActionBtn>
              </div>
            )}

            <div ref={chatRef} className={styles["messages-scroll"]}>
              <DisclaimerBubble />
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  msg={msg}
                  isNew={i === messages.length - 1 && !loading}
                  selected={selectingMode && selectedMessages.includes(i)}
                  onReact={setMsgReaction}
                  onClick={(ev) => (
                    selectingMode &&
                      setSelectedMsgs((current) =>
                        !current.includes(i) ? [...current, i] : current
                      ),
                    ev.stopPropagation()
                  )}
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
              disabled={!!error || selectingMode}
            />
            <button
              onClick={() => onClickSend()}
              style={btnHeight ? { height: `${btnHeight}px` } : undefined}
              disabled={msgDraft.replace(/\W/gi, "") === "" || selectingMode}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
