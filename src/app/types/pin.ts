export interface Pin {
  id: string;
  title: string;
  description: string | null | undefined;
  imageUrl: string;
  createdAt: Date;
  saved: boolean;
}
