import { Trans } from '@lingui/macro'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/types'
import { ButtonSecondary } from '../Button'
import { useMemo } from 'react'
import Loader from '../Loader'

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

export default function PendingStatus() {

  const allTransactions = useAllTransactions();

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)

  const hasPendingTransactions = !!pending.length

  if (hasPendingTransactions) {
    return (
      <ButtonSecondary>
        <Loader />&nbsp;&nbsp;
        <Trans>{pending?.length} Pending</Trans>
      </ButtonSecondary>
    )
  } else {
    return (null)
  }
}
