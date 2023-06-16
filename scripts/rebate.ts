import keccak256 from "keccak256";
import { MerkleTree } from 'merkletreejs'
import SHA256 from 'crypto-js/sha256'
import { addresses } from "./constants";

export async function buildMerkleRoot(): Promise<{ root: string, totalClaimAmount: number}> {
  const totalClaimableAmount = addresses?.reduce((acc, curr) => acc + curr.claimableAmount, 0)

  const merkleTree = getMerkleTree()
  
  const root = merkleTree.getRoot().toString('hex')

  console.log({
    root,
    totalClaimAmount: totalClaimableAmount 
  });
  
  return {
    root,
    totalClaimAmount: totalClaimableAmount 
  }
}

export function getMerkleTree() {
  const leaves = addresses?.map(event => {
    const leafString = `OP_REBATE` + event.address + event.claimableAmount
    const leaf = keccak256(leafString).toString('hex') 
    return SHA256(leaf)
   })
 
  const tree = new MerkleTree(leaves, SHA256)  
  return tree
}


export function bulidMerkleProof(params: string) { 
    
  const args = JSON.parse(params) as { address: string, amount: string }
  
  const merkleTree = getMerkleTree()
  const leafString = `OP_REBATE` + args.address + Number(args.amount);
  const leaf = SHA256(keccak256(leafString).toString('hex'));
  const proof = merkleTree.getProof(leaf.toString());

  return proof
}