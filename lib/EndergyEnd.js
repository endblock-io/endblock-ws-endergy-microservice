const async = require("async");

class EndergyEnd {
  constructor(web3, address, abi, defaultAccount) {
    this.web3 = web3;
    this.contract = new web3.eth.Contract(abi, address);
    this.contract.defaultAccount = defaultAccount;
  }

  async receiveFromContract(account, amount) {
    const gasPriceGwei = await this.web3.eth.getGasPrice();

    const estimateGas = await this.contract.methods
      .receiveFromContract(amount)
      .estimateGas({ from: account });

    return await this.contract.methods.receiveFromContract(amount).send({
      from: account,
      gas: Number(Number(estimateGas.toString()) * 1.2).toFixed(0),
      gasPrice: gasPriceGwei,
    });
  }
}

module.exports = EndergyEnd;
