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
}

interface MsgResponse {
  dialog_id: string;
  utt_id: string;
  user_id: string;
  response: string;
  active_skill: string;
}

const useChat = (): UseChatReturn => {
  const { error, post } = usePost();
  const [loading, setLoading] = useState(false);
  const dialogIdRef = useRef<string | null>(null);

  const [userId, setUserId] = useStored("user-id", nanoid);

  const [rating, setStoredRating] = useStored<number>("dialog_rating", -1);
  const setRating = useCallback(
    (newRating: number) => {
      if (dialogIdRef.current && rating === -1) {
        post("rating/dialog", {
          user_id: userId,
          rating: newRating + 1, // It has to be 1-5
          dialog_id: dialogIdRef.current,
        });
        setStoredRating(newRating);
      }
    },
    [rating, userId, setStoredRating, post]
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
          dialogIdRef.current = res.dialog_id;
          addMsg({
            sender: "bot",
            type: "text",
            content: res.response,
            utteranceId: res.utt_id,
          });
        })
        .finally(() => setLoading(false));
    },
    [userId, setMessages, post]
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

  const reset = () => {
    setUserId(nanoid());
    setMessages([]);
    setStoredRating(-1);
    dialogIdRef.current = null;
  };

  return {
    messages,
    sendMsg,
    setRating,
    rating,
    setMsgReaction,
    error,
    loading,
    reset,
  };
};

export default useChat;
