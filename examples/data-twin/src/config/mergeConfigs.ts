import { Config } from './types'

export const mergeConfigs = (configs: Partial<Config>[]) =>
  configs.reduce(
    (acc: Partial<Config>, item: Partial<Config>) => ({ ...acc, ...item }),
    {}
  ) as Config
