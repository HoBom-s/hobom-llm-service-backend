import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { GeminiClientAdapter } from "src/llm-gateway/adapters/out/gemini-client.adapter";

const mockGenerateContent = jest.fn();

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

describe("GeminiClientAdapter", () => {
  let adapter: GeminiClientAdapter;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiClientAdapter,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue("test-api-key"),
          },
        },
      ],
    }).compile();

    adapter = module.get(GeminiClientAdapter);
  });

  const validOXQuestion = {
    subject: "개인정보 보호법 총칙",
    type: "OX",
    question: "정보주체의 동의가 필요하다.",
    choices: [],
    answer: "O",
    explanation: "제15조 근거",
  };

  const validMCQuestion = {
    subject: "안전성 확보조치",
    type: "MULTIPLE_CHOICE",
    question: "다음 중 해당하지 않는 것은?",
    choices: ["접근 통제", "암호화", "물리적 보안", "광고 집행"],
    answer: "광고 집행",
    explanation: "광고는 무관합니다.",
  };

  describe("generateExamQuestions", () => {
    const articles = [
      { articleNo: "제15조", articleTitle: "수집·이용", content: "내용" },
    ];

    it("should return validated questions from LLM response", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({ questions: [validOXQuestion, validMCQuestion] }),
        },
      });

      const result = await adapter.generateExamQuestions(articles, "테스트", 2);

      expect(result.questions).toHaveLength(2);
      expect(result.questions[0].type).toBe("OX");
      expect(result.questions[1].type).toBe("MULTIPLE_CHOICE");
    });

    it("should handle markdown-fenced JSON response", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            "```json\n" +
            JSON.stringify({ questions: [validOXQuestion] }) +
            "\n```",
        },
      });

      const result = await adapter.generateExamQuestions(articles, "테스트", 1);

      expect(result.questions).toHaveLength(1);
    });

    it("should normalize LLM type variations", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              questions: [{ ...validOXQuestion, type: "ox" }],
            }),
        },
      });

      const result = await adapter.generateExamQuestions(articles, "테스트", 1);

      expect(result.questions[0].type).toBe("OX");
    });

    it("should filter invalid questions from LLM response", async () => {
      const invalidQuestion = {
        subject: "",
        type: "UNKNOWN",
        question: "",
        choices: [],
        answer: "",
        explanation: "",
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              questions: [validOXQuestion, invalidQuestion],
            }),
        },
      });

      const result = await adapter.generateExamQuestions(articles, "테스트", 1);

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].type).toBe("OX");
    });

    it("should throw when valid questions below 50% threshold", async () => {
      const invalidQuestion = {
        subject: "",
        type: "BAD",
        question: "",
        choices: [],
        answer: "",
        explanation: "",
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              questions: [invalidQuestion, invalidQuestion, invalidQuestion],
            }),
        },
      });

      await expect(
        adapter.generateExamQuestions(articles, "테스트", 3),
      ).rejects.toThrow("유효한 문제가 너무 적어요");
    });

    it("should throw when JSON parsing fails", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => "not valid json" },
      });

      await expect(
        adapter.generateExamQuestions(articles, "테스트", 1),
      ).rejects.toThrow("LLM 응답을 파싱할 수 없어요.");
    });
  });

  describe("generateStudyMaterial", () => {
    const changes = [
      {
        articleNo: "제15조",
        changeType: "MODIFIED",
        before: "이전 내용",
        after: "변경 내용",
      },
    ];

    it("should parse and return study material", async () => {
      const mockResponse = {
        summary: "요약",
        keyPoints: ["핵심1"],
        quizzes: [
          {
            type: "OX",
            question: "문제",
            answer: "O",
            explanation: "해설",
            choices: [],
          },
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify(mockResponse) },
      });

      const result = await adapter.generateStudyMaterial(changes);

      expect(result.summary).toBe("요약");
      expect(result.keyPoints).toEqual(["핵심1"]);
      expect(result.quizzes).toHaveLength(1);
    });
  });

  describe("askQuestion", () => {
    it("should parse and return answer", async () => {
      const mockResponse = {
        answer: "답변입니다.",
        referencedArticles: ["제15조"],
      };

      mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify(mockResponse) },
      });

      const result = await adapter.askQuestion("질문", [], []);

      expect(result.answer).toBe("답변입니다.");
      expect(result.referencedArticles).toEqual(["제15조"]);
    });
  });
});
