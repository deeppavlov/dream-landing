import { nanoid } from "nanoid";
import { useState, useEffect, useRef, useCallback } from "react";
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
}

interface MsgResponse {
  dialog_id: string;
  utt_id: string;
  user_id: string;
  response: string;
  active_skill: string;
}

const DREAM_API_URL = "https://7019.deeppavlov.ai/";

const useChat = (): UseChatReturn => {
  const { error, post } = usePost(DREAM_API_URL);
  const [loading, setLoading] = useState(false);
  const [dialogId, setDialogId] = useStored<null | string>("dialog-id", null);
  const [userId, setUserId] = useStored("user-id", () => nanoid(), {
    initialRender: null,
  });

  const [rating, setStoredRating] = useStored<number>("dialog_rating", -1);
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

  const [messages, setMessages] = useStored<Message[]>("messages", []);

  const sendMsg = useCallback(
    (msgText: string) => {
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
    setUserId(nanoid());
    setMessages([]);
    setStoredRating(-1);
    setDialogId(null);
  }, [setDialogId, setMessages, setStoredRating, setUserId]);

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
  };
};

export default useChat;
