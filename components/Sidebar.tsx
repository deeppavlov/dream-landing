import React, { FC, useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faDownload,
  faRefresh,
  faBars,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";

import styles from "./sidebar.module.css";
import ActionBtn from "./ActionBtn";
import { usePopup } from "./Popup";

const Sidebar: FC<{
  onScreenshot?: () => void;
  onReset?: () => void;
  onDownload?: () => void;
}> = ({ onScreenshot, onReset }) => {
  const [isOpen, setOpen] = useState(false);
  const { show } = usePopup();

  return (
    <>
      <div className={styles["hamburger"]} onClick={() => setOpen(true)}>
        <FontAwesomeIcon icon={faBars} onClick={() => setOpen(false)} />
      </div>

      <div
        className={`${styles["sidebar"]} ${
          isOpen ? styles["sidebar-open"] : ""
        }`}
      >
        <div className={styles["back-arrow"]} onClick={() => setOpen(false)}>
          <FontAwesomeIcon icon={faClose} />
        </div>

        <div className={styles["avatar"]} />
        <div className={styles["scroll-cont"]}>
          <div className={styles["title"]}>Dream Socialbot</div>
          <div className={styles["desc"]}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </div>

          <div className={styles["small-title"]}>Actions</div>
          <div className={styles["actions-cont"]}>
            <ActionBtn icon={faCamera} onClick={onScreenshot}>
              Take screenshot
            </ActionBtn>
            <ActionBtn icon={faDownload}>Download other dialogs</ActionBtn>
            <ActionBtn icon={faRefresh} onClick={onReset}>
              Start a new dialog
            </ActionBtn>
          </div>

          <div className={styles["small-title"]}>Messengers</div>
          <div className={styles["messengers-cont"]}>
            <div className={styles["messenger-btn"]}>
              <a
                href="https://t.me/dream_second_bot"
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon size="2x" icon={faTelegram} />
              </a>
            </div>
          </div>

          <a
            className={styles["disclaimer"]}
            onClick={() => show("disclaimer")}
          >
            Disclaimer of responsibility
          </a>
        </div>
        <div className={styles["overlay"]} onClick={() => setOpen(false)} />
      </div>
    </>
  );
};

export default Sidebar;
