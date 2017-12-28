import * as _ from 'lodash';
import Web3 = require('web3');
import {LedgerSubproviderConfigs, TxParams, PartialTxParams} from '../types';
import {Lock} from 'semaphore-async-await'
import {LedgerEthConnection} from '../ledger_eth_connection';
import Subprovider = require('web3-provider-engine/subproviders/subprovider');
import promisify = require('es6-promisify');
import * as EthereumTx from 'ethereumjs-tx';
import ethUtil = require('ethereumjs-util');

const DEFAULT_DERIVATION_PATH = `44'/60'/0'`
const DEFAULT_DERIVATION_PATH_INDEX = 0;
const NUM_ADDRESSES_TO_FETCH = 2;
const ASK_FOR_ON_DEVICE_CONFIRMATION = false;
const SHOULD_GET_CHAIN_CODE = false;

export class LedgerSubprovider extends  Subprovider {
    private derivationPath: string;
    private derivationPathIndex: number;
    private shouldAskForOnDeviceConfirmation: boolean;
    private readonly lock: Lock;
    private readonly config: LedgerSubproviderConfigs;
    private readonly connection: LedgerEthConnection;
    constructor(ledgerConfig: LedgerSubproviderConfigs) {
        super();
        this.config = ledgerConfig;
        this.derivationPath = this.config.derivationPath || DEFAULT_DERIVATION_PATH;
        this.derivationPathIndex= this.config.derivationPathIndex || DEFAULT_DERIVATION_PATH_INDEX;
        this.shouldAskForOnDeviceConfirmation = this.config.shouldAskForOnDeviceConfirmation || ASK_FOR_ON_DEVICE_CONFIRMATION;
        this.connection = this.config.ledgerConnection;
        this.lock = new Lock();
    }
    public getPath(): string {
        return this.derivationPath;
    }
    public setPath(derivationPath: string): void {
        this.derivationPath = derivationPath;
    }
    public setPathIndex(pathIndex: number): void {
        this.derivationPathIndex = pathIndex;
    }
    private buildDerivationPath(): string {
        const derivationPath = `${this.getPath()}/${this.derivationPathIndex}`;
        return derivationPath;
    }
    public async handleRequest(payload: any, next: () => void, end: (err?: Error, result?: any) => void) {
        switch(payload.method) {
            case 'eth_coinbase':
                console.log("eth_coinbase")
                var accounts = await this.getAccountsAsync();
                end(undefined, accounts[0]);
                return;
            case 'eth_accounts':
                console.log("eth_accounts")
                var accounts = await this.getAccountsAsync();
                end(undefined, accounts);
                return;
            case 'eth_sendTransaction':
                var txParams = payload.params[0];
                var result = await this.sendTransaction(txParams);
                end(undefined, result);
                return;
            default:
                next();
                return;
        }
    }
    public async getAccountsAsync(): Promise<string[]> {
        const accounts = [];
        for (let i = 0; i < NUM_ADDRESSES_TO_FETCH; i++) {
            try {
                const derivationPath = `${this.derivationPath}/${i + this.derivationPathIndex}`;
                const result = await this.connection.getAddress_async(
                    derivationPath, this.shouldAskForOnDeviceConfirmation, SHOULD_GET_CHAIN_CODE,
                );
                accounts.push(result.address.toLowerCase());
            } catch (err) {
                throw err;
            }
        }
        return accounts;
    }
    private async sendTransaction(txParams: PartialTxParams): Promise<any> {
        console.log('sending tx');
        await this.lock.wait();
        // fill in the extras
        const filledParams = await this.populateMissingTxParams(txParams);
        // sign it
        const signedTx = await this.signTransactionAsync(filledParams);
        // emit a submit
        const payload = { method: 'eth_sendRawTransaction', params: [signedTx, filledParams]};
        const result = await promisify(this.emitPayload.bind(this))(payload);
        console.log(result);
        await this.lock.release();
        return result;
    }
    private async populateMissingTxParams(txParams: PartialTxParams): Promise<PartialTxParams> {
        if (_.isUndefined(txParams.gasPrice)) {
          const gasPriceResult = await promisify(this.emitPayload.bind(this))({ method: 'eth_gasPrice', params: [] });
          const gasPrice = gasPriceResult.result.toString();
          txParams.gasPrice = '0x2';
          console.log('gasPrice: ', gasPrice);
        }
        if (_.isUndefined(txParams.nonce)) {
            const nonceResult = await promisify(this.emitPayload.bind(this))({ method: 'eth_getTransactionCount', params: [txParams.from, 'pending'] });
            const nonce = nonceResult.result;
            txParams.nonce = nonce;
            console.log('nonce: ', nonce);
        }
        if (_.isUndefined(txParams.gas)) {
          const gasResult = await promisify(this.emitPayload.bind(this))({ method: 'eth_estimateGas', params: [txParams] });
          const gas = gasResult.result.toString();
          txParams.gas = gas;
          console.log('gas: ', gas);
        }
        return txParams;
    }
    public async signTransactionAsync(txParams: PartialTxParams) : Promise<string> {
        const tx = new EthereumTx(txParams);
        
        // Set the EIP155 bits
        tx.raw[6] = Buffer.from([this.config.networkId]);  // v
        tx.raw[7] = Buffer.from([]);         // r
        tx.raw[8] = Buffer.from([]);         // s
        
        console.log(tx.toJSON());
        const txHex = tx.serialize().toString('hex');
        try {
            const derivationPath = this.buildDerivationPath();
            const result = await this.connection.signTransaction_async(derivationPath, txHex);
            // Store signature in transaction
            tx.r = Buffer.from(result.r, 'hex');
            tx.s = Buffer.from(result.s, 'hex');
            tx.v = Buffer.from(result.v, 'hex');
        
            // EIP155: v should be chain_id * 2 + {35, 36}
            const signedChainId = Math.floor((tx.v[0] - 35) / 2);
            if (signedChainId !== this.config.networkId) {
                throw new Error('TOO_OLD_LEDGER_FIRMWARE');
            }
        
            const signedTxHex = `0x${tx.serialize().toString('hex')}`;
            return signedTxHex;
        } catch (err) {
            throw err;
        }
    }
}