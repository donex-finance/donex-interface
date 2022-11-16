import { Trans } from '@lingui/macro'
import BRAAVOS_WALLET_ICON_URL from 'assets/images/braavosWalletIcon.svg'
import { braavosWalletConnection, ConnectionType } from 'connection'
import { getConnectionName } from 'connection/utils'
import { Connector } from 'donex-sdk/web3-react/types'

import Option from './Option'

const BASE_PROPS = {
  color: '#4196FC',
  icon: BRAAVOS_WALLET_ICON_URL,
  id: 'braavos',
}

export function InstallBraavosOption() {
  return <Option {...BASE_PROPS} header={<Trans>Install Braavos</Trans>} link={'https://braavos.app/'} />
}

export function BraavosWalletOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = braavosWalletConnection.hooks.useIsActive()
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(braavosWalletConnection.connector)}
      header={getConnectionName(ConnectionType.BRAAVOS_WALLET)}
    />
  )
}
