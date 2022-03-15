import React, {
  FC,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

import styles from "./popup.module.css";

type OpenPopups = { [id: string]: (open: boolean) => void };

const popupsContext = React.createContext<OpenPopups>({});

export const Popup: FC<{
  id: string;
  showCross?: boolean;
  allowIgnore?: boolean;
}> = ({ id, showCross = true, allowIgnore = true, children }) => {
  const [open, setOpen] = useState(false);
  const popups = useContext(popupsContext);

  useEffect(() => {
    popups[id] = setOpen;
    return () => {
      delete popups[id];
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return open ? (
    <>
      <div
        className={styles["overlay"]}
        onClick={() => allowIgnore && setOpen(false)}
      >
        <div className={styles["popup"]} onClick={(ev) => ev.stopPropagation()}>
          {showCross && (
            <div className={styles["close-btn"]} onClick={() => setOpen(false)}>
              <FontAwesomeIcon icon={faClose} />
            </div>
          )}

          <div className={styles["content"]}>{children}</div>
        </div>
      </div>
    </>
  ) : null;
};

export const usePopup = () => {
  const popups = useContext(popupsContext);
  const hide = () => Object.values(popups).forEach((setOpen) => setOpen(false));
  return {
    hide,
    show(id: string) {
      hide();
      popups[id](true);
    },
  };
};

export const PopupProvider = popupsContext.Provider;
