import React, { useState, FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

import styles from './messagerating.module.css'

const ratingEmojis = ["👍", "👎", "😍", "😄", "😲", "😡"];

const MessageRating: FC = () => {
  const [rating, setRating] = useState(-1);
  const [isExpanded, setExpanded] = useState(false);

  return (
    <>
      {rating > -1 && (
        <div className={styles["rating-indicator"]}>{ratingEmojis[rating]}</div>
      )}
      <div
        className={styles["bubble-rating"]}
        onMouseLeave={() => setExpanded(false)}
      >
        {ratingEmojis.slice(0, isExpanded ? undefined : 2).map((em, idx) => (
          <div
            key={em}
            className={styles["rating-emoji"]}
            onClick={() => setRating(idx)}
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
    </>
  );
};

export default MessageRating;
