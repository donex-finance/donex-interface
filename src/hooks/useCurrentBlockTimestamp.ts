import { BigNumber } from '@ethersproject/bignumber'
import { useBlockTimestamp } from 'lib/hooks/useBlockNumber'

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): BigNumber | undefined {
  const timestamp = useBlockTimestamp()
  return timestamp ? BigNumber.from(timestamp) : undefined
}
