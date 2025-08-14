import '@testing-library/jest-dom';
import { server } from './src/mocks/server';

jest.mock('@/lib/logger');

// Start MSW server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
