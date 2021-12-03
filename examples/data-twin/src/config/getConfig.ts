import { Config, Flavor } from './types'
import { defaults, development, staging, production } from './data'
import {
  FLAVOR_DEVELOPMENT,
  FLAVOR_PRODUCTION,
  FLAVOR_STAGING,
} from './constants'
import { mergeConfigs } from './mergeConfigs'
import localOverrides from './localOverrides'

const getFlavorConfig = (flavor?: Flavor) => {
  switch (flavor) {
    case FLAVOR_PRODUCTION:
      return production
    case FLAVOR_STAGING:
      return staging
    case FLAVOR_DEVELOPMENT:
    default:
      return development
  }
}

export function getConfig(flavor?: Flavor, ignoreLocalOverrides = false) {
  const rawConfig = mergeConfigs([
    defaults,
    getFlavorConfig(flavor),
    !ignoreLocalOverrides ? (localOverrides as Partial<Config>) : {},
  ])

  return rawConfig
}
