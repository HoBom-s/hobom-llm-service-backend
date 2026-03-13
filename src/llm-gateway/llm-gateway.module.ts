import { Module } from "@nestjs/common";
import { DIToken } from "../shared/di/token.di";
import { GeminiClientAdapter } from "./adapters/out/gemini-client.adapter";
import { GenerateStudyMaterialService } from "./application/use-cases/generate-study-material.service";
import { AskQuestionService } from "./application/use-cases/ask-question.service";
import { StudyMaterialGrpcController } from "./adapters/in/study-material.grpc-controller";
import { AskQuestionGrpcController } from "./adapters/in/ask-question.grpc-controller";
import { AskQuestionRestController } from "./adapters/in/ask-question.rest-controller";
import { GenerateExamRestController } from "./adapters/in/generate-exam.rest-controller";
import { GenerateExamService } from "./application/use-cases/generate-exam.service";

@Module({
  controllers: [
    StudyMaterialGrpcController,
    AskQuestionGrpcController,
    AskQuestionRestController,
    GenerateExamRestController,
  ],
  providers: [
    {
      provide: DIToken.LlmGatewayModule.LlmClientPort,
      useClass: GeminiClientAdapter,
    },
    {
      provide: DIToken.LlmGatewayModule.GenerateStudyMaterialUseCase,
      useClass: GenerateStudyMaterialService,
    },
    {
      provide: DIToken.LlmGatewayModule.AskQuestionUseCase,
      useClass: AskQuestionService,
    },
    {
      provide: DIToken.LlmGatewayModule.GenerateExamUseCase,
      useClass: GenerateExamService,
    },
  ],
})
export class LlmGatewayModule {}
