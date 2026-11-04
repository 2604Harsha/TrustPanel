document.addEventListener("DOMContentLoaded", async () => {

    const user = protectPage();

    if (!user) return;

    if (user.role !== "admin") {
        location.href = "user-dashboard.html";
        return;
    }

    setupDashboard(user);
    setupDashboardEvents();

    const container = document.querySelector(".settings-grid");

    try {

        const data = await apiRequest("/admin/stats");

        const stats = data.stats;

        const box = document.createElement("div");

        box.className = "panel";

        box.innerHTML = `

            <h3>Workspace Security Overview</h3>

            <p>
                Active accounts: ${stats.activeUsers}
            </p>

            <p>
                Suspended accounts: ${stats.suspendedUsers}
            </p>

            <p>
                Administrator accounts: ${stats.adminUsers}
            </p>

            <p>
                Your account role: ${escapeHTML(user.role)}
            </p>

        `;

        container?.after(box);

    } catch (error) {

        showToast(error.message);
    }
});