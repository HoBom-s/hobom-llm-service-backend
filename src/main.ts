import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
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
        "llm/v1/generate-study-material.proto",
        "llm/v1/ask-question.proto",
      ],
      loader: {
        includeDirs: [join(__dirname, "../hobom-buf-proto")],
      },
    },
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("HoBom LLM Service")
    .setDescription("CPPG Privacy-Law LLM API")
    .setVersion("1.0")
    .addApiKey({ type: "apiKey", name: "x-api-key", in: "header" }, "api-key")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api-docs", app, document);

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
