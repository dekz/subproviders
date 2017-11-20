import * as proxyquire from 'proxyquire';
import * as Sinon from 'sinon';

import * as _ from 'lodash';
import * as mocha from 'mocha';
import * as chai from 'chai';
import { chaiSetup } from '../chai_setup';
chaiSetup.configure();
const expect = chai.expect;

import {
    LedgerWallet,
    LedgerEthConnection
} from '../../src';

import {
    DoneCallback 
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
    let stubs: Sinon.SinonStub[] = [];
    let commStub: LedgerEthConnection;
    before(async () => {
        commStub = <LedgerEthConnection>{};
        wallet = new LedgerWallet((commStub as LedgerEthConnection));
    });
    afterEach(() => {
        // clean up any stubs after the test has completed
        _.each(stubs, s => s.restore());
        stubs = [];
    });
    it('returns a list of accounts', (done: DoneCallback) => {
        (async () => {
            commStub.getAddress_async = Sinon.stub().returns({ address: '1234' });
            const callback = reportCallbackErrors(done)((err: Error, accounts: string[]) =>  {
                expect(err).to.be.undefined();
                expect(accounts[0]).to.be.equal('1234');
                expect(accounts.length).to.be.equal(10);
                done();
            })
            await wallet.getAccountsAsync(callback);
        })().catch(done)
    })
    it('signs a personal message', (done: DoneCallback) => {
        (async () => {
            const message = 'hello world';
            commStub.signPersonalMessage_async = Sinon.stub().returns({ v: '1234', r: '123', s: '456' });
            const callback = reportCallbackErrors(done)((err: Error, result: string) =>  {
                expect(err).to.be.undefined();
                expect(result).to.be.equal(
                    '0x071b0cf9a9c0dce10ff33c873fce47b89e9f1661d71420f2ec0d59249ec627395056900bc9032cdcf092cb8034c6047d7390b5384135631ccf001aad91de513700');
                done();
            })
            await wallet.signPersonalMessageAsync(message, callback);
        })().catch(done)
    })
})