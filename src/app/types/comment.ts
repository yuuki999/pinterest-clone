export interface Comment {
  id: string;
  content: string;
  text?: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}
