import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    res.status(400).write("Invalid method");
    res.end();
    return;
  }

  const context = req.body;
//   res.json(req.body);
  res.end();
};

export default handler;
