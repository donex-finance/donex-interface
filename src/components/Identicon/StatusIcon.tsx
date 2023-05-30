import ARGENTX_WALLET_ICON_URL from 'assets/images/argentXWalletIcon.svg'
import BRAAVOS_WALLET_ICON_URL from 'assets/images/braavosWalletIcon.svg'
import { ConnectionType } from 'connection'
import { useHasSocks } from 'hooks/useSocksBalance'
import styled from 'styled-components/macro'

import sockImg from '../../assets/svg/socks.svg'
import Identicon from '../Identicon'

const IconWrapper = styled.div<{ size?: number }>`
  position: relative;
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    align-items: flex-end;
  `};
`

const SockContainer = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  bottom: -4px;
  right: -4px;
`

const SockImg = styled.img`
  width: 16px;
  height: 16px;
`

const Socks = () => {
  return (
    <SockContainer>
      <SockImg src={sockImg} />
    </SockContainer>
  )
}

const useIcon = (connectionType: ConnectionType) => {
  if (connectionType === ConnectionType.ARGENTX_WALLET) {
    return <img src={ARGENTX_WALLET_ICON_URL} alt="Argent X Wallet" />
  } else if (connectionType === ConnectionType.BRAAVOS_WALLET) {
    return <img src={BRAAVOS_WALLET_ICON_URL} alt="Braavos Wallet" />
  } else {
    return <Identicon />
  }
}

export default function StatusIcon({ connectionType, size }: { connectionType: ConnectionType; size?: number }) {
  const hasSocks = useHasSocks()
  const icon = useIcon(connectionType)

  return (
    <IconWrapper size={size ?? 16}>
      {hasSocks && <Socks />}
      {icon}
    </IconWrapper>
  )
}
