const async = require("async");

class ERC20 {
  constructor(web3, address, abi, defaultAccount) {
    this.web3 = web3;
    this.contract = new web3.eth.Contract(abi, address);
    this.contract.defaultAccount = defaultAccount;
  }

  async balanceOf(account) {
    return await this.contract.methods.balanceOf(account).call();
  }

  async approve(
    account,
    addrSpender,
    rawAmount,
    gas = 3000000,
    gasPriceGwei = "10"
  ) {
    const gasPrice = await this.getGasPrice();

    const _gasPrice =
      gasPriceGwei != "0"
        ? this.web3.utils.toWei(gasPriceGwei, "gwei")
        : gasPrice;
    const _gas = await this.contract.methods
      .approve(addrSpender, rawAmount)
      .estimateGas({ from: account });
    const _gasUsed = gas == 0 ? _gas : gas;

    return await this.contract.methods
      .approve(addrSpender, rawAmount)
      .send({ from: account, gas: _gasUsed, gasPrice: _gasPrice });
  }

  async approve2(
    account,
    addrSpender,
    rawAmount,
    gas = 3000000,
    gasPriceGwei = "10"
  ) {
    const allowance = await this.allowance(account, addrSpender);

    const bnalow = new this.web3.utils.BN(allowance);

    const bnamount = new this.web3.utils.BN(rawAmount);

    if (bnalow.cmp(bnamount) == -1) {
      const gasPrice = await this.getGasPrice();

      const _gasPrice =
        gasPriceGwei != "0"
          ? this.web3.utils.toWei(gasPriceGwei, "gwei")
          : gasPrice;
      const _gas = await this.contract.methods
        .approve(addrSpender, rawAmount)
        .estimateGas({ from: account });
      const _gasUsed = gas == 0 ? _gas : gas;

      return await this.contract.methods
        .approve(addrSpender, rawAmount)
        .send({ from: account, gas: _gasUsed, gasPrice: _gasPrice });
    }
  }

  async allowance(account, spender) {
    return await this.contract.methods.allowance(account, spender).call();
  }

  async getERC20info() {
    return await async.parallel({
      name: (callback) => {
        this.contract.methods.name().call(null, function (error, result) {
          callback(error, result);
        });
      },

      symbol: (callback) => {
        this.contract.methods.symbol().call(null, function (error, result) {
          callback(error, result);
        });
      },
    });
  }
}

module.exports = ERC20;
