import React, { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import styles from "./actionbtn.module.css";

const ActionBtn: FC<{ onClick?: () => void; icon: IconDefinition }> = ({
  onClick,
  icon,
  children,
}) => {
  return (
    <button className={styles["action-btn"]} onClick={onClick}>
      <div className={styles["icon-cont"]}>
        <FontAwesomeIcon icon={icon} />
      </div>
      {children}
    </button>
  );
};

export default ActionBtn;
