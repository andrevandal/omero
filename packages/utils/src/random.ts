import { createRandomStringGenerator } from '@better-auth/utils/random'

export const generateId = (size?: number) =>
  createRandomStringGenerator('a-z', 'A-Z', '0-9')(size ?? 7)
