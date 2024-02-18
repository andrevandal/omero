import logger from '../services/logger'
const log = logger('api')

export default eventHandler(() => {
  log.info('New request...')
  return { nitro: 'Is Awesome!' }
})
