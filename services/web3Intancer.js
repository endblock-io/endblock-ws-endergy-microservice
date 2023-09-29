



 const getContract = async (abi,contractAddress, web3) => {
    return new web3.eth.Contract( abi , contractAddress )
}


module.exports = {
    getContract
}