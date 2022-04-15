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
];

export const worker = typeof window !== "undefined" && setupWorker(...handlers);
