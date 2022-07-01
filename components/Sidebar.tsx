import React, { FC, useCallback, useEffect, useState } from "react";
import ReactDom from "react-dom";
import { Icon } from "@iconify/react";

import styles from "./sidebar.module.css";
import useOnSmallerScreen from "../hooks/useOnSmallerScreen";
import ActionBtn, { ActionBtnGroup, ActionBtnSlide } from "./ActionBtn";
import { usePopup } from "./Popup";
import { withGa, withGaThenNavigate } from "../utils/analytics";

const Sidebar: FC<{
  open: boolean;
  disableShare: boolean;
  onClose: () => void;
  onShareVisible?: () => void;
  onStartSelect?: () => void;
  onReset?: () => void;
}> = ({
  open,
  disableShare,
  onClose,
  onShareVisible,
  onStartSelect,
  onReset,
}) => {
  const { show } = usePopup();

  const renderFloating = useOnSmallerScreen({ width: 1000 });
  const isMobile = useOnSmallerScreen({ width: 800 });

  const elem = (
    <>
      <div
        className={`${styles["sidebar"]} ${open ? styles["sidebar-open"] : ""}`}
      >
        {isMobile ? (
          <div className={styles["back"]} onClick={onClose}>
            <div className={styles["close-icon-cont"]}>
              <Icon icon="fa6-solid:xmark" />
            </div>
          </div>
        ) : (
          <a
            className={styles["back"]}
            href="https://deeppavlov.ai/dream"
            onClick={withGaThenNavigate(
              "Panel",
              "pressed back to homepage",
              "https://deeppavlov.ai/dream"
            )}
          >
            <div className={styles["back-icon-cont"]}>
              <Icon icon="fa6-solid:arrow-left" />
            </div>{" "}
            Back to Dream
          </a>
        )}

        {!isMobile && <div className={styles["avatar"]} id="avatar" />}
        <div className={styles["scroll-cont"]}>
          {/* On mobile, place the avatar in the scollcontainer to free up space */}
          {isMobile && <div className={styles["avatar"]} id="avatar" />}

          <div className={styles["title"]}>Dream Socialbot</div>
          <div className={styles["desc"]}>
            Hi! Name&apos;s Dream, I&apos;m a socialbot born during the Alexa
            Prize 3 & 4 competitions. I was built using the DeepPavlov Dream
            platform, and you can discuss various societal topics with me. Let
            my devs know how good I am by providing feedback, and share the best
            dialogs with your friends!{" "}
          </div>

          <hr />

          <div className={styles["small-title"]}>Actions</div>
          <div className={styles["actions-cont"]}>
            <ActionBtnSlide toggleOnClick disabled={disableShare}>
              <ActionBtn icon="fa6-solid:share-nodes">Share dialog</ActionBtn>

              <ActionBtnGroup>
                <ActionBtn icon="fa6-solid:camera" onClick={onShareVisible}>
                  Share visible
                </ActionBtn>

                <ActionBtn
                  icon="fa6-solid:object-group"
                  onClick={onStartSelect}
                >
                  Select messages
                </ActionBtn>
              </ActionBtnGroup>
            </ActionBtnSlide>
            <ActionBtn
              icon="fa6-solid:download"
              onClick={withGaThenNavigate(
                "Panel",
                "pressed download other dialogs",
                "http://deeppavlov.ai/dream/datasets"
              )}
            >
              Download other dialogs
            </ActionBtn>
            <ActionBtn
              icon="fa6-solid:arrows-rotate"
              onClick={withGa("Panel", "pressed reset", onReset)}
            >
              Start a new dialog
            </ActionBtn>
            {isMobile && (
              <>
                <ActionBtn
                  icon="fa6-solid:star"
                  onClick={() => show("feedback")}
                >
                  Give feedback
                </ActionBtn>
                <a
                  style={{ display: "block" }} // To get margins to work
                  href="https://deeppavlov.ai/dream"
                  onClick={withGaThenNavigate(
                    "Panel",
                    "pressed back to homepage",
                    "https://deeppavlov.ai/dream"
                  )}
                >
                  <ActionBtn icon="fa6-solid:house">Dream website</ActionBtn>
                </a>
              </>
            )}
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
                <Icon icon="fa6-brands:telegram" fontSize="2em" />
              </a>
            </div>
          </div>

          <a
            className={styles["disclaimer"]}
            onClick={withGa("Disclaimer", "opened again", () =>
              show("disclaimer")
            )}
          >
            Disclaimer of responsibility
          </a>

          <span className={styles["version-links"]}>
            <a
              href="#"
              onClick={(ev) => ((location.search = ""), ev.preventDefault())}
            >
              English
            </a>
            {" | "}
            <a
              href="#"
              onClick={(ev) => (
                (location.search = "?version=ru"), ev.preventDefault()
              )}
            >
              Russian
            </a>
          </span>
        </div>
      </div>
      <div className={styles["overlay"]} onClick={() => onClose()} />
    </>
  );

  return renderFloating ? ReactDom.createPortal(elem, document.body) : elem;
};

export default Sidebar;
