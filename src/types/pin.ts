export type Pin = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  tags: {
    id: string;
    name: string;
  }[];
  _count: {
    likes: number;
    saves: number;
  };
};
