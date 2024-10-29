import { User } from "./user";

export interface Comment {
  id: string;
  text: string;
  user: User;
  createdAt: Date;
}
