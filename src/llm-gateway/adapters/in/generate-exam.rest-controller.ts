import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiSecurity,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import { DIToken } from "../../../shared/di/token.di";
import { RestApiKeyGuard } from "../../../shared/guard/rest-api-key.guard";
import { GenerateExamUseCase } from "../../domain/ports/in/generate-exam.use-case";
import {
  GenerateExamRequestDto,
  GenerateExamResponseDto,
} from "./dto/generate-exam.dto";

@ApiTags("LLM")
@ApiSecurity("api-key")
@Controller("api/v1")
@UseGuards(RestApiKeyGuard)
export class GenerateExamRestController {
  constructor(
    @Inject(DIToken.LlmGatewayModule.GenerateExamUseCase)
    private readonly generateExamUseCase: GenerateExamUseCase,
  ) {}

  @Post("generate-exam")
  @ApiOperation({ summary: "CPPG 모의고사 문제 생성" })
  @ApiBody({ type: GenerateExamRequestDto })
  @ApiResponse({ status: 200, type: GenerateExamResponseDto })
  public async generateExam(@Body() request: GenerateExamRequestDto) {
    return this.generateExamUseCase.invoke(request);
  }
}
