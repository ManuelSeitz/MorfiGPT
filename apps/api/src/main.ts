import cookie from "@fastify/cookie";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { ServerResponse } from "http";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({
    origin: process.env.WEB_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  const fastifyInstance = app.getHttpAdapter().getInstance();
  fastifyInstance.addHook("onRequest", (_request, reply, done) => {
    reply.raw.setHeader = reply.raw.setHeader.bind(
      reply.raw,
    ) as ServerResponse["setHeader"];
    reply.raw.end = reply.raw.end.bind(reply.raw) as ServerResponse["end"];
    done();
  });

  void app.register(cookie, { secret: process.env.COOKIE_SECRET });

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, forbidUnknownValues: true }),
  );

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
void bootstrap();
