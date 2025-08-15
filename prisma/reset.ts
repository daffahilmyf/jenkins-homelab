import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function resetDatabase() {
  await prisma.post.deleteMany();

  await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name='Post';`);
}

export async function seedDatabase() {
  await prisma.post.create({
    data: {
      title: 'Seeded Post',
      content: 'This was created in global setup',
      published: true,
    },
  });
}
