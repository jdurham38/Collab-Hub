// In a suitable place, e.g., your 'types/index.ts' file:
import { Channel, User } from "./interfaces";

export function isUser(chat: Channel | User | null): chat is User {
    return chat !== null && 'username' in chat; // Assuming 'username' only exists in User
  }