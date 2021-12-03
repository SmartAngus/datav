import { getConfig } from './getConfig'

import {
  FLAVOR_PRODUCTION,
  FLAVOR_STAGING,
  FLAVOR_DEVELOPMENT,
} from './constants'

test.each([FLAVOR_PRODUCTION, FLAVOR_DEVELOPMENT, FLAVOR_STAGING] as const)(
  '%s matches snapshot',
  (flavor) => {
    expect(getConfig(flavor, true)).toMatchSnapshot()
  }
)
