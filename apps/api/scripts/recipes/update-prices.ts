import cookie from "@fastify/cookie";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import "dotenv/config";
import { AppModule } from "../../src/app.module";
import { RecipesService } from "../../src/recipes/recipes.service";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  void app.register(cookie, { secret: process.env.COOKIE_SECRET });

  const recipesService = app.get(RecipesService);

  await recipesService.updatePrices();

  await app.close();
}

void bootstrap();
