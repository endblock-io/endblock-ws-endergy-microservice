const web3contract  = require('./web3Intancer')
const abiEnd = require('../contracts/abis/endergyEND.json')
const abiEth = require('../contracts/abis/endergyETH.json')

const {addresses} = require('../contracts/addresses')




 
 const endergyData = async ( web3 ) => {

    const contractEnd = await web3contract.getContract(abiEnd, addresses.endergyEndEnd[process.env.CHAIN_ID], web3)
    const contractEth = await web3contract.getContract(abiEth, addresses.endergyEndEth[process.env.CHAIN_ID], web3)
    

    let totalStakedAmountEth = 0;
    let rewardPerBlockEth = 0;
    let rewardBalanceEth = 0;

    let totalStakedAmountEnd = 0;
    let rewardPerBlockEnd = 0;
    let rewardBalanceEnd = 0;

    try {

        totalStakedAmountEnd = await contractEnd?.methods.totalStakedAmount().call();
        rewardPerBlockEnd = await contractEnd.methods.rewardPerBlock().call();
        rewardBalanceEnd = await contractEnd.methods.getRewardBalance().call();

        totalStakedAmountEth = await contractEth?.methods.totalStakedAmount().call();
        rewardPerBlockEth = await contractEth.methods.rewardPerBlock().call();
        rewardBalanceEth = await contractEth.methods.getRewardBalance().call();

    } catch (error) {
        console.log(error)
    }
    


    return {

        endergyEth:{
            totalStakedAmountEth:totalStakedAmountEth.toString(),
            rewardPerBlockEth:rewardPerBlockEth.toString(),
            rewardBalanceEth:rewardBalanceEth.toString()
        },
        endergyEnd:{
            totalStakedAmountEnd:totalStakedAmountEnd.toString(),
            rewardPerBlockEnd:rewardPerBlockEnd.toString(),
            rewardBalanceEnd:rewardBalanceEnd.toString()
        }
    }

}



module.exports = {
    endergyData
}