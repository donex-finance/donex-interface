import { validateTokenList } from '@uniswap/widgets'
import type { TokenList } from 'donex-sdk/token-lists'
import uriToHttp from 'lib/utils/uriToHttp'

export const DEFAULT_TOKEN_LIST = 'https://gateway.ipfs.io/ipns/tokens.uniswap.org'

const listCache = new Map<string, TokenList>()

/** Fetches and validates a token list. */
export default async function fetchTokenList(listUrl: string, skipValidation?: boolean): Promise<TokenList> {
  const cached = listCache?.get(listUrl) // avoid spurious re-fetches
  if (cached) {
    return cached
  }

  const urls: string[] = uriToHttp(listUrl)

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const isLast = i === urls.length - 1
    let response
    try {
      response = await fetch(url, { credentials: 'omit' })
    } catch (error) {
      const message = `failed to fetch list: ${listUrl}`
      console.debug(message, error)
      if (isLast) throw new Error(message)
      continue
    }

    if (!response.ok) {
      const message = `failed to fetch list: ${listUrl}`
      console.debug(message, response.statusText)
      if (isLast) throw new Error(message)
      continue
    }

    const json = await response.json()
    skipValidation = true
    const list = skipValidation ? json : await validateTokenList(json)
    listCache?.set(listUrl, json)
    return json
  }

  throw new Error('Unrecognized list URL protocol.')
}
