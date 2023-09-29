const express = require('express');
const { Web3 } = require('web3')
const cors = require('cors')
require('dotenv').config()



const endergy = require('./services/endergy')


const app = express();

const server = require('http').createServer(app);

const io = require('socket.io')(server,{   cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
 })


const web3 = new Web3(process.env.RPC)

app.use(cors());
app.use( express.static( __dirname + '/public'))



let response = {};

setInterval(async() => {
    try {
        response = await endergy.endergyData(web3)
        console.log(response)
    } catch (error) {
        console.log(error)
    }
     
    
}, 2500);

io.on('connection', ( socket ) => {
    console.log(socket.id)
});

setInterval(async() => {

    try {
    io.emit('get-endergy', JSON.stringify(response))
        console.log(response)
    } catch (error) {
        console.log(error)
    }

}, 2500);

server.listen(process.env.PORT,async()=>{
    console.log('port:',process.env.PORT)
    // const response = await pools.poolDatas(web3)
//    const response = await jackpool.jackPoolData(web3)
    // console.log(response)
})