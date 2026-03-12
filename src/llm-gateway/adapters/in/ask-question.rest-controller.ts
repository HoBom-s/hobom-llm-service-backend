import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { DIToken } from "../../../shared/di/token.di";
import { RestApiKeyGuard } from "../../../shared/guard/rest-api-key.guard";
import { AskQuestionUseCase } from "../../domain/ports/in/ask-question.use-case";

@Controller("api/v1")
@UseGuards(RestApiKeyGuard)
export class AskQuestionRestController {
  constructor(
    @Inject(DIToken.LlmGatewayModule.AskQuestionUseCase)
    private readonly askQuestionUseCase: AskQuestionUseCase,
  ) {}

  @Post("ask")
  public async ask(
    @Body()
    request: {
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
    },
  ) {
    return this.askQuestionUseCase.invoke(request);
  }
}
