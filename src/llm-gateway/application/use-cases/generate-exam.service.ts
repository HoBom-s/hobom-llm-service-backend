import { Inject, Injectable } from "@nestjs/common";
import { GenerateExamUseCase } from "../../domain/ports/in/generate-exam.use-case";
import { LlmClientPort } from "../../domain/ports/out/llm-client.port";
import { DIToken } from "../../../shared/di/token.di";

@Injectable()
export class GenerateExamService implements GenerateExamUseCase {
  constructor(
    @Inject(DIToken.LlmGatewayModule.LlmClientPort)
    private readonly llmClientPort: LlmClientPort,
  ) {}

  public async invoke(request: {
    articles: { articleNo: string; articleTitle: string; content: string }[];
    subject: string;
    questionCount: number;
  }) {
    return this.llmClientPort.generateExamQuestions(
      request.articles,
      request.subject,
      request.questionCount,
    );
  }
}
