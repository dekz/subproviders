## 0x subproviders
A bunch of useful subproviders, including a Ledger Nano subprovider.

## Ledger Subprovider for Web3

Usage example as a [Web3 Provider Engine](https://github.com/MetaMask/provider-engine).

```js

import {
    LedgerEthConnection,
    LedgerWallet,
    LedgerWalletSubprovider,
    LedgerBrowserCommunicationFactory,
    wrapWalletSubproviderFactory
} from '0x-subproviders';

const networkId = 42;
const provider = new ProviderEngine();
// Browser (U2F) or Node
const conn = new LedgerEthConnection(LedgerBrowserCommunicationFactory);
const wallet = new LedgerWallet(conn, networkId);

const ledgerSubProvider = wrapWalletSubproviderFactory(wallet);
// Hooks in as a HookedWalletSubProvider
// This takes over all Signing operations in the web3 stack
provider.addProvider(ledgerSubProvider);
// All other operations need to fall through to an underlying provider
// in this case infura or another JSON RPC endpoint
provider.addProvider(new RpcSubprovider(
    rpcUrl: publicRpcNode,
));
provider.start();
```


Offset the derivation path
```js
// Offset the derivation path
const conn = new LedgerEthConnection(LedgerBrowserCommunicationFactory);
const wallet = new LedgerWallet(conn, networkId);
wallet.setPathIndex(3);
```

Use directly rather than as a Web3 Provider
```js
// Offset the derivation path
const conn = new LedgerEthConnection(LedgerBrowserCommunicationFactory);
const wallet = new LedgerWallet(conn, networkId);
wallet.getAccountsAsync((err, accounts) => { console.log(accounts) });
wallet.signPersonalMessageAsync("Hi There!", (err, result) => { console.log(result) });
```

Set the modified provider in 0x.js 
```
this.zeroEx = new ZeroEx(provider);
```

Test the connection before assuming the ledger is present.
```js
provider = new ProviderEngine();
const conn = new LedgerEthConnection(LedgerBrowserCommunicationFactory);
const wallet = new LedgerWallet(conn, networkId);
const timeout = 500;
wallet.testConnection(timeout, (err, connected) => {
    if (_.isUndefined(err) && connected) {
        utils.debug('provider')('ledger');
        this.ledgerSubProvider = wrapWalletSubproviderFactory(wallet);
        provider.addProvider(this.ledgerSubProvider);
    } else {
        utils.debug('provider')('injected');
        provider.addProvider(new InjectedWeb3SubProvider(injectedWeb3));
    }
    utils.debug('provider')('filter');
    provider.addProvider(new FilterSubprovider());
    utils.debug('provider')(publicNodeUrlsIfExistsForNetworkId);
    provider.addProvider(new RpcSubprovider(
        rpcUrl: publicRpcNode,
    ));
    provider.start();
});
```