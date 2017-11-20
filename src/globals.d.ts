/// <reference types='chai-typescript-typings' />
/// <reference types='chai-as-promised-typescript-typings' />
declare module 'dirty-chai';
declare module 'ledgerco';
declare module 'ethereumjs-tx';

declare module 'ledgerco' {
    interface comm {
        close_async: Promise<void>; 
        create_async: Promise<void>; 
    }

    export class comm_node implements comm {
        create_async: Promise<void>;
        close_async: Promise<void>;
    }

    export class comm_u2f implements comm {
        create_async: Promise<void>;
        close_async: Promise<void>;
    }
}

declare class HookedWalletSubprovider {
    constructor(wallet: any);
}
declare module 'web3-provider-engine/subproviders/hooked-wallet' {
    export = HookedWalletSubprovider;
}

declare module 'ethereumjs-util' {
    export function stripHexPrefix(hex: string): string;
}    