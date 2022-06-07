import cn from "classnames";
import { FC } from "react";
import { Message } from "../hooks/useChat";
import MessageBubble, {
  DisclaimerBubble,
  ThinkingBubble,
} from "./MessageBubble";

import styles from "./messagehistory.module.css";

const MessageHistory: FC<{
  messages: Message[];
  showDisclaimer?: boolean;
  selectingMode?: boolean;
  selectedMessages?: number[];
  loading?: boolean;
  bubbleClassname?: string;
  wrapperClassname?: string;
  setMsgReaction?: (uttId: string, reaction: number) => void;
  onSelectMessage?: (idx: number) => void;
}> = ({
  messages,
  showDisclaimer = true,
  selectingMode = false,
  selectedMessages = [],
  loading = false,
  bubbleClassname,
  wrapperClassname,
  setMsgReaction,
  onSelectMessage = () => {},
}) => {
  return (
    <div className={cn(styles["messages-scroll"], wrapperClassname)}>
      {showDisclaimer && <DisclaimerBubble />}
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          idxData={i}
          msg={msg}
          className={cn(bubbleClassname)}
          isNew={i === messages.length - 1 && !loading}
          canSelect={selectingMode}
          selected={selectingMode && selectedMessages.includes(i)}
          onReact={setMsgReaction}
          onSelect={(ev) => (onSelectMessage(i), ev.stopPropagation())}
        />
      ))}
      {loading && <ThinkingBubble />}
    </div>
  );
};

export default MessageHistory;
