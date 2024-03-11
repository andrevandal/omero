import { vi } from 'vitest'

export const dbPoolMock = vi.fn().mockImplementation(() => {
  return {
    select: vi.fn().mockImplementation(function () {
      return this // Retorna o próprio objeto mock
    }),
    from: vi.fn().mockImplementation(function (table: string) {
      this.table = table // Armazena a tabela
      return this // Retorna o próprio objeto mock
    }),
    where: vi.fn().mockImplementation(function (predicate: any) {
      this.predicate = predicate // Armazena o predicado
      return this // Retorna o próprio objeto mock
    })
  }
})
