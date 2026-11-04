document.addEventListener("DOMContentLoaded", async () => {

    const user = protectPage();

    if (!user) return;

    if (user.role !== "admin") {
        location.href = "user-dashboard.html";
        return;
    }

    setupDashboard(user);
    setupDashboardEvents();

    try {

        const [statsData, users, activities] = await Promise.all([
            apiRequest("/admin/stats"),
            loadUsers(),
            loadActivity()
        ]);

        const stats = statsData.stats || {};

        const values = {
            totalUsers: stats.totalUsers,
            activeUsers: stats.activeUsers,
            adminUsers: stats.adminUsers,
            suspendedUsers: stats.suspendedUsers
        };

        Object.entries(values).forEach(([id, value]) => {

            const element = document.getElementById(id);

            if (element) {
                element.textContent = value ?? 0;
            }
        });


        const welcome = document.getElementById("welcomeName");

        if (welcome) {
            welcome.textContent = user.name.split(" ")[0];
        }


        const activityContainer =
            document.querySelector("#recentActivity");

        if (activityContainer) {

            activityContainer.innerHTML = activities
                .slice(0, 5)
                .map(activity => `
                    <div class="activity-item">

                        <div class="activity-icon">✓</div>

                        <div class="activity-description">

                            <strong>
                                ${escapeHTML(activity.title)}
                            </strong>

                            <p>
                                ${escapeHTML(activity.description)}
                            </p>

                        </div>

                        <span class="activity-time">
                            ${timeAgo(activity.time)}
                        </span>

                    </div>
                `)
                .join("") ||
                '<div class="empty-state">No activity yet.</div>';
        }


        const usersTable =
            document.querySelector("#recentUsersTable");

        if (usersTable) {

            usersTable.innerHTML = users
                .slice(0, 5)
                .map(user => `
                    <tr>

                        <td>${renderUserCell(user)}</td>

                        <td>${renderRoleBadge(user.role)}</td>

                        <td>${renderStatusBadge(user.status)}</td>

                        <td>${formatDate(user.joined)}</td>

                    </tr>
                `)
                .join("");
        }

    } catch (error) {

        showToast(error.message);
    }
});