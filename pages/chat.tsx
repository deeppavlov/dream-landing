import React, { useState, useCallback, useRef } from "react";
import type { NextPage } from "next";
import html2canvas from "html2canvas";

import useChat from "../hooks/useChat";
import styles from "./chat.module.css";
import Sidebar from "../components/Sidebar";
import MessageBubble, { ThinkingBubble } from "../components/MessageBubble";

const Chat: NextPage = () => {
  const { messages, loading, error, sendMsg, reset, setRating, rating } =
    useChat();

  const chatRef = useRef<HTMLDivElement>(null);
  const getChatPic = () => {
    if (!chatRef.current) return;
    html2canvas(chatRef.current).then((canvas) => {
      const imgDataUrl = canvas.toDataURL();
      const a = document.createElement("a");
      a.download = "canvas_image.png";
      a.href = imgDataUrl;
      a.click();
    });
  };

  const [msgDraft, setMsgDraft] = useState("");
  const onClickSend = useCallback(
    () => msgDraft !== "" && (sendMsg(msgDraft), setMsgDraft("")),
    [msgDraft, sendMsg]
  );

  return (
    <div className={`page ${styles["chat-page"]}`}>
      <Sidebar
        onScreenshot={getChatPic}
        onReset={reset}
        setRating={setRating}
        rating={rating}
      ></Sidebar>

      <div className={styles["chat-cont"]}>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <div ref={chatRef} className={styles["messages-cont"]}>
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              isNew={i === messages.length - 1 && !loading}
            />
          ))}
          {loading && <ThinkingBubble />}
        </div>
        <div className={styles["input-cont"]}>
          <input
            type="text"
            placeholder="Type your message here..."
            value={msgDraft}
            onInput={(ev) => setMsgDraft((ev.target as HTMLInputElement).value)}
            onKeyDown={(ev) => ev.key === "Enter" && onClickSend()}
          />
          <button onClick={onClickSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
