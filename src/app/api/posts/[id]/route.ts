import { NextResponse } from 'next/server';
import { postUpdateSchema } from '@/lib/schemas';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { ZodError } from 'zod';

// GET /api/posts/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      logger.warn({ id }, 'Post not found');
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    logger.info({ id }, 'Post fetched successfully');
    return NextResponse.json(post);
  } catch (error) {
    logger.error({ error, id }, 'Error fetching post');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/posts/:id
export async function PUT(
  request: Request,
  { params }: { params:  Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const validated = postUpdateSchema.parse(body);

    const updatedPost = await prisma.post.update({
      where: { id },
      data: validated,
    });

    logger.info({ id, updatedFields: validated }, 'Post updated successfully');
    return NextResponse.json(updatedPost);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.flatten().fieldErrors;
      logger.warn({ id, validationErrors }, 'Validation failed while updating post');
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    logger.error({ error, id }, 'Error updating post');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/posts/:id
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.post.delete({ where: { id } });

    logger.info({ id }, 'Post deleted successfully');
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error({ error, id }, 'Error deleting post');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
