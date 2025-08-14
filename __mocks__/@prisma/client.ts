const mockPrisma = {
  post: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const PrismaClient = jest.fn(() => mockPrisma);

export { PrismaClient, mockPrisma };