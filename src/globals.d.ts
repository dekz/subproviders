/// <reference types='chai-typescript-typings' />
/// <reference types='chai-as-promised-typescript-typings' />
declare module 'dirty-chai';
declare module 'ledgerco';
declare module 'ethereumjs-tx';
declare module 'web3-provider-engine';
declare module 'web3-provider-engine/subproviders/rpc';
declare module 'web3-provider-engine/subproviders/subprovider';
declare module 'es6-promisify';
declare module 'debug';
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
// web3-provider-engine declarations
declare class Subprovider {
    public emitPayload(payload: any): void;
}
declare module 'web3-provider-engine/subproviders/subprovider' {
    export = Subprovider;
}
declare class RpcSubprovider {
    constructor(options: {rpcUrl: string});
    public handleRequest(payload: any, next: any, end: (err?: Error, data?: any) =>  void): void;
}
declare module 'web3-provider-engine/subproviders/rpc' {
    export = RpcSubprovider;
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