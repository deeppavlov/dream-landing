import { Icon } from "@iconify/react";
import React, { useState, FC, useCallback, useEffect } from "react";

import styles from "./messagerating.module.css";
import { Popup, usePopup } from "./Popup";

const ratingEmojis = ["👍", "👎", "😍", "😄", "😲", "😡"];

export const ReactionsPopup: FC<{
  onReact: (uttId: string, reaction: number) => void;
}> = ({ onReact }) => {
  return (
    <Popup id="reaction" transparent width="100vw">
      {({ data, hide }) => (
        <div className={styles["popup-emoji-cont"]}>
          {ratingEmojis.map((em, idx) => (
            <React.Fragment key={em}>
              <div
                onClick={() => (hide(), onReact(data as string, idx))}
                className={styles["popup-emoji"]}
              >
                {em}
              </div>
              {idx === Math.floor(ratingEmojis.length / 2) - 1 && (
                <div className={styles["break"]} />
              )}
            </React.Fragment>
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
  const { show } = usePopup();

  const [isExpanded, setExpanded] = useState(false);
  const expand = () => {
    if (window.innerWidth <= 500) show("reaction", uttId);
    else setExpanded(true);
  };

  const [isCompact, setCompact] = useState(false);
  useEffect(() => {
    const handler = () => setCompact(window.innerWidth <= 500);
    window.addEventListener("resize", handler);
    handler();
    return () => window.removeEventListener("resize", handler);
  }, []);

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
          {ratingEmojis
            .slice(0, isExpanded ? undefined : isCompact ? 0 : 2)
            .map((em, idx) => (
              <div
                key={em}
                className={styles["rating-emoji"]}
                onClick={() => onReact && onReact(uttId, idx)}
              >
                {em}
              </div>
            ))}
          {!isExpanded && (
            <Icon
              className={styles["rating-expand"]}
              icon="fa-solid:ellipsis-h"
              onClick={expand}
            />
          )}
        </div>
      )}
    </>
  );
};

export default MessageReaction;
