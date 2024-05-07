

// 0x981406ca568f425fc6b5e893522f9684a57e144769c5112dfd49efad4a709b2a
// 0x000000000000000000000000de34a68dd306ab49990216b976e7359edd9c4de1


const eventJsonInterface = 			{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "address",
      "name": "account",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "coins",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint32",
      "name": "reward",
      "type": "uint32"
    },
    {
      "indexed": false,
      "internalType": "enum HelperAutoPOOLENDJP.WIN_CONTEXT",
      "name": "state",
      "type": "uint8"
    }
  ],
  "name": "Awarded",
  "type": "event"
};


const autoPoolAwardSubscribe = async (address, io,autoPoolName, web3 , logs ) => {


  const logSubscription = await  web3.eth.subscribe(
    "logs",
    {
      address,
      topics: ['0x981406ca568f425fc6b5e893522f9684a57e144769c5112dfd49efad4a709b2a'],
      // topics: ['0x2cb77763bc1e8490c1a904905c4d74b4269919aca114464f4bb4d911e60de364',"0x000000000000000000000000de34a68dd306ab49990216b976e7359edd9c4de1"],
    }
  );

  logSubscription.on('data', (result) => {
            const eventObj = web3.eth.abi.decodeLog(
          eventJsonInterface.inputs,
          result.data,
          result.topics.slice(1)
        );
        const data =   {
          account:eventObj.account,
          coins:eventObj.coins.toString(),
          reward:eventObj.reward.toString(),
          state:eventObj.state.toString(),
          autoPoolName
        }
        // emmiter({
        //   account:eventObj.account,
        //   coins:eventObj.coins.toString(),
        //   reward:eventObj.reward.toString(),
        //   state:eventObj.state.toString(),
        //   autoPoolName
        // })
        try {
          io.emit('autoPool-Awards', JSON.stringify(
            data
          ))
              console.log(JSON.stringify(data), 'emmited')
          } catch (error) {
              console.log(error)
          }
  });
logSubscription.on('error', (error) => console.log(error));


};
module.exports = {
  autoPoolAwardSubscribe
};
