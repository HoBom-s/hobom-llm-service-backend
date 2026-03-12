import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RestApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers["x-api-key"] as string | undefined;
    const expected =
      this.configService.getOrThrow<string>("HOBOM_GRPC_API_KEY");

    if (apiKey == null || apiKey !== expected) {
      throw new UnauthorizedException("Invalid API key");
    }

    return true;
  }
}
