const web3contract  = require('./web3Intancer')
const abiContStakeEndEth = require('../contracts/abis/cstk.json')
const abiContStakeLpEth = require('../contracts/abis/cstk20.json')
const abiContStakeJuiEth = require('../contracts/abis/cdtk721.json')
const abiContStakeJuiEthPro = require('../contracts/abis/cstk721P.json')
const abiContStakeJuiEthRare = require('../contracts/abis/cstk721Rare.json')
const {addresses} = require('../contracts/addresses')

const chainId = process.env.CHAIN_ID;


 
 const stakesData = async (abi, address, web3) => {


   let totalStakedAmount;
   let rewardPerBlock;
   let rewardBalance;

    const contract = await web3contract.getContract(abi, address, web3)


    try {
        totalStakedAmount = await contract?.methods.totalStakedAmount().call();
        rewardPerBlock = await contract.methods.rewardPerBlock().call();
        rewardBalance = await contract.methods.getRewardBalance().call();
    } catch (error) {
        console.log(error)
    }



    return {
        totalStakedAmount:totalStakedAmount.toString(),
        rewardPerBlock:rewardPerBlock.toString(),
        rewardBalance:rewardBalance.toString()
    }

}


const stakesDatas = async (web3) => {


    const response = await Promise.all(
        [
        stakesData(abiContStakeEndEth,addresses.contStakeEndEth[chainId],web3),
        stakesData(abiContStakeLpEth,addresses.contStakeLpEth[chainId],web3),
        stakesData(abiContStakeJuiEth,addresses.contStakeJuiEth[chainId],web3),
        stakesData(abiContStakeJuiEthPro,addresses.contStakeJuiEthPro[chainId],web3),
        stakesData(abiContStakeJuiEthRare,addresses.continuousStakeRareETH[chainId],web3),

    ])
    return {
        contStakeEndEth:response[0],
        contStakeLpEth:response[1],
        contStakeJuiEth:response[2],
        contStakeJuiEthPro:response[3],
        contStakeJuiEthRare:response[4],
    }

}

module.exports = {
    stakesDatas
}