# Ledger Subprovider for Web3

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
provider.addProvider(new RedundantRPCSubprovider(
    publicNodeUrlsIfExistsForNetworkId,
));
provider.start();
```
