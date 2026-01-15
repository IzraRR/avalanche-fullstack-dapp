// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Kontrak untuk menyimpan dan mengambil nilai dengan ownership dan event notification
contract SimpleStorage {
    // Variabel untuk menyimpan owner address
    address public owner;
    
    // Variabel private untuk menyimpan nilai, hanya bisa diakses oleh kontrak ini
    uint256 private storedValue;
    
    // Variabel untuk menyimpan message (optional state)
    string public message;

    // Event yang dipancarkan ketika owner diset (biasanya saat deploy)
    event OwnerSet(address indexed newOwner);
    
    // Event yang dipancarkan ketika nilai disimpan (untuk logging dan monitoring)
    event ValueUpdated(uint256 newValue);
    
    // Event yang dipancarkan ketika message diupdate
    event MessageUpdated(string newMessage);

    // Constructor dijalankan saat contract di-deploy
    constructor() {
        // Set owner ke address yang melakukan deployment
        owner = msg.sender;
        // Emit event OwnerSet
        emit OwnerSet(msg.sender);
    }

    // Modifier untuk memastikan hanya owner yang bisa memanggil fungsi tertentu
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Fungsi untuk menyimpan nilai baru (hanya owner)
    function setValue(uint256 _value) public onlyOwner {
        // Simpan nilai baru ke dalam storedValue
        storedValue = _value;
        // Pancarkan event untuk memberitahu bahwa nilai telah diperbarui
        emit ValueUpdated(_value);
    }

    // Fungsi untuk mengambil nilai yang tersimpan (bisa dipanggil siapa saja)
    function getValue() public view returns (uint256) {
        // Kembalikan nilai yang tersimpan (tidak mengubah state)
        return storedValue;
    }
    
    // Fungsi untuk update message (hanya owner)
    function setMessage(string memory _message) public onlyOwner {
        // Simpan message baru
        message = _message;
        // Emit event MessageUpdated
        emit MessageUpdated(_message);
    }
}