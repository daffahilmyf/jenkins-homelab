import { getPosts, createPost, updatePost, deletePost } from '@/lib/api';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

describe('API Client Functions', () => {
  const mockPosts = [
    {
      id: '1',
      title: 'Post 1',
      content: 'Content 1',
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Post 2',
      content: 'Content 2',
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Post 3',
      content: 'Content 3',
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Post 4',
      content: 'Content 4',
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Post 5',
      content: 'Content 5',
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'Post 6',
      content: 'Content 6',
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  describe('getPosts', () => {
    it('should fetch posts successfully', async () => {
      server.use(
        http.get('/api/posts', ({ request }) => {
          const url = new URL(request.url);
          const skip = Number(url.searchParams.get('skip'));
          const take = Number(url.searchParams.get('take'));
          const paginatedPosts = mockPosts.slice(skip, skip + take);
          return HttpResponse.json({ posts: paginatedPosts, totalPosts: mockPosts.length });
        })
      );
      const { posts, totalPosts } = await getPosts(0, 5);
      expect(posts).toHaveLength(5);
      expect(totalPosts).toBe(6);
      expect(posts[0].title).toBe('Post 1');
    });

    it('should fetch posts with pagination', async () => {
      server.use(
        http.get('/api/posts', ({ request }) => {
          const url = new URL(request.url);
          const skip = Number(url.searchParams.get('skip'));
          const take = Number(url.searchParams.get('take'));
          const paginatedPosts = mockPosts.slice(skip, skip + take);
          return HttpResponse.json({ posts: paginatedPosts, totalPosts: mockPosts.length });
        })
      );
      const { posts } = await getPosts(2, 2);
      expect(posts).toHaveLength(2);
      expect(posts[0].title).toBe('Post 3');
    });

    it('should handle API errors when fetching posts', async () => {
      server.use(
        http.get('/api/posts', () => {
          return HttpResponse.json({ error: 'Failed to fetch' }, { status: 500 });
        })
      );
      await expect(getPosts(0, 5)).rejects.toThrow('Failed to fetch');
    });

    it('should handle non-JSON response gracefully', async () => {
      server.use(
        http.get('/api/posts', () => {
          return new HttpResponse('Server error', {
            status: 500,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
      );
      await expect(getPosts(0, 5)).rejects.toThrow('HTTP error! status: 500');
    });

    it('should fallback to status error when no error message in response', async () => {
      server.use(
        http.get('/api/posts', () => {
          return new HttpResponse('{}', {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );
      await expect(getPosts(0, 5)).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle "errors" field in error response', async () => {
      server.use(
        http.get('/api/posts', () => {
          return HttpResponse.json({ errors: ['Something went wrong'] }, { status: 500 });
        })
      );
      await expect(getPosts(0, 5)).rejects.toThrow('[\"Something went wrong\"]');
    });
  });

  describe('createPost', () => {
    it('should create a new post successfully', async () => {
      server.use(
        http.post('/api/posts', async ({ request }) => {
          const newPost = await request.json();
          return HttpResponse.json(
            {
              id: 'new-id',
              ...newPost,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { status: 201 }
          );
        })
      );
      const newPostData = { title: 'New Post', content: 'New Content' };
      const createdPost = await createPost(newPostData);
      expect(createdPost).toEqual(expect.objectContaining({ id: 'new-id', title: 'New Post' }));
    });

    it('should handle API errors when creating a post', async () => {
      server.use(
        http.post('/api/posts', () => {
          return HttpResponse.json({ error: 'Validation failed' }, { status: 400 });
        })
      );
      const newPostData = { title: 'Invalid Post', content: '' };
      await expect(createPost(newPostData)).rejects.toThrow('Validation failed');
    });
  });

  describe('updatePost', () => {
    it('should update an existing post successfully', async () => {
      server.use(
        http.put('/api/posts/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedData = await request.json();
          return HttpResponse.json({
            id,
            ...updatedData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        })
      );
      const updatedData = { title: 'Updated Title', published: true };
      const updatedPost = await updatePost('1', updatedData);
      expect(updatedPost).toEqual(
        expect.objectContaining({ id: '1', title: 'Updated Title', published: true })
      );
    });

    it('should handle API errors when updating a post', async () => {
      server.use(
        http.put('/api/posts/:id', () => {
          return HttpResponse.json({ error: 'Post not found' }, { status: 404 });
        })
      );
      const updatedData = { title: 'Non-existent Post' };
      await expect(updatePost('non-existent-id', updatedData)).rejects.toThrow('Post not found');
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      server.use(
        http.delete('/api/posts/:id', ({ params }) => {
          const { id } = params;
          if (id === 'non-existent-id') {
            return HttpResponse.json({ error: 'Post not found' }, { status: 404 });
          }
          return HttpResponse.json(null, { status: 200 });
        })
      );
      await expect(deletePost('1')).resolves.toBeUndefined();
    });

    it('should handle API errors when deleting a post', async () => {
      server.use(
        http.delete('/api/posts/:id', ({ params }) => {
          const { id } = params;
          if (id === 'non-existent-id') {
            return HttpResponse.json({ error: 'Post not found' }, { status: 404 });
          }
          return HttpResponse.json(null, { status: 200 });
        })
      );
      await expect(deletePost('non-existent-id')).rejects.toThrow('Post not found');
    });
  });
});
