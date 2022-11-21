import * as useV3Positions from 'hooks/useV3Positions'
import { render, screen } from 'test-utils'

import CTACards from './CTACards'

jest.mock('donex-sdk/web3-react/core', () => {
  const web3React = jest.requireActual('donex-sdk/web3-react/core')
  return {
    ...web3React,
    useWeb3React: () => ({
      chainId: 42,
    }),
  }
})

describe('CTAcard links', () => {
  it('renders mainnet link when chain is not supported', () => {
    jest.spyOn(useV3Positions, 'useV3Positions').mockImplementation(() => {
      return { loading: false, positions: undefined }
    })

    render(<CTACards />)
    expect(screen.getByTestId('cta-infolink')).toHaveAttribute('href', 'https://info.donex.finance/#/pools')
  })
})
