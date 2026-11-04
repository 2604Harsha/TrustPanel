const Activity = require("../models/Activity");

exports.getDashboard = async (req, res, next) => {
    try {
        const user = req.user;

        const activities = await Activity.find({
            userId: user._id
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const profileFields = [
            user.name,
            user.email,
            user.phone,
            user.location,
            user.bio
        ];

        const completedFields = profileFields.filter(field => {
            return field && String(field).trim().length > 0;
        }).length;

        const profileCompletion = Math.round(
            (completedFields / profileFields.length) * 100
        );

        const securityScore = user.isEmailVerified ? 85 : 65;

        res.json({
            success: true,

            dashboard: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                    isEmailVerified: user.isEmailVerified
                },

                stats: {
                    accountStatus: user.status,
                    lastLogin: user.lastLogin,
                    profileCompletion,
                    securityScore
                },

                recentActivity: activities.map(activity => ({
                    id: activity._id,
                    title: activity.title,
                    description: activity.description,
                    icon: activity.icon,
                    color: activity.color,
                    date: activity.createdAt
                }))
            }
        });

    } catch (error) {
        next(error);
    }
};

exports.getActivity = async (req, res, next) => {
    try {
        const activities = await Activity.find({
            userId: req.user._id
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        res.json({
            success: true,
            activities
        });

    } catch (error) {
        next(error);
    }
};