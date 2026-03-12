import { Controller, Inject, UseGuards } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { DIToken } from "../../../shared/di/token.di";
import { GrpcApiKeyGuard } from "../../../shared/guard/grpc-api-key.guard";
import { AskQuestionUseCase } from "../../domain/ports/in/ask-question.use-case";

@Controller()
@UseGuards(GrpcApiKeyGuard)
export class AskQuestionGrpcController {
  constructor(
    @Inject(DIToken.LlmGatewayModule.AskQuestionUseCase)
    private readonly askQuestionUseCase: AskQuestionUseCase,
  ) {}

  @GrpcMethod("AskQuestionService", "Ask")
  public async ask(request: {
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
    return this.askQuestionUseCase.invoke(request);
  }
}
