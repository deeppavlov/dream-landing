import { nanoid } from "nanoid";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import usePost from "./usePost";
import useStored from "./useStored";

export interface Message {
  sender: "bot" | "user";
  type: "text";
  content: string;
  utteranceId?: string;
  reaction?: number;
}

interface UseChatReturn {
  sendMsg: (msg: string) => void;
  reset: () => void;
  setRating: (rating: number) => void;
  rating: number;
  setMsgReaction: (uttId: string, reaction: number) => void;
  messages: Message[];
  error: string | null;
  loading: boolean;
  userId: string | null;
  dialogId: string | null;
  version: keyof typeof DREAM_API_URL;
}

interface MsgResponse {
  dialog_id: string;
  utt_id: string;
  user_id: string;
  response: string;
  active_skill: string;
}

// Probably this should be moved elsewhere, as it is also used in `utils/shareUrl.ts`
export const DREAM_API_URL = {
  // "" <empty string> is the default version name (=english) for backwards compatibility
  "": "https://7019.deeppavlov.ai/",
  // TODO: Change this URL here to Russian Dream's endpoint
  ru: "https://7019.deeppavlov.ai/",
};

const useChat = (): UseChatReturn => {
  // Fetch the current version from the URL search (?version=...)
  const version = useMemo(() => {
    if (typeof window !== "undefined" && window.location) {
      const versionParam = new URLSearchParams(location.search).get("version");
      if (
        versionParam &&
        Object.prototype.hasOwnProperty.call(DREAM_API_URL, versionParam)
      )
        return versionParam;
    }
    return "";
  }, []) as keyof typeof DREAM_API_URL;

  const { error, post } = usePost(DREAM_API_URL[version]);
  const [loading, setLoading] = useState(false);
  const [dialogId, setDialogId] = useStored<null | string>(
    `${version}dialog-id`,
    null
  );
  const [userId, setUserId] = useStored(`${version}user-id`, () => nanoid(), {
    initialRender: null,
  });

  const [rating, setStoredRating] = useStored<number>(
    `${version}dialog_rating`,
    -1
  );
  const setRating = useCallback(
    (newRating: number) => {
      if (dialogId) {
        post("rating/dialog", {
          user_id: userId,
          rating: newRating + 1, // It has to be 1-5
          dialog_id: dialogId,
        });
        setStoredRating(newRating);
      }
    },
    [dialogId, post, userId, setStoredRating]
  );

  const [messages, setMessages] = useStored<Message[]>(
    `${version}messages`,
    []
  );

  const sendMsg = useCallback(
    (msgText: string) => {
      if (msgText.startsWith("/")) {
        // The user sent a special command
        setLoading(true);
        post("", { user_id: userId, payload: msgText }).finally(() => {
          setLoading(false);
          // TODO: make this nicer, even though it's a rare usecase
          window.alert(`Command "${msgText}" sent!`);
        });
        // Commands should not be dealt with further
        return;
      }
      const addMsg = (msg: Message) => setMessages((msgs) => [...msgs, msg]);

      addMsg({
        sender: "user",
        type: "text",
        content: msgText,
      });
      setLoading(true);

      post("", {
        user_id: userId,
        payload: msgText,
      })
        .then((res?: MsgResponse) => {
          if (!res) return;
          setDialogId(res.dialog_id);
          addMsg({
            sender: "bot",
            type: "text",
            content: res.response,
            utteranceId: res.utt_id,
          });
        })
        .finally(() => setLoading(false));
    },
    [post, userId, setMessages, setDialogId]
  );

  const setMsgReaction = useCallback(
    (uttId: string, reaction: number) => {
      if (reaction !== -1) {
        post("rating/utterance", {
          user_id: userId,
          rating: reaction,
          utt_id: uttId,
        });
      }
      setMessages((msgs) => {
        const idx = msgs.findIndex(({ utteranceId }) => utteranceId === uttId);
        if (idx === -1) throw `"${uttId}" utterance id not found!`;
        return [
          ...msgs.slice(0, idx),
          { ...msgs[idx], reaction },
          ...msgs.slice(idx + 1),
        ];
      });
    },
    [userId, setMessages, post]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setStoredRating(-1);
    setDialogId(null);
    // Send a /close command to restart dialog while keeping the user id
    setLoading(true);
    post("", { user_id: userId, payload: "/close" }).finally(() =>
      setLoading(false)
    );
  }, [post, setDialogId, setMessages, setStoredRating, userId]);

  return {
    messages,
    sendMsg,
    setRating,
    rating,
    setMsgReaction,
    error,
    loading,
    reset,
    userId,
    dialogId,
    version,
  };
};

export default useChat;
