import { NextApiHandler } from "next";
import renderChat from "../../utils/renderChat";
import { fetchSharedMessages, ShareParams } from "../../utils/shareUrl";

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    res.status(400).write("Invalid method");
    return;
  }
  const messages = await fetchSharedMessages(req.query as ShareParams);

  res.setHeader("Content-Type", "image/png");
  res.status(200);
  renderChat(messages).pipe(res);
};

export default handler;
