const { BN } = require("bn.js");
class Paraswap {
  constructor(web3, address, abi, defaultAccount) {
    this.web3 = web3;
    this.contract = new web3.eth.Contract(abi, address);
    this.contract.defaultAccount = defaultAccount;
  }

  async simpleSwap(
    srcToken,
    destToken,
    srcAmount,
    destAmount,
    expectedAmount,
    callees,
    exchangeData,
    startIndexes,
    values,
    beneficiary,
    partner,
    feePercent,
    permit,
    deadline,
    uuid,
    caller
  ) {
    const gasPriceGwei = await this.web3.eth.getGasPrice();

    const simpleData = {
      fromToken: srcToken,
      toToken: destToken,
      fromAmount: srcAmount,
      toAmount: destAmount,
      expectedAmount: expectedAmount,
      callees: callees,
      exchangeData: exchangeData,
      startIndexes: startIndexes,
      values: values,
      beneficiary: beneficiary,
      partner: partner,
      feePercent: feePercent,
      permit: permit,
      deadline: deadline,
      uuid: uuid,
    };

    const estimateGas = await this.contract.methods
      .simpleSwap(simpleData)
      .estimateGas({
        from: caller,
        value: srcAmount,
        gasPrice: gasPriceGwei,
      });

    return await this.contract.methods.simpleSwap(simpleData).send({
      from: caller,
      gas: Number(Number(estimateGas.toString()) * 1.2).toFixed(0),
      gasPrice: gasPriceGwei,
      value: srcAmount,
    });
  }
}

module.exports = Paraswap;
