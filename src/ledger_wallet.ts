import * as _ from 'lodash';
import Web3 = require('web3');
import * as EthereumTx from 'ethereumjs-tx';
import ethUtil = require('ethereumjs-util');
import * as ledger from 'ledgerco';
import HookedWalletSubprovider = require('web3-provider-engine/subproviders/hooked-wallet');
import {LedgerCommunicationFactory, SignPersonalMessageParams, TxParams} from './types';
import {LedgerEthConnection} from './ledger_eth_connection';

//const DEFAULT_DERIVATION_PATH = `44'/60'/0'`
const DEFAULT_DERIVATION_PATH = "m/44'/60'/0'"
const NUM_ADDRESSES_TO_FETCH = 10;
const ASK_FOR_ON_DEVICE_CONFIRMATION = false;
const SHOULD_GET_CHAIN_CODE = false;

export class LedgerWallet {
    public getAccounts: (callback: (err: Error, accounts: string[]) => void) => void;
    public signMessage: (msgParams: SignPersonalMessageParams,
        callback: (err: Error, result?: string) => void) => void;
    public signTransaction: (txParams: TxParams,
            callback: (err: Error, result?: string) => void) => void;
    private _derivationPath: string;
    private _derivationPathIndex: number;
    private _ledgerEthConnection: LedgerEthConnection;
    constructor(connection: LedgerEthConnection) {
        this._ledgerEthConnection = connection;
        this._derivationPath = DEFAULT_DERIVATION_PATH;
        this._derivationPathIndex = 0;
        this.getAccounts = this.getAccountsAsync.bind(this);
        this.signMessage = this.signPersonalMessageAsync.bind(this);
        this.signTransaction = this.signTransactionAsync.bind(this);
    }
    public getPath(): string {
        return this._derivationPath;
    }
    public setPath(derivationPath: string) {
        this._derivationPath = derivationPath;
        // HACK: Must re-assign getAccounts, signMessage and signTransaction since they were
        // previously bound to old values of this.path
        this.getAccounts = this.getAccountsAsync.bind(this);
        this.signMessage = this.signPersonalMessageAsync.bind(this);
        this.signTransaction = this.signTransactionAsync.bind(this);
    }
    public setPathIndex(pathIndex: number) {
        this._derivationPathIndex = pathIndex;
        // HACK: Must re-assign signMessage & signTransaction since they it was previously bound to
        // old values of this.path
        this.signMessage = this.signPersonalMessageAsync.bind(this);
        this.signTransaction = this.signTransactionAsync.bind(this);
    }
    public async getAccountsAsync(callback: (err?: Error, accounts?: string[]) => void): Promise<void> {
        const accounts = [];
        for (let i = 0; i < NUM_ADDRESSES_TO_FETCH; i++) {
            try {
                const derivationPath = `${this._derivationPath}/${i}`;
                const result = await this._ledgerEthConnection.getAddress_async(
                    derivationPath, ASK_FOR_ON_DEVICE_CONFIRMATION, SHOULD_GET_CHAIN_CODE,
                );
                accounts.push(result.address.toLowerCase());
            } catch (err) {
                callback(err, undefined);
                return;
            }
        }
        callback(undefined, accounts);
    }
    public async signTransactionAsync(txParams: TxParams, callback: (err?: Error, result?: string) => void) : Promise<void> {
        const tx = new EthereumTx(txParams);
        
        // Set the EIP155 bits
        tx.raw[6] = Buffer.from([txParams.chainId]);  // v
        tx.raw[7] = Buffer.from([]);         // r
        tx.raw[8] = Buffer.from([]);         // s
        
        const txHex = tx.serialize().toString('hex');
        
        try {
            const derivationPath = this.getPath();
            const result = await this._ledgerEthConnection.signTransaction_async(derivationPath, txHex);
            // Store signature in transaction
            tx.r = Buffer.from(result.r, 'hex');
            tx.s = Buffer.from(result.s, 'hex');
            tx.v = Buffer.from(result.v, 'hex');
        
            // EIP155: v should be chain_id * 2 + {35, 36}
            const signedChainId = Math.floor((tx.v[0] - 35) / 2);
            if (signedChainId !== txParams.chainId) {
                const err = new Error('TOO_OLD_LEDGER_FIRMWARE');
                callback(err, undefined);
                return;
            }
        
            const signedTxHex = `0x${tx.serialize().toString('hex')}`;
            callback(undefined, signedTxHex);
        } catch (err) {
            console.log(err)
            console.log(err.stack)
            callback(err, undefined);
        }
    }
    public async signPersonalMessageAsync(message: string,
                                          callback: (err?: Error, result?: string) => void): Promise<void> {
        try {
            const derivationPath = `${this._derivationPath}/${0}`;
            const result = await this._ledgerEthConnection.signPersonalMessage_async(
                derivationPath, ethUtil.stripHexPrefix(Buffer.from(message).toString('hex')),
            );
            const v = _.parseInt(result.v) - 27;
            let vHex = v.toString(16);
            if (vHex.length < 2) {
                vHex = `0${v}`;
            }
            const signature = `0x${result.r}${result.s}${vHex}`;
            callback(undefined, signature);
        } catch (err) {
            callback(err, undefined);
        }
    }
}

export const ledgerWalletSubproviderFactory = (ledgerEthConnection: LedgerEthConnection): LedgerWallet => {
    const wallet = new LedgerWallet(ledgerEthConnection);
    const subProvider = new HookedWalletSubprovider(wallet) as LedgerWallet;
    subProvider.getPath = wallet.getPath.bind(wallet);
    subProvider.setPath = wallet.setPath.bind(wallet);
    subProvider.setPathIndex = wallet.setPathIndex.bind(wallet);
    return wallet;
}