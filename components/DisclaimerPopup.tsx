import { FC, UIEventHandler, useEffect, useRef, useState } from "react";
import { Popup, usePopup } from "./Popup";

import styles from "./disclaimerpopup.module.css";
import useStored from "../hooks/useStored";

const DisclaimerPopup: FC = () => {
  const { hide, show } = usePopup();
  const [read, setRead] = useState(false);

  const [agreed, setAgree] = useStored<boolean | null>("agreed", false, {
    initialRender: null,
  });
  useEffect(() => {
    if (agreed === false) show("disclaimer");
  }, [agreed, setAgree, show]);

  const handleScroll: UIEventHandler<HTMLDivElement> = (ev) => {
    const el = ev.currentTarget;
    const bottomScroll = el.scrollHeight - el.clientHeight - 20;
    if (el.scrollTop >= bottomScroll) setRead(true);
  };

  const handleDisagree = () => {
    const sure = window.confirm(
      "You cannot use the bot unless you agree to the conditions. Are you sure?"
    );
    if (sure) window.location.href = "https://deeppavlov.ai/dream";
  };

  const handleAgree = () => {
    setAgree(true);
    hide();
  };

  return (
    <Popup
      id="disclaimer"
      showCross={false}
      allowIgnore={false}
      contentClass={styles["content"]}
    >
      <div className={styles["headline"]}>Before we start chatting...</div>

      <div
        ref={(scrollRef) => {
          if (scrollRef) {
            const bottomScroll =
              scrollRef.scrollHeight - scrollRef.clientHeight - 20;
            if (scrollRef.scrollTop >= bottomScroll) setRead(true);
          }
        }}
        className={styles["scroll"]}
        onScroll={read ? undefined : handleScroll}
      >
        <h2>Disclaimer of responsibility</h2>

        <p>
          By using the bot, you explicitly give permission for your conversation
          data to be released publicly in any sources and by any ways.
        </p>

        <p className={styles["red"]}>
          MIPT (TIN 5008006211) has the right to store and publicly share your
          conversation data without compliance to special requirements.
        </p>

        <div className={`${styles["small-title"]} ${styles["emoji-title"]}`}>
          🙅 Do not mention
        </div>

        <ul className={styles["list"]}>
          <li>your address</li>
          <li>phone number</li>
          <li>full names</li>
          <li>car information</li>
          <li>passwords</li>
          <li>driver license numbers</li>
          <li>insurance policy numbers</li>
          <li>loan numbers</li>
          <li>credit/debit card numbers</li>
          <li>PIN numbers</li>
          <li>banking information</li>
          <li>etc.</li>
        </ul>

        <div className={`${styles["small-title"]} ${styles["emoji-title"]}`}>
          🔒 We would not publish
        </div>

        <ul className={styles["list"]}>
          <li>your IP-address</li>
          <li>information about devices</li>
          <li>location</li>
        </ul>

        <div className={styles["small-title"]}>Full disclaimer</div>

        <p>
          Bot responses are generated automatically. MIPT (TIN 5008006211) shall
          bear no responsibility for accuracy, relevance, and correctness of the
          information received by the User through the chat bot.
        </p>

        <p>
          MIPT (TIN 5008006211) shall bear no responsibility for the information
          received by the User through the chatbot, including if this
          information hurts the user&apos;s feelings related to ethics and
          standards of living. Information received by the User through the bot
          does not appeal for any actions, including ethnic and religious
          hatred; does not promote anything, including non-traditional sexual
          orientation, violence, drug use, alcohol and smoking; it&apos;s not
          intended to offend anyone&apos;s feelings on religious, gender,
          political or any other grounds, including insulting government
          officials and state symbols of any country.
        </p>

        <p>
          MIPT (TIN 5008006211) shall bear no responsibility for the information
          received by the User through the bot, including, but not limited to,
          if this information violates the rights of the third parties to
          intellectual property and equivalent means of identification; the
          right to information constituting a trade secret; the rights of
          minors; contains negative and critical statements regarding religion,
          politics, racial, ethnic, gender, personal qualities and abilities,
          sexual orientation and appearance of the third parties; contains
          insults to specific individuals or organizations; violates generally
          accepted moral standards and ethical norms, promotes hatred and / or
          discrimination.
        </p>

        <p>
          By using the bot, you explicitly give permission for your conversation
          data to be released publicly in any sources and by any ways.
        </p>

        <p style={{ fontWeight: "bold" }}>
          MIPT (TIN 5008006211) has the right to store and publicly share your
          conversation data without compliance to special requirements.
        </p>

        <p>
          If you consider this unacceptable, we kindly ask you not to use the
          bot. By using the chat bot, you explicitly give your permission to
          receive any information; all claims and complaints on bot functioning
          shall not be considered by MIPT (TIN 5008006211).
        </p>
      </div>

      <div className={styles["btn-cont"]}>
        <button
          className={styles["red-btn"]}
          onClick={handleDisagree}
          disabled={!read}
        >
          Disagree
        </button>
        <button onClick={handleAgree} disabled={!read}>
          Agree
        </button>
      </div>
    </Popup>
  );
};

export default DisclaimerPopup;
