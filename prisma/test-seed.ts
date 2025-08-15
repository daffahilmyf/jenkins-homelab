import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function resetDatabase() {
  await prisma.post.deleteMany();
}

export async function seedDatabase() {
  await prisma.post.createMany({
    data: [
      {
        title: 'Seeded Post A',
        content: 'This post was added by globalSetup.',
        published: true,
      },
      {
        title: 'Seeded Post B',
        content: 'Another seeded post.',
        published: false,
      },
    ],
  });
}
