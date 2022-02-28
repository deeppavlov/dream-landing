import React, { useState, useCallback, FC, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import type { NextPage } from "next";
import html2canvas from "html2canvas";

import styles from "./chat.module.css";
import Sidebar from "../components/Sidebar";

interface Message {
  sender: "bot" | "user";
  type: "text";
  content: string;
}

interface UseChatReturn {
  sendMsg: (msg: string) => void;
  reset: () => void;
  setRating: (rating: number) => void;
  rating: number;
  messages: Message[];
  error: string | null;
  loading: boolean;
}

interface MsgRequest {
  user_id: string;
  payload: string;
}

interface MsgResponse {
  dialog_id: string;
  utt_id: string;
  user_id: string;
  response: string;
  active_skill: string;
}

const API_URL = "https://7019.lnsigo.mipt.ru/";

const useChat = (): UseChatReturn => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dialogIdRef = useRef<string | null>(null);

  const [userId, setUserId] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem("user_id");
      if (stored) return stored;
    }
    return nanoid();
  });
  useEffect(() => {
    if (userId && typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("user_id", userId);
    }
  }, [userId]);

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem("messages");
      if (stored) return JSON.parse(stored);
    }
    return [];
  });
  const addMsg = (msg: Message) => setMessages((msgs) => [...msgs, msg]);
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const jsonMsgs = JSON.stringify(messages);
      localStorage.setItem("messages", jsonMsgs);
    }
  }, [messages.length, messages]);

  const [rating, _setRating] = useState<number>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem("dialog_rating");
      if (stored) return parseInt(stored);
    }
    return -1;
  });
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("dialog_rating", `${rating}`);
    }
  }, [rating]);
  const setRating = useCallback(
    (newRating: number) => {
      if (dialogIdRef.current && rating === -1) {
        const body = {
          user_id: userId,
          rating: newRating + 1, // It has to be 1-5
          dialog_id: dialogIdRef.current,
        };
        fetch(API_URL + "rating/dialog", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        _setRating(newRating);
      }
    },
    [rating, userId]
  );

  const reset = () => {
    setUserId(nanoid());
    setMessages([]);
    _setRating(-1);
    dialogIdRef.current = null;
  };

  const sendMsg = useCallback(
    (msgText: string) => {
      if (error) setError(null);

      addMsg({
        sender: "user",
        type: "text",
        content: msgText,
      });
      setLoading(true);

      const body: MsgRequest = {
        user_id: userId,
        payload: msgText,
      };
      fetch(API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((res: MsgResponse) => {
          dialogIdRef.current = res.dialog_id;
          addMsg({
            sender: "bot",
            type: "text",
            content: res.response,
          });
        })
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
    },
    [userId, error]
  );

  return {
    messages,
    sendMsg,
    setRating,
    rating,
    error,
    loading,
    reset,
  };
};

const MessageBubble: FC<{ msg: Message; isNew: boolean }> = ({
  msg,
  isNew,
}) => {
  const isRight = msg.sender === "user";
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isNew && divRef.current) {
      divRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isNew]);
  return (
    <div
      ref={divRef}
      className={
        styles["bubble-wrap"] + ` ${isRight ? styles["bubble-wrap-right"] : ""}`
      }
    >
      <div className={styles["bubble"]}>{msg.content}</div>
    </div>
  );
};

const ThinkingBubble: FC = () => {
  const [msg, setMsg] = useState("...");
  useEffect(() => {
    const handle = setInterval(() => {
      setMsg((msg) => (msg.length >= 4 ? "." : msg + "."));
    }, 200);
    return () => clearInterval(handle);
  }, []);

  return (
    <MessageBubble
      msg={{
        sender: "bot",
        type: "text",
        content: msg,
      }}
      isNew
    />
  );
};

const Chat: NextPage = () => {
  const { messages, loading, error, sendMsg, reset, setRating, rating } =
    useChat();

  const chatRef = useRef<HTMLDivElement>(null);
  const getChatPic = () => {
    if (!chatRef.current) return;
    html2canvas(chatRef.current).then((canvas) => {
      const imgDataUrl = canvas.toDataURL();
      const a = document.createElement("a");
      a.download = "canvas_image.png";
      a.href = imgDataUrl;
      a.click();
    });
  };

  const [msgDraft, setMsgDraft] = useState("");
  const onClickSend = useCallback(
    () => msgDraft !== "" && (sendMsg(msgDraft), setMsgDraft("")),
    [msgDraft, sendMsg]
  );

  return (
    <div className={`page ${styles["chat-page"]}`}>
      <Sidebar
        onScreenshot={getChatPic}
        onReset={reset}
        setRating={setRating}
        rating={rating}
      ></Sidebar>

      <div className={styles["chat-cont"]}>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <div ref={chatRef} className={styles["messages-cont"]}>
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              isNew={i === messages.length - 1 && !loading}
            />
          ))}
          {loading && <ThinkingBubble />}
        </div>
        <div className={styles["input-cont"]}>
          <input
            type="text"
            placeholder="Type your message here..."
            value={msgDraft}
            onInput={(ev) => setMsgDraft((ev.target as HTMLInputElement).value)}
            onKeyDown={(ev) => ev.key === "Enter" && onClickSend()}
          />
          <button onClick={onClickSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
