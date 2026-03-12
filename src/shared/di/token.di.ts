import { DITokenRegister } from "./token-registry.di";

export class DIToken {
  public static readonly LlmGatewayModule = class extends DITokenRegister {
    public static LlmClientPort = this.register("LlmClientPort");
    public static GenerateStudyMaterialUseCase = this.register(
      "GenerateStudyMaterialUseCase",
    );
    public static AskQuestionUseCase = this.register("AskQuestionUseCase");
  };
}
