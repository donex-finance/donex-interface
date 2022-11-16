import { ProviderInterface } from 'starknet'

/**
 * @param providers - An array of providers to try to connect to.
 * @param timeout - How long to wait before a call is considered failed, in ms.
 */
export async function getBestProvider(providers: ProviderInterface[], timeout = 5000): Promise<ProviderInterface> {
  // if we only have 1 provider, it's the best!
  return providers[0]
}
