import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { DecodedAccessToken } from "@repo/types/auth";
import type { FastifyRequest } from "fastify";
import { Observable } from "rxjs";

@Injectable()
export class ChatsGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  private requests = new Map<string, number[]>();

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let userId: string | null = null;
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const token = request.cookies.ACCESS_TOKEN;

    if (token) {
      try {
        const payload = this.jwtService.verify<DecodedAccessToken>(token, {
          secret: this.configService.get<string>("JWT_SECRET"),
        });
        userId = payload.sub;
      } catch {
        userId = null;
      }
    }

    const ip = request.ip;

    const key = userId ?? ip;
    const limit = userId ? 15 : 5;

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const timestamps =
      this.requests.get(key)?.filter((t) => now - t < DAY) ?? [];

    timestamps.push(now);
    this.requests.set(key, timestamps);

    if (timestamps.length === 1) {
      setTimeout(() => this.requests.delete(key), DAY);
    }

    if (timestamps.length > limit) {
      throw new HttpException(
        token
          ? "Límite diario alcanzado (10 requests)"
          : "Límite diario alcanzado (3 requests sin inicio de sesión)",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
