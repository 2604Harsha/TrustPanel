const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Activity = require("../models/Activity");


exports.getProfile = async (req, res) => {
    const user = req.user;

    res.json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            bio: user.bio,
            role: user.role,
            status: user.status,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }
    });
};


// UPDATE PROFILE
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, location, bio } = req.body;

        const user = await User.findById(req.user._id);

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty"
                });
            }

            user.name = name.trim();
        }

        if (phone !== undefined) user.phone = phone.trim();
        if (location !== undefined) user.location = location.trim();
        if (bio !== undefined) user.bio = bio.trim();

        await user.save();

        await Activity.create({
            userId: user._id,
            title: "Profile updated",
            description: "Your profile information was updated",
            icon: "♙",
            color: "purple"
        });

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                bio: user.bio,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        next(error);
    }
};


exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current and new passwords are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters"
            });
        }

        const user = await User.findById(req.user._id)
            .select("+password");

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        user.passwordChangedAt = new Date();

        await user.save();

        await Activity.create({
            userId: user._id,
            title: "Password changed",
            description: "Your password was changed",
            icon: "♢",
            color: "orange"
        });

        res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        next(error);
    }
};