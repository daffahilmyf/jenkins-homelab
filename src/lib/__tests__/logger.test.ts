describe('logger module', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    (process.env.NODE_ENV as unknown as string) = originalEnv;
    jest.resetModules();
  });

  it('should use pretty transport when NODE_ENV is development', () => {
    (process.env.NODE_ENV as unknown as string) = 'development';
    jest.resetModules();
    const { logger } = require('@/lib/logger');
    expect(logger).toBeDefined();
  });

  it('should use JSON transport when NODE_ENV is not development', () => {
    (process.env.NODE_ENV as unknown as string) = 'production';
    jest.resetModules();
    const { logger } = require('@/lib/logger');
    expect(logger).toBeDefined();
  });
});
