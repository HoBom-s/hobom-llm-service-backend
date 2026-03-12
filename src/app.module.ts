import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { ConfigService } from "@nestjs/config";
import { LlmGatewayModule } from "./llm-gateway/llm-gateway.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get<string>("LOG_LEVEL", "info"),
          transport:
            configService.get<string>("NODE_ENV") !== "production"
              ? {
                  target: "pino-pretty",
                  options: { colorize: true, singleLine: true },
                }
              : undefined,
        },
      }),
    }),
    LlmGatewayModule,
  ],
})
export class AppModule {}
