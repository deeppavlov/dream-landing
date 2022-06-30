import { rest, setupWorker } from "msw";
import { nanoid } from "nanoid";

const API_URL = "https://7019.deeppavlov.ai/";

const handlers = [
  rest.post(API_URL, (req, res, ctx) => {
    return res(
      ctx.json({
        dialog_id: "dialog_id",
        utt_id: nanoid(),
        user_id: (req.body as Record<string, string>).user_id,
        response: "Hey there!",
        active_skill: "skill",
      })
    );
  }),

  rest.post(API_URL + "rating/utterance", (req, res, ctx) => res()),
  rest.post(API_URL + "rating/dialog", (req, res, ctx) => res()),

  rest.get(API_URL + "api/dialogs/:id", (req, res, ctx) => {
    return res(
      ctx.json({
        utterances: [
          {
            utt_id: "1",
            text: "Hello there!",
            user: {
              user_type: "human",
            },
          },
          {
            utt_id: "2",
            text: "Hey!",
            user: {
              user_type: "bot",
            },
          },
          {
            utt_id: "3",
            text: "How are you?",
            user: {
              user_type: "human",
            },
          },
        ],
      })
    );
  }),
];

export const worker = typeof window !== "undefined" && setupWorker(...handlers);
