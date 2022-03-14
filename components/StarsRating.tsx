import React, { FC, useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

import styles from "./starsrating.module.css";

const StarsRating: FC<{ rating: number; setRating: (r: number) => void }> = ({
  rating,
  setRating,
}) => {
  const color = useCallback(
    (idx: number) => ({ color: idx <= rating ? "#ffd93a" : "gray" }),
    [rating]
  );

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
              style={color(idx)}
              onClick={() => setRating(idx)}
            />
          ))}
      </div>
      or <a>leave feedback</a>
    </div>
  );
};

export default StarsRating;
