import { useMemo } from 'react'

/**
 * Does a reverse lookup for an address to find its ENS name.
 * Note this is not the same as looking up an ENS name to find an address.
 */
export default function useENSName(address?: string): { ENSName?: string; loading: boolean } {
  return useMemo(
    () => ({
      ENSName: address,
      loading: false,
    }),
    [address]
  )
}
