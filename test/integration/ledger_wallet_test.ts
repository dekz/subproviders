import * as Sinon from 'sinon';
import * as _ from 'lodash';
import * as mocha from 'mocha';
import * as chai from 'chai';
import { chaiSetup } from '../chai_setup';
chaiSetup.configure();
const expect = chai.expect;

import ProviderEngine = require('web3-provider-engine');
import {
    LedgerWallet,
    ledgerWalletSubproviderFactory,
    LedgerEthConnection
} from '../../src';

import {
    DoneCallback, LedgerNodeCommunicationFactory 
} from '../../src/types';

const reportCallbackErrors = (done: DoneCallback) => {
    return (f: (...args: any[]) => void) => {
        const wrapped = (...args: any[]) => {
            try {
                f(...args);
            } catch (err) {
                done(err);
            }
        };
        return wrapped;
    };
};
describe('LedgerWallet', () => {
    let wallet: LedgerWallet;
    let connection: LedgerEthConnection;
    let network: number = 42;
    before(async () => {
        const communicationFactory = LedgerNodeCommunicationFactory;
        connection = new LedgerEthConnection(communicationFactory);

        wallet = new LedgerWallet({ ledgerConnection: connection, networkId: network });
    });
    it('returns a list of accounts', (done: DoneCallback) => {
        (async () => {
            const callback = reportCallbackErrors(done)((err: Error, accounts: string[]) =>  {
                expect(err).to.be.undefined();
                expect(accounts[0]).to.not.be.undefined();
                expect(accounts.length).to.be.equal(10);
                done();
            })
            await wallet.getAccountsAsync(callback);
        })().catch(done)
    })
    it('signs a personal message', (done: DoneCallback) => {
        (async () => {
            const message = 'hello world';
            const callback = reportCallbackErrors(done)((err: Error, result: string) =>  {
                expect(err).to.be.undefined();
                expect(result).to.be.equal(
                    '0x071b0cf9a9c0dce10ff33c873fce47b89e9f1661d71420f2ec0d59249ec627395056900bc9032cdcf092cb8034c6047d7390b5384135631ccf001aad91de513700');
                done();
            })
            await wallet.signPersonalMessageAsync({ data: message }, callback);
        })().catch(done)
    })
    it('signs a transaction', (done: DoneCallback) => {
        (async () => {
            const tx = { nonce: '0x00', gasLimit: '0x2710', to: '0x0000000000000000000000000000000000000000', value: '0x00', chainId: 3};
            const callback = reportCallbackErrors(done)((err: Error, result: string) =>  {
                expect(err).to.be.undefined();
                done();
            })
            await wallet.signTransactionAsync(tx, callback);
        })().catch(done)
    })
    it('connects as as web3 provider', (done: DoneCallback) => {
        (async () => {
            const provider = new ProviderEngine();
            const subprovider = ledgerWalletSubproviderFactory(connection, network);
            provider.addProvider(subprovider);
            done();
        })().catch(done)
    })
})