import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get("GOOGLE_CLIENT_ID") || "",
      clientSecret: configService.get("GOOGLE_CLIENT_SECRET") || "",
      callbackURL: new URL(
        "/auth/google/callback",
        configService.get("API_URL"),
      ).toString(),
      scope: ["email", "profile"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = await this.authService.findOrCreateOAuthUser(profile);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
