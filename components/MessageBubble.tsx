import React, { FC, useEffect, useRef, useState } from "react";
import cn from "classnames";

import styles from "./messagebubble.module.css";
import { Message } from "../hooks/useChat";
// import MessageReaction from "./MessageReaction";
import { usePopup } from "./Popup";
import { Icon } from "@iconify/react";

const MessageBubble: FC<{
  msg: Message;
  isNew: boolean;
  canSelect: boolean;
  onReact?: (uttId: string, reaction: number) => void;
  onSelect?: (ev: React.MouseEvent) => void;
  disableReaction?: boolean;
  className?: string;
  selected?: boolean;
  idxData?: number;
}> = ({
  msg,
  isNew,
  onReact,
  disableReaction: disableRating = false,
  className = "",
  canSelect,
  selected = false,
  onSelect = () => {},
  idxData,
  children,
}) => {
  selected = canSelect && selected;
  const isRight = msg.sender === "user";
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isNew) {
      // This hack is required on mobile chrome to have the thinking bubble
      // scrolling into view working.
      setTimeout(
        () => divRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
    }
  }, [isNew]);

  return (
    <div
      ref={divRef}
      className={cn(styles["bubble-wrap"], selected && styles["selected"])}
      onClick={canSelect ? onSelect : undefined}
    >
      <div
        className={cn(
          styles["gutter"],
          canSelect && styles["gutter-selecting"]
        )}
      >
        <div
          className={cn(
            styles["checkbox"],
            canSelect && selected && styles["checked"]
          )}
        >
          <Icon icon="fa-regular:check-square" />
        </div>
      </div>
      <div
        // We save the message index in the DOM, so that when finding
        // which messages are visible, we can get back the idx.
        data-idx={`${idxData}`}
        className={cn(
          styles["bubble"],
          isRight && styles["bubble-right"],
          selected && styles["selected"],
          className
        )}
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
    console.log("Thinking bubble mounted");
    const handle = setInterval(() => {
      setMsg((msg) => (msg.length >= 4 ? "." : msg + "."));
    }, 200);
    return () => {
      clearInterval(handle);
      console.log("Thinking bubble unmounted");
    };
  }, []);

  return (
    <MessageBubble
      canSelect={false}
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
      canSelect={false}
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
