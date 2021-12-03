import {
  FLAVOR_DEVELOPMENT,
  FLAVOR_PRODUCTION,
  FLAVOR_STAGING,
} from './constants'
import { defaults } from './data'

export type Config = typeof defaults

export type Flavor =
  | typeof FLAVOR_DEVELOPMENT
  | typeof FLAVOR_STAGING
  | typeof FLAVOR_PRODUCTION
