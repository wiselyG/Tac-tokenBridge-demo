// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { TacProxyV1 } from "@tonappchain/evm-ccl/contracts/proxies/TacProxyV1.sol";
import { TokenAmount, NFTAmount, OutMessageV1, TacHeaderV1 } from "@tonappchain/evm-ccl/contracts/core/Structs.sol";

interface ISimpleMessage {
    function setMessage(string memory _message) external;
    function getMessage() external view returns (string memory, address);
}

contract SimpleMessageProxy is TacProxyV1 {
    ISimpleMessage public simpleMessage;
    
    event CrossChainMessageReceived(
        string message,
        string originalCaller,
        uint256 timestamp
    );

    constructor(
        address _simpleMessageContract,
        address _crossChainLayer
    ) TacProxyV1(_crossChainLayer) {
        simpleMessage = ISimpleMessage(_simpleMessageContract);
    }

    /**
     * @dev Receives cross-chain messages from TON and forwards them to SimpleMessage
     * This function signature is required: (bytes calldata, bytes calldata)
     */
    function forwardMessage(
        bytes calldata tacHeader, 
        bytes calldata arguments
    ) external _onlyCrossChainLayer {
        // Decode the TAC header to get TON user info
        TacHeaderV1 memory header = _decodeTacHeader(tacHeader);
        
        // Decode the message from TON user
        string memory message = abi.decode(arguments, (string));
        
        // Call the target contract
        simpleMessage.setMessage(message);
        
        // Emit event for tracking
        emit CrossChainMessageReceived(
            message,
            header.tvmCaller,
            header.timestamp
        );
        
        // Optional: Send confirmation back to TON
        // (uncomment if you want to send a response back)
        /*
        OutMessageV1 memory response = OutMessageV1({
            shardsKey: header.shardsKey,
            tvmTarget: header.tvmCaller,
            tvmPayload: "",
            tvmProtocolFee: 0,  // Round trip - fees already paid
            tvmExecutorFee: 0,  // Round trip - fees already paid
            tvmValidExecutors: new string[](0), // Round trip - executors already set
            toBridge: new TokenAmount[](0),
            toBridgeNFT: new NFTAmount[](0)
        });
        
        _sendMessageV1(response, 0);
        */
    }

    /**
     * @dev Get the current message from the target contract
     */
    function getCurrentMessage() external view returns (string memory, address) {
        return simpleMessage.getMessage();
    }
}