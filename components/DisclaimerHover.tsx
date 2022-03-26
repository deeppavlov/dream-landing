import React, { FC } from "react";

import styles from "./disclaimerhover.module.css";
import { usePopup } from "./Popup";

const DisclaimerHover: FC<{
  onOk: () => void;
  showBig: boolean;
}> = ({ onOk, showBig }) => {
  const { show } = usePopup();
  return (
    <div
      className={`${styles["hover"]} ${
        showBig ? styles["hover-big"] : styles["hover-small"]
      }`}
    >
      <b>NOTE: Please avoid sharing anything sensitive</b> such as your address,
      phone number
      {showBig ? (
        `, family member's names, car information, passwords,
      driver license numbers, insurance policy numbers, loan numbers,
      credit/debit card numbers, PIN numbers, banking information etc. All of
      your conversational data may be published on deeppavlov.ai and/or
      github.com/deepmipt websites for non-commercial purposes of collecting
      open-domain Conversational AI datasets. `
      ) : (
        <a href="" onClick={(ev) => (ev.preventDefault(), show("disclaimer"))}>
          {" "}
          show more...
        </a>
      )}
      {showBig && (
        <button className={styles["ok-btn"]} onClick={onOk}>
          OK
        </button>
      )}
    </div>
  );
};

export default DisclaimerHover;
