import { NextResponse } from 'next/server';
import { postCreateSchema } from '@/lib/schemas';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { ZodError } from 'zod';

/**
 * GET /api/posts
 * Fetch paginated posts and total count
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skip = Math.max(Number(searchParams.get('skip')) || 0, 0);
  const take = Math.max(Number(searchParams.get('take')) || 10, 1);

  try {
    logger.debug({ skip, take }, 'Fetching posts from database');

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count(),
    ]);

    logger.info({ count: posts.length, totalPosts }, 'Fetched posts successfully');

    return NextResponse.json({ posts, totalPosts }, { status: 200 });
  } catch (error) {
    logger.error({ error }, 'Error fetching posts');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/posts
 * Create a new post
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = postCreateSchema.parse(body);

    const newPost = await prisma.post.create({
      data: parsed,
    });

    logger.info(
      {
        postId: newPost.id,
        title: newPost.title,
        published: newPost.published,
      },
      'Post created successfully'
    );

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.flatten().fieldErrors;
      logger.warn({ validationErrors }, 'Post creation validation failed');
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    logger.error({ error }, 'Error creating post');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
