import React, { FC, useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

import styles from "./starsrating.module.css";
import stylesAnim from "./starsanimation.module.css";
import { usePopup } from "./Popup";

const StarsRating: FC<{
  rating: number;
  setRating: (r: number) => void;
  showFeedbackLink?: boolean;
  animate?: boolean;
}> = ({ rating, setRating, animate = false, showFeedbackLink = false }) => {
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
              onClick={() => (console.log("rated", idx), setRating(idx))}
              className={animate ? stylesAnim["star-jump"] : ""}
              style={{
                animationDelay: `${idx * 0.3}s`,
              }}
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
