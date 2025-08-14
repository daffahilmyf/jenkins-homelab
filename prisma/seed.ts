import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  

  // Create some initial posts
  await prisma.post.upsert({
    where: { id: 'post-1' },
    update: {},
    create: {
      id: 'post-1',
      title: 'My First Seeded Post',
      content: `This is the content of my first seeded post. It's great!`,
      published: true,
    },
  });

  await prisma.post.upsert({
    where: { id: 'post-2' },
    update: {},
    create: {
      id: 'post-2',
      title: 'Another Seeded Post',
      content: `This post is also very interesting and was added via seeding.`,
      published: false,
    },
  });

  
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
