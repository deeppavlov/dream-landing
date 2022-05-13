import React, { FC, useLayoutEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import cn from "classnames";

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Hack to prevent running in SSR
  if (typeof window !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLayoutEffect(() => {
      if (!overflowRef.current || !wrapperRef.current) return;
      // Set wrapper height
      wrapperRef.current.style.height = `${overflowRef.current.scrollHeight}px`;
    }, []);
  }

  const [idxOverride, setIdxOverride] = useState<number | null>(null);
  const onClick = () => {
    if (!toggleOnClick) return;
    setIdxOverride((idx) => ((idx ?? activeIdx) + 1) % children.length);
  };

  return (
    <div
      ref={wrapperRef}
      className={cn(
        styles["slide-wrapper"],
        disabled && styles["slide-disabled"]
      )}
      onClick={onClick}
    >
      <div
        ref={overflowRef}
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
