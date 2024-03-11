import { generateRandomString, alphabet } from 'oslo/crypto'

export function generateId (length: number): string {
  return generateRandomString(length, alphabet('0-9', 'a-z'))
}
