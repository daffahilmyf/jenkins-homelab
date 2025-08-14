import { GET, POST } from '../route';
import { NextResponse } from 'next/server';
import { postCreateSchema } from '@/lib/schemas';
import { mockPrisma } from '@/../__mocks__/@prisma/client';
import { ZodError } from 'zod';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, init })),
  },
}));

describe('GET /api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of posts with default pagination', async () => {
    const mockPosts = [{
      id: '1',
      title: 'Test Post',
      content: 'Content',
      createdAt: new Date(),
      published: true
    }];
    mockPrisma.post.findMany.mockResolvedValue(mockPosts);
    mockPrisma.post.count.mockResolvedValue(1);

    const request = new Request('http://localhost/api/posts');
    const response = await GET(request);

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    expect(mockPrisma.post.count).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ posts: mockPosts, totalPosts: 1 }),
      { status: 200 }
    );
    // @ts-expect-error - mocked response includes `init`
    expect(response.init).toEqual({ status: 200 });
  });

  it('should return a list of posts with custom skip and take', async () => {
    const mockPosts = [{
      id: '2',
      title: 'Another Post',
      content: 'More Content',
      createdAt: new Date(),
      published: true
    }];
    mockPrisma.post.findMany.mockResolvedValue(mockPosts);
    mockPrisma.post.count.mockResolvedValue(1);

    const request = new Request('http://localhost/api/posts?skip=5&take=5');
    const response = await GET(request);

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    expect(mockPrisma.post.count).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ posts: mockPosts, totalPosts: 1 }),
      { status: 200 }
    );
    // @ts-expect-error - mocked response includes `init`
    expect(response.init).toEqual({ status: 200 });
  });

  it('should handle errors when fetching posts', async () => {
    mockPrisma.post.findMany.mockRejectedValue(new Error('DB error'));

    const request = new Request('http://localhost/api/posts');
    const response = await GET(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
    // @ts-expect-error - mocked response includes `init`
    expect(response.init).toEqual({ status: 500 });
  });
});

describe('POST /api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new post successfully', async () => {
    const newPostData = { title: 'New Post', content: 'New Content', published: true };
    const createdPost = {
      id: '3',
      ...newPostData,
      createdAt: new Date(),
    };

    mockPrisma.post.create.mockResolvedValue(createdPost);

    const request = new Request('http://localhost/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPostData),
    });

    const response = await POST(request);

    expect(mockPrisma.post.create).toHaveBeenCalledWith({ data: newPostData });
    expect(NextResponse.json).toHaveBeenCalledWith(createdPost, { status: 201 });
    // @ts-expect-error - mocked response includes `init`
    expect(response.init).toEqual({ status: 201 });
  });

  it('should return 400 for invalid input', async () => {
    const invalidPostData = { title: '', content: '', published: 'not a boolean' };

    const zodError = new ZodError([
      {
        path: ['title'],
        message: 'String must contain at least 1 character(s)',
        code: 'too_small',
      },
      {
        path: ['content'],
        message: 'String must contain at least 1 character(s)',
        code: 'too_small',
      },
      {
        path: ['published'],
        message: 'Expected boolean, received string',
        code: 'invalid_type',
      },
    ]);

    jest.spyOn(postCreateSchema, 'parse').mockImplementation(() => {
      throw zodError;
    });

    const request = new Request('http://localhost/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPostData),
    });

    const response = await POST(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        errors: {
          title: ['String must contain at least 1 character(s)'],
          content: ['String must contain at least 1 character(s)'],
          published: ['Expected boolean, received string'],
        },
      },
      { status: 400 }
    );
    // @ts-expect-error - mocked response includes `init`
    expect(response.init).toEqual({ status: 400 });
  });

  it('should handle server errors when creating a post', async () => {
    const validPost = { title: 'Valid', content: 'Valid', published: true };

    // Allow validation to pass
    jest.spyOn(postCreateSchema, 'parse').mockReturnValue(validPost);

    // Simulate Prisma failure
    mockPrisma.post.create.mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPost),
    });

    const response = await POST(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
    // @ts-expect-error - mocked response includes `init`
    expect(response.init).toEqual({ status: 500 });
  });
});