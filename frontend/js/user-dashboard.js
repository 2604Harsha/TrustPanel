
document.addEventListener("DOMContentLoaded", () => {

    const user = protectPage();

    if (!user) return;

    
    setupDashboard(user);

    setupDashboardEvents();

    
    initializeDashboard(user);
});


function initializeDashboard(user) {

    const fullName = user.name || "User";
    const firstName = fullName.split(" ")[0];

    
    setText("welcomeName", firstName);
    setText("topbarName", fullName);
    setText("accountName", fullName);
    setText("detailName", fullName);


    setText("accountEmail", user.email || "");
    setText("detailEmail", user.email || "");

    
    setText("detailRole", user.role || "User");

    
    const initials = getInitials(fullName);

    setText("topbarAvatar", initials);
    setText("profileAvatar", initials);

    
    const today = new Date();

    setText(
        "currentDate",
        today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        })
    );


    setText("accountStatus", user.status || "Active");

    setText(
        "detailJoined",
        user.createdAt
            ? formatDate(user.createdAt)
            : formatDate(new Date())
    );

    const completion = calculateProfileCompletion(user);

    setText("profileCompletion", completion + "%");

    const progress = document.getElementById("profileProgress");

    if (progress) {
        progress.style.width = completion + "%";
    }

   
    setText(
        "lastLogin",
        user.lastLogin
            ? formatTime(user.lastLogin)
            : "Today"
    );

  
    renderActivities(user);

    
    setupNavigation();

    
    setupQuickActions();

    
    document.getElementById("notificationButton")
        ?.addEventListener("click", () => {
            showToast("You are all caught up!");
        });

    
    document.getElementById("helpButton")
        ?.addEventListener("click", () => {
            showToast("Help center is coming soon.");
        });
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function calculateProfileCompletion(user) {

    const fields = [
        user.name,
        user.email,
        user.phone,
        user.location,
        user.bio
    ];

    const completedFields = fields.filter(field =>
        field && String(field).trim().length > 0
    ).length;

    return Math.round(
        (completedFields / fields.length) * 100
    );
}

function renderActivities(user) {

    const activityList = document.getElementById("activityList");

    if (!activityList) return;

    const activities =
        typeof getUserActivities === "function"
            ? getUserActivities(user.id) || []
            : [];

    if (activities.length === 0) {

        activityList.innerHTML = `
            <div class="activity-item">

                <div class="activity-icon purple">◷</div>

                <div class="activity-info">
                    <h3>Welcome to Northstar</h3>
                    <p>Your account dashboard is ready to use.</p>
                </div>

                <span class="activity-time">Now</span>

            </div>
        `;

        return;
    }

    activityList.innerHTML = activities
        .slice(0, 4)
        .map(activity => `
            <div class="activity-item">

                <div class="activity-icon ${escapeHTML(activity.color || "purple")}">
                    ${escapeHTML(activity.icon || "◷")}
                </div>

                <div class="activity-info">
                    <h3>${escapeHTML(activity.title)}</h3>
                    <p>${escapeHTML(activity.description)}</p>
                </div>

                <span class="activity-time">
                    ${formatTime(activity.date)}
                </span>

            </div>
        `)
        .join("");
}

function setupNavigation() {
}

function setupQuickActions() {

    const profileButton = document.getElementById("profileButton");

    if (profileButton) {
        profileButton.addEventListener("click", () => {
            window.location.href = "./profile.html";
        });
    }

    const settingsButton = document.getElementById("settingsButton");

    if (settingsButton) {
        settingsButton.addEventListener("click", () => {
            window.location.href = "./settings.html";
        });
    }

    const userMenuButton = document.getElementById("userMenuButton");

    if (userMenuButton) {
        userMenuButton.addEventListener("click", () => {
            window.location.href = "./profile.html";
        });
    }
}
