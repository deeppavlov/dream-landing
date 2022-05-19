import { NextApiHandler } from "next";
import renderChat from "../../utils/renderChat";
import { fetchSharedMessages, ShareParams } from "../../utils/shareUrl";

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    res.status(400).write("Invalid method");
    return;
  }
  const { w = "1080", h = null } = req.query;
  const width = parseInt(Array.isArray(w) ? w[0] : w);
  const height = h === null ? width : parseInt(Array.isArray(h) ? h[0] : h);
  const messages = await fetchSharedMessages(req.query as ShareParams);

  res.setHeader("Content-Type", "image/png");
  res.status(200);
  res.write(await renderChat(messages, width, height, 2));
  res.end();
};

export default handler;
