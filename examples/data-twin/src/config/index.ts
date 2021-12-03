import { getConfig } from './getConfig'
import getFlavor from './getFlavor'

const flavor = getFlavor()

export default getConfig(flavor)

export { getFlavor }
