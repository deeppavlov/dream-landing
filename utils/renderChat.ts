import { Message } from "../hooks/useChat";
import { createCanvas, CanvasRenderingContext2D, registerFont } from "canvas";

registerFont("./public/fonts/BlenderPro-Medium.ttf", {
  family: "Blender Pro",
});
// registerFont("./public/fonts/BlenderPro-Bold.ttf", {
//   family: "Blender Pro",
//   weight: "900",
// });
// registerFont("./public/fonts/BlenderPro-Thin.ttf", {
//   family: "Blender Pro",
//   weight: "100",
// });

const padding = 10;
const bubblePadding = 16;
const msgGap = 10;
const fontSize = 16;
const lineHeight = 1.2;
const font = `${fontSize}px "Blender Pro"`;

const layoutBubble = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) => {
  // Adopted from https://stackoverflow.com/a/16599668
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];
  let longestLineWidth = 0;

  for (var i = 1; i < words.length; i++) {
    const word = words[i];
    const { width } = ctx.measureText(currentLine + " " + word);
    if (width < maxWidth) {
      currentLine += " " + word;
      longestLineWidth = Math.max(longestLineWidth, width);
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  if (longestLineWidth === 0)
    longestLineWidth = ctx.measureText(currentLine).width;
  return { lines, width: longestLineWidth };
};

export default function renderChat(
  messages: Message[],
  width = 1080,
  height = 1080
) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  ctx.textBaseline = "top";
  const innerWidth = width - 2 * padding;
  const innerHeight = height - 2 * padding;
  const maxWidth = innerWidth <= 500 ? 0.75 * innerWidth : 0.5 * innerWidth;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  let nextBubbleY = padding;
  messages.forEach((msg) => {
    const isRight = msg.sender === "user";
    const { lines, width: bubbleInnerW } = layoutBubble(
      ctx,
      msg.content,
      maxWidth
    );
    const bubbleOuterW = bubbleInnerW + 2 * bubblePadding;
    const bubbleInnerH = lines.length * fontSize * lineHeight;
    const bubbleOuterH = bubbleInnerH + 2 * bubblePadding;
    const x = isRight ? innerWidth - bubbleOuterW + padding : padding;
    ctx.fillStyle = isRight ? "#0069b3" : "#f2f2f2";
    ctx.fillRect(x, nextBubbleY, bubbleOuterW, bubbleOuterH);

    ctx.fillStyle = isRight ? "white" : "black";
    ctx.fillText(lines[0], x + bubblePadding, nextBubbleY + bubblePadding);

    nextBubbleY += bubbleOuterH + msgGap;
  });

  return canvas.createPNGStream();
}
