require("@nomiclabs/hardhat-ethers");
require('dotenv').config();

module.exports = {
    solidity: {
      version:"0.8.27"
    }, // Specify the Solidity compiler version
    networks: {
        avalanche: {
            url: "https://api.avax-test.network/ext/bc/C/rpc", // Avalanche Fuji Testnet RPC URL
            accounts: [`0x${process.env.PRIVATE_KEY}`], // Use a private key stored as an environment variable
            chainId: 43113, // Chain ID for Avalanche Fuji Testnet
            gas: "auto", // Automatically calculate gas
            gasPrice: 225000000000, // 225 gwei gas price
        },
    },
};

//npm install --save-dev ethers@5.7.2 @nomiclabs/hardhat-ethers@2.2.1

