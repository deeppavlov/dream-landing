import React, { FC, useCallback, useEffect, useRef, useState } from "react";

import { Popup, usePopup } from "./Popup";
import styles from "./sharepopup.module.css";
import usePost from "../hooks/usePost";
import { withGa } from "../utils/analytics";
import { Icon } from "@iconify/react";
import Tooltip, { useTooltip } from "./Tooltip";

const ShareBtn = React.forwardRef<
  HTMLDivElement,
  {
    icon: string;
    onClick?: () => void;
  }
>(function ShareBtn({ icon, onClick }, ref) {
  return (
    <div ref={ref} className={styles["icon-cont"]} onClick={onClick}>
      <Icon icon={icon} />
    </div>
  );
});

const SharePopup: FC = ({ children }) => {
  // const { post } = usePost(SPREADSHEET_API_URL);
  const { hide } = usePopup();

  const { setAnchor, ...tooltipProps } = useTooltip();
  const [tooltipTarget, setTooltipTarget] = useState(0);
  const [tooltipMsg, setTooltipMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!tooltipMsg) return;
    const handle = setTimeout(() => setTooltipMsg(null), 1000);
    return () => clearTimeout(handle);
  }, [tooltipMsg]);

  const copyToClipboard = (shareUrl: string) => {
    navigator.clipboard.writeText(shareUrl);
    setTooltipTarget(0);
    setTooltipMsg("URL copied to clipboard!");
  };

  return (
    <Popup id="share" width="550px" height="670px">
      {({ data: shareUrl }) => {
        const params = new URL(shareUrl).searchParams;
        params.set("w", "500");
        params.set("h", "500");
        params.set("s", "0.8");
        const previewUrl = "/api/preview/?" + params.toString();
        return (
          <div className={styles["content"]}>
            <div
              className={styles["preview"]}
              style={{ backgroundImage: `url(${previewUrl})` }}
            />

            <h1>Select a platform to share</h1>
            <div className={styles["btn-cont"]}>
              <ShareBtn
                ref={tooltipTarget === 0 ? setAnchor : undefined}
                icon="fa6-solid:clipboard"
                onClick={() => copyToClipboard(shareUrl)}
              />
              <a
                href={`http://vk.com/share.php?url=${encodeURIComponent(
                  shareUrl
                )}`}
              >
                <ShareBtn
                  ref={tooltipTarget === 1 ? setAnchor : undefined}
                  icon="fa6-brands:vk"
                />
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <ShareBtn
                  ref={tooltipTarget === 3 ? setAnchor : undefined}
                  icon="fa6-brands:telegram"
                />
              </a>
            </div>

            {tooltipMsg && <Tooltip {...tooltipProps}>{tooltipMsg}</Tooltip>}
          </div>
        );
      }}
    </Popup>
  );
};

export default SharePopup;
