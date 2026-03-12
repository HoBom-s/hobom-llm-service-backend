import { Inject, Injectable } from "@nestjs/common";
import { AskQuestionUseCase } from "../../domain/ports/in/ask-question.use-case";
import { LlmClientPort } from "../../domain/ports/out/llm-client.port";
import { DIToken } from "../../../shared/di/token.di";

@Injectable()
export class AskQuestionService implements AskQuestionUseCase {
  constructor(
    @Inject(DIToken.LlmGatewayModule.LlmClientPort)
    private readonly llmClientPort: LlmClientPort,
  ) {}

  public async invoke(request: {
    question: string;
    articles: {
      articleNo: string;
      articleTitle: string;
      content: string;
    }[];
    recentChanges: {
      articleNo: string;
      changeType: string;
      before: string;
      after: string;
    }[];
  }) {
    return this.llmClientPort.askQuestion(
      request.question,
      request.articles,
      request.recentChanges,
    );
  }
}
