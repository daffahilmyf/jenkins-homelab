import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Generate 10k posts
  const posts = Array.from({ length: 10_000 }).map(() => ({
    title: faker.word.words({ count: { min: 3, max: 7 } }) ,
    content: faker.word.words({ count: { min: 10, max: 20 } }),
    published: faker.datatype.boolean(),
  }))

  const batchSize = 1000
  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize)
    await prisma.post.createMany({
      data: batch,
    })
    console.log(`Inserted batch ${i / batchSize + 1}`)
  }

  console.log('Seeding finished ✅')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
