// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateNFT is ERC721, Ownable {
    uint256 public nextCertificateId;
    mapping(uint256 => string) private _certificateData;

    event CertificateIssued(uint256 indexed certificateId, address indexed recipient, string data);

    constructor() ERC721("CertificateNFT", "CERT") {}

    function issueCertificate(address recipient, string memory data) public onlyOwner {
        uint256 certificateId = nextCertificateId;
        _safeMint(recipient, certificateId);
        _certificateData[certificateId] = data;
        emit CertificateIssued(certificateId, recipient, data);
        nextCertificateId++;
    }

    function getCertificateData(uint256 certificateId) public view returns (string memory) {
        require(_exists(certificateId), "Certificate does not exist");
        return _certificateData[certificateId];
    }
}