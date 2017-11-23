## Ledger Subprovider for Web3

Usage example as a web3 provider engine.

```js

import {
    LedgerEthConnection,
    LedgerWallet,
    LedgerWalletSubprovider,
    LedgerBrowserCommunicationFactory,
    wrapWalletSubproviderFactory
} from 'ledger';

const networkId = 42;
const provider = new ProviderEngine();
// Browser (U2F) or Node
const conn = new LedgerEthConnection(LedgerBrowserCommunicationFactory);
const wallet = new LedgerWallet(conn, networkId);

const ledgerSubProvider = wrapWalletSubproviderFactory(wallet);
// Hooks in as a HookedWalletSubProvider
provider.addProvider(ledgerSubProvider);
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

Set the modified provider in 0x.js 
```
this.zeroEx = new ZeroEx(provider);
```