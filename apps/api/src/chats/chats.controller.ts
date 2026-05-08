import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { EventStream } from "@openrouter/sdk/lib/event-streams.js";
import { ChatStreamingResponseChunk } from "@openrouter/sdk/models";
import { AuthenticatedUser, DecodedAccessToken } from "@repo/types/auth";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Repository } from "typeorm";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Recipe } from "../recipes/entities/recipe.entity";
import { User } from "../users/entities/user.entity";
import { ChatsService } from "./chats.service";
import { SendMessageDto } from "./dtos/send-message.dto";
import { Role } from "./entities/message.entity";
import { ChatsGuard } from "./guards/chats.guard";

@Controller("chats")
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Req() req: FastifyRequest & { user: AuthenticatedUser }) {
    const user = req.user;
    const chats = await this.chatsService.getAll(user.id);
    return chats;
  }

  @UseGuards(ChatsGuard)
  @Get("chat")
  async chat(
    @Query() { chatId, message }: SendMessageDto,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const token = req.cookies["ACCESS_TOKEN"] ?? null;
    let user: User | null = null;
    if (token) {
      const tokenPayload = this.jwtService.decode<DecodedAccessToken>(token, {
        json: true,
      });
      user = await this.userRepository.findOne({
        where: { id: tokenPayload.sub },
      });
    }

    const chat = await this.chatsService.findOrCreate(chatId, user);
    await this.chatsService.saveMessage(Role.USER, message, chat.id);

    const history = await this.chatsService.getRecentHistory(chat.id);

    const intent = await this.chatsService.getIntent(history);

    res.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": process.env.WEB_URL,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "X-Accel-Buffering": "no",
    });

    const actions = {
      search_recipe: () => this.chatsService.streamRecipe(history),
      ask: () => this.chatsService.streamAsk(history),
    };

    const action: {
      stream: EventStream<ChatStreamingResponseChunk>;
      recipe?: Recipe;
    } = await actions[intent]();

    const { messageId, fullResponse } =
      await this.chatsService.sendStreamResponse(
        res,
        action.stream,
        action.recipe,
      );

    if (!chat.title && !chat.expiresAt) {
      await this.chatsService.createChatTitle(fullResponse, chat.id);
    }

    await this.chatsService.saveMessage(
      Role.ASSISTANT,
      fullResponse,
      chat.id,
      messageId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async findById(
    @Param("id") id: string,
    @Req() req: FastifyRequest & { user: AuthenticatedUser },
  ) {
    const user = req.user;
    const chat = await this.chatsService.findById(id);

    if (!chat) {
      throw new NotFoundException("Chat no encontrado");
    }

    if (chat.user?.id !== user.id) {
      throw new UnauthorizedException("No estás autorizado a leer este chat");
    }

    return chat;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @HttpCode(204)
  async delete(
    @Param("id") id: string,
    @Req() req: FastifyRequest & { user: AuthenticatedUser },
  ) {
    const user = req.user;
    const chat = await this.chatsService.findById(id);

    if (!chat) {
      throw new NotFoundException("Chat no encontrado");
    }

    if (chat.user?.id !== user.id) {
      throw new UnauthorizedException(
        "No estás autorizado a eliminar este chat",
      );
    }

    await this.chatsService.deleteById(chat.id);
  }
}
