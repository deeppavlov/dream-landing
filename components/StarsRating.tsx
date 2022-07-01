import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import confetti from "canvas-confetti";

import styles from "./starsrating.module.css";
import stylesAnim from "./starsanimation.module.css";
import { usePopup } from "./Popup";
import Tooltip, { useTooltip } from "./Tooltip";
import { withGa } from "../utils/analytics";

const reactions = {
  happy: () => (
    <>
      <Icon
        icon="twemoji:partying-face"
        fontSize="2em"
        style={{ float: "left", marginRight: "5px" }}
      />{" "}
      Thank you! I am extremely glad that you liked our chat. Come again!
    </>
  ),
  neutral: () => (
    <>
      <Icon
        icon="twemoji:slightly-smiling-face"
        fontSize="2em"
        style={{ float: "left", marginRight: "5px" }}
      />{" "}
      Thank you, we have received your feedback.
    </>
  ),
  sad: () => (
    <>
      <Icon
        icon="twemoji:sad-but-relieved-face"
        fontSize="2em"
        style={{ float: "left", marginRight: "5px" }}
      />{" "}
      Thank you! I am sorry you did not enjoy our conversation. I hope next time
      I can improve.
    </>
  ),
  nodialog: () => "Start a dialog before rating!",
};

const StarsRating: FC<{
  rating: number;
  setRating: (r: number) => void;
  showFeedbackLink?: boolean;
  canRate?: boolean;
  animate?: boolean;
  inactiveStarColor?: string;
  starsMargin?: string;
  compactOnMobile?: boolean;
  showTooltipAndConfetti?: boolean;
}> = ({
  rating,
  setRating,
  animate = false,
  canRate = true,
  showFeedbackLink = false,
  inactiveStarColor = "#fbfbfb4f",
  starsMargin = "5px",
  compactOnMobile = false,
  showTooltipAndConfetti = false,
}) => {
  const { setAnchor, ...tooltipProps } = useTooltip();
  const { show } = usePopup();

  const [tooltipId, setTooltip] = useState<keyof typeof reactions | null>(null);
  useEffect(() => {
    if (tooltipId === null) return;
    const handle = setTimeout(() => setTooltip(null), 4000);
    return () => clearTimeout(handle);
  }, [tooltipId]);

  const rate = (idx: number) => {
    // idx ∈ [0. 4]
    if (idx >= 3) {
      setTooltip("happy");
      confetti({
        origin: { x: 1, y: 0 },
        angle: 215,
        startVelocity: 20,
        ticks: 80,
        spread: 90,
        particleCount: 190,
        disableForReducedMotion: true,
      });
    } else if (idx === 2) {
      setTooltip("neutral");
    } else {
      setTooltip("sad");
    }
    setRating(idx);
  };

  return (
    <div className={styles["stars-cont"]}>
      <span className={compactOnMobile ? styles["only-desktop"] : ""}>
        Rate your dialog
      </span>
      <div
        ref={setAnchor}
        className={styles["stars"]}
        style={{ margin: `${starsMargin} 0` }}
      >
        {Array(5)
          .fill(0)
          .map((_, idx) => (
            <Icon
              key={idx}
              icon="fa6-solid:star"
              fontSize="2em"
              color={idx <= rating ? "#ffd93a" : inactiveStarColor}
              onClick={() => (canRate ? rate(idx) : setTooltip("nodialog"))}
              className={animate ? stylesAnim["star-jump"] : ""}
              style={{
                animationDelay: `${idx * 0.3}s`,
              }}
            />
          ))}
      </div>
      <span className={compactOnMobile ? styles["only-desktop"] : ""}>
        {showFeedbackLink && (
          <span style={{ visibility: canRate ? "visible" : "hidden" }}>
            or{" "}
            <a
              onClick={withGa("Topbar", "pressed feedback", () =>
                show("feedback")
              )}
            >
              leave feedback
            </a>
          </span>
        )}
      </span>
      {tooltipId && (
        <Tooltip fade={4} {...tooltipProps}>
          {tooltipId !== null && reactions[tooltipId]()}
        </Tooltip>
      )}
    </div>
  );
};

export default StarsRating;
