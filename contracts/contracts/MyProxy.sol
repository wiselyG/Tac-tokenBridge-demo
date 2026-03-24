// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { OutMessageV1, TacHeaderV1, TokenAmount, NFTAmount } from "@tonappchain/evm-ccl/contracts/core/Structs.sol";
import { TacProxyV1 } from "@tonappchain/evm-ccl/contracts/proxies/TacProxyV1.sol";

interface ISimpleToken{
  function transfer(address to,uint256 value) external returns (bool);
  function mint(address to,uint256 value) external;
  function balanceOf(address from) external view returns (uint256);
  function name() external view returns (string memory);
  function totalSupply() external view returns (uint256);
  function decimals() external view returns (uint8);
  function approve(address spender,uint256 value) external returns (bool);
}

struct TransferParams {
  address to;
  uint256 amount;
}

contract MyProxy is TacProxyV1 {
    ISimpleToken public simpleToken;
    event Transfer(address indexed from,address indexed to,uint256 value);
    event Mint(address indexed to,uint256 value);
    address public my_token;

    constructor(address _simpleTokenContract,address _crossChainLayer) TacProxyV1(_crossChainLayer) {
       simpleToken=ISimpleToken(_simpleTokenContract);
       my_token = _simpleTokenContract;
    }

    function transferTo(bytes calldata tacHeader,bytes calldata args) external _onlyCrossChainLayer{
       TacHeaderV1 memory header = _decodeTacHeader(tacHeader);
       TransferParams memory params =abi.decode(args,(TransferParams));

       TokenAmount[] memory outTokens = new TokenAmount[](1);

       outTokens[0]=TokenAmount(
        my_token,
        params.amount * 10**simpleToken.decimals()
       );

       for(uint i=0;i<outTokens.length;i++){
         simpleToken.approve(_getCrossChainLayerAddress(),outTokens[i].amount);
       }

       _sendMessageV1(
        OutMessageV1({
          shardsKey: header.shardsKey,
          tvmTarget: header.tvmCaller,
          tvmPayload: "",
          tvmProtocolFee: 0,
          tvmExecutorFee: 0,
          tvmValidExecutors: new string[](0),
          toBridge: outTokens,
          toBridgeNFT: new NFTAmount[](0)
        }),
        0
       );
    }

    function mintTo(bytes calldata tacHeader,bytes calldata args) external _onlyCrossChainLayer{
    TacHeaderV1 memory header = _decodeTacHeader(tacHeader);

    TransferParams memory params =abi.decode(args,(TransferParams));

    simpleToken.mint(address(this),params.amount);
    
    emit Mint(address(this),params.amount);
  }


}
