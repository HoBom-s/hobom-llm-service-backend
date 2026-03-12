import { Module } from "@nestjs/common";
import { DIToken } from "../shared/di/token.di";
import { GeminiClientAdapter } from "./adapters/out/gemini-client.adapter";
import { GenerateStudyMaterialService } from "./application/use-cases/generate-study-material.service";
import { AskQuestionService } from "./application/use-cases/ask-question.service";
import { StudyMaterialGrpcController } from "./adapters/in/study-material.grpc-controller";
import { AskQuestionGrpcController } from "./adapters/in/ask-question.grpc-controller";
import { AskQuestionRestController } from "./adapters/in/ask-question.rest-controller";

@Module({
  controllers: [
    StudyMaterialGrpcController,
    AskQuestionGrpcController,
    AskQuestionRestController,
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
  ],
})
export class LlmGatewayModule {}
