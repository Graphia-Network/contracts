import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

import { Assets } from '../typechain-types';

describe('Assets', function () {
  let signers: SignerWithAddress[];
  let assets: Assets;

  const dummyProof = ethers.keccak256(ethers.toUtf8Bytes('dummy proof'));

  beforeEach(async function () {
    signers = await ethers.getSigners();

    const Assets = await ethers.getContractFactory('Assets');
    assets = await Assets.deploy('dummy url', signers[0].address);

    expect(await assets.getAddress()).to.be.properAddress;
  });

  describe('initial conditions', async function () {
    it('should have the correct initial owner', async function () {
      expect(await assets.hasRole(ethers.ZeroHash, signers[0].address)).to.be.true;
    });

    it('should have the correct initial URL', async function () {
      expect(await assets.uri(1)).to.equal('dummy url');
    });
  });

  describe('supportsInterface override', async function () {
    const ERC1155_INTERFACE_ID = '0xd9b67a26';

    it('should return true for ERC1155 interface', async function () {
      expect(await assets.supportsInterface(ERC1155_INTERFACE_ID)).to.be.true;
    });
  });

  describe('permissions', async function () {
    it('should have the correct initial permissions', async function () {
      expect(await assets.hasRole(ethers.ZeroHash, signers[0].address)).to.be.true;
      expect(await assets.hasRole(ethers.ZeroHash, signers[1].address)).to.be.false;
    });

    it('should allow the owner to grant roles', async function () {
      expect(await assets.hasRole(ethers.ZeroHash, signers[1].address)).to.be.false;
      await assets.grantRole(ethers.ZeroHash, signers[1].address);
      expect(await assets.hasRole(ethers.ZeroHash, signers[1].address)).to.be.true;
    });

    it('should allow the owner to revoke roles', async function () {
      await assets.grantRole(ethers.ZeroHash, signers[1].address);
      await assets.revokeRole(ethers.ZeroHash, signers[1].address);
      expect(await assets.hasRole(ethers.ZeroHash, signers[1].address)).to.be.false;
    });

    it('should not allow non-owners to grant roles or revoke them', async function () {
      assets = assets.connect(signers[1]);

      await expect(assets.grantRole(ethers.ZeroHash, signers[1].address)).to.be.revertedWithCustomError(assets, 'AccessControlUnauthorizedAccount');
      await expect(assets.revokeRole(ethers.ZeroHash, signers[0].address)).to.be.revertedWithCustomError(assets, 'AccessControlUnauthorizedAccount');
    });
  });

  describe('asset creation', async function () {
    it('should allow the owner to create assets', async function () {
      await assets.newAsset('new dummy uri', signers[1].address, 20);
      expect(await assets.balanceOf(signers[1].address, 0)).to.equal(20);
    });

    it('should not allow non-owners to create assets', async function () {
      assets = assets.connect(signers[1]);

      await expect(assets.newAsset('new dummy uri', signers[1].address, 20)).to.be.revertedWithCustomError(assets, 'AccessControlUnauthorizedAccount');
    });

    it('should fire an event when minting assets', async function () {
      await expect(assets.newAsset('new dummy uri', signers[1].address, 20)).to.emit(assets, 'Created').withArgs(0, signers[1].address, 20);
    });
  });

  describe('burning', async function () {
    it('should allow admin to burn assets from single address with proof', async function () {
      await assets.newAsset('new dummy uri', signers[1].address, 20);
      expect(await assets.balanceOf(signers[1].address, 0)).to.equal(20);

      await assets.burnWithProof(0, [signers[1].address], [10], dummyProof);
      expect(await assets.balanceOf(signers[1].address, 0)).to.equal(10);
    });

    it('should allow admin to burn assets from multiple addresses with proof', async function () {
      await assets.newAsset('new dummy uri', signers[1].address, 20);

      assets = assets.connect(signers[1]);

      await assets.safeTransferFrom(signers[1].address, signers[2].address, 0, 10, ethers.ZeroHash);

      expect(await assets.balanceOf(signers[1].address, 0)).to.equal(10);
      expect(await assets.balanceOf(signers[2].address, 0)).to.equal(10);

      assets = assets.connect(signers[0]);

      await assets.burnWithProof(0, [signers[1].address, signers[2].address], [3, 2], dummyProof);

      expect(await assets.balanceOf(signers[1].address, 0)).to.equal(7);
      expect(await assets.balanceOf(signers[2].address, 0)).to.equal(8);
    });

    it('should prohibit burning assets with proof to non-admin', async function () {
      await assets.newAsset('new dummy uri', signers[1].address, 20);
      expect(await assets.balanceOf(signers[1].address, 0)).to.equal(20);

      assets = assets.connect(signers[1]);

      await expect(assets.burnWithProof(0, [signers[1].address], [10], dummyProof)).to.be.revertedWithCustomError(assets, 'AccessControlUnauthorizedAccount');

      expect(await assets.balanceOf(signers[1].address, 0)).to.equal(20);
    });

    it('should fire an event when burning assets with proof', async function () {
      await assets.newAsset('new dummy uri', signers[1].address, 20);

      await expect(assets.burnWithProof(0, [signers[1].address], [10], dummyProof)).to.emit(assets, 'Burned').withArgs(0, signers[1].address, 10, dummyProof);
    });

    it('should allow user to burn their own assets', async function () {
      await assets.newAsset('new dummy uri', signers[1].address, 20);
      expect(await assets.balanceOf(signers[1].address, 0)).to.equal(20);

      assets = assets.connect(signers[1]);

      await assets.burn(0, 10);

      expect(await assets.balanceOf(signers[1].address, 0)).to.equal(10);
    });

    it('should fire an event when burning assets', async function () {
      await assets.newAsset('new dummy uri', signers[1].address, 20);

      assets = assets.connect(signers[1]);

      await expect(assets.burn(0, 10)).to.emit(assets, 'Burned').withArgs(0, signers[1].address, 10, "0x");
    });
  });

  describe('freezing', async function () {
    it('should allow admin to freeze account', async function () {
      expect(await assets.isFrozen(signers[1].address)).to.be.false;

      await assets.setAccountFreezeStatus(signers[1].address, true);

      expect(await assets.isFrozen(signers[1].address)).to.be.true;
    });

    it('should allow admin to unfreeze account', async function () {
      await assets.setAccountFreezeStatus(signers[1].address, true);

      expect(await assets.isFrozen(signers[1].address)).to.be.true;

      await assets.setAccountFreezeStatus(signers[1].address, false);

      expect(await assets.isFrozen(signers[1].address)).to.be.false;
    });

    it('should prohibit freezing account to non-admin', async function () {
      await expect(assets.connect(signers[1]).setAccountFreezeStatus(signers[1].address, true)).to.be.revertedWithCustomError(assets, 'AccessControlUnauthorizedAccount');
    });

    it('should fire an event when freezing account', async function () {
      await expect(assets.setAccountFreezeStatus(signers[1].address, true)).to.emit(assets, 'AccountFreezeStatusChanged').withArgs(signers[1].address, true);
      await expect(assets.setAccountFreezeStatus(signers[1].address, false)).to.emit(assets, 'AccountFreezeStatusChanged').withArgs(signers[1].address, false);
    });

    it('should prohibit frozen account from sending or receiving assets', async function () {
      await assets.newAsset('new dummy uri', signers[1].address, 20);

      await assets.setAccountFreezeStatus(signers[1].address, true);

      assets = assets.connect(signers[1]);

      await expect(assets.safeTransferFrom(signers[1].address, signers[2].address, 0, 10, ethers.ZeroHash)).to.be.revertedWithCustomError(assets, 'SenderIsFrozen');
      await expect(assets.safeBatchTransferFrom(signers[1].address, signers[2].address, [0], [10], ethers.ZeroHash)).to.be.revertedWithCustomError(assets, 'SenderIsFrozen');

      expect(await assets.balanceOf(signers[1].address, 0)).to.equal(20);

      assets = assets.connect(signers[0]);

      await assets.setAccountFreezeStatus(signers[1].address, false);
      await assets.setAccountFreezeStatus(signers[2].address, true);

      assets = assets.connect(signers[1]);

      await expect(assets.safeTransferFrom(signers[1].address, signers[2].address, 0, 10, ethers.ZeroHash)).to.be.revertedWithCustomError(assets, 'RecipientIsFrozen');
      await expect(assets.safeBatchTransferFrom(signers[1].address, signers[2].address, [0], [10], ethers.ZeroHash)).to.be.revertedWithCustomError(assets, 'RecipientIsFrozen');
    });
  });

  describe('transfer overrides', async function () {
    it('should transfer single asset', async function () {
      await assets.newAsset('new dummy uri', signers[1].address, 20);

      assets = assets.connect(signers[1]);

      await assets.safeTransferFrom(signers[1].address, signers[2].address, 0, 10, ethers.ZeroHash);

      expect(await assets.balanceOf(signers[1].address, 0)).to.equal(10);
      expect(await assets.balanceOf(signers[2].address, 0)).to.equal(10);
    });

    it('should transfer multiple assets', async function () {
      await assets.newAsset('new dummy uri', signers[1].address, 20);
      await assets.newAsset('new dummy uri', signers[1].address, 20);

      assets = assets.connect(signers[1]);

      await assets.safeBatchTransferFrom(signers[1].address, signers[2].address, [0, 1], [10, 5], ethers.ZeroHash);

      expect(await assets.balanceOf(signers[1].address, 0)).to.equal(10);
      expect(await assets.balanceOf(signers[1].address, 1)).to.equal(15);
      expect(await assets.balanceOf(signers[2].address, 0)).to.equal(10);
      expect(await assets.balanceOf(signers[2].address, 1)).to.equal(5);
    });
  });
});
