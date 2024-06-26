import { privateKeyA, privateKeyB, privateKeyC, nftContractAddress, mintingFeeTokenAddress } from '../../config/config'
import { checkMintResult, mintNFTWithRetry } from '../../utils/utils'
import { registerIpAsset, attachLicenseTerms, registerDerivative, payRoyaltyOnBehalf, royaltySnapshot, collectRoyaltyTokens, royaltyClaimableRevenue, royaltyClaimRevenue } from '../../utils/sdkUtils'
import { expect } from 'chai'

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { comUseLicenseTermsId1, comRemixLicenseTermsId2, mintingFee1, mintingFee2, commercialRevShare2, comUseLicenseTermsId2, comRemixLicenseTermsId1, commercialRevShare1 } from '../setup';
import { Address } from 'viem';

let tokenIdA: string;
let tokenIdB: string;
let tokenIdC: string;
let ipIdA: Address;
let ipIdB: Address;
let ipIdC: Address;
let snapshotId1: bigint;
let snapshotId2: bigint;

const waitForTransaction: boolean = true;

describe('SDK E2E Test', function () {
    describe("Royalty", function () {
        describe("Commercial Use PIL - Claim Minting Fee", function () {
            before("Register parent and derivative IP assets", async function () {
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                checkMintResult(tokenIdA);
    
                const responseRegisterIpAsset = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
                expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;
    
                ipIdA = responseRegisterIpAsset.ipId;
    
                const responseAttachLicenseTerms = await expect(
                    attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;
    
                tokenIdB = await mintNFTWithRetry(privateKeyB);
                checkMintResult(tokenIdB);
    
                const responseregisterIpAssetB = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
                expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;
    
                ipIdB = responseregisterIpAssetB.ipId;
    
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [comUseLicenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;
    
                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Collect royalty tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("B", ipIdA, ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a('bigint').and.equal(0n);
            });

            step("Capture snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint").and.to.be.ok;

                snapshotId1 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response).to.be.a("bigint").and.to.be.ok;
                expect(response).to.be.equal(BigInt(mintingFee1));
            });

            step("Claim minting fee", async function () {
                const response = await expect(
                    royaltyClaimRevenue("A", [snapshotId1], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.claimableToken).to.be.equal(BigInt(mintingFee1));
            });

            step("Check claimable revenue again", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response).to.be.a("bigint").and.to.be.equal(0n);
            });            
        })

        describe('Commercial Use PIL - Claim Minting Fee and Pay on Behalf', async function () {
            let payAmount: string = "100";

            before("Register parent and derivative IP assets", async function () {    
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                checkMintResult(tokenIdA);
    
                const responseRegisterIpAsset = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
                expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;
    
                ipIdA = responseRegisterIpAsset.ipId;
    
                const responseAttachLicenseTerms = await expect(
                    attachLicenseTerms("A", ipIdA, comUseLicenseTermsId2, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;
    
                tokenIdB = await mintNFTWithRetry(privateKeyB);
                checkMintResult(tokenIdB);
    
                const responseregisterIpAssetB = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
                expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;
    
                ipIdB = responseregisterIpAssetB.ipId;
    
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [comUseLicenseTermsId2], waitForTransaction)
                ).to.not.be.rejected;
    
                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Collect royalty tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("B", ipIdA, ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a('bigint').and.equal(0n);
            });
            
            step("Capture snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint").and.to.be.ok;

                snapshotId1 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response).to.be.a("bigint").and.to.be.ok;
                expect(response).to.be.equal(BigInt(mintingFee2));
            });

            step("Pay royalty on behalf", async function () {
                const response = await expect(
                    payRoyaltyOnBehalf("B", ipIdA, ipIdB, mintingFeeTokenAddress, payAmount, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Capture snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A",ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint").and.to.be.ok;

                snapshotId2 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId2, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                expect(response).to.be.a("bigint").and.to.be.ok;
                expect(response).to.be.equal(BigInt(payAmount));
            });

            step("Claim revenue", async function () {
                const claimableRevenue = String(Number(mintingFee2) + Number(payAmount));
                const response = await expect(
                    royaltyClaimRevenue("A", [snapshotId1, snapshotId2], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.claimableToken).to.be.a("bigint").and.to.be.equal(BigInt(claimableRevenue));
            });

            step("Check claimable revenue again", async function () {
                const responseClaimableRevenue1 = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;

                const responseClaimableRevenue2 = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId2, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;

                expect(responseClaimableRevenue1).to.be.a("bigint").and.to.be.equal(0n);
                expect(responseClaimableRevenue2).to.be.a("bigint").and.to.be.equal(0n);
            });
        });

        describe("Commercial Remix PIL - Claim Minting Fee", function () {
            before("Register parent and derivative IP Assets", async function () {    
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                checkMintResult(tokenIdA);
    
                const responseRegisterIpAsset = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
                expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;
    
                ipIdA = responseRegisterIpAsset.ipId;
    
                const responseAttachLicenseTerms = await expect(
                    attachLicenseTerms("A", ipIdA, comRemixLicenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;
    
                tokenIdB = await mintNFTWithRetry(privateKeyB);
                checkMintResult(tokenIdB);
    
                const responseregisterIpAssetB = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
                expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;
    
                ipIdB = responseregisterIpAssetB.ipId;
    
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [comRemixLicenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;
    
                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Collect royalty tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("A", ipIdA, ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a('bigint').and.to.be.ok;

                expect(Number(response.royaltyTokensCollected)).to.be.equal(commercialRevShare1 * 1000000);
            });
                        
            step("Capture snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint").and.to.be.ok;

                snapshotId1 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response).to.be.a("bigint").and.to.be.ok;
                expect(response).to.be.equal(BigInt(mintingFee1));
            });

            step("Claim revenue", async function () {
                const response = await expect(
                    royaltyClaimRevenue("A", [snapshotId1], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.claimableToken).to.be.a("bigint").to.be.equal(BigInt(mintingFee1));               
            });
                        
            step("Check claimable revenue again", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response).to.be.a("bigint").and.to.be.equal(0n);
            });
        })

        describe('Commercial Remix PIL - Claim Minting Fee and Pay on Behalf', async function () {
            let payAmount: string = "600";
            const claimableRevenue = String(Number(mintingFee2) + Number(payAmount));

            before("Register parent and derivative IP assets", async function () {    
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                checkMintResult(tokenIdA);
                expect(tokenIdA).not.empty;
    
                const responseRegisterIpAsset = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
                expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;
    
                ipIdA = responseRegisterIpAsset.ipId;
    
                const responseAttachLicenseTerms = await expect(
                    attachLicenseTerms("A", ipIdA, comRemixLicenseTermsId2, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty; 
    
                tokenIdB = await mintNFTWithRetry(privateKeyB);
                checkMintResult(tokenIdB);
                expect(tokenIdB).not.empty;
    
                const responseregisterIpAssetB = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
                expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;
    
                ipIdB = responseregisterIpAssetB.ipId;
    
                const responseB = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [comRemixLicenseTermsId2], waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseB.txHash).to.be.a("string").and.not.empty;
            });

            step("Collect royalty tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("C", ipIdA, ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a('bigint').and.equal(BigInt(commercialRevShare2 * 1000000));
            });

            step("Capture snapshot", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint").and.to.be.ok;

                snapshotId1 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                expect(response).to.be.a("bigint").and.to.be.ok;
                expect(response).to.be.equal(BigInt(mintingFee2));
            });

            step("Pay royalty on behalf", async function () {
                const response = await expect(
                    payRoyaltyOnBehalf("C", ipIdA, ipIdB, mintingFeeTokenAddress, payAmount, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Capture snapshot", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint").and.to.be.ok;

                snapshotId2 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId2, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                expect(response).to.be.a("bigint").and.to.be.ok;
                expect(response).to.be.equal(BigInt(payAmount));
            });

            step("Claim royalty tokens", async function () {
                const response = await expect(               
                    royaltyClaimRevenue("A", [snapshotId1, snapshotId2], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.claimableToken).to.be.a("bigint").and.to.be.equal(BigInt(claimableRevenue));
            })

            step("Check claimable revenue again", async function () {
                const responseClaimableRevenue1 = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;

                const responseClaimableRevenue2 = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId2, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                expect(responseClaimableRevenue1).to.be.a("bigint").and.to.be.equal(0n);                
                expect(responseClaimableRevenue2).to.be.a("bigint").and.to.be.equal(0n);
            });
        });

        describe('Royalty - Derivative and Re-inherited IP Assets', async function () {
            let payAmount: string = "800";

            before("Register parent and derivative IP assets", async function () {    
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                checkMintResult(tokenIdA);
                expect(tokenIdA).not.empty;
    
                const responseRegisterIpAsset = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
                expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;
    
                ipIdA = responseRegisterIpAsset.ipId;
    
                const responseAttachLicenseTerms = await expect(
                    attachLicenseTerms("A", ipIdA, comRemixLicenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty; 
    
                tokenIdB = await mintNFTWithRetry(privateKeyB);
                checkMintResult(tokenIdB);
                expect(tokenIdB).not.empty;
    
                const responseregisterIpAssetB = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
                expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;
    
                ipIdB = responseregisterIpAssetB.ipId;
    
                const responseB = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [comRemixLicenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseB.txHash).to.be.a("string").and.not.empty;
    
                tokenIdC = await mintNFTWithRetry(privateKeyC);
                checkMintResult(tokenIdC);
    
                const responseregisterIpAssetC = await expect(
                    registerIpAsset("C", nftContractAddress, tokenIdC, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseregisterIpAssetC.txHash).to.be.a("string").and.not.empty;
                expect(responseregisterIpAssetC.ipId).to.be.a("string").and.not.empty;
    
                ipIdC = responseregisterIpAssetC.ipId;
    
                const responseC = await expect(
                    registerDerivative("C", ipIdC, [ipIdB], [comRemixLicenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseC.txHash).to.be.a("string").and.not.empty;
            });

            step("Pay royalty on behalf", async function () {
                const response = await expect(
                    payRoyaltyOnBehalf("C", ipIdB, ipIdC, mintingFeeTokenAddress, payAmount, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Collect royalty tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("C", ipIdA, ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a('bigint').and.equal(BigInt(commercialRevShare1 * 1000000));
            });

            step("Collect royalty tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("C", ipIdB, ipIdC, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a('bigint').and.equal(BigInt(commercialRevShare1 * 1000000));
            });

            step("Capture snapshot", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint").and.to.be.ok;

                snapshotId1 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                expect(response).to.be.a("bigint").and.to.be.ok;
                expect(response).to.be.equal(BigInt(mintingFee1));
            });

            step("Claim royalty tokens", async function () {
                const response = await expect(               
                    royaltyClaimRevenue("A", [snapshotId1], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.claimableToken).to.be.a("bigint").and.to.be.equal(BigInt(mintingFee1));
            })

            step("Check claimable revenue again", async function () {
                const responseClaimableRevenue1 = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                expect(responseClaimableRevenue1).to.be.a("bigint").and.to.be.equal(0n);
            });
        });
    });
});
