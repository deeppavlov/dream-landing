import React, { FC } from "react";

import { Popup } from "./Popup";
import styles from "./feedbackpopup.module.css";
import StarsRating from "./StarsRating";

const FeedbackPopup: FC<Parameters<typeof StarsRating>[0]> = ({
  children,
  ...starProps
}) => {
  return (
    <Popup id="feedback">
      <div className={styles["content"]}>
        <h1>How was your experience?</h1>
        <StarsRating {...starProps} showFeedbackLink={false} />
        <div className={styles["small-title"]}>Share your thoughts:</div>
        <textarea
          className={styles["feedback-box"]}
          placeholder="Your feedback..."
        />
        <button>Submit Feedback</button>
      </div>
    </Popup>
  );
};

export default FeedbackPopup;
