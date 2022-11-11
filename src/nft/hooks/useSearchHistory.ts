import { FungibleToken } from 'nft/types'
import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface SearchHistoryProps {
  history: FungibleToken[]
  addItem: (item: FungibleToken) => void
  updateItem: (update: FungibleToken) => void
}

export const useSearchHistory = create<SearchHistoryProps>()(
  persist(
    devtools((set) => ({
      history: [],
      addItem: (item: FungibleToken) => {
        set(({ history }) => {
          const historyCopy = [...history]
          if (historyCopy.length === 0 || historyCopy[0].address !== item.address) historyCopy.unshift(item)
          return { history: historyCopy }
        })
      },
      updateItem: (update: FungibleToken) => {
        set(({ history }) => {
          const index = history.findIndex((item) => item.address === update.address)
          if (index === -1) return { history }

          const historyCopy = [...history]
          historyCopy[index] = update
          return { history: historyCopy }
        })
      },
    })),
    { name: 'useSearchHistory' }
  )
)
