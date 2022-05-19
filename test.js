const { createCanvas, registerFont } = require("canvas");
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext("2d");

registerFont("comicsans.ttf", { family: "Comic Sans MS" });

ctx.font = '16px "Comic Sans MS"';
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 200, 200);
ctx.fillStyle = "black";
ctx.fillText("Hello", 0, 100);

const fs = require("fs");
const out = fs.createWriteStream(__dirname + "/test.png");
const stream = canvas.createPNGStream();
stream.pipe(out);
out.on("finish", () => console.log("The PNG file was created."));
