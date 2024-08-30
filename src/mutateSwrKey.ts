import { mutate } from 'swr'
import type { Arguments } from 'swr'

/**
 * Mutate SWR cache by swrKey property
 * @param key The value of swrKey to mutate
 * @example
 * const {data} = useSWR({ swrKey:'something', ...otherParams })
 * // elsewhere
 * mutateSwrKey('something')
 */
export const mutateSwrKey = (key: string) => {
  // Mutate any SWR key that's an object with `swrKey === key`
  mutate(
    (opts: Arguments) =>
      opts &&
      typeof opts === 'object' &&
      'swrKey' in opts &&
      opts.swrKey === key
  )
}
