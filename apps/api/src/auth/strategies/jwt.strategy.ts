import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { AuthenticatedUser } from "@repo/types/auth";
import { FastifyRequest } from "fastify";
import { Strategy } from "passport-jwt";

interface Payload {
  sub: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  avatar: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: FastifyRequest) => {
        return req.cookies["ACCESS_TOKEN"] || null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_SECRET") || "",
    });
  }

  validate(payload: Payload): AuthenticatedUser {
    const { sub, name, email, emailVerified, avatar } = payload;
    return { id: sub, name, email, emailVerified, avatar };
  }
}
