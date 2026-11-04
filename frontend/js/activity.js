document.addEventListener("DOMContentLoaded", async () => {

    const user = protectPage();

    if (!user) return;

    setupDashboard(user);
    setupDashboardEvents();

    const container = document.querySelector("#activityList");

    if (!container) return;

    try {

        const activities = await loadActivity();

        container.innerHTML = activities.map(activity => `

            <div class="activity-item">

                <div class="activity-icon">
                    ✓
                </div>

                <div class="activity-description">

                    <strong>
                        ${escapeHTML(activity.title)}
                    </strong>

                    <p>
                        ${escapeHTML(activity.description)}
                    </p>

                </div>

                <span class="activity-time">
                    ${new Date(activity.time).toLocaleString()}
                </span>

            </div>

        `).join("") ||
        '<div class="empty-state">No activity has been recorded.</div>';

    } catch (error) {

        showToast(error.message);
    }
});