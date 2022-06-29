import { existsSync, PathLike, readdirSync, readFileSync } from "fs";
import { validate } from "jsonschema";
import { NextApiHandler } from "next";
import path from "path";
import * as yaml from "js-yaml";
import {
  ClientContext,
  SurveyConfig,
  findSurvey,
} from "../../utils/surveyConfig";

// On startup we parse all of our surveys
const schemaPath = path.join(
  process.cwd(),
  "utils",
  "surveyConfig.schema.json"
);
const schema = JSON.parse(readFileSync(schemaPath, { encoding: "utf-8" }));
const validateConfig = (config: unknown, id: string): boolean => {
  const result = validate(config, schema);
  if (!result.valid) {
    console.error(
      `Invalid survey config "${id}"\n` +
        result.errors
          .map((err) => `  - "${err.property} ${err.message}"`)
          .join("\n")
    );
  }
  return result.valid;
};

const surveysDir = path.join(process.cwd(), "surveys");
console.log(
  "surveys directory",
  surveysDir,
  "\nexists",
  existsSync(surveysDir)
);

const surveys = readdirSync(surveysDir)
  .filter((file) => [".yml", ".yaml"].includes(path.extname(file)))
  .map((file) => {
    const id = file.split(".").slice(0, -1).join(".");
    const config = yaml.load(
      readFileSync(path.join(surveysDir, file), { encoding: "utf-8" })
    );
    const valid = validateConfig(config, id);
    return valid
      ? <SurveyConfig>{
          id,
          ...(config as object),
        }
      : null;
  })
  .filter((res) => res !== null) as SurveyConfig[];

console.log(
  surveys.length > 0
    ? `Loaded surveys:\n${surveys.map((s: SurveyConfig) => s.title).join("\n")}`
    : "no valid surveys found!"
);

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    res.status(400).write("Invalid method");
    res.end();
    return;
  }

  const context: ClientContext = req.body;
  const foundSurvey = findSurvey(surveys, context);
  res.write(JSON.stringify(foundSurvey));
  res.end();
};

export default handler;
