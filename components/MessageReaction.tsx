import React, { useState, FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

import styles from "./messagerating.module.css";
import { Popup, usePopup } from "./Popup";

const ratingEmojis = ["👍", "👎", "😍", "😄", "😲", "😡"];

export const ReactionsPopup: FC<{
  onReact: (uttId: string, reaction: number) => void;
}> = ({ onReact }) => {
  return (
    <Popup id="reaction" small>
      {({ data, hide }) => (
        <div className={styles["popup-emoji-cont"]}>
          {ratingEmojis.map((em, idx) => (
            <div
              onClick={() => (hide(), onReact(data as string, idx))}
              key={idx}
              className={styles["popup-emoji"]}
            >
              {em}
            </div>
          ))}
        </div>
      )}
    </Popup>
  );
};

const MessageReaction: FC<{
  uttId: string;
  reaction?: number;
  onReact?: (uttId: string, reaction: number) => void;
  readOnly?: boolean;
}> = ({ uttId, reaction = -1, readOnly = true, onReact }) => {
  const [isExpanded, setExpanded] = useState(false);
  const { show } = usePopup();
  const expand = () => {
    if (window.innerWidth <= 500) show("reaction", uttId);
    else setExpanded(true);
  };

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
              onClick={() => onReact && onReact(uttId, idx)}
            >
              {em}
            </div>
          ))}
          {!isExpanded && (
            <FontAwesomeIcon
              className={styles["rating-expand"]}
              icon={faEllipsis}
              onClick={expand}
            />
          )}
        </div>
      )}
    </>
  );
};

export default MessageReaction;
