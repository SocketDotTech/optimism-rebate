import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import '@nomiclabs/hardhat-ethers'
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const accounts =
  process.env.DEPLOYER_PRIVATE_KEY !== undefined
    ? [process.env.DEPLOYER_PRIVATE_KEY]
    : [];

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  etherscan: {
    // apiKey: getEtherscanKey(),
    apiKey: {
      polygon: process.env.POLYGON_ETHERSCAN_KEY,
      gnosis: process.env.GNOSIS_ETHERSCAN_KEY,
      optimisticEthereum: process.env.OPTIMISM_ETHERSCAN_KEY,
      arbitrumOne: process.env.ARBITRUM_ETHERSCAN_KEY,
      aurora: process.env.AURORA_ETHERSCAN_KEY,
      bsc: process.env.BINANCE_ETHERSCAN_KEY,
      opera: process.env.FANTOM_ETHERSCAN_KEY,
      avalanche: process.env.AVALANCHE_ETHERSCAN_KEY,
      mainnet: process.env.MAINNET_ETHERSCAN_KEY,
      polygonZKevm: process.env.POLYGON_ZKEVM_ETHERSCAN_KEY,
    },
    customChains: [
      {
        network: "polygonZKevm",
        chainId: 1101,
        urls: {
          browserURL: 'https://zkevm.polygonscan.com',
          apiURL: 'https://api-zkevm.polygonscan.com/api',
        }
      }
    ]
  },
  networks: {
    // hardhat: {
    //   accounts: {
    //     mnemonic: process.env.HOP_MNEMONIC_TESTNET,
    //   },
    // },
    // localhost: {
    //   url: "http://localhost:8545",
    //   accounts: {
    //     mnemonic: process.env.HOP_MNEMONIC_TESTNET,
    //   },
    // },
    // goerli: {
    //   url: process.env.RPC_ENDPOINT_GOERLI || "",
    //   accounts,
    // },
    mainnet: {
      url: process.env.RPC_ENDPOINT_MAINNET || "",
      accounts,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;