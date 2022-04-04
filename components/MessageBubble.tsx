import React, { FC, useEffect, useRef, useState } from "react";

import styles from "./messagebubble.module.css";
import { Message } from "../hooks/useChat";
// import MessageReaction from "./MessageReaction";
import { usePopup } from "./Popup";

const MessageBubble: FC<{
  msg: Message;
  isNew: boolean;
  onReact?: (uttId: string, reaction: number) => void;
  disableReaction?: boolean;
  className?: string;
}> = ({
  msg,
  isNew,
  onReact,
  disableReaction: disableRating = false,
  className = "",
  children,
}) => {
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
          styles["bubble"] +
          ` ${isRight ? styles["bubble-right"] : ""}` +
          ` ${className}`
        }
      >
        {children || msg.content.replace(/ #\+#.*/, "")}
        {/* {msg.utteranceId && !disableRating && (
          <MessageReaction
            uttId={msg.utteranceId}
            reaction={msg.reaction}
            onReact={onReact}
            readOnly={!isNew}
          />
        )} */}
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

export const DisclaimerBubble: FC = () => {
  const { show } = usePopup();

  return (
    <MessageBubble
      msg={{
        sender: "bot",
        type: "text",
        content: ``,
      }}
      isNew={false}
      className={styles["disclaimer"]}
    >
      <b>NOTE: Please avoid sharing anything sensitive</b> such as your address,
      phone number, etc.{" "}
      <a href="" onClick={(ev) => (ev.preventDefault(), show("disclaimer"))}>
        Read full disclaimer.
      </a>
      {/* family member's names, car information, passwords, driver license
      numbers, insurance policy numbers, loan numbers, credit/debit card
      numbers, PIN numbers, banking information etc. All of your conversational
      data may be published on deeppavlov.ai and/or github.com/deepmipt websites
      for non-commercial purposes of collecting open-domain Conversational AI
      datasets. */}
    </MessageBubble>
  );
};
