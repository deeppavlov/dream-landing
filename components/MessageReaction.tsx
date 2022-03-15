import React, { useState, FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

import styles from "./messagerating.module.css";

const ratingEmojis = ["👍", "👎", "😍", "😄", "😲", "😡"];

const MessageReaction: FC<{
  reaction?: number;
  onReact?: (reaction: number) => void;
  readOnly?: boolean;
}> = ({ reaction = -1, readOnly = true, onReact }) => {
  const [isExpanded, setExpanded] = useState(false);

  return (
    <>
      {reaction > -1 && (
        <div className={styles["rating-indicator"]}>
          {ratingEmojis[reaction]}
        </div>
      )}
      {!readOnly && (
        <div
          className={styles["bubble-rating"]}
          onMouseLeave={() => setExpanded(false)}
        >
          {ratingEmojis.slice(0, isExpanded ? undefined : 2).map((em, idx) => (
            <div
              key={em}
              className={styles["rating-emoji"]}
              onClick={() => onReact && onReact(idx)}
            >
              {em}
            </div>
          ))}
          {!isExpanded && (
            <FontAwesomeIcon
              className={styles["rating-expand"]}
              icon={faEllipsis}
              onClick={() => setExpanded(true)}
            />
          )}
        </div>
      )}
    </>
  );
};

export default MessageReaction;
