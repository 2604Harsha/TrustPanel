const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Activity = require("../models/Activity");
const PasswordReset = require("../models/PasswordReset");

const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/emailService");

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "user",
            status: "active"
        });

        await Activity.create({
            userId: user._id,
            title: "Account created",
            description: "Your Northstar account was created",
            icon: "✓",
            color: "green"
        });

        const token = generateToken(user._id);

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        next(error);
    }
};



exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Your account is not active"
            });
        }

        user.lastLogin = new Date();

        await user.save();

        await Activity.create({
            userId: user._id,
            title: "Login successful",
            description: "You signed in to your account",
            icon: "↪",
            color: "blue",
            ipAddress: req.ip
        });

        const token = generateToken(user._id);

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        next(error);
    }
};



exports.logout = async (req, res) => {
    return res.json({
        success: true,
        message: "Logout successful. Clear the token on the frontend."
    });
};


exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.json({
                success: true,
                message: "If this email exists, reset instructions will be sent."
            });
        }

        await PasswordReset.deleteMany({
            userId: user._id,
            used: false
        });

        const resetToken = crypto.randomBytes(32).toString("hex");

        const tokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        await PasswordReset.create({
            userId: user._id,
            tokenHash,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        });

        const resetUrl =
            `${process.env.CLIENT_URL}/reset-password.html?token=${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: "Reset your Northstar password",
            html: `
                <h2>Password reset</h2>
                <p>You requested a password reset.</p>
                <p>
                    <a href="${resetUrl}">
                        Reset your password
                    </a>
                </p>
                <p>This link expires in 15 minutes.</p>
                <p>If you did not request this, ignore this email.</p>
            `
        });

        return res.json({
            success: true,
            message: "If this email exists, reset instructions will be sent."
        });

    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Token and new password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const resetRecord = await PasswordReset.findOne({
            tokenHash,
            used: false,
            expiresAt: { $gt: new Date() }
        });

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                message: "Reset token is invalid or expired"
            });
        }

        const user = await User.findById(resetRecord.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.password = await bcrypt.hash(password, 12);
        user.passwordChangedAt = new Date();

        await user.save();

        resetRecord.used = true;
        await resetRecord.save();

        await PasswordReset.deleteMany({
            userId: user._id
        });

        await Activity.create({
            userId: user._id,
            title: "Password reset",
            description: "Your password was reset successfully",
            icon: "♢",
            color: "orange"
        });

        return res.json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        next(error);
    }
};