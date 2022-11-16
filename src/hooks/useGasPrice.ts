import JSBI from 'jsbi'

const CHAIN_DATA_ABI = [
  {
    inputs: [],
    name: 'latestAnswer',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

/**
 * Returns the price of 1 gas in WEI for the currently selected network using the chainlink fast gas price oracle
 */
export default function useGasPrice(): JSBI | undefined {
  return undefined
  // const address = ''
  // const contract = useContract(address ?? undefined, CHAIN_DATA_ABI, false)

  // const resultStr = useSingleCallResult(contract, 'latestAnswer').result?.[0]?.toString()
  // return useMemo(() => (typeof resultStr === 'string' ? JSBI.BigInt(resultStr) : undefined), [resultStr])
}
