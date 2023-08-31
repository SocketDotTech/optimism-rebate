import { Contract, getDefaultProvider, Wallet, utils, BigNumber} from "ethers";
import { merkleRewardsContract, merkleRewardsContractAbi } from "./constants";
import { getRootAndSum, getMerkleProof } from "./utils";
import 'dotenv/config'

const provider = getDefaultProvider(process.env.RPC_URL);
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!privateKey) {
  throw new Error('Private key not found')
}
const wallet = new Wallet(privateKey, provider);


export async function setMerkleRoot() {
  const { merkleRoot, totalRewards } = await getRootAndSum()
  console.log({ merkleRoot, totalRewards } );
  
  const contract = new Contract(merkleRewardsContract, merkleRewardsContractAbi, wallet);

  const gasPrice = utils.parseUnits('1', 'gwei'); 


  try {
    const tx = await contract.setMerkleRoot(merkleRoot, totalRewards, {
      gasLimit: 200000,
      gasPrice
    });
    console.log("Transaction hash:", tx.hash);
    await tx.wait(); // Wait for the transaction to be mined
    console.log("Transaction successful!");
  } catch (error) {
    console.error("Error calling claim function:", error);
  }

}

export async function claimAmount(address: string, amount: string) {
  console.log({amount});
  

  const proof = await getMerkleProof(address, BigNumber.from(amount))
  
  const contract = new Contract(merkleRewardsContract, merkleRewardsContractAbi, wallet);

  const gasPrice = utils.parseUnits('1', 'gwei'); 

  try {
    const tx = await contract.claim(address, amount, proof, {
      gasLimit: 200000,
      gasPrice
    });

    console.log("Transaction hash:", tx.hash);
    await tx.wait(); // Wait for the transaction to be mined
    console.log("Transaction successful!");
  } catch (error) {
    console.error("Error calling claim function:", error);
  }

}