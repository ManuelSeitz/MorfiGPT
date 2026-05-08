import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthenticatedUser } from "@repo/types/auth";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { SendCredentialsDto } from "./dtos/send-credentials.dto";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(GoogleAuthGuard)
  @Get("google")
  async googleAuth() {}

  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  async googleAuthRedirect(
    @Req() req: FastifyRequest & { user: AuthenticatedUser },
    @Res() res: FastifyReply,
  ) {
    const user = req.user;
    const tokens = await this.authService.getTokens(user);
    this.authService.saveTokens(res, tokens);

    const htmlPayload = `
    <html>
      <body>
        <script>
          const user = ${JSON.stringify(user)};
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_SUCCESS', user }, 
            "${process.env.WEB_URL ?? "NO URL FOUND"}"
          );
          window.close();
        </script>
      </body>
    </html>
    `;

    res.type("text/html").send(htmlPayload);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(
    @Body() _: SendCredentialsDto,
    @Req() req: FastifyRequest & { user: AuthenticatedUser },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const user = req.user;
    const tokens = await this.authService.getTokens(user);
    this.authService.saveTokens(res, tokens);
    return user;
  }

  @Post("signup")
  async signup(
    @Body() { email, password }: SendCredentialsDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const user = await this.authService.signup(email, password);
    const tokens = await this.authService.getTokens(user);
    this.authService.saveTokens(res, tokens);
    return user;
  }

  @HttpCode(204)
  @Post("logout")
  logout(@Res({ passthrough: true }) res: FastifyReply) {
    res.clearCookie("ACCESS_TOKEN");
    res.clearCookie("REFRESH_TOKEN");
  }

  @Get("refresh")
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshToken = req.cookies.REFRESH_TOKEN;

    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token");
    }

    const user = await this.authService.validateRefreshToken(refreshToken);

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.getTokens(user);

    this.authService.saveTokens(res, {
      accessToken,
      refreshToken: newRefreshToken,
    });

    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: FastifyRequest & { user: AuthenticatedUser }) {
    const user = req.user;
    return user;
  }
}
