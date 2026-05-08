export interface Chat {
  id: string;
  title: string | null;
  messages: Message[];
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  chat: Chat;
  createdAt: string;
}
