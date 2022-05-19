import {
  NextPage,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import cn from "classnames";
import MessageHistory from "../components/MessageHistory";
import { Message } from "../hooks/useChat";
import { fetchSharedMessages, ShareParams } from "../utils/shareUrl";
import styles from "./shared.module.css";
import Link from "next/link";
import SharePopup from "../components/SharePopup";
import { usePopup } from "../components/Popup";

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  return {
    props: {
      messages: await fetchSharedMessages(query as ShareParams),
    },
  };
}

const Shared: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ messages }) => {
  const { show } = usePopup();
  return (
    <div className={cn("page", styles["share-page"])}>
      <SharePopup />

      <div className={styles["top-bar"]}>
        <a href="http://deeppavlov.ai/" target="_blank" rel="noreferrer">
          <div className={styles["avatar"]} />
        </a>
        <div>
          Dream Socialbot by{" "}
          <a
            href="http://deeppavlov.ai/dream/"
            target="_blank"
            rel="noreferrer"
          >
            DeepPavlov.ai
          </a>
        </div>
      </div>
      <div className={styles["chat-cont"]}>
        <MessageHistory showDisclaimer={false} messages={messages} />
      </div>
      <div className={styles["btn-cont"]}>
        <Link href="/">
          <a className={cn(styles["fat-btn"], styles["primary"])}>
            Chat with Dream
          </a>
        </Link>
        <button
          className={styles["fat-btn"]}
          onClick={() => show("share", document.location.href)}
        >
          Share this dialog
        </button>
      </div>
    </div>
  );
};

export default Shared;
