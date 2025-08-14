export interface Post {
  id: string;
  title: string;
  content: string | null;
  published: boolean;
  createdAt: string; // Assuming ISO string from Prisma
  updatedAt: string; // Assuming ISO string from Prisma
}

export interface PostsApiResponse {
  posts: Post[];
  totalPosts: number;
}
