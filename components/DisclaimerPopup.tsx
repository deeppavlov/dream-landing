import React, { FC } from "react";
import { Popup, usePopup } from "./Popup";

const DisclaimerPopup: FC = () => {
  const { hide } = usePopup();
  return (
    <Popup id="disclaimer" showCross={false} allowIgnore={false}>
      <h1>Before we start chatting...</h1>
      <h2>Disclaimer of responsibility</h2>

      <p>
        Bot responses are generated automatically. MIPT (TIN 5008006211) shall
        bear no responsibility for accuracy, relevance, and correctness of the
        information received by the User through the chat bot.
      </p>

      <p>
        MIPT (TIN 5008006211) shall bear no responsibility for the information
        received by the User through the chatbot, including if this information
        hurts the user&apos;s feelings related to ethics and standards of
        living. Information received by the User through the bot does not appeal
        for any actions, including ethnic and religious hatred; does not promote
        anything, including non-traditional sexual orientation, violence, drug
        use, alcohol and smoking; it&apos;s not intended to offend anyone&apos;s
        feelings on religious, gender, political or any other grounds, including
        insulting government officials and state symbols of any country.
      </p>

      <p>
        MIPT (TIN 5008006211) shall bear no responsibility for the information
        received by the User through the bot, including, but not limited to, if
        this information violates the rights of the third parties to
        intellectual property and equivalent means of identification; the right
        to information constituting a trade secret; the rights of minors;
        contains negative and critical statements regarding religion, politics,
        racial, ethnic, gender, personal qualities and abilities, sexual
        orientation and appearance of the third parties; contains insults to
        specific individuals or organizations; violates generally accepted moral
        standards and ethical norms, promotes hatred and / or discrimination.
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
        If you consider this unacceptable, we kindly ask you not to use the bot.
        By using the chat bot, you explicitly give your permission to receive
        any information; all claims and complaints on bot functioning shall not
        be considered by MIPT (TIN 5008006211).
      </p>

      <button onClick={hide}>I Accept</button>
    </Popup>
  );
};

export default DisclaimerPopup;
