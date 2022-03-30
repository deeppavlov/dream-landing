import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

import styles from "./starsrating.module.css";
import stylesAnim from "./starsanimation.module.css";
import { usePopup } from "./Popup";
import Tooltip, { useTooltip } from "./Tooltip";

const StarsRating: FC<{
  rating: number;
  setRating: (r: number) => void;
  showFeedbackLink?: boolean;
  canRate?: boolean;
  animate?: boolean;
  inactiveStarColor?: string;
  starsMargin?: string;
  compactOnMobile?: boolean;
}> = ({
  rating,
  setRating,
  animate = false,
  canRate = true,
  showFeedbackLink = false,
  inactiveStarColor = "#fbfbfb4f",
  starsMargin = "5px",
  compactOnMobile = false,
}) => {
  const { setAnchor, ...tooltipProps } = useTooltip();
  const { show } = usePopup();

  const [showTooltip, setShowTooltip] = useState(false);
  useEffect(() => {
    if (!showTooltip) return;
    const handle = setTimeout(() => setShowTooltip(false), 1000);
    return () => clearTimeout(handle);
  }, [showTooltip]);

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
            <FontAwesomeIcon
              key={idx}
              icon={faStar}
              size="2x"
              color={idx <= rating ? "#ffd93a" : inactiveStarColor}
              onClick={() => (canRate ? setRating(idx) : setShowTooltip(true))}
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
            or <a onClick={() => show("feedback")}>leave feedback</a>
          </span>
        )}
      </span>
      {showTooltip && (
        <Tooltip {...tooltipProps}>Start a dialog before rating</Tooltip>
      )}
    </div>
  );
};

export default StarsRating;
