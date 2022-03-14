import React, { FC, useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faDownload, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";

import styles from "./sidebar.module.css";
import ActionBtn from "./ActionBtn";

const Sidebar: FC<{
  onScreenshot?: () => void;
  onReset?: () => void;
  onDownload?: () => void;
  setRating: (r: number) => void;
  rating: number;
}> = ({ onScreenshot, onReset, setRating, rating }) => {
  return (
    <div className={styles["cont"]}>
      <div className={styles["sidebar"]}>
        <div className={styles["avatar"]} />
        <div className={styles["title"]}>Dream Socialbot</div>
        <div className={styles["desc"]}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </div>

        <div className={styles["small-title"]}>Actions</div>
        <div className={styles["actions-cont"]}>
          <ActionBtn icon={faCamera} onClick={onScreenshot}>Take screenshot</ActionBtn>
          <ActionBtn icon={faDownload} >Download other dialogs</ActionBtn>
          <ActionBtn icon={faRefresh} onClick={onReset}>Start a new dialog</ActionBtn>
        </div>

        <div className={styles["small-title"]}>Messengers</div>
        <div className={styles["messengers-cont"]}>
          <div className={styles["messenger-btn"]}>
            <FontAwesomeIcon size="2x" icon={faTelegram} />
          </div>
        </div>

        <a className={styles["disclaimer"]}>Disclaimer of responsibility</a>
      </div>
    </div>
  );
};

export default Sidebar;
