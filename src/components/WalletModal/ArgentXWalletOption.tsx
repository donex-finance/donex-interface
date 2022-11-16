import { Trans } from '@lingui/macro'
import ARGENTX_WALLET_ICON_URL from 'assets/images/argentXWalletIcon.svg'
import { argentXWalletConnection, ConnectionType } from 'connection'
import { getConnectionName } from 'connection/utils'
import { Connector } from 'donex-sdk/web3-react/types'

import Option from './Option'

const BASE_PROPS = {
  color: '#4196FC',
  icon: ARGENTX_WALLET_ICON_URL,
  id: 'argentX',
}

export function InstallArgentXOption() {
  return <Option {...BASE_PROPS} header={<Trans>Install Braavos</Trans>} link={'https://argentx.xyz/'} />
}

export function ArgentXWalletOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = argentXWalletConnection.hooks.useIsActive()
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(argentXWalletConnection.connector)}
      header={getConnectionName(ConnectionType.ARGENTX_WALLET)}
    />
  )
}
