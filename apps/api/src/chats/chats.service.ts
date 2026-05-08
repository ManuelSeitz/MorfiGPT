import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { OpenRouter } from "@openrouter/sdk";
import { EventStream } from "@openrouter/sdk/lib/event-streams.js";
import { ChatStreamingResponseChunk } from "@openrouter/sdk/models";
import { InvalidRequestError } from "@openrouter/sdk/models/errors";
import { UserInput } from "@repo/types/recipes";
import { FastifyReply } from "fastify";
import { LessThan, Repository } from "typeorm";
import { EmbeddingsService } from "../embeddings/embeddings.service";
import { Recipe } from "../recipes/entities/recipe.entity";
import { RecipesService } from "../recipes/recipes.service";
import { User } from "../users/entities/user.entity";
import { Chat } from "./entities/chat.entity";
import { Message, Role } from "./entities/message.entity";

interface Event {
  type: string;
  content: string;
}

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    @InjectRepository(Recipe) private recipeRepository: Repository<Recipe>,
    private readonly embeddingsService: EmbeddingsService,
    private readonly recipesService: RecipesService,
  ) {}

  private readonly openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  async getIntent(history: Message[]): Promise<"search_recipe" | "ask"> {
    const intentPrompt =
      "Analiza el historial de chat para clasificar la intención del ÚLTIMO mensaje en una de estas categorías:\n\n" +
      "1. search_recipe: El usuario busca una receta nueva, una sugerencia de comida o ingredientes para un plato que NO se ha seleccionado todavía.\n" +
      "2. ask: Preguntas sobre una receta ya mencionada, dudas técnicas, sustitución de ingredientes de un plato en curso, o cualquier charla general.\n\n" +
      "Reglas basadas en el contexto:\n" +
      "- Si el usuario menciona que 'no tiene un ingrediente' o pregunta 'cómo reemplazar algo' sobre una receta que ya se está discutiendo en el historial, clasifica como: ask.\n" +
      "- Si el usuario pide sugerencias de qué cocinar desde cero (aunque sea siguiendo el hilo), clasifica como: search_recipe.\n" +
      "- Si hay duda entre ambas, pero el usuario está 'modificando' una receta ya dada por el asistente, es: ask.\n\n" +
      "Responde ÚNICAMENTE con la palabra exacta: search_recipe o ask.";

    const intentResponse = await this.openrouter.chat.send({
      chatGenerationParams: {
        model: process.env.OPENROUTER_MODEL,
        messages: [
          { role: "system", content: intentPrompt },
          ...history.map(({ role, content }) => ({ role, content })),
        ],
      },
    });

    const message = (intentResponse.choices[0].message.content as string)
      .trim()
      .toLowerCase();

    if (message !== "search_recipe" && message !== "ask") return "ask";

    return message;
  }

  async streamRecipe(history: Message[]) {
    const userInput = history.at(-1)?.content || "";

    const initialPrompt =
      "Convierte la entrada del usuario en JSON con este formato:" +
      '{"recipe":"string","maxPrice":number|null,"priceLevel":"low|medium|high|null"}.' +
      " 'recipe': descripción breve con contexto útil (ingredientes o preparación), sin relleno." +
      " Si el usuario NO menciona ninguna receta, plato o comida específica, debes agregar una receta adecuada para recomendar." +
      " 'maxPrice': número solo si el usuario indica un límite explícito; si no hay, null." +
      " 'priceLevel': 'low','medium' o 'high' según intención (barato, medio, caro); si no hay info, null." +
      " No conviertas 'barato/caro' a número." +
      " Responde solo JSON válido, sin texto extra ni saltos de línea." +
      " Ejemplos:" +
      ' Input: "lasaña barata" → {"recipe":"lasaña casera al horno","maxPrice":null,"priceLevel":"low"}' +
      ' Input: "ensalada menos de 500" → {"recipe":"ensalada fresca con verduras","maxPrice":500,"priceLevel":null}' +
      ' Input: "algo para cenar" → {"recipe":"pollo al horno con verduras","maxPrice":null,"priceLevel":null}';

    const llmResponse = await this.openrouter.chat.send({
      chatGenerationParams: {
        model: process.env.OPENROUTER_MODEL,
        messages: [
          { role: "system", content: initialPrompt },
          { role: "user", content: userInput },
        ],
      },
    });

    let formattedInput: UserInput | null = null;

    try {
      formattedInput = JSON.parse(
        llmResponse.choices[0].message.content as string,
      ) as UserInput;
    } catch {
      throw new InvalidRequestError("Invalid JSON from LLM");
    }

    const inputEmbedding = await this.embeddingsService.embedInput(
      formattedInput.recipe,
    );

    const query = this.recipeRepository.createQueryBuilder("recipe");

    if (formattedInput.maxPrice) {
      query.where("recipe.estimatedPrice <= :maxPrice", {
        maxPrice: formattedInput.maxPrice,
      });
    }

    query
      .addSelect(
        `recipe.recipeEmbedding <=> CAST(:vector AS vector)`,
        "distance",
      )
      .setParameter("vector", `[${inputEmbedding.join(",")}]`)
      .orderBy("distance", "ASC")
      .limit(3);

    const recipes = await query.getMany();

    const systemPrompt =
      "Eres un asistente de cocina experto de Argentina.\n" +
      "Debes responder únicamente en español, de manera amigable, y con una secuencia de objetos JSON válidos, uno por línea.\n" +
      "Incluye emojis (especialmente en títulos, subtítulos e ingredientes), para una respuesta más amigable.\n" +
      'Aclara para cuántas personas es la receta utilizando el campo "servings" proporcionado por el usuario.\n' +
      "Cada objeto debe tener la forma:\n" +
      '{"type": string, "content": string}\n' +
      'Si el tipo es "text", el contenido del JSON debe ser en formato markdown\n' +
      "Ejemplo:\n" +
      '{"type":"text","content":"Introducción..."}\n' +
      '{"type":"title","content":"Milanesas"}\n' +
      '{"type":"text","content":"Estas milanesas..."}\n' +
      '{"type":"subtitle","content":"Ingredientes"}\n' +
      '{"type":"ingredient_0","content":"{"title":"Una calabaza mediana 🧡","name":"calabaza","quantity":"1","unit":null,"optional":false}"}\n' +
      '{"type":"subtitle","content":"Instrucciones"}\n' +
      '{"type":"step_0","content":"Cortar la carne"}\n' +
      '{"type":"subtitle","content":"Recomendaciones"}\n' +
      '{"type":"text","content":"Como recomendación..."}\n' +
      'Para cada ingrediente, el campo "content" debe ser un JSON serializado (stringificado), con comillas dobles en cada propiedad.\n' +
      'Los campos originales de cada ingrediente deben mantenerse, excepto el campo "name".\n' +
      'El campo "name" debe ser transformado a una versión optimizada para búsquedas en e-commerce (como VTEX), siguiendo estas reglas:\n' +
      "- Usar nombres simples, genéricos y en singular.\n" +
      "- Eliminar descriptores de corte, forma o preparación (ej: 'en cubos', 'picado', 'en rodajas', etc).\n" +
      "- Evitar adjetivos innecesarios (ej: 'fresco', 'grande', 'rico').\n" +
      "- Priorizar el nombre más común de producto en supermercado.\n" +
      "- No incluir cantidades ni unidades.\n" +
      'Ejemplos de transformación del campo "name":\n' +
      "- 'Zuccini en cuartos' → 'zucchini'\n" +
      "- 'Palta/aguacate' → 'palta'\n" +
      "- 'Tomates cherry en rodajas' → 'tomate cherry'\n" +
      "- 'Puré de tomates' → 'pure de tomate'\n" +
      "- 'Huevos grandes' → 'huevo'\n" +
      "- 'Dientes de ajo picados' → 'ajo'\n" +
      "Además, debes agregar:\n" +
      '- "title": un nombre descriptivo del ingrediente con emojis incluyendo la cantidad, unidad y si es opcional. La cantidad puede adaptarse en el title para ser más legible.\n' +
      "Si algún atributo es null, déjalo como null.\n" +
      "Habla sólo de la primera receta, el resto menciónalas al final de la recomendación, sin mencionar datos internos como el ID.\n" +
      "No escribas texto fuera de JSON.";

    const optimizedRecipes = recipes.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      estimatedTime: r.estimatedTime,
      servings: r.servings,
      ingredients: r.ingredients.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        optional: i.optional,
      })),
      instructions: r.instructions,
      link: r.link,
    }));

    const stream = await this.openrouter.chat.send({
      chatGenerationParams: {
        model: process.env.OPENROUTER_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `User input: ${userInput}. Recipes: ${JSON.stringify(optimizedRecipes)}`,
          },
        ],
        stream: true,
      },
    });

    return { recipe: recipes[0], stream };
  }

  async streamAsk(history: Message[]) {
    const askPrompt =
      "Eres una app de recetas de Argentina. Tu nombre es MorfiGPT.\n" +
      "Tu trabajo es responder a lo que el usuario escribe y responder sus dudas de forma amigable.\n" +
      "Si la pregunta no está relacionada a la cocina, explica que no fuiste programado para responder eso.\n" +
      'Responde únicamente en formato JSON: {"type":"text","content":"respuesta"} y separa cada JSON con un salto de línea.' +
      "El contenido de cada JSON debe estar en formato markdown y sólo haz uso de negritas para palabras clave";

    const stream = await this.openrouter.chat.send({
      chatGenerationParams: {
        model: process.env.OPENROUTER_MODEL,
        messages: [
          { role: "system", content: askPrompt },
          ...history.map(({ role, content }) => ({ role, content })),
        ],
        stream: true,
      },
    });

    return { stream };
  }

  sendEvent(res: FastifyReply, data: Event) {
    res.raw.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  async sendStreamResponse(
    res: FastifyReply,
    stream: EventStream<ChatStreamingResponseChunk>,
    recipe?: Recipe,
  ) {
    const messageId = crypto.randomUUID();
    const idEvent = { type: "id", content: messageId };
    const events: Event[] = [idEvent];
    let buffer = "";

    this.sendEvent(res, idEvent);

    if (recipe) {
      const recipeData = {
        type: "recipe",
        content: JSON.stringify({
          servings: recipe.servings,
          link: recipe.link,
        }),
      };
      events.push(recipeData);
      this.sendEvent(res, recipeData);
    }

    this.sendEvent(res, { type: "start", content: "" });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (!content) continue;

      buffer += content;

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line.trim()) as Event;
          events.push(parsed);
          this.sendEvent(res, parsed);
        } catch {
          continue;
        }
      }
    }

    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer.trim()) as Event;
        events.push(parsed);
        this.sendEvent(res, parsed);
      } catch {
        // Ignore
      }
    }

    if (recipe) {
      const recipeVideos = await this.recipesService.getRecipeVideos(
        recipe.title,
      );
      const videoData = {
        type: "videos",
        content: JSON.stringify(recipeVideos),
      };

      events.push(videoData);
      this.sendEvent(res, videoData);
    }

    this.sendEvent(res, { type: "done", content: "" });
    res.raw.end();
    const fullResponse = JSON.stringify(events);
    return { messageId, fullResponse };
  }

  async getRecentHistory(chatId: string) {
    const MAX_HISTORY_LENGTH = 10;
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ["messages"],
      order: { messages: { createdAt: "ASC" } },
    });
    if (!chat) return [];
    const history = chat.messages.slice(-MAX_HISTORY_LENGTH);
    return history;
  }

  async createChatTitle(assistantResponse: string, chatId: string) {
    const response = await this.openrouter.chat.send({
      chatGenerationParams: {
        model: process.env.OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content:
              `Genera un título corto para un chat. Debe ser en texto plano, con un emoji al principio, y basado siguiente respuesta: ${assistantResponse}\n` +
              "Si la respuesta se trata de una receta, el título puede ser la categoría de esa receta.",
          },
        ],
      },
    });

    const title = response.choices[0].message.content as string;

    await this.chatRepository.update({ id: chatId }, { title });
  }

  async saveMessage(role: Role, content: string, chatId: string, id?: string) {
    const message = this.messageRepository.create({
      id,
      role,
      content,
      chat: { id: chatId },
    });
    await this.messageRepository.save(message);
  }

  async getAll(userId: string) {
    const chats = await this.chatRepository.find({
      where: { user: { id: userId } },
      order: { updatedAt: "DESC" },
    });
    return chats;
  }

  async findById(id: string) {
    const chat = await this.chatRepository.findOne({
      where: { id },
      relations: ["messages", "user"],
      order: {
        messages: {
          createdAt: "ASC",
        },
      },
    });

    return chat;
  }

  async findOrCreate(id: string, user: User | null): Promise<Chat> {
    let existingChat = await this.chatRepository.findOne({
      where: { id },
      relations: ["messages"],
    });

    if (!existingChat) {
      existingChat = this.chatRepository.create({
        id,
        user,
        messages: [],
        expiresAt: user ? null : undefined,
      });

      await this.chatRepository.save(existingChat);
    }

    return existingChat;
  }

  async deleteById(id: string) {
    await this.chatRepository.delete({ id });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanExpiredChats() {
    await this.chatRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
