import {
  validateExamQuestion,
  validateExamQuestions,
} from "src/llm-gateway/application/exam-question.validator";

describe("ExamQuestionValidator", () => {
  const validOX = {
    subject: "개인정보 보호법 총칙",
    type: "OX",
    question: "개인정보처리자는 정보주체의 동의를 받아야 한다.",
    choices: [],
    answer: "O",
    explanation: "제15조에 따르면 동의가 필요합니다.",
  };

  const validMC = {
    subject: "안전성 확보조치",
    type: "MULTIPLE_CHOICE",
    question: "다음 중 안전성 확보조치에 해당하지 않는 것은?",
    choices: ["접근 통제", "암호화", "물리적 보안", "광고 집행"],
    answer: "광고 집행",
    explanation: "광고 집행은 안전성 확보조치와 무관합니다.",
  };

  describe("validateExamQuestion", () => {
    it("should pass valid OX question", () => {
      const result = validateExamQuestion(validOX, 1);
      expect(result).toEqual(validOX);
    });

    it("should pass valid MULTIPLE_CHOICE question", () => {
      const result = validateExamQuestion(validMC, 1);
      expect(result).toEqual(validMC);
    });

    it("should return null when subject is missing", () => {
      expect(validateExamQuestion({ ...validOX, subject: "" }, 1)).toBeNull();
    });

    it("should return null when question is missing", () => {
      expect(
        validateExamQuestion({ ...validOX, question: undefined }, 1),
      ).toBeNull();
    });

    it("should return null when answer is missing", () => {
      expect(validateExamQuestion({ ...validOX, answer: "" }, 1)).toBeNull();
    });

    it("should return null when explanation is missing", () => {
      expect(
        validateExamQuestion({ ...validOX, explanation: undefined }, 1),
      ).toBeNull();
    });

    it("should normalize type 'ox' to 'OX'", () => {
      const result = validateExamQuestion({ ...validOX, type: "ox" }, 1);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("OX");
    });

    it("should normalize type '객관식' to 'MULTIPLE_CHOICE'", () => {
      const result = validateExamQuestion({ ...validMC, type: "객관식" }, 1);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("MULTIPLE_CHOICE");
    });

    it("should normalize type '4지선다' to 'MULTIPLE_CHOICE'", () => {
      const result = validateExamQuestion({ ...validMC, type: "4지선다" }, 1);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("MULTIPLE_CHOICE");
    });

    it("should return null for unrecognized type", () => {
      expect(validateExamQuestion({ ...validOX, type: "ESSAY" }, 1)).toBeNull();
    });

    it("should return null when type is not a string", () => {
      expect(validateExamQuestion({ ...validOX, type: 123 }, 1)).toBeNull();
    });

    it("should return null when OX answer is not O or X", () => {
      expect(validateExamQuestion({ ...validOX, answer: "YES" }, 1)).toBeNull();
    });

    it("should return null when choices is not an array", () => {
      expect(
        validateExamQuestion({ ...validOX, choices: "none" }, 1),
      ).toBeNull();
    });

    it("should clear OX choices even if provided", () => {
      const result = validateExamQuestion(
        { ...validOX, choices: ["A", "B"] },
        1,
      );
      expect(result).not.toBeNull();
      expect(result!.choices).toEqual([]);
    });

    it("should return null when MC has wrong number of choices", () => {
      expect(
        validateExamQuestion({ ...validMC, choices: ["A", "B"] }, 1),
      ).toBeNull();
    });

    it("should return null when MC answer not in choices", () => {
      expect(
        validateExamQuestion({ ...validMC, answer: "없는 선택지" }, 1),
      ).toBeNull();
    });

    it("should trim whitespace from all string fields", () => {
      const result = validateExamQuestion(
        {
          ...validOX,
          subject: "  개인정보  ",
          question: "  문제  ",
          answer: " O ",
          explanation: "  해설  ",
        },
        1,
      );
      expect(result).not.toBeNull();
      expect(result!.subject).toBe("개인정보");
      expect(result!.question).toBe("문제");
      expect(result!.answer).toBe("O");
      expect(result!.explanation).toBe("해설");
    });
  });

  describe("validateExamQuestions", () => {
    it("should throw when questions field is missing", () => {
      expect(() => validateExamQuestions({}, 10)).toThrow(
        "LLM 응답에 questions 필드가 없어요.",
      );
    });

    it("should throw when questions is not an array", () => {
      expect(() => validateExamQuestions({ questions: "invalid" }, 10)).toThrow(
        "LLM 응답의 questions가 배열이 아니에요.",
      );
    });

    it("should throw when valid count is below 50%", () => {
      const invalid = {
        subject: "",
        type: "OX",
        question: "",
        choices: [],
        answer: "O",
        explanation: "",
      };
      expect(() =>
        validateExamQuestions({ questions: [invalid, invalid, invalid] }, 4),
      ).toThrow("유효한 문제가 너무 적어요");
    });

    it("should filter invalid and return only valid questions", () => {
      const invalid = {
        subject: "",
        type: "BAD",
        question: "",
        choices: [],
        answer: "",
        explanation: "",
      };
      const result = validateExamQuestions(
        { questions: [validOX, invalid, validMC] },
        2,
      );
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe("OX");
      expect(result[1].type).toBe("MULTIPLE_CHOICE");
    });

    it("should return all valid questions when all pass", () => {
      const result = validateExamQuestions(
        { questions: [validOX, validMC] },
        2,
      );
      expect(result).toHaveLength(2);
    });
  });
});
