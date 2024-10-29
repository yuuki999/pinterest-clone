import { User } from "./user";

export interface Pin {
  id: string;
  title: string;
  description: string | null | undefined;
  imageUrl: string;
  user: User;
  createdAt: Date;
  comments: Comment[];
}
