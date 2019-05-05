const Web3 = require('web3');
const HDWalletProvider = require("truffle-hdwallet-provider");
const abi = require('./abi.js')

require('dotenv').config()

const walletAddresses = ['0xAC80f8FefE1F14F40fFf2Bf96210a5B46e0DfD26', '0xE77b8a5a3085AD31eF455F794e46FbBC3AF5cd36']
const kinContractAddress = '0x818fc6c2ec5986bc6e2cbf00939d90556ab12ce5'
const kinAmount = 1000000000 // gwei

const web3 = new Web3(new HDWalletProvider(process.env.MNENOMIC, "https://mainnet.infura.io/v3/62df5323062344249adb11c3403dba29"))

void async function main() {
  // setup
  const accounts = await web3.eth.getAccounts()
  const account = accounts[0]
  const kinContract = new web3.eth.Contract(abi, kinContractAddress, {defaultAccount: account, gas: 300000 })

  let nonce = await web3.eth.getTransactionCount(account)

  // distribute some cats
  for (let i = 0; i < walletAddresses.length; i++) {
    // increase nonce
    nonce++

    console.log(`now transferring ${kinAmount} KIN to ${walletAddresses[i]}`);
    console.log(`from account: ${account}`);

    // let approval = await kinContract.methods.approve(walletAddresses[i], kinAmount).send()


    let transferEncodedABI = await kinContract.methods.transfer(walletAddresses[i], kinAmount).encodeABI()

    console.log(`transferEncodedABI: ${transferEncodedABI}`);

    let tx = {
      to: kinContractAddress,
      gas: 300000,
      data: transferEncodedABI,
      nonce: nonce
    }

    let signedTxn = await web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY)
    console.log(`signedTxn: ${signedTxn}`);
    let signedRawTxn = signedTxn.rawTransaction
    console.log(`signedRawTxn: ${signedRawTxn}`);
    let sendTxn = await web3.eth.sendSignedTransaction(signedRawTxn);
    console.log(`sendTxn: ${sendTxn}`);
    sendTxn.on('receipt', (receipt) => { console.log("Receipt: "+ receipt); });

    // let transfer = await kinContract.methods.transferFrom('0x8d3e809Fbd258083a5Ba004a527159Da535c8abA', walletAddresses[i], kinAmount).send()
  }
}()

// gripes:
// approval succeeds, transfer fails
// should probably test on rinkeby but how do i get a ck on rinkeby
