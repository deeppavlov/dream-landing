import React, { FC, useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";

import styles from "./sidebar.module.css";

const StarsRating: FC = () => {
  const [rating, setRating] = useState(-1);
  const color = useCallback(
    (idx: number) => ({ color: idx <= rating ? "#ffd93a" : "gray" }),
    [rating]
  );

  return (
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
  );
};

const Sidebar: FC<{
  onScreenshot?: () => void;
  onReset?: () => void;
  onDownload?: () => void;
}> = ({ onScreenshot, onReset }) => {
  return (
    <div className={styles["cont"]}>
      <div className={styles["avatar"]} />
      <div className={styles["title"]}>Dream Socialbot</div>
      <div className={styles["desc"]}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </div>
      <hr />
      <div className={styles["small-title"]}>Rate the dialog</div>
      <StarsRating />
      <hr />
      <button className={styles["action-btn"]} onClick={onScreenshot}>Take screenshot</button>
      <button className={styles["action-btn"]}>Download other dialogs</button>
      <button className={styles["action-btn"]} onClick={onReset}>Start a new dialog</button>
      <div className={styles["small-title"]}>Save in messengers</div>
      <div className={styles["messengers-cont"]}>
        <div className={styles["messenger-btn"]}>
          <FontAwesomeIcon size="2x" icon={faTelegram} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
