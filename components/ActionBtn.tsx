import React, { FC, useState } from "react";
import { Icon } from "@iconify/react";
import cn from "classnames";

import styles from "./actionbtn.module.css";

const ActionBtn: FC<{
  onClick?: () => void;
  icon: string;
  disabled?: boolean;
}> = ({ onClick, icon, disabled = false, children }) => {
  return (
    <button
      className={cn(styles["action-btn"], disabled && styles["disabled"])}
      onClick={onClick}
    >
      <div className={styles["icon-cont"]}>
        <Icon icon={icon} />
      </div>
      {children}
    </button>
  );
};

export const ActionBtnGroup: FC<{
  children:
    | React.ReactElement<typeof ActionBtn>[]
    | React.ReactElement<typeof ActionBtn>;
}> = ({ children }) => {
  return <div className={styles["group"]}>{children}</div>;
};

export const ActionBtnSlide: FC<{
  activeIdx?: number;
  toggleOnClick?: boolean;
  disabled?: boolean;
  children: (
    | React.ReactElement<typeof ActionBtnGroup>
    | React.ReactElement<typeof ActionBtn>
  )[];
}> = ({ activeIdx = 0, toggleOnClick = false, disabled = false, children }) => {
  const [idxOverride, setIdxOverride] = useState<number | null>(null);
  const onClick = () => {
    if (!toggleOnClick) return;
    setIdxOverride((idx) => ((idx ?? activeIdx) + 1) % children.length);
  };

  return (
    <div
      className={cn(styles["slide-wrapper"], disabled && styles["disabled"])}
      onClick={onClick}
    >
      <div
        className={styles["slide-overflow"]}
        style={{
          width: `${children.length * 100}%`,
          left: `${-(idxOverride ?? activeIdx) * 100}%`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ActionBtn;
