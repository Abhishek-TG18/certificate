// Backend/config/env.js
const dotenv = require('dotenv');
dotenv.config();

const config = {
    database: {
        uri: process.env.MONGODB_URI,
        name: process.env.MONGODB_DATABASE
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiration: process.env.JWT_EXPIRATION
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    blockchain: {
        networkUrl: process.env.BLOCKCHAIN_NETWORK_URL,
        privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY
    },
    ipfs: {
        projectId: process.env.IPFS_PROJECT_ID,
        projectSecret: process.env.IPFS_PROJECT_SECRET
    },
    security: {
        verificationCodeExpiry: parseInt(process.env.VERIFICATION_CODE_EXPIRY, 10),
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10)
    }
};

// Validate critical configurations
const validateConfig = () => {
    const errors = [];

    if (!config.database.uri) errors.push('MONGODB_URI is not defined');
    if (!config.jwt.secret) errors.push('JWT_SECRET is not defined');
    
    if (errors.length > 0) {
        console.error('Configuration Errors:', errors);
        process.exit(1);
    }
};

validateConfig();

module.exports = config;