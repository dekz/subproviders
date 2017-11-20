import * as _ from 'lodash';
import { LedgerCommunicationFactory, LedgerEthCommunication, LedgerSignResult, LedgerConnection, LedgerGetAddressResult } from './types'
import { comm as LedgerCommunication, eth as LedgerEthereumApi } from 'ledgerco';

export class LedgerEthConnection implements LedgerEthCommunication {
    private _communicationFactory: LedgerCommunicationFactory;
    private _connection?: LedgerConnection;
    constructor(communicationFactory: LedgerCommunicationFactory) {
        this._communicationFactory = communicationFactory;
    }
    public async getAddress_async(derivationPath: string, askForDeviceConfirmation: boolean, shouldGetChainCode: boolean): Promise<LedgerGetAddressResult> {
        this._connection = await this.acquireLock();
        try {
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
        this._connection = await this.acquireLock();
        try {
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
        this._connection = await this.acquireLock();
        try {
            const ethConnection = new LedgerEthereumApi(this._connection);
            const result = await ethConnection.signPersonalMessage_async(derivationPath, txHex);
            await this.releaseLock();
            return result;
        } catch (err) {
            await this.releaseLock();
            throw err;
        }
    }
    private async acquireLock(): Promise<LedgerConnection> {
        if (!_.isUndefined(this._connection)) {
            throw new Error('Have lock and already have connection');
        }
        const comm = await this._communicationFactory();
        return comm;
    }

    private async releaseLock(): Promise<void> {
        if (_.isUndefined(this._connection)) {
            return;
        }
        await this._connection.close_async();
        this._connection = undefined;
    }
}