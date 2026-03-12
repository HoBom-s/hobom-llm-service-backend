import { Inject, Injectable } from "@nestjs/common";
import { GenerateStudyMaterialUseCase } from "../../domain/ports/in/generate-study-material.use-case";
import { LlmClientPort } from "../../domain/ports/out/llm-client.port";
import { DIToken } from "../../../shared/di/token.di";

@Injectable()
export class GenerateStudyMaterialService
  implements GenerateStudyMaterialUseCase
{
  constructor(
    @Inject(DIToken.LlmGatewayModule.LlmClientPort)
    private readonly llmClientPort: LlmClientPort,
  ) {}

  public async invoke(request: {
    changes: {
      articleNo: string;
      changeType: string;
      before: string;
      after: string;
    }[];
  }) {
    return this.llmClientPort.generateStudyMaterial(request.changes);
  }
}
