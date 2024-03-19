const express = require('express');
const { Web3 } = require('web3')
const cors = require('cors')
require('dotenv').config()


// const buyend = require("./services/buyend");
const endergy = require('./services/endergy')
const stakes = require('./services/stakes')
// const autoPool = require('./services/autoPoolAwardSubscriber')
// const {addresses} = require('./contracts/v4/addresses')


const app = express();

const server = require('http').createServer(app);

const io = require('socket.io')(server,{   cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
 })


const web3 = new Web3(process.env.RPC)
// const web3Wss = new Web3(
//     "wss://rpc.ankr.com/polygon/ws/7efab394d5527c290021107f4f0e001fa3137d1957fd462b81d4781f397fcb65"
//     // "https://rpc.ankr.com/polygon/7efab394d5527c290021107f4f0e001fa3137d1957fd462b81d4781f397fcb65"
//   );

app.use(cors());
app.use( express.static( __dirname + '/public'))

// buyend.init();


let response = {};

setInterval(async() => {
    try {
        response = await endergy.endergyData(web3)

    } catch (error) {
        console.log(error)
    }
     
}, 3000);

let responseStakes = {};
setInterval(async() => {
    try {
        responseStakes = await stakes.stakesDatas(web3)
    } catch (error) {
        console.log(error)
    }
     
    
}, 3000);

io.on('connection', ( socket ) => {
    console.log(socket.id)
});

setInterval(async() => {
    try {
    io.emit('get-endergy', JSON.stringify(response))

    } catch (error) {
        console.log(error)
    }

}, 2500);


setInterval(async() => {

    try {
    io.emit('get-stakes', JSON.stringify(responseStakes))
    } catch (error) {
        console.log(error)
    }

}, 2500);




// const pro =  () =>{
//     autoPool.autoPoolAwardSubscribe(addresses.autoPools.AutoPOOL2[137],io, 'AutoPOOL2Winner',web3Wss)
//     autoPool.autoPoolAwardSubscribe(addresses.autoPools.AutoPOOL3[137],io, 'AutoPOOL3Winner',web3Wss)
//     autoPool.autoPoolAwardSubscribe(addresses.autoPools.AutoPOOL4[137],io, 'AutoPOOL4Winner',web3Wss)
//     autoPool.autoPoolAwardSubscribe(addresses.autoPools.AutoPOOL5[137],io, 'AutoPOOL5Winner',web3Wss)
// }


let flag = true 

// if (flag) {
//     pro()
//     flag= false
// }

// setInterval(async() => {
//     try {
//         pro()
//     } catch (error) {
//         console.log(error)
//     }
// }, 60000);


server.listen(process.env.PORT,async()=>{
    console.log('port:',process.env.PORT)
    // const response = await pools.poolDatas(web3)
//    const response = await jackpool.jackPoolData(web3)
    // console.log(response)
})