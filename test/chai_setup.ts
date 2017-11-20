import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import chaiAsPromised = require('chai-as-promised');

export const chaiSetup = {
    configure() {
        chai.config.includeStack = true;
        chai.use(dirtyChai);
        chai.use(chaiAsPromised);
    },
};
