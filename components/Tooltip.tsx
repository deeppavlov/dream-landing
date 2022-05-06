import React, { FC, useState } from "react";
import { usePopper } from "react-popper";

import styles from "./tooltip.module.css";

export const useTooltip = () => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
  const { styles, attributes } = usePopper(anchor, popperElement, {
    modifiers: [
      // { name: "arrow", options: { element: arrowElement } },
      { name: "offset", options: { offset: [0, 5] } },
    ],
  });

  return {
    setAnchor,
    setPopperElement,
    setArrowElement,
    styles,
    attributes,
  };
};

const Tooltip: FC<
  Omit<ReturnType<typeof useTooltip>, "setAnchor"> & { fade?: boolean }
> = ({
  attributes,
  setArrowElement,
  setPopperElement,
  styles: popperStyles,
  fade = false,
  children,
}) => {
  return (
    <div
      ref={setPopperElement}
      className={`${styles["tooltip"]} ${fade ? styles["tooltip-fade"] : ""}`}
      style={popperStyles.popper}
      {...attributes.popper}
    >
      {children}
      {/* <div
        ref={setArrowElement}
        className={styles["arrow"]}
        style={popperStyles.arrow}
      /> */}
    </div>
  );
};

export default Tooltip;
