import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiSecurity } from "@nestjs/swagger";
import { DIToken } from "../../../shared/di/token.di";
import { RestApiKeyGuard } from "../../../shared/guard/rest-api-key.guard";
import { AskQuestionUseCase } from "../../domain/ports/in/ask-question.use-case";

@ApiTags("LLM")
@ApiSecurity("api-key")
@Controller("api/v1")
@UseGuards(RestApiKeyGuard)
export class AskQuestionRestController {
  constructor(
    @Inject(DIToken.LlmGatewayModule.AskQuestionUseCase)
    private readonly askQuestionUseCase: AskQuestionUseCase,
  ) {}

  @Post("ask")
  @ApiOperation({ summary: "개인정보보호법 관련 질문 (CPPG)" })
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
