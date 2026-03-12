import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LlmClientPort } from "../../domain/ports/out/llm-client.port";
import {
  STUDY_MATERIAL_SYSTEM_PROMPT,
  buildStudyMaterialUserPrompt,
} from "../../../prompt-registry/study-material.prompt";
import {
  ASK_QUESTION_SYSTEM_PROMPT,
  buildAskQuestionUserPrompt,
} from "../../../prompt-registry/ask-question.prompt";

@Injectable()
export class GeminiClientAdapter implements LlmClientPort {
  private readonly genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(GeminiClientAdapter.name);

  constructor(private readonly configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.getOrThrow<string>("GOOGLE_GEMINI_API_KEY"),
    );
  }

  public async generateStudyMaterial(
    changes: {
      articleNo: string;
      changeType: string;
      before: string;
      after: string;
    }[],
  ): Promise<{
    summary: string;
    keyPoints: string[];
    quizzes: {
      type: string;
      question: string;
      answer: string;
      explanation: string;
      choices: string[];
    }[];
  }> {
    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: STUDY_MATERIAL_SYSTEM_PROMPT,
    });

    const result = await model.generateContent(
      buildStudyMaterialUserPrompt(changes),
    );

    return this.parseJsonResponse(result.response.text());
  }

  public async askQuestion(
    question: string,
    articles: {
      articleNo: string;
      articleTitle: string;
      content: string;
    }[],
    recentChanges: {
      articleNo: string;
      changeType: string;
      before: string;
      after: string;
    }[],
  ): Promise<{
    answer: string;
    referencedArticles: string[];
  }> {
    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: ASK_QUESTION_SYSTEM_PROMPT,
    });

    const result = await model.generateContent(
      buildAskQuestionUserPrompt(question, articles, recentChanges),
    );

    return this.parseJsonResponse(result.response.text());
  }

  private parseJsonResponse<T>(text: string): T {
    let raw = text.trim();
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
      raw = fenced[1].trim();
    }

    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.error(
        `LLM 응답 파싱 실패: ${text}`,
        (error as Error).stack,
      );
      throw new Error("LLM 응답을 파싱할 수 없어요.");
    }
  }
}
