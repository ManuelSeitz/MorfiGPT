import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthenticatedUser } from "@repo/types/auth";
import { compare, hash } from "bcrypt";
import type { FastifyReply } from "fastify";
import { Profile } from "passport-google-oauth20";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.password) return null;

    const isPasswordValid = await compare(pass, user.password);
    if (!isPasswordValid) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  }

  async findOrCreateOAuthUser(
    profile: Profile,
  ): Promise<AuthenticatedUser | null> {
    const { emails, displayName, photos } = profile;
    if (!emails) return null;

    const email = emails[0];
    const user = await this.userService.findOrCreate(email.value, {
      email: email.value,
      emailVerified: email.verified,
      name: displayName,
      avatar: photos?.[0]?.value ?? null,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  }

  async getTokens(user: AuthenticatedUser) {
    const { id, name, email, emailVerified, avatar } = user;
    const payload = { sub: id, name, email, emailVerified, avatar };
    const refreshPayload = { sub: id, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: "30m",
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  saveTokens(
    res: FastifyReply,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const isProd = process.env.NODE_ENV === "production";

    res.setCookie("ACCESS_TOKEN", tokens.accessToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: isProd,
      maxAge: 60 * 30,
    });

    res.setCookie("REFRESH_TOKEN", tokens.refreshToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: isProd,
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  async validateRefreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userService.findByEmail(payload.email);

      if (!user) throw Error();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;

      return result;
    } catch {
      throw new UnauthorizedException("Refresh token inválido");
    }
  }

  async signup(email: string, pass: string) {
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException("El usuario ya existe");
    }

    const hashedPassword = await hash(pass, 10);

    const user = await this.userService.save({
      email,
      password: hashedPassword,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  }
}
