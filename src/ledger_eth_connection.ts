import * as _ from 'lodash';
import { LedgerCommunicationFactory, LedgerEthCommunication, LedgerSignResult, LedgerConnection, LedgerGetAddressResult } from './types'
import { comm as LedgerCommunication, eth as LedgerEthereumApi } from 'ledgerco';
import { Lock } from 'semaphore-async-await'

export class LedgerEthConnection implements LedgerEthCommunication {
    private _communicationFactory: LedgerCommunicationFactory;
    private _connection?: LedgerConnection;
    private readonly lock = new Lock();
    constructor(communicationFactory: LedgerCommunicationFactory) {
        this._communicationFactory = communicationFactory;
    }
    public async getAddress_async(derivationPath: string, askForDeviceConfirmation: boolean, shouldGetChainCode: boolean): Promise<LedgerGetAddressResult> {
        try {
            this._connection = await this.acquireLock();
            const ethConnection = new LedgerEthereumApi(this._connection);
            const result = await ethConnection.getAddress_async(derivationPath, askForDeviceConfirmation, shouldGetChainCode);
            await this.releaseLock();
            return result;
        } catch (err) {
            await this.releaseLock();
            throw err;
        }
    }
    public async signPersonalMessage_async(derivationPath: string, messageHex: string) : Promise<LedgerSignResult> {
        try {
            this._connection = await this.acquireLock();
            const ethConnection = new LedgerEthereumApi(this._connection);
            const result = await ethConnection.signPersonalMessage_async(derivationPath, messageHex);
            await this.releaseLock();
            return result;
        } catch (err) {
            await this.releaseLock();
            throw err;
        }
    }
    public async signTransaction_async(derivationPath: string, txHex: string) : Promise<LedgerSignResult> {
        try {
            this._connection = await this.acquireLock();
            const ethConnection = new LedgerEthereumApi(this._connection);
            const result = await ethConnection.signPersonalMessage_async(derivationPath, txHex);
            await this.releaseLock();
            return { r: result.r, s: result.s, v: result.v.toString() }
        } catch (err) {
            await this.releaseLock();
            throw err;
        }
    }
    private async acquireLock(): Promise<LedgerConnection> {
        await this.lock.acquire();
        if (!_.isUndefined(this._connection)) {
            throw new Error('Have lock and already have connection');
        }
        const comm = await this._communicationFactory();
        return comm;
    }

    private async releaseLock(): Promise<void> {
        await this.lock.release();
        if (_.isUndefined(this._connection)) {
            return;
        }
        try {
            await this._connection.close_async();
            this._connection = undefined;
        } catch (err) {
            this._connection = undefined;
            throw err;
        }
    }
}