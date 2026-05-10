import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { GoogleStrategy } from "./strategies/google.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    LocalAuthGuard,
    JwtAuthGuard,
    GoogleAuthGuard,
  ],
  exports: [LocalAuthGuard, JwtAuthGuard, GoogleAuthGuard],
})
export class AuthModule {}
