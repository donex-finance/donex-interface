import { useWeb3React } from '@web3-react/core'
import ConnectedAccountBlocked from 'components/ConnectedAccountBlocked'
import TokensBanner from 'components/Tokens/TokensBanner'
import useAccountRiskCheck from 'hooks/useAccountRiskCheck'
import { useLocation } from 'react-router-dom'
import { useModalIsOpen } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'

export default function TopLevelModals() {
  const blockedAccountModalOpen = useModalIsOpen(ApplicationModal.BLOCKED_ACCOUNT)
  const { account } = useWeb3React()
  const location = useLocation()

  useAccountRiskCheck(account)
  const open = Boolean(blockedAccountModalOpen && account)
  return (
    <>
      <ConnectedAccountBlocked account={account} isOpen={open} />
      {(location.pathname.includes('/pool') || location.pathname.includes('/swap')) && <TokensBanner />}
    </>
  )
}
