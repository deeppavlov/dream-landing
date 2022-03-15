import React, {
  FC,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

import styles from "./popup.module.css";

type OpenPopups = { [id: string]: (open: boolean, data?: any) => void };

const popupsContext = React.createContext<OpenPopups | null>(null);

export const Popup: FC<{
  id: string;
  showCross?: boolean;
  allowIgnore?: boolean;
  small?: boolean;
  children:
    | ReactNode
    | undefined
    | ((arg: { data: any; hide: () => void }) => void);
}> = ({
  id,
  showCross = true,
  allowIgnore = true,
  small = false,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const popups = useContext(popupsContext);

  const show = useCallback((shouldBeOpen: boolean, data: any = null) => {
    setOpen(shouldBeOpen);
    setData(data);
  }, []);

  useEffect(() => {
    if (!popups) return;
    popups[id] = show;
    return () => {
      delete popups[id];
    };
  }, [popups]); // eslint-disable-line react-hooks/exhaustive-deps

  return open ? (
    <>
      <div
        className={styles["overlay"]}
        onClick={() => allowIgnore && setOpen(false)}
      >
        <div
          className={`${styles["popup"]} ${small ? styles["popup-small"] : ""}`}
          onClick={(ev) => ev.stopPropagation()}
        >
          {showCross && (
            <div className={styles["close-btn"]} onClick={() => setOpen(false)}>
              <FontAwesomeIcon icon={faClose} />
            </div>
          )}

          <div className={styles["content"]}>
            {typeof children === "function"
              ? children({ data, hide: () => setOpen(false) })
              : children}
          </div>
        </div>
      </div>
    </>
  ) : null;
};

export const usePopup = () => {
  const popups = useContext(popupsContext);
  const hide = () =>
    popups && Object.values(popups).forEach((show) => show(false));
  return {
    hide,
    show(id: string, data: any = null) {
      if (!popups) return;
      hide();
      popups[id](true, data);
    },
  };
};

export const PopupProvider: FC = ({ children }) => {
  const popups = useRef<OpenPopups>({});
  return (
    <popupsContext.Provider value={popups.current}>
      {children}
    </popupsContext.Provider>
  );
};
