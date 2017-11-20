const ledger = require('ledgerco');
const ethUtil = require('ethereumjs-util');
const EthereumTx = require('ethereumjs-tx');

//const data = ethUtil.sha3("test");
const data = "test";
const derivation = "44'/60'/0'/0'/0"
console.log("message: ", data.toString('hex'));
ledger
	.comm_node
	.create_async()
	.then(function(comm) {
            console.log(comm.device.getDeviceInfo());
            var eth = new ledger.eth(comm)
            //return eth.signTransaction_async("44'/60'/0'/0", "E8068504e3b2920082520894DF900e740116c863e8B9995b666c4891F95f321E87038d7ea4c6800080").then( function(result) {console.log(result);})
            let message = ethUtil.stripHexPrefix(Buffer.from(data).toString("hex"));
            eth.getAddress_async(derivation).then(function(result) { console.log(result);})
            return eth.signPersonalMessage_async(derivation, message).then(
              function(result) {
                console.log(result);
                var v = result['v'] - 27;
                v = v.toString(16);
                if (v.length < 2) {
                  v = "0" + v;
                }
                return "0x" + result['r'] + result['s'] + v;
              }).then( function(sgn) {
                console.log(sgn);
                var r = ethUtil.toBuffer(sgn.slice(0,66))
                var s = ethUtil.toBuffer('0x' + sgn.slice(66,130))
                var v = ethUtil.bufferToInt(ethUtil.toBuffer('0x' + sgn.slice(130,132))) + 27
                console.log(v)
                var m = ethUtil.toBuffer(ethUtil.sha3(data))
                var pub = ethUtil.ecrecover(m, v, r, s)
                var adr = '0x' + ethUtil.pubToAddress(pub).toString('hex')
                console.log(adr);

              });
	})
	.catch(function(reason) {
		console.log('An error occured: ', reason);
	});
