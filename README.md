

```js

import {
    LedgerEthConnection,
    LedgerWallet,
    LedgerWalletSubprovider,
    LedgerBrowserCommunicationFactory,
    wrapWalletSubproviderFactory
} from 'ledger';

provider = new ProviderEngine();
const conn = new LedgerEthConnection(LedgerBrowserCommunicationFactory);
const wallet = new LedgerWallet(conn, networkIdIfExists);

this.ledgerSubProvider = wrapWalletSubproviderFactory(wallet);
provider.addProvider(this.ledgerSubProvider);
provider.addProvider(new RedundantRPCSubprovider(
    publicNodeUrlsIfExistsForNetworkId,
));
provider.start();
```
