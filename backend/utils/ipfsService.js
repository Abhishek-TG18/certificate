const fs = require('fs');

class IPFSService {
  constructor() {
    // Dynamically import the 'ipfs-http-client' to handle the ESM module correctly
    (async () => {
      try {
        const { create } = await import('ipfs-http-client');
        // Initialize IPFS client
        this.client = create({
          url: 'https://ipfs.infura.io:5001/api/v0',  // Correct URL to connect to Infura's IPFS service
          headers: {
            authorization: `Basic ${Buffer.from(
              `${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`
            ).toString('base64')}`
          }
        });
      } catch (error) {
        console.error('Error while initializing IPFS client:', error);
      }
    })();
  }

  async uploadFile(file) {
    try {
      // If file is a buffer or path
      const fileBuffer = file.buffer || 
        (typeof file === 'string' ? fs.readFileSync(file) : file);

      // Add file to IPFS
      const result = await this.client.add(fileBuffer, {
        pin: true, // Pin the file to ensure persistence
        wrapWithDirectory: false
      });

      return {
        hash: result.path,
        size: result.size
      };
    } catch (error) {
      console.error('IPFS Upload Error:', error);
      throw new Error('File upload to IPFS failed');
    }
  }

  async downloadFile(ipfsHash) {
    try {
      // Retrieve file from IPFS
      const chunks = [];
      for await (const chunk of this.client.cat(ipfsHash)) {
        chunks.push(chunk);
      }

      // Convert chunks to buffer
      const fileBuffer = Buffer.concat(chunks);
      
      return fileBuffer;
    } catch (error) {
      console.error('IPFS Download Error:', error);
      throw new Error('File download from IPFS failed');
    }
  }

  async getFileMetadata(ipfsHash) {
    try {
      // Get file stats
      const stats = await this.client.files.stat(`/ipfs/${ipfsHash}`);
      
      return {
        hash: ipfsHash,
        size: stats.size,
        type: stats.type,
        cumulativeSize: stats.cumulativeSize
      };
    } catch (error) {
      console.error('IPFS Metadata Error:', error);
      throw new Error('Unable to retrieve file metadata');
    }
  }
}

module.exports = new IPFSService();
