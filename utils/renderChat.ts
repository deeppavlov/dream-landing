import { Message } from "../hooks/useChat";
import { createCanvas, GlobalFonts, SKRSContext2D } from "@napi-rs/canvas";
import path from "path";
import { existsSync } from "fs";

type Radius = {
  tl: number;
  tr: number;
  br: number;
  bl: number;
};

const fontPath = path.join(
  process.cwd(),
  "public",
  "fonts",
  "BlenderPro-Medium.ttf"
);
console.log("fontPath", fontPath, "\nexists", existsSync(fontPath));

if (!GlobalFonts.has("Blender Pro"))
  GlobalFonts.registerFromPath(fontPath, "Blender Pro");

console.log(
  GlobalFonts.families.find(({ family }) => family.includes("Blender"))
);

const padding = 10;
const bubblePaddingHor = 16;
const bubblePaddingVer = 13;
const msgGap = 10;
const fontSize = 21;
const lineHeight = 1.2;

const layoutBubble = (ctx: SKRSContext2D, text: string, maxWidth: number) => {
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

const roundedRect = (
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  corners: Partial<Radius> = {}
) => {
  // Adopted from https://stackoverflow.com/a/3368118
  const radius = { tl: 5, bl: 5, br: 5, tr: 5, ...corners };
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + w - radius.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius.tr);
  ctx.lineTo(x + w, y + h - radius.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius.br, y + h);
  ctx.lineTo(x + radius.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
};

export default function renderChat(
  messages: Message[],
  width = 1080,
  height = 1080,
  scale = 1
) {
  const s = (v: number) => v * scale;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const lineHeightPx = lineHeight * s(fontSize);
  ctx.font = `${s(fontSize)}px Blender Pro`;
  // ctx.textBaseline = "top";
  const innerWidth = width - 2 * s(padding);
  const maxWidth = innerWidth <= 500 ? 0.75 * innerWidth : 0.5 * innerWidth;
  const fontAscent = ctx.measureText("Test").fontBoundingBoxAscent;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  let nextBubbleY = s(padding);
  messages.forEach((msg) => {
    const isRight = msg.sender === "user";
    const { lines, width: bubbleInnerW } = layoutBubble(
      ctx,
      msg.content,
      maxWidth
    );
    const bubbleOuterW = bubbleInnerW + 2 * s(bubblePaddingHor);
    const bubbleInnerH = lines.length * lineHeightPx;
    const bubbleOuterH = bubbleInnerH + 2 * s(bubblePaddingVer);
    const x = isRight ? innerWidth - bubbleOuterW + s(padding) : s(padding);
    ctx.fillStyle = isRight ? "#0069b3" : "#f2f2f2";
    roundedRect(ctx, x, nextBubbleY, bubbleOuterW, bubbleOuterH, {
      [isRight ? "br" : "bl"]: 0,
    });
    ctx.fill();

    ctx.fillStyle = isRight ? "white" : "black";
    lines.forEach((line, idx) =>
      ctx.fillText(
        line,
        x + s(bubblePaddingHor),
        nextBubbleY + s(bubblePaddingVer) + fontAscent + idx * lineHeightPx
      )
    );

    nextBubbleY += bubbleOuterH + s(msgGap);
  });

  return canvas.encode("png");
}
