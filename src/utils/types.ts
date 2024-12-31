
import { Channel, User } from "./interfaces";

export function isUser(chat: Channel | User | null): chat is User {
    return chat !== null && 'username' in chat; 
  }