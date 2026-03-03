import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Web3 from 'web3';
import { MerkleTree } from 'merkletreejs';
import * as crypto from 'crypto';

export interface BlockchainConfig {
  network: 'ethereum' | 'polygon' | 'bsc' | 'sepolia';
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
}

export interface AnchorResult {
  success: boolean;
  txHash?: string;
  blockNumber?: number;
  merkleRoot?: string;
  error?: string;
}

export interface VerificationResult {
  verified: boolean;
  message: string;
  blockNumber?: number;
  timestamp?: Date;
}

@Injectable()
export class Web3Service {
  private readonly logger = new Logger(Web3Service.name);
  private web3!: Web3;
  private config!: BlockchainConfig;
  private isInitialized = false;
  private allowMock = false;

  constructor(private configService: ConfigService) {
    this.initializeWeb3();
  }

  /**
   * Initialize Web3 connection
   */
  private initializeWeb3(): void {
    try {
      const network = this.configService.get<string>('BLOCKCHAIN_NETWORK', 'sepolia') as any;
      const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL', '');
      const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY', '');
      const contractAddress = this.configService.get<string>('BLOCKCHAIN_CONTRACT_ADDRESS', '');
      this.allowMock =
        String(this.configService.get<string>('BLOCKCHAIN_ALLOW_MOCK', 'false')).toLowerCase() === 'true';

      if (!rpcUrl) {
        this.logger.warn(
          this.allowMock
            ? 'Blockchain RPC URL not configured - mock mode is explicitly enabled'
            : 'Blockchain RPC URL not configured - blockchain operations will fail closed',
        );
        this.isInitialized = false;
        return;
      }

      this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
      this.config = {
        network,
        rpcUrl,
        privateKey,
        contractAddress,
      };

      this.isInitialized = true;
      this.logger.log(`Web3 initialized for ${network} network`);
    } catch (error) {
      this.logger.error('Failed to initialize Web3:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Check if Web3 is connected
   */
  async isConnected(): Promise<boolean> {
    if (!this.isInitialized || !this.web3) {
      return false;
    }
    try {
      return await this.web3.eth.net.isListening();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    if (!this.isInitialized) {
      // Default fallback when blockchain is not initialized
      return this.web3?.utils?.toWei('20', 'gwei') || '20000000000';
    }
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      return gasPrice.toString();
    } catch (error) {
      this.logger.error('Error getting gas price:', error);
      return this.web3.utils.toWei('20', 'gwei');
    }
  }

  /**
   * Generate Merkle root from votes
   */
  generateMerkleRoot(votes: { id: number; hash: string }[]): string {
    if (votes.length === 0) {
      return '0x' + '0'.repeat(64);
    }

    // Use mock Web3 utilities if not initialized
    if (!this.isInitialized || !this.web3) {
      return this.generateMockMerkleRoot(votes);
    }

    // Create leaf nodes (hash each vote)
    const leaves = votes.map(vote => 
      this.web3.utils.keccak256(vote.id + ':' + vote.hash)
    );

    // Build Merkle tree
    const tree = new MerkleTree(leaves, this.web3.utils.keccak256, {
      hashLeaves: false,
      sortLeaves: true,
      sortPairs: true,
    });

    return tree.getRoot().toString('hex');
  }

  /**
   * Get Merkle proof for a specific vote
   */
  getMerkleProof(votes: { id: number; hash: string }[], targetVoteId: number): string[] {
    if (votes.length === 0) {
      return [];
    }

    // Use mock proof generation if not initialized
    if (!this.isInitialized || !this.web3) {
      return this.generateMockMerkleProof(votes, targetVoteId);
    }

    const leaves = votes.map(vote =>
      this.web3.utils.keccak256(vote.id + ':' + vote.hash)
    );

    const tree = new MerkleTree(leaves, this.web3.utils.keccak256, {
      hashLeaves: false,
      sortLeaves: true,
      sortPairs: true,
    });

    const targetLeaf = votes.find(v => v.id === targetVoteId);
    if (!targetLeaf) {
      return [];
    }

    const targetHash = this.web3.utils.keccak256(targetVoteId + ':' + targetLeaf.hash);
    const proof = tree.getProof(targetHash);

    return proof.map(p => '0x' + p.data.toString('hex'));
  }

  /**
   * Create vote hash
   */
  createVoteHash(voteId: number, contestantId: number, eventId: number, timestamp: number): string {
    const data = `${voteId}:${contestantId}:${eventId}:${timestamp}`;
    
    // Use Web3 keccak256 if available, otherwise use SHA256 as fallback
    if (this.isInitialized && this.web3) {
      return this.web3.utils.keccak256(data);
    }
    
    // Fallback using Node.js crypto
    return '0x' + crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Anchor votes to blockchain
   * This would call a smart contract function
   */
  async anchorToBlockchain(
    merkleRoot: string,
    voteCount: number,
    eventId: number,
  ): Promise<AnchorResult> {
    if (!this.isInitialized) {
      if (this.allowMock) {
        return this.mockAnchor(merkleRoot);
      }
      return {
        success: false,
        merkleRoot,
        error: 'Blockchain is not configured. Set BLOCKCHAIN_RPC_URL or explicitly enable BLOCKCHAIN_ALLOW_MOCK=true.',
      };
    }

    try {
      const accounts = await this.web3.eth.getAccounts();
      const fromAccount = accounts[0] || this.web3.eth.accounts.privateKeyToAccount(this.config.privateKey).address;

      // Prepare transaction data (calling smart contract)
      const contract = new this.web3.eth.Contract(
        this.getABI(),
        this.config.contractAddress
      );

      const gasPrice = await this.getGasPrice();
      const estimatedGas = await contract.methods
        .anchorVotes(merkleRoot, voteCount, eventId)
        .estimateGas({ from: fromAccount });

      // Send transaction
      const tx = await contract.methods
        .anchorVotes(merkleRoot, voteCount, eventId)
        .send({
          from: fromAccount,
          gas: String(Math.floor(Number(estimatedGas) * 1.2)), // Add 20% buffer
          gasPrice,
        });

      this.logger.log(`Vote anchored successfully: ${tx.transactionHash}`);

      return {
        success: true,
        txHash: tx.transactionHash,
        blockNumber: Number(tx.blockNumber),
        merkleRoot,
      };
    } catch (error) {
      this.logger.error('Error anchoring to blockchain:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        merkleRoot,
      };
    }
  }

  /**
   * Verify anchor on blockchain
   */
  async verifyAnchor(txHash: string): Promise<VerificationResult> {
    if (!this.isInitialized) {
      return {
        verified: false,
        message: 'Blockchain is not connected',
      };
    }

    try {
      const receipt = await this.web3.eth.getTransactionReceipt(txHash);

      if (!receipt) {
        return {
          verified: false,
          message: 'Transaction not found',
        };
      }

      if (receipt.status) {
        const block = await this.web3.eth.getBlock(receipt.blockNumber);
        return {
          verified: true,
          message: 'Anchor verified on blockchain',
          blockNumber: Number(receipt.blockNumber),
          timestamp: new Date(Number(block.timestamp) * 1000),
        };
      }

      return {
        verified: false,
        message: 'Transaction failed',
      };
    } catch (error) {
      this.logger.error('Error verifying anchor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        verified: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<string> {
    if (!this.isInitialized) {
      return '0';
    }
    try {
      const balance = await this.web3.eth.getBalance(address);
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      return '0';
    }
  }

  /**
   * Get network ID
   */
  async getNetworkId(): Promise<number> {
    if (!this.isInitialized) {
      return 0;
    }
    try {
      return Number(await this.web3.eth.net.getId());
    } catch (error) {
      return 0;
    }
  }

  /**
   * Mock anchor for development
   */
  private mockAnchor(merkleRoot: string): AnchorResult {
    const mockTxHash = '0x' + crypto.randomBytes(32).toString('hex');
    this.logger.warn(`MOCK: Anchored to blockchain - ${mockTxHash}`);

    return {
      success: true,
      txHash: mockTxHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      merkleRoot,
    };
  }

  /**
   * Generate mock Merkle root when Web3 is not initialized
   */
  private generateMockMerkleRoot(votes: { id: number; hash: string }[]): string {
    if (votes.length === 0) {
      return '0x' + '0'.repeat(64);
    }

    // Create simple hash-based root without Web3
    const combinedHash = votes
      .map(v => v.id + ':' + v.hash)
      .join('|');
    const hash = crypto.createHash('sha256').update(combinedHash).digest('hex');
    return '0x' + hash;
  }

  /**
   * Generate mock Merkle proof when Web3 is not initialized
   */
  private generateMockMerkleProof(votes: { id: number; hash: string }[], targetVoteId: number): string[] {
    const targetLeaf = votes.find(v => v.id === targetVoteId);
    if (!targetLeaf) {
      return [];
    }

    // Generate mock proof hashes
    const proof: string[] = [];
    votes.forEach(vote => {
      if (vote.id !== targetVoteId) {
        proof.push('0x' + crypto.randomBytes(32).toString('hex'));
      }
    });

    return proof;
  }

  /**
   * Get smart contract ABI
   * This is a sample ABI for a voting anchor contract
   */
  private getABI(): any {
    return [
      {
        "inputs": [
          { "name": "_merkleRoot", "type": "bytes32" },
          { "name": "_voteCount", "type": "uint256" },
          { "name": "_eventId", "type": "uint256" }
        ],
        "name": "anchorVotes",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "name": "_eventId", "type": "uint256" }
        ],
        "name": "getAnchor",
        "outputs": [
          { "name": "merkleRoot", "type": "bytes32" },
          { "name": "voteCount", "type": "uint256" },
          { "name": "timestamp", "type": "uint256" },
          { "name": "confirmed", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getContractBalance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      }
    ];
  }
}
