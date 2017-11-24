import * as _ from 'lodash';
import Web3 = require('web3');

/*
 * This class implements the web3-provider-engine subprovider interface and forwards
 * requests involving transport (eth_sendRawTransaction) to the injected
 * web3 instance in their browser.
 * Source: https://github.com/MetaMask/provider-engine/blob/master/subproviders/subprovider.js
 */
export class InjectedTransportWeb3Subprovider {
    private injectedWeb3: Web3;
    constructor(injectedWeb3: Web3) {
        this.injectedWeb3 = injectedWeb3;
    }
    public handleRequest(payload: any, next: () => void, end: (err?: Error, result?: any) => void) {
        switch (payload.method) {
            case 'web3_clientVersion':
                this.injectedWeb3.version.getNode(end);
                return;
            case 'eth_getBlockByNumber':
                this.injectedWeb3.eth.getBlockNumber(end);
                return;
            case 'net_version':
                this.injectedWeb3.version.getNetwork(end)
                return;
            case 'eth_getCode':
                const [codeAddress] = payload.params;
                this.injectedWeb3.eth.getCode(codeAddress, end);
                return;
            case 'eth_call':
                const [callData] = payload.params;
                this.injectedWeb3.eth.call(callData, end)
                return;
            case 'eth_getLogs':
                return;
            case 'eth_getTransactionReceipt':
                this.injectedWeb3.eth.getTransactionReceipt(payload.params[0], end);
                return;
            case 'eth_gasPrice':
                this.injectedWeb3.eth.getGasPrice(end);
                return;
            case 'eth_estimateGas':
                this.injectedWeb3.eth.estimateGas(payload.params[0], end);
                return;
            case 'eth_getTransactionCount':
                this.injectedWeb3.eth.getTransactionCount(payload.params[0], end);
                return;
            case 'eth_getBalance':
                const [address] = payload.params;
                this.injectedWeb3.eth.getBalance(address, end);
                return;
            case 'eth_sendRawTransaction':
                const [rawTx] = payload.params;
                this.injectedWeb3.eth.sendRawTransaction(rawTx, end);
                return;
            default:
                next();
                return;
        }
    }
    // Required to implement this method despite not needing it for this subprovider
    public setEngine(engine: any) {
        // noop
    }
}