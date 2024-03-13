const axios = require("axios");

class ParaswapApiClient {
  constructor() {
    this.tockenETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    this.tockenETHDecimals = 18;
  }

  async getPricesCall(
    _srcToken,
    _destToken,
    _srcDecimals,
    _destDecimals,
    _amount,
    _side,
    _includeDEXS,
    _includeContractMethods,
    _userAddress,
    _route,
    _partner,
    _networkID
  ) {
    const srcToken = _srcToken;
    const destToken = _destToken;
    const amount = _amount;
    const srcDecimals = _srcDecimals;
    const destDecimals = _destDecimals;
    const side = _side;
    const network = _networkID;
    const includeDEXS = _includeDEXS;
    const includeContractMethods = _includeContractMethods;
    const userAddress = _userAddress;
    const route = _route;
    const partner = _partner;

    return await axios.get("https://apiv5.paraswap.io/prices/", {
      params: {
        srcToken,
        destToken,
        amount,
        srcDecimals,
        destDecimals,
        side,
        network,
        includeDEXS,
        includeContractMethods,
        userAddress,
        route,
        partner,
      },
      headers: {
        Accept: "application/json",
      },
    });
  }

  async getTransactionParametersCall(
    srcToken,
    destToken,
    amount,
    priceRoute,
    userAddress,
    partner,
    srcDecimals,
    destDecimals,
    networkID
  ) {
    const requestBody = {
      srcToken: srcToken,
      destToken: destToken,
      srcAmount: amount,
      destAmount: priceRoute.destAmount,
      priceRoute: priceRoute,
      userAddress: userAddress,
      partner: partner,
      srcDecimals: srcDecimals,
      destDecimals: destDecimals,
    };

    return await axios.post(
      "https://apiv5.paraswap.io/transactions/" +
        networkID +
        "?onlyParams=true",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
  }

  async getPrices(
    srcToken,
    destToken,
    amount,
    srcDecimals,
    destDecimals,
    side,
    includeDEXS,
    includeContractMethods,
    userAddress,
    route,
    partner,
    networkID
  ) {
    const retValue = {
      isOk: false,
      priceRoute: null,
      error: null,
    };

    await this.getPricesCall(
      srcToken,
      destToken,
      srcDecimals,
      destDecimals,
      amount,
      side,
      includeDEXS,
      includeContractMethods,
      userAddress,
      route,
      partner,
      networkID
    )
      .then((response) => {
        retValue.isOk = true;
        retValue.priceRoute = response.data.priceRoute;
      })
      .catch((error) => {
        retValue.isOk = false;
        retValue.error = error;
      });

    return retValue;
  }

  async getTransactionParameters(
    srcToken,
    destToken,
    amount,
    priceRoute,
    userAddress,
    partner,
    srcDecimals,
    destDecimals,
    networkID
  ) {
    const retValue = {
      isOk: false,
      transactionParameters: null,
      error: null,
    };

    await this.getTransactionParametersCall(
      srcToken,
      destToken,
      amount,
      priceRoute,
      userAddress,
      partner,
      srcDecimals,
      destDecimals,
      networkID
    )
      .then((response) => {
        retValue.isOk = true;
        retValue.transactionParameters = response.data;
      })
      .catch((error) => {
        retValue.isOk = false;
        retValue.error = error;
      });

    return retValue;
  }

  async getParameters(
    srcToken,
    destToken,
    amount,
    srcDecimals,
    destDecimals,
    side,
    userAddress,
    partner,
    includeDEXS,
    includeContractMethods,
    route,
    networkID
  ) {
    const retValue = {
      isOk: false,
      transactionParameters: null,
      error: null,
    };

    const pricesRetValue = await this.getPrices(
      srcToken,
      destToken,
      amount,
      srcDecimals,
      destDecimals,
      side,
      includeDEXS,
      includeContractMethods,
      userAddress,
      route,
      partner,
      networkID
    );

    if (!pricesRetValue.isOk) {
      retValue.isOk = false;
      retValue.error = pricesRetValue.error;
      return retValue;
    }

    const transactionParametersRetValue = await this.getTransactionParameters(
      srcToken,
      destToken,
      amount,
      pricesRetValue.priceRoute,
      userAddress,
      partner,
      srcDecimals,
      destDecimals,
      networkID
    );

    if (!transactionParametersRetValue.isOk) {
      retValue.isOk = false;
      retValue.error = transactionParametersRetValue.error;
      return retValue;
    }

    retValue.isOk = true;
    retValue.transactionParameters =
      transactionParametersRetValue.transactionParameters;

    return retValue;
  }
}
module.exports = ParaswapApiClient;
