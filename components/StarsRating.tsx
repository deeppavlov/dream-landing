import React, { FC, useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

import styles from "./starsrating.module.css";
import { usePopup } from "./Popup";

const StarsRating: FC<{
  rating: number;
  setRating: (r: number) => void;
  showFeedbackLink?: boolean;
}> = ({ rating, setRating, showFeedbackLink = false }) => {
  const { show } = usePopup();

  return (
    <div className={styles["stars-cont"]}>
      Rate your dialog
      <div className={styles["stars"]}>
        {Array(5)
          .fill(0)
          .map((_, idx) => (
            <FontAwesomeIcon
              key={idx}
              icon={faStar}
              size="2x"
              color={idx <= rating ? "#ffd93a" : "gray"}
              onClick={() => setRating(idx)}
            />
          ))}
      </div>
      {showFeedbackLink && (
        <>
          or <a onClick={() => show("feedback")}>leave feedback</a>
        </>
      )}
    </div>
  );
};

export default StarsRating;
