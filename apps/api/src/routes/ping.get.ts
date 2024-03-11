import { eventHandler } from 'h3'

// [GET] /ping
export default eventHandler(() => {
  return 'pong'
})
