import { createConsola } from 'consola'

const { CONSOLA_LEVEL } = import.meta.env

const consola = createConsola({
  level: Number(CONSOLA_LEVEL || '3')
})

export default (tag: string) => consola.withTag(tag)
