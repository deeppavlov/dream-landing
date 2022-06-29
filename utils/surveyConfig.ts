import { PathLike, readdirSync, readFileSync, readSync } from "fs";
import { validate, Schema } from "jsonschema";
import * as yaml from "js-yaml";
import path from "path";

export interface SurveyConfig {
  /**
   * ID is the spec's filename (wihtout extension)
   */
  id: string;
  title: string;
  description: string;
  options: {
    [key: string]: {
      name: string;
      icon?: string;
      color?: string;
    };
  };
  /**
   * Conditions for showing the survey to a user
   */
  trigger: {
    /**
     * Show when this user visits for the first time
     */
    first_time_user?: boolean;
    /**
     * Show after the user has sent at least five messages in the currenct session
     */
    only_after_n_messages?: number;
    /**
     *Show if the user has already had at least 3 sessions
     */
    only_after_n_sessions?: number;
    /**
     *Show only at the beginning of a new session
     */
    after_session_start?: boolean;
    /**
     *Show if the last reply came from this skill
     */
    when_skill_activated?: string;
    /**
     * Random probability (0-1) of showing, given all other conditions are met
     * If multiple surveys meet the conditions, their probabilities are normalized
     * and selected randomly based on those normalized scores.
     */
    with_probability: number;
    /**
     *Show at most once per session
     */
    max_n_times_per_session?: number;
    /**
     *Show at most once for each user
     */
    max_n_times_per_user?: number;
  };
}

/**
 * Data from the client necessary for matching surveys
 */
export interface ClientContext {
  firstTimeUser: boolean;
  messagesSoFar: number;
  justStartedSession: boolean;
  activeSkill: string;
}

const schemaPath = path.join(__dirname, "surveyConfig.schema.json");
const schema: Schema = JSON.parse(
  readFileSync(schemaPath, { encoding: "utf-8" })
);

export const validateConfig = (config: unknown, id: string): boolean => {
  const result = validate(config, schema);
  if (!result.valid) {
    console.error(
      `Invalid survey config "${id}"\n` +
        result.errors
          .map((err) => `  "${err.message}" at ${err.property}`)
          .join("\n")
    );
  }
  return result.valid;
};

export const parseSurveyConfigs = (surveyDir: PathLike): SurveyConfig[] =>
  readdirSync(surveyDir)
    .filter((file) => ["yml", "yaml"].includes(path.extname(file)))
    .map((file) => {
      const id = file.split(".").slice(0, -1).join(".");
      const config = yaml.load(readFileSync(file, { encoding: "utf-8" }));
      const valid = validateConfig(config, id);
      return valid
        ? <SurveyConfig>{
            id,
            ...(config as object),
          }
        : null;
    })
    .filter((res) => res !== null) as SurveyConfig[];

export const findSurvey = (
  surveys: SurveyConfig[],
  context: ClientContext
): SurveyConfig | null => {
  const matchingSurveys = surveys.filter(({ trigger }) => {
    if (
      ("first_time_user" in trigger &&
        context.firstTimeUser !== trigger.first_time_user) ||
      ("only_after_n_messages" in trigger &&
        context.messagesSoFar < trigger.only_after_n_messages!) ||
      ("after_session_start" in trigger &&
        context.justStartedSession !== trigger.after_session_start) ||
      ("when_skill_activated" in trigger &&
        context.activeSkill !== trigger.when_skill_activated!)
      // TODO: implement remaining conditions
    )
      return false;
    return true;
  });
  if (matchingSurveys.length === 0) return null;

  const totalProb = matchingSurveys.reduce(
    (sum, s) => sum + s.trigger.with_probability,
    0
  );
  const surveyIdsDist = matchingSurveys.flatMap(({ id, trigger }) => {
    const fraction =
      totalProb > 1
        ? trigger.with_probability / totalProb
        : trigger.with_probability;
    return Array(Math.floor(fraction * 100)).fill(id) as string[];
  });
  const distributionWith100Els = [
    ...surveyIdsDist,
    ...Array(Math.max(0, 100 - surveyIdsDist.length)).fill(""),
  ];
  const randomIdx = Math.floor(distributionWith100Els.length * Math.random());
  return (
    surveys.find(({ id }) => id === distributionWith100Els[randomIdx]) ?? null
  );
};
