import { FungibleToken } from 'nft/types'

/**
 * Organizes the number of Token and NFT results to be shown to a user depending on if they're in the NFT or Token experience
 * Show up to 5 tokens.
 * @param tokenResults array of FungibleToken results
 * @returns an array of Fungible Tokens and an array of NFT Collections with correct number of results to be shown
 */
export function organizeSearchResults(tokenResults: FungibleToken[]): [FungibleToken[]] {
  const reducedTokens = tokenResults?.slice(0, 5) ?? []

  return [reducedTokens]
}
