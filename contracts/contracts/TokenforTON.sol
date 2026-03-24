// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenforTON is ERC20 {
    // 构造函数：初始化代币名称、符号和总供应量
    constructor(string memory _name,string memory _symbol,uint256 initialSupply) ERC20(_name, _symbol) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    // 允许代币持有者销毁代币
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    // 仅合约所有者可以铸造新代币
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // 获取当前小数位数（固定为 8）
    function decimals() public view virtual override returns (uint8) {
        return 8;
    }
}

