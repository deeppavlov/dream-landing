import { ClientContext, findSurvey, SurveyConfig } from "./surveyConfig";

describe("findSurvey", () => {
  let surveyIdx = 0;
  let randomVal = 0.9;
  beforeEach(() => {
    jest.spyOn(global.Math, "random").mockImplementation(() => randomVal);
    surveyIdx = 0;
  });

  afterEach(() => {
    jest.spyOn(global.Math, "random").mockRestore();
  });

  const ctx = (c: Partial<ClientContext> = {}): ClientContext => ({
    activeSkill: "skill",
    firstTimeUser: false,
    justStartedSession: false,
    messagesSoFar: 1,
    ...c,
  });

  const survey = (s: Partial<SurveyConfig["trigger"]> = {}): SurveyConfig => ({
    id: `test_survey_${surveyIdx++}`,
    title: "A survey",
    description: "A survey",
    options: { op1: { name: "option 1" } },
    trigger: {
      with_probability: 1,
      ...s,
    },
  });

  it("returns null if no surveys are given", () => {
    const result = findSurvey([], ctx());
    expect(result).toBeNull();
  });

  describe("when only a single survey matches", () => {
    it("checks first time user", () => {
      const survey1 = survey({ first_time_user: true });
      const result1 = findSurvey([survey1], ctx({ firstTimeUser: true }));
      const result2 = findSurvey([survey1], ctx({ firstTimeUser: false }));
      expect(result1).toBe(survey1);
      expect(result2).toBeNull();
    });

    it("checks message count", () => {
      const survey1 = survey({ only_after_n_messages: 5 });
      const result1 = findSurvey([survey1], ctx({ messagesSoFar: 6 }));
      const result2 = findSurvey([survey1], ctx({ messagesSoFar: 4 }));
      expect(result1).toBe(survey1);
      expect(result2).toBeNull();
    });

    it("checks session start", () => {
      const survey1 = survey({ after_session_start: true });
      const result1 = findSurvey([survey1], ctx({ justStartedSession: true }));
      const result2 = findSurvey([survey1], ctx({ justStartedSession: false }));
      expect(result1).toBe(survey1);
      expect(result2).toBeNull();
    });

    it("checks active skill", () => {
      const survey1 = survey({ when_skill_activated: "dff_skill" });
      const result1 = findSurvey([survey1], ctx({ activeSkill: "dff_skill" }));
      const result2 = findSurvey(
        [survey1],
        ctx({ activeSkill: "another_skill" })
      );
      expect(result1).toBe(survey1);
      expect(result2).toBeNull();
    });

    it("can return null according to the probability", () => {
      const survey1 = survey({
        with_probability: 0.5,
        when_skill_activated: "dff_skill",
      });
      const result1 = findSurvey([survey1], ctx({ activeSkill: "dff_skill" }));
      expect(result1).toBeNull();
    });
  });

  describe("when there are multiple surveys", () => {
    it("selects according to the given probabilities", () => {
      const survey1 = survey({ with_probability: 0.1, first_time_user: true });
      const survey2 = survey({
        with_probability: 0.4,
        first_time_user: true,
        after_session_start: true,
      });
      const survey3 = survey({
        with_probability: 0.5,
        first_time_user: true,
        when_skill_activated: "skill",
      });
      const result1 = findSurvey(
        [survey1, survey2, survey3],
        ctx({
          firstTimeUser: true,
          justStartedSession: true,
          activeSkill: "skill",
        })
      );
      expect(result1).toBe(survey3);
    });

    it("can return none of the matched surveys according to the probabilities", () => {
      const survey1 = survey({ with_probability: 0.1, first_time_user: true });
      const survey2 = survey({
        with_probability: 0.2,
        first_time_user: true,
        after_session_start: true,
      });
      const survey3 = survey({
        with_probability: 0.3,
        first_time_user: true,
        when_skill_activated: "skill",
      });
      const result1 = findSurvey(
        [survey1, survey2, survey3],
        ctx({
          firstTimeUser: true,
          justStartedSession: true,
          activeSkill: "skill",
        })
      );
      expect(result1).toBeNull();
    });

    it("returns null if none of them match", () => {
      const survey1 = survey({ with_probability: 0.1, first_time_user: true });
      const survey2 = survey({
        with_probability: 0.4,
        first_time_user: true,
        after_session_start: true,
      });
      const survey3 = survey({
        with_probability: 0.5,
        first_time_user: true,
        when_skill_activated: "skill",
      });
      const result1 = findSurvey(
        [survey1, survey2, survey3],
        ctx({
          firstTimeUser: false,
          justStartedSession: true,
          activeSkill: "skill",
        })
      );
      expect(result1).toBeNull();
    });
  });
});
