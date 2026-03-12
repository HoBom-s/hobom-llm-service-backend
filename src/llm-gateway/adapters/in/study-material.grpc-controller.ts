import { Controller, Inject, UseGuards } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { DIToken } from "../../../shared/di/token.di";
import { GrpcApiKeyGuard } from "../../../shared/guard/grpc-api-key.guard";
import { GenerateStudyMaterialUseCase } from "../../domain/ports/in/generate-study-material.use-case";

@Controller()
@UseGuards(GrpcApiKeyGuard)
export class StudyMaterialGrpcController {
  constructor(
    @Inject(DIToken.LlmGatewayModule.GenerateStudyMaterialUseCase)
    private readonly generateStudyMaterialUseCase: GenerateStudyMaterialUseCase,
  ) {}

  @GrpcMethod("StudyMaterialService", "Generate")
  public async generate(request: {
    changes: {
      articleNo: string;
      changeType: string;
      before: string;
      after: string;
    }[];
  }) {
    return this.generateStudyMaterialUseCase.invoke(request);
  }
}
