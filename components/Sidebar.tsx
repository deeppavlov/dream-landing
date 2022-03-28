import React, { FC, useCallback, useEffect, useState } from "react";
import ReactDom from "react-dom";
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

  const [renderFloating, setFloating] = useState(false);
  useEffect(() => {
    const measure = () => setFloating(window.innerWidth <= 1000);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const elem = (
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
            Hi! Name&apos;s Dream, I&apos;m a socialbot born during the Alexa
            Prize 3 & 4 competitions. I was built using the DeepPavlov Dream
            platform, and you can discuss various societal topics with me. Let
            my devs know how good I am by providing feedback, and share the best
            dialogs with your friends! - feel free to use this text for the
            description of the socialbot for the time being
          </div>

          <hr />

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

          <hr />

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
      </div>
      <div className={styles["overlay"]} onClick={() => setOpen(false)} />
    </>
  );

  return renderFloating ? ReactDom.createPortal(elem, document.body) : elem;
};

export default Sidebar;
