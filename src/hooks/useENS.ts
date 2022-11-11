import { useMemo } from 'react'

import { isAddress } from '../utils'

/**
 * Given a name or address, does a lookup to resolve to an address and name
 * @param nameOrAddress ENS name or address
 */
export default function useENS(nameOrAddress?: string | null): {
  loading: boolean
  address: string | null
  name: string | null
} {
  const validated = isAddress(nameOrAddress)

  return useMemo(
    () => ({
      loading: false,
      address: validated || null,
      name: nameOrAddress || null,
    }),
    [nameOrAddress, validated]
  )
}
