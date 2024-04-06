const web3contract = require("./web3Intancer");
const abiContStakeEndEth = require("../contracts/abis/ContinuousStakeETH.json");
// const abiContStakeLpEth = require('../contracts/abis/cstk20.json')
const abiContStakeJuiEth = require("../contracts/abis/ContinuousStake721ETH.json");
const abiContStakeJuiEthPro = require("../contracts/abis/ContinuousStakeLegendariosETH.json");
const abiContStakeJuiEthRare = require("../contracts/abis/ContinuousStakeRareETH.json");
const abiProfitHarvest721 = require("../contracts/abis/ProfitHarvest721.json");

const { addresses } = require("../contracts/addresses");

const chainId = process.env.CHAIN_ID;

const stakesData = async (abi, address, web3) => {
  let totalStakedAmount;
  let rewardPerBlock;
  let rewardBalance;

  const contract = await web3contract.getContract(abi, address, web3);

  try {
    totalStakedAmount = await contract?.methods.totalStakedAmount().call();
    rewardPerBlock = await contract.methods.rewardPerBlock().call();
    rewardBalance = await contract.methods.getRewardBalance().call();
  } catch (error) {
    console.log(error);
  }

  return {
    totalStakedAmount: totalStakedAmount.toString(),
    rewardPerBlock: rewardPerBlock.toString(),
    rewardBalance: rewardBalance.toString(),
  };
};
const profitHarvestData = async (abi, address, web3) => {
  //    let totalStakedAmount;
  let rewardPerBlock;
  let rewardBalance;

  const contract = await web3contract.getContract(abi, address, web3);

  try {
    rewardBalance = await contract.methods.totRewardAcum().call();
  } catch (error) {
    console.log(error);
  }

  return {
    rewardBalance: rewardBalance.toString(),
  };
};

const stakesDatas = async (web3) => {
  const response = await Promise.all([
    stakesData(abiContStakeEndEth, addresses.contStakeEndEth[chainId], web3),
    // stakesData(abiContStakeLpEth,addresses.contStakeLpEth[chainId],web3),
    stakesData(abiContStakeJuiEth, addresses.contStakeJuiEth[chainId], web3),
    stakesData(
      abiContStakeJuiEthPro,
      addresses.contStakeJuiEthPro[chainId],
      web3
    ),
    stakesData(
      abiContStakeJuiEthRare,
      addresses.continuousStakeRareETH[chainId],
      web3
    ),
    profitHarvestData(
      abiProfitHarvest721,
      addresses.ProfitHarvest721[chainId],
      web3
    ),
  ]);

  return {
    contStakeEndEth: response[0],
    // contStakeLpEth:response[1],
    contStakeJuiEth: response[1],
    contStakeJuiEthPro: response[2],
    contStakeJuiEthRare: response[3],
    profit721: response[4],
  };
};

module.exports = {
  stakesDatas,
};
