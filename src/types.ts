import * as _ from 'lodash';
import * as Web3 from 'web3';
import {
    comm_u2f as LedgerBrowserCommunication,
    comm_node as LedgerNodeCommunication
} from 'ledgerco';

export {
    comm as LedgerCommunication
} from 'ledgerco';

export type LedgerCommunicationFactory = () => Promise<any>;
export async function LedgerBrowserCommunicationFactory() { return await LedgerBrowserCommunication.create_async(); }
export async function LedgerNodeCommunicationFactory() { return await LedgerNodeCommunication.create_async(); }

export interface SignatureData {
    hash: string;
    r: string;
    s: string;
    v: number;
};

export interface LedgerGetAddressResult {
    address: string;
}
export interface LedgerSignResult {
    v: string;
    r: string;
    s: string;
}
export interface LedgerConnection {
    close_async: () => void;
    create_async: () => void;
}

export interface LedgerWalletSubprovider {
    getPath: () => string;
    setPath: (path: string) => void;
    setPathIndex: (pathIndex: number) => void;
}
export interface LedgerEthCommunication {
    getAddress_async: (derivationPath: string, askForDeviceConfirmation: boolean,
                       shouldGetChainCode: boolean) => Promise<LedgerGetAddressResult>;
    signPersonalMessage_async: (derivationPath: string, messageHex: string) => Promise<LedgerSignResult>;
    signTransaction_async: (derivationPath: string, txHex: string) => Promise<LedgerSignResult>;
}
export interface SignPersonalMessageParams {
    from?: string;
    data: string;
}

export interface TxParams {
    nonce: string;
    gasPrice?: number;
    gasLimit: string;
    to: string;
    value?: string;
    data?: string;
    chainId: number; // EIP 155 chainId - mainnet: 1, ropsten: 3
}

export type DoneCallback = (err?: Error) => void;

export interface JSONRPCPayload {
    params: any[];
    method: string;
}