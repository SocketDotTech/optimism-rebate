import keccak256 from 'keccak256'
import { MerkleTree } from 'merkletreejs'
import  merkleTreeElements from "./addresses.json";
import { BigNumber, Contract, getDefaultProvider, utils} from "ethers";
import { merkleRewardsContract, merkleRewardsContractAbi, claimEventsEndPoint } from "./constants";
import axios from 'axios';
import 'dotenv/config'


const provider = getDefaultProvider(process.env.RPC_URL);

const addresses = merkleTreeElements


export async function getRootAndSum() {
  const merkleTree = bulidAndGetMerkleTree()
  
  const contract = new Contract(merkleRewardsContract, merkleRewardsContractAbi, provider);
  const currentMerkleRoot = await contract.merkleRoot()
  const newMerkleRoot = merkleTree.getHexRoot()

  if (newMerkleRoot === currentMerkleRoot) {
    console.log('Merkle root not changed');
    throw new Error('Merkle root not changed')
  }

  const claimEvents = await getClaimEvents()

  if (!claimEvents) {
    throw new Error("Claiming get events failed");
  }

  console.log({claimEvents: claimEvents.length});
  

  
  const rewardAmountSum = claimEvents?.reduce((acc, curr) => BigNumber.from(acc).add(BigNumber.from(curr.claimableAmount)) , BigNumber.from(0))
  const currentTotalRewards = await contract.currentTotalRewards()
  const currentTotalRewardsParsed = BigNumber.from(currentTotalRewards)
  const additonalRewards = rewardAmountSum.sub(currentTotalRewardsParsed)   
  const totalRewards = currentTotalRewardsParsed.add(additonalRewards)

  console.log({
    currentTotalRewards: currentTotalRewardsParsed,
    merkleRoot: newMerkleRoot,
    additonalRewards,
    totalRewards
  });
  
  return {
    merkleRoot: newMerkleRoot,
    totalRewards
  }
}


export function bulidAndGetMerkleTree() {  
  const merkleTreeLeaves = addresses?.map(event => {
    return hashLeaf(event.address, BigNumber.from(event.claimableAmount))
  })
  const tree = new MerkleTree(merkleTreeLeaves, keccak256, { sort: true })
  return tree
}

export function getMerkleProof(address: string, amount: BigNumber) { 
    
  
  const merkleTree = bulidAndGetMerkleTree()

  const leaf = hashLeaf(address, amount)
  
  const proof = merkleTree.getHexProof(leaf);

  console.log({ proof });
  
  console.log('isValidProof', merkleTree.verify(proof, leaf, merkleTree.getHexRoot()));
  
  const isValidProof = merkleTree.verify(proof, leaf, merkleTree.getHexRoot())
  
  if (!isValidProof) {
    throw new Error("Invalid Proof, pls check amount and address");
  }
  
  return proof
}

function hashLeaf (address: string, amount: BigNumber) {
  const salt = keccak256('OP_REBATE')
  return utils.solidityKeccak256(['bytes32', 'address', 'uint256'], [salt, address, amount])
}

const getClaimEvents = async (): Promise<{
  address: string;
  claimableAmount: string;
}[] | undefined> => {
  try {
    const resp = await axios.get(claimEventsEndPoint)
    return resp.data
  } catch (error) {
    console.log(error)
    return undefined
  }
}