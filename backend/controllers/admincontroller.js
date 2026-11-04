const User = require("../models/User");
const Activity = require("../models/Activity");


exports.getUsers = async (req, res, next) => {
    try {
        const {
            search = "",
            status,
            role,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        if (status) filter.status = status;
        if (role) filter.role = role;

        const pageNumber = Math.max(1, Number(page));
        const limitNumber = Math.min(100, Math.max(1, Number(limit)));

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .lean();

        const totalUsers = await User.countDocuments(filter);

        res.json({
            success: true,
            users,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: totalUsers,
                pages: Math.ceil(totalUsers / limitNumber)
            }
        });

    } catch (error) {
        next(error);
    }
};



exports.getAdminStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            activeUsers,
            suspendedUsers,
            adminUsers
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: "active" }),
            User.countDocuments({ status: "suspended" }),
            User.countDocuments({ role: "admin" })
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                suspendedUsers,
                adminUsers
            }
        });

    } catch (error) {
        next(error);
    }
};


exports.updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!["active", "suspended", "pending"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        if (String(req.params.id) === String(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: "You cannot change your own status"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.status = status;
        await user.save();

        res.json({
            success: true,
            message: "User status updated",
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


exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        if (String(req.params.id) === String(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: "You cannot change your own role"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.role = role;
        await user.save();

        res.json({
            success: true,
            message: "User role updated",
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



exports.deleteUser = async (req, res, next) => {
    try {
        if (String(req.params.id) === String(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(user._id);

        await Activity.deleteMany({
            userId: user._id
        });

        res.json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};