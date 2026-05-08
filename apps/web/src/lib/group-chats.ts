import { Chat } from "@repo/types/chats";

export function groupChats(chats: Chat[]) {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const groups: Record<string, Chat[]> = {
    Hoy: [],
    Ayer: [],
    "Esta semana": [],
    "Este mes": [],
    "Este año": [],
  };

  chats.forEach((chat) => {
    const date = new Date(chat.updatedAt);

    if (date >= startOfToday) {
      groups["Hoy"].push(chat);
    } else if (date >= startOfYesterday) {
      groups["Ayer"].push(chat);
    } else if (date >= startOfWeek) {
      groups["Esta semana"].push(chat);
    } else if (date >= startOfMonth) {
      groups["Este mes"].push(chat);
    } else if (date >= startOfYear) {
      groups["Este año"].push(chat);
    }
  });

  return groups;
}
