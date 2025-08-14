import PostList from '@/components/organisms/PostList';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-800 p-8">
      <PostList />
    </main>
  );
}