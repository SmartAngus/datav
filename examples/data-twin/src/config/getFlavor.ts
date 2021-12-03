import { FLAVOR_DEVELOPMENT } from './constants'
import { Flavor } from './types'

const getFlavor = (): Flavor => {
  const flavor = (process.env.REACT_APP_CONFIG_FLAVOR ||
    FLAVOR_DEVELOPMENT) as Flavor

  return flavor
}

export default getFlavor
