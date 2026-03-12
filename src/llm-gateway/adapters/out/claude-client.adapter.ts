import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";
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
export class ClaudeClientAdapter implements LlmClientPort {
  private readonly client: Anthropic;
  private readonly logger = new Logger(ClaudeClientAdapter.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.getOrThrow<string>("ANTHROPIC_API_KEY"),
    });
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
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: STUDY_MATERIAL_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildStudyMaterialUserPrompt(changes),
        },
      ],
    });

    return this.parseJsonResponse(response);
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
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: ASK_QUESTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildAskQuestionUserPrompt(
            question,
            articles,
            recentChanges,
          ),
        },
      ],
    });

    return this.parseJsonResponse(response);
  }

  private parseJsonResponse<T>(response: Anthropic.Message): T {
    const textBlock = response.content.find((block) => block.type === "text");
    if (textBlock == null || textBlock.type !== "text") {
      throw new Error("LLM 응답에서 텍스트를 찾을 수 없어요.");
    }

    let raw = textBlock.text.trim();
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
      raw = fenced[1].trim();
    }

    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.error(
        `LLM 응답 파싱 실패: ${textBlock.text}`,
        (error as Error).stack,
      );
      throw new Error("LLM 응답을 파싱할 수 없어요.");
    }
  }
}
