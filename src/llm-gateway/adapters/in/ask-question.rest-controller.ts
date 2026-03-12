import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiSecurity, ApiBody, ApiResponse } from "@nestjs/swagger";
import { DIToken } from "../../../shared/di/token.di";
import { RestApiKeyGuard } from "../../../shared/guard/rest-api-key.guard";
import { AskQuestionUseCase } from "../../domain/ports/in/ask-question.use-case";
import {
  AskQuestionRequestDto,
  AskQuestionResponseDto,
} from "./dto/ask-question.dto";

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
  @ApiBody({ type: AskQuestionRequestDto })
  @ApiResponse({ status: 200, type: AskQuestionResponseDto })
  public async ask(@Body() request: AskQuestionRequestDto) {
    return this.askQuestionUseCase.invoke(request);
  }
}
