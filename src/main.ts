import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { Logger } from "nestjs-pino";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: `${process.env.HOBOM_GRPC_HOST ?? "0.0.0.0"}:${process.env.HOBOM_GRPC_PORT ?? "50052"}`,
        package: ["llm"],
        protoPath: [
          join(
            __dirname,
            "../../hobom-buf-proto/llm/v1/generate-study-material.proto",
          ),
          join(
            __dirname,
            "../../hobom-buf-proto/llm/v1/ask-question.proto",
          ),
        ],
      },
    },
  );

  app.useLogger(app.get(Logger));
  await app.listen();

  const logger = app.get(Logger);
  logger.log(
    `gRPC LLM service running on port ${process.env.HOBOM_GRPC_PORT ?? "50052"}`,
    "Bootstrap",
  );
}

bootstrap().catch((error) => {
  console.error("Bootstrap failed", error);
  process.exit(1);
});
