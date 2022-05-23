import React, { FC, useCallback, useRef, useState } from "react";

import { Popup, usePopup } from "./Popup";
import styles from "./feedbackpopup.module.css";
import StarsRating from "./StarsRating";
import usePost from "../hooks/usePost";
import { withGa } from "../utils/analytics";

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

    gtag("event", "wrote and sent comments", { event_category: "Feedback" });
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
    <Popup
      id="feedback"
      width="650px"
      height="550px"
      onClose={() =>
        gtag("event", "closed without submit", { event_category: "Feedback" })
      }
    >
      {
        <div className={styles["content"]}>
          <h1>How was your experience?</h1>
          <StarsRating
            {...starProps}
            setRating={withGa("Feedback", "pressed star", starProps.setRating)}
            showFeedbackLink={false}
            inactiveStarColor="gray"
            starsMargin="0.7em"
          />
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
      }
    </Popup>
  );
};

export default FeedbackPopup;
