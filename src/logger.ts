import { LogTypes, Sola } from '@vyke/sola'

export const rootSola = new Sola({ tag: 'pm2' })

rootSola.level = LogTypes.debug
