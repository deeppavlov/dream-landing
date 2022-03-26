import React, { FC, useCallback, useRef, useState } from "react";

import { Popup, usePopup } from "./Popup";
import styles from "./feedbackpopup.module.css";
import StarsRating from "./StarsRating";
import usePost from "../hooks/usePost";

const SPREADSHEET_API_URL =
  "https://sheet.best/api/sheets/6f128cc2-4aca-45f2-b1ac-da77a6540949";

const FeedbackPopup: FC<
  Parameters<typeof StarsRating>[0] & {
    userId: string;
    dialogId: string | null;
  }
> = ({ children, userId, dialogId, ...starProps }) => {
  const { post } = usePost(SPREADSHEET_API_URL);
  const submitted = useRef<Set<string>>(new Set()).current;
  const [feedbackDraft, setFeedback] = useState("");
  const { hide } = usePopup();

  const submit = useCallback(() => {
    if (
      !userId ||
      !dialogId ||
      starProps.rating === -1 ||
      feedbackDraft.replace(/\W/gi, "") === ""
    )
      return;
    post("", {
      user_id: userId,
      dialog_id: dialogId,
      rating: starProps.rating + 1,
      feedback: feedbackDraft,
    });
    setFeedback("");
    submitted.add(dialogId);
    hide();
  }, [
    userId,
    dialogId,
    starProps.rating,
    feedbackDraft,
    post,
    submitted,
    hide,
  ]);

  return (
    <Popup id="feedback" width="600px">
      {submitted.has(dialogId as string) ? (
        "Thank you for your feedback"
      ) : (
        <div className={styles["content"]}>
          <h1>How was your experience?</h1>
          <StarsRating {...starProps} showFeedbackLink={false} inactiveStarColor="gray"/>
          <div className={styles["small-title"]}>Share your thoughts:</div>
          <textarea
            className={styles["feedback-box"]}
            value={feedbackDraft}
            onInput={(ev) =>
              setFeedback((ev.target as HTMLTextAreaElement).value)
            }
            placeholder="Your feedback..."
          />
          <button onClick={submit}>Submit Feedback</button>
        </div>
      )}
    </Popup>
  );
};

export default FeedbackPopup;
