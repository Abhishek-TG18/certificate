const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('../config/env');
// const User = require('../models/User');

// Login method
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        console.log("Fetched user:", user);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            config.jwt.secret,
            { expiresIn: config.jwt.expiration }
        );

        // Set the token as an HttpOnly cookie
        res.cookie('auth_token', token, {
            httpOnly: true, // Makes the cookie inaccessible to JavaScript
            secure: process.env.NODE_ENV === 'production', // Ensures cookie is sent over HTTPS in production
            maxAge: 24 * 1000, // Set the cookie expiration to match the JWT expiration
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Login failed',
            error: error.message
        });
    }
};




// Registration method
exports.register = async (req, res) => {
    try {
        const { email, password, name, phoneNumber, role } = req.body; // Added phone and role
        console.log(email, password, name, phoneNumber, role);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            email,
            phoneNumber, // Save phone number
            role,  // Save role
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Registration failed',
            error: error.message
        });
    }
};


// Forgot Password method
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        // Save reset token and expiry to user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Setup email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email service
            auth: {
                user: config.email.user,
                pass: config.email.pass
            }
        });

        // Compose email
        const mailOptions = {
            from: config.email.user,
            to: user.email,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   http://${req.headers.host}/reset-password/${resetToken}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Forgot password failed', 
            error: error.message 
        });
    }
};

// Reset Password method
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Password reset failed', 
            error: error.message 
        });
    }
};

// Change Password method
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // Assuming authenticateToken middleware adds user to req

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Password change failed', 
            error: error.message 
        });
    }
};

// Logout method (typically handled client-side by removing token)
exports.logout = (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
};

// Upload certificate method (to be implemented based on your schema)
exports.uploadCertificate = async (req, res) => {
    try {
        // Implement certificate upload logic here
        res.status(200).json({ message: 'Certificate uploaded successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Certificate upload failed', 
            error: error.message 
        });
    }
};

// Verify certificate method (to be implemented based on your schema)
exports.verifyCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;

        // Implement certificate verification logic here
        res.status(200).json({ 
            message: 'Certificate verification successful',
            certificateId
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Certificate verification failed', 
            error: error.message 
        });
    }
};
