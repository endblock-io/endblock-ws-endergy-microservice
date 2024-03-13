class Blockchain {
  constructor(web, nodeUrl, chainID) {
    this.nodeUrl = nodeUrl;
    this.defChainID = chainID;
    this.web3 = web;
  }

  async getBalance(account) {
    return await this.web3.eth.getBalance(account);
  }

  async getCurrentChainID() {
    return await this.web3.eth.net.getId();
  }

  async isDefaultNetwork() {
    const chain = await this.getCurrentChainID();
    return Number(chain) == Number(this.defChainID);
  }

  isValidAddress(address) {
    if (this.web3.utils.isAddress(address)) {
      return true;
    } else {
      return false;
    }
  }

  async getBlock(blocknumber) {
    return await this.web3.eth.getBlock(blocknumber);
  }

  async getBlockDate(blocknumber) {
    const block = await this.web3.eth.getBlock(blocknumber);

    return new Date(block.timestamp * 1000);
  }

  async getGasPrice() {
    return await this.web3.eth.getGasPrice();
  }

  async getPastEvents(eventName, blkFrom, blkEnd, filterEvents) {
    if (blkFrom > blkEnd) {
      return { err: null, events: filterEvents };
    }

    const blockTo = blkFrom + 5000;

    const events = await this.envContract.getPastEvents(eventName, {
      fromBlock: blkFrom,
      toBlock: blockTo,
    });

    filterEvents.push(...events);

    return await this.getPastEvents(
      eventName,
      blkFrom + 5000,
      blkEnd,
      filterEvents
    );
  }
}

module.exports = Blockchain;
