import { GET, PUT, DELETE } from '../route';
import { NextResponse } from 'next/server';
import { postUpdateSchema } from '@/lib/schemas';
import { mockPrisma } from '@/../__mocks__/@prisma/client';
import { ZodError } from 'zod';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, init })),
  },
}));

describe('GET /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a single post if found', async () => {
    const mockPost = {
      id: '1',
      title: 'Test Post',
      content: 'Content',
      createdAt: new Date(),
      published: true,
    };

    mockPrisma.post.findUnique.mockResolvedValue(mockPost);

    const request = new Request('http://localhost/api/posts/1');
    const response = await GET(request, { params: { id: '1' } });

    expect(mockPrisma.post.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(NextResponse.json).toHaveBeenCalledWith(mockPost);
    expect(response.init).toBeUndefined();
  });

  it('should return 404 if post is not found', async () => {
    mockPrisma.post.findUnique.mockResolvedValue(null);

    const request = new Request('http://localhost/api/posts/999');
    const response = await GET(request, { params: { id: '999' } });

    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Post not found' }, { status: 404 });
    expect(response.init).toEqual({ status: 404 });
  });

  it('should handle errors when fetching a single post', async () => {
    mockPrisma.post.findUnique.mockRejectedValue(new Error('DB error'));

    const request = new Request('http://localhost/api/posts/1');
    const response = await GET(request, { params: { id: '1' } });

    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' }, { status: 500 });
    expect(response.init).toEqual({ status: 500 });
  });
});

describe('PUT /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a post successfully', async () => {
    const updatedData = { title: 'Updated Title', content: 'Updated Content', published: true };
    const updatedPost = { id: '1', ...updatedData, createdAt: new Date() };

    mockPrisma.post.update.mockResolvedValue(updatedPost);

    const request = new Request('http://localhost/api/posts/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    const response = await PUT(request, { params: { id: '1' } });

    expect(mockPrisma.post.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: updatedData,
    });

    expect(NextResponse.json).toHaveBeenCalledWith(updatedPost);
    expect(response.init).toBeUndefined();
  });

  it('should return 400 for invalid input', async () => {
    const invalidData = { title: '', content: '' };

    // Simulate ZodError
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
    ]);

    jest.spyOn(postUpdateSchema, 'parse').mockImplementation(() => {
      throw zodError;
    });

    const request = new Request('http://localhost/api/posts/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData),
    });

    const response = await PUT(request, { params: { id: '1' } });

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        errors: {
          title: ['String must contain at least 1 character(s)'],
          content: ['String must contain at least 1 character(s)'],
        },
      },
      { status: 400 }
    );
    expect(response.init).toEqual({ status: 400 });
  });

  it('should handle server errors when updating a post', async () => {
  const validUpdate = { title: 'Valid', content: 'Valid', published: true };

  jest.spyOn(postUpdateSchema, 'parse').mockReturnValue(validUpdate);
  mockPrisma.post.update.mockRejectedValue(new Error('DB error'));

  const request = new Request('http://localhost/api/posts/1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validUpdate),
  });

  const response = await PUT(request, { params: { id: '1' } });

  expect(NextResponse.json).toHaveBeenCalledWith(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
  expect(response.init).toEqual({ status: 500 });
});

});

describe('DELETE /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a post successfully', async () => {
    mockPrisma.post.delete.mockResolvedValue({});

    const request = new Request('http://localhost/api/posts/1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: { id: '1' } });

    expect(mockPrisma.post.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Post deleted successfully' });
    expect(response.init).toBeUndefined();
  });

  it('should handle errors when deleting a post', async () => {
    mockPrisma.post.delete.mockRejectedValue(new Error('DB error'));

    const request = new Request('http://localhost/api/posts/1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: { id: '1' } });

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
    expect(response.init).toEqual({ status: 500 });
  });
});
