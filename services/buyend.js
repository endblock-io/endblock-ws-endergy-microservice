require("log-timestamp");
require("dotenv").config();
const { Web3 } = require("web3");

const { BN } = require("bn.js");
const axios = require("axios");
const Blockchain = require("../lib/blockchain");
const ERC20 = require("../lib/erc20");
const EndergyEnd = require("../lib/EndergyEnd");
const ParaswapApiClient = require("../lib/ParaswappApiClient");
const Paraswap = require("../lib/Paraswap");

const Net = require("../config/net/polygonmainnet").blk;
const ABISimpleSwap = require("../config/abis/SimpleSwap").sc;
const ABIEndblock = require("../config/abis/endblock").sc;
const ABIEndergyEnd = require("../config/abis/edyend").sc;

const web3 = new Web3(new Web3.providers.HttpProvider(Net.url));
web3.eth.defaultAccount = process.env.buyer;
web3.eth.accounts.wallet.add("0x" + process.env.buyerkey);

const blockchain = new Blockchain(web3, Net.url, Net.chainID);

const endContract = new ERC20(
  web3,
  Net.end,
  ABIEndblock.abi,
  process.env.buyer
);

const endergyEndContract = new EndergyEnd(
  web3,
  Net.edyEND,
  ABIEndergyEnd.abi,
  process.env.buyer
);

const paraswapContract = new Paraswap(
  web3,
  Net.simpleswap,
  ABISimpleSwap.abi,
  process.env.buyer
);

const paraswapApiClient = new ParaswapApiClient();

const validateGasPrice = async () => {
  const gasPrice = await web3.eth.getGasPrice();
  const gasPriceGwei = web3.utils.fromWei(gasPrice, "gwei");

  if (Number(gasPriceGwei) <= Number(process.env.gasPriceLimitGwei)) {
    return {
      valid: true,
      gasPriceGwei: gasPriceGwei,
      gasPriceLimitGwei: process.env.gasPriceLimitGwei,
    };
  } else {
    return {
      false: true,
      gasPriceGwei: gasPriceGwei,
      gasPriceLimitGwei: process.env.gasPriceLimitGwei,
    };
  }
};

const calcTransFeeValue = async (gasLimit) => {
  const gasPrice = await web3.eth.getGasPrice();

  const gasPriceLimitBN = new BN(gasLimit);
  const gasPriceBN = new BN(gasPrice);

  return gasPriceLimitBN.mul(gasPriceBN);
};

const haveEnoughFunds = async () => {
  const balance = await blockchain.getBalance(process.env.buyer);
  const transFeeValue = await calcTransFeeValue(process.env.gasLimitBuyEnd);

  const neededFunds = transFeeValue.add(new BN(process.env.triggerBuyInWei));
  const balanceBN = new BN(balance);

  return {
    valid: balanceBN.gte(neededFunds),
    needed: neededFunds,
    balance: balance,
  };
};

const calcMaxEthBalance = async () => {
  const balance = await blockchain.getBalance(process.env.buyer);
  const transFeeValue = await calcTransFeeValue(process.env.gasLimitBuyEnd);
  const transFeeValueEnd = await calcTransFeeValue(
    process.env.gasLimitToSendEnd
  );

  const reservedGas = transFeeValue.add(new BN(transFeeValueEnd));

  const balanceBN = new BN(balance);

  const reservedPercentBN = balanceBN
    .mul(new BN(process.env.useMaxEthReservedPerc))
    .div(new BN(100));

  let retBal = balanceBN.sub(reservedPercentBN);

  if (reservedGas.gt(reservedPercentBN)) {
    retBal = balanceBN.sub(reservedGas);
  }

  return retBal;
};

const haveEnoughGasToSendEnd = async () => {
  const balance = await blockchain.getBalance(process.env.buyer);
  const transFeeValue = await calcTransFeeValue(process.env.gasLimitToSendEnd);

  const balanceBN = new BN(balance);

  return {
    valid: balanceBN.gte(transFeeValue),
    needed: transFeeValue,
    balance: balance,
  };
};

const haveEnoughEndToSend = async () => {
  const balend = await endContract.balanceOf(process.env.buyer);
  const balanceBN = new BN(balend);
  const minEndToSendImWei = new BN(process.env.minEndToSendImWei);

  return {
    valid: balanceBN.gte(minEndToSendImWei),
    needed: process.env.minEndToSendImWei,
    balance: balend,
  };
};

const buyEND = async (amountETH) => {
  const retValue = { isOk: false, txHash: null, endBuyed: null, error: null };

  const parametersRetValues = await paraswapApiClient.getParameters(
    paraswapApiClient.tockenETH,
    Net.end,
    amountETH,
    18,
    18,
    "SELL",
    process.env.buyer,
    "anon",
    "QuickSwap",
    "simpleSwap",
    paraswapApiClient.tockenETH + "-" + Net.end,
    Net.chainID
  );

  if (!parametersRetValues.isOk) {
    retValue.isOk = false;
    retValue.error = parametersRetValues.error;
    return retValue;
  }

  const par = parametersRetValues.transactionParameters[0];

  try {
    const tx = await paraswapContract.simpleSwap(
      paraswapApiClient.tockenETH,
      Net.end,
      amountETH,
      par.toAmount,
      par.expectedAmount,
      par.callees,
      par.exchangeData,
      par.startIndexes,
      par.values,
      par.beneficiary,
      par.partner,
      par.feePercent,
      par.permit,
      par.deadline,
      par.uuid,
      process.env.buyer
    );

    retValue.isOk = true;
    retValue.txHash = tx.transactionHash;
    retValue.endBuyed = par.toAmount;
  } catch (error) {
    retValue.isOk = false;
    retValue.error = error;
  }

  return retValue;
};

const executeBuy = async () => {
  const validGasPrice = await validateGasPrice();

  if (!validGasPrice.valid) {
    console.log(
      " Gas is too expensive ",
      validGasPrice.gasPriceGwei,
      " Expected: ",
      validGasPrice.gasPriceLimitGwei,
      " Gwei"
    );
    return;
  }

  const enoughFunds = await haveEnoughFunds();

  if (!enoughFunds.valid) {
    console.log(
      "Not enough funds to buy end:",
      web3.utils.fromWei(enoughFunds.balance, "ether"),
      " needed: ",
      web3.utils.fromWei(enoughFunds.needed, "ether"),
      " ETH"
    );
    return;
  }

  let useEth = new BN(process.env.triggerBuyInWei);

  if (process.env.useMaxEthBalanceToBuy == 1) {
    useEth = await calcMaxEthBalance();
  }

  console.log("begin to buy END eth=", useEth.toString());

  const buyendRet = await buyEND(useEth.toString());

  if (!buyendRet.isOk) {
    console.log("Error executing buyEND():", buyendRet.error.message);
    return;
  }

  console.log(
    "executeBuy() tx=",
    buyendRet.txHash,
    " endBuyed=",
    buyendRet.endBuyed,
    " END ethUsed=",
    useEth.toString(),
    " ETH"
  );
};

const sendEnd = async (amountEND) => {
  const retValue = { isOk: false, txHash: null, endSended: null, error: null };

  try {
    const tx = await endergyEndContract.receiveFromContract(
      process.env.buyer,
      amountEND
    );

    retValue.isOk = true;
    retValue.txHash = tx.transactionHash;
    retValue.endSended = amountEND;
  } catch (error) {
    retValue.isOk = false;
    retValue.error = error;
  }

  return retValue;
};

const executeSendEnd = async () => {
  //console.log("begin to send END...");

  const validGasPrice = await validateGasPrice();

  if (!validGasPrice.valid) {
    console.log(
      " Gas is too expensive ",
      validGasPrice.gasPriceGwei,
      " Expected: ",
      validGasPrice.gasPriceLimitGwei,
      " Gwei"
    );
    return;
  }

  const enoughGas = await haveEnoughGasToSendEnd();

  if (!enoughGas.valid) {
    console.log(
      "Not enough gas to send end:",
      web3.utils.fromWei(enoughGas.balance, "ether"),
      " needed: ",
      web3.utils.fromWei(enoughGas.needed, "ether"),
      " ETH"
    );
    return;
  }

  const enoughEndToSend = await haveEnoughEndToSend();

  if (!enoughEndToSend.valid) {
    console.log(
      "Not enough end to send:",
      web3.utils.fromWei(enoughEndToSend.balance, "ether"),
      " needed: ",
      web3.utils.fromWei(enoughEndToSend.needed, "ether"),
      " END"
    );
    return;
  }

  const sendEndRet = await sendEnd(enoughEndToSend.balance);

  if (!sendEndRet.isOk) {
    console.log("Error executing sendEND():", sendEndRet.error);
    return;
  }

  console.log(
    "executeSendEnd() end tx=",
    sendEndRet.txHash,
    " sended: ",
    sendEndRet.endSended
  );
};

const service = {
  isBusy: false,
  init: async () => {
    console.log("init services..");

    setInterval(async () => {
      if (service.isBusy) {
        console.log("service is busy in executeBuy() call");
        return;
      }
      service.isBusy = true;
      await executeBuy();
      service.isBusy = false;
    }, process.env.refreshIntervalBuyEnd || 10000);

    console.log(
      "init executeBuy() done each->",
      process.env.refreshIntervalBuyEnd,
      " ms"
    );

    setInterval(async () => {
      if (service.isBusy) {
        console.log("service is busy in executeSendEnd() call");
        return;
      }
      service.isBusy = true;
      await executeSendEnd();
      service.isBusy = false;
    }, process.env.refreshIntervalSendEnd || 10000);

    console.log(
      "init executeSendEnd() done each->",
      process.env.refreshIntervalSendEnd,
      " ms"
    );
  },
};

module.exports = service;
