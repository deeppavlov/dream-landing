import React, { FC, useEffect, useRef, useState } from "react";

import styles from './messagebubble.module.css';
import { Message } from "../hooks/useChat";
import MessageRating from "./MessageRating";

const MessageBubble: FC<{ msg: Message; isNew: boolean; isLast?: boolean }> = ({
  msg,
  isNew,
  isLast = false,
}) => {
  const isRight = msg.sender === "user";
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isNew && divRef.current) {
      divRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isNew]);
  return (
    <div
      ref={divRef}
      className={
        styles["bubble-wrap"] + ` ${isRight ? styles["bubble-wrap-right"] : ""}`
      }
    >
      <div className={styles["bubble"]}>
        {msg.content} {isLast && <MessageRating />}{" "}
      </div>
    </div>
  );
};

export default MessageBubble;


export const ThinkingBubble: FC = () => {
  const [msg, setMsg] = useState("...");
  useEffect(() => {
    const handle = setInterval(() => {
      setMsg((msg) => (msg.length >= 4 ? "." : msg + "."));
    }, 200);
    return () => clearInterval(handle);
  }, []);

  return (
    <MessageBubble
      msg={{
        sender: "bot",
        type: "text",
        content: msg,
      }}
      isNew
    />
  );
};