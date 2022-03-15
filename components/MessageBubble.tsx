import React, { FC, useEffect, useRef, useState } from "react";

import styles from "./messagebubble.module.css";
import { Message } from "../hooks/useChat";
import MessageReaction from "./MessageReaction";

const MessageBubble: FC<{
  msg: Message;
  isNew: boolean;
  onReact?: (uttId: string, reaction: number) => void;
  disableReaction?: boolean;
}> = ({ msg, isNew, onReact, disableReaction: disableRating = false }) => {
  const isRight = msg.sender === "user";
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isNew && divRef.current) {
      divRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isNew]);
  return (
    <div ref={divRef} className={styles["bubble-wrap"]}>
      <div
        className={
          styles["bubble"] + ` ${isRight ? styles["bubble-right"] : ""}`
        }
      >
        {msg.content}
        {msg.utteranceId && !disableRating && (
          <MessageReaction
            uttId={msg.utteranceId}
            reaction={msg.reaction}
            onReact={onReact}
            readOnly={!isNew}
          />
        )}
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
      disableReaction
    />
  );
};
