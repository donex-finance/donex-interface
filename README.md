# Donex Finance Interface

Fork of the [Uniswap/interface](https://github.com/Uniswap/interface)

An open source interface for Donex -- a protocol for decentralized exchange of Starknet tokens.

- Website: [donex.finance](https://donex.finance/)
- Interface: [app.donex.finance](https://app.donex.finance)
- Docs: [donex.finance/docs/](https://docs.donex.finance/)
- Twitter: [@Donex-Finance](https://twitter.com/Donex-Finance)
- Email: [contact@donex.finance](mailto:contact@donex.finance)
- Discord: [Uniswap](https://discord.gg/FCfyBSbCU5)

## Accessing the Uniswap Interface

To access the Donex Finance Interface, use the
[latest release](https://github.com/donex-finance/app.donex.finance/releases/latest),
or visit [app.donex.finance](https://app.donex.finance).

## Unsupported tokens

Check out `useUnsupportedTokenList()` in [src/state/lists/hooks.ts](./src/state/lists/hooks.ts) for blocking tokens in your instance of the interface.

You can block an entire list of tokens by passing in a tokenlist like [here](./src/constants/lists.ts)

## Contributions

For steps on local deployment, development, and code contribution, please see [CONTRIBUTING](./CONTRIBUTING.md).

