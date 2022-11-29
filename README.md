# Donex Finance Interface

Fork of the [Uniswap/interface](https://github.com/Uniswap/interface)

An open source interface for Donex -- a protocol for decentralized exchange of Starknet tokens.

- Website: [donex.finance](https://donex.finance/)
- Interface: [app.donex.finance](https://app.donex.finance)
- Twitter: [@donexfinance](https://twitter.com/donexfinance)
- Email: [contact@donex.finance](mailto:contact@donex.finance)
- Discord: [DonexFinance](https://discord.gg/AUm7KDRZhh)

## Run
```
yarn
yarn start
```

## Build
```
PUBLIC_URL=https://app.donex.finance  yarn build
````

## Accessing the Interface

visit [app.donex.finance](https://app.donex.finance).

## Unsupported tokens

Check out `useUnsupportedTokenList()` in [src/state/lists/hooks.ts](./src/state/lists/hooks.ts) for blocking tokens in your instance of the interface.

You can block an entire list of tokens by passing in a tokenlist like [here](./src/constants/lists.ts)

## Contributions

For steps on local deployment, development, and code contribution, please see [CONTRIBUTING](./CONTRIBUTING.md).

