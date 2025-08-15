jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    })),
  };
});

describe('Prisma Singleton', () => {
  const ORIGINAL_ENV = process.env.NODE_ENV;

  let PrismaClientMock: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    (process.env.NODE_ENV as unknown as string) = 'development';
    delete (globalThis as any).prisma;

    PrismaClientMock = require('@prisma/client').PrismaClient;
    PrismaClientMock.mockClear();
  });

  afterEach(() => {
    (process.env.NODE_ENV as unknown as string) = ORIGINAL_ENV;
    jest.resetModules();
  });

  it('should create a new PrismaClient instance if none exists', () => {
    const { prisma } = require('@/lib/prisma');

    expect(PrismaClientMock).toHaveBeenCalledTimes(1);
    expect(prisma).toBeDefined();
    expect((globalThis as any).prisma).toBe(prisma);
  });

  it('should reuse existing PrismaClient instance if already defined', () => {
    const fakeInstance = { mocked: true };
    (globalThis as any).prisma = fakeInstance;

    const { prisma } = require('@/lib/prisma');

    expect(PrismaClientMock).not.toHaveBeenCalled();
    expect(prisma).toBe(fakeInstance);
  });

  it('should not assign global prisma in production', () => {
    (process.env.NODE_ENV as unknown as string) = 'production';

    const { prisma } = require('@/lib/prisma');

    expect(PrismaClientMock).toHaveBeenCalledTimes(1);
    expect((globalThis as any).prisma).toBeUndefined();
    expect(prisma).toBeDefined();
  });
});
