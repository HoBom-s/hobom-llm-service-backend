import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ValidationPipe } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
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
  });

  await app.startAllMicroservices();
  await app.listen(Number(process.env.HOBOM_REST_PORT ?? 3000));

  const logger = app.get(Logger);
  logger.log(
    `gRPC LLM service running on port ${process.env.HOBOM_GRPC_PORT ?? "50052"}`,
    "Bootstrap",
  );
  logger.log(
    `REST API running on port ${process.env.HOBOM_REST_PORT ?? 3000}`,
    "Bootstrap",
  );
}

bootstrap().catch((error) => {
  console.error("Bootstrap failed", error);
  process.exit(1);
});
