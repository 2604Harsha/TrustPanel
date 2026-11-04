
async function apiRequest(path, options = {}) {
    const token = localStorage.getItem(APP_CONFIG.storage.token);

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(
            `${APP_CONFIG.API_BASE_URL}${path}`,
            {
                ...options,
                headers
            }
        );
    } catch (error) {
        throw new Error(
            "Cannot connect to backend. Please start the server."
        );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
        if (response.status === 401) {
            clearSession();
            window.location.replace("./index.html");
        }

        throw new Error(
            data.message || `Request failed: ${response.status}`
        );
    }

    return data;
}




function getCurrentUser() {
    try {
        return JSON.parse(
            localStorage.getItem(APP_CONFIG.storage.user) || "null"
        );
    } catch {
        return null;
    }
}

function setCurrentUser(user, token) {
    localStorage.setItem(
        APP_CONFIG.storage.user,
        JSON.stringify(user)
    );

    if (token) {
        localStorage.setItem(
            APP_CONFIG.storage.token,
            token
        );
    }

    if (user && (user.id || user._id)) {
        localStorage.setItem(
            APP_CONFIG.storage.session,
            String(user.id || user._id)
        );
    }
}

function clearSession() {
    const keys = [
        APP_CONFIG.storage.user,
        APP_CONFIG.storage.token,
        APP_CONFIG.storage.session
    ];

    keys.forEach(key => {
        if (key) {
            localStorage.removeItem(key);
        }
    });
}

function normalizeUser(user) {
    return {
        ...user,
        id: String(user.id || user._id),
        joined: user.joined || user.createdAt
    };
}

async function loadUsers() {
    const data = await apiRequest("/admin/users?limit=100");

    return (data.users || []).map(normalizeUser);
}

async function loadActivity() {
    const data = await apiRequest("/dashboard/activity");

    return (data.activities || []).map(activity => ({
        ...activity,
        id: String(activity._id || activity.id),
        time: activity.createdAt || activity.time
    }));
}

function showToast(message) {
    const toast = document.querySelector("#toast");

    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function formatTime(value) {
    if (!value) return "Unknown";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Unknown";

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}

function timeAgo(value) {
    if (!value) return "Unknown";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Unknown";

    const seconds = Math.max(
        0,
        Math.floor((Date.now() - date.getTime()) / 1000)
    );

    if (seconds < 60) return "Just now";

    if (seconds < 3600) {
        return `${Math.floor(seconds / 60)} min ago`;
    }

    if (seconds < 86400) {
        return `${Math.floor(seconds / 3600)} hr ago`;
    }

    return `${Math.floor(seconds / 86400)} day(s) ago`;
}

function getInitials(name) {
    return (name || "User")
        .split(" ")
        .filter(Boolean)
        .map(part => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function renderUserCell(user) {
    const initials = getInitials(user.name);

    return `
        <div class="table-user">
            <div class="avatar">
                ${escapeHTML(initials)}
            </div>

            <div>
                <strong>${escapeHTML(user.name)}</strong>
                <small>${escapeHTML(user.email)}</small>
            </div>
        </div>
    `;
}

function renderRoleBadge(role) {
    return `
        <span class="role-badge role-${escapeHTML(role)}">
            ${role === "admin" ? "Administrator" : "User"}
        </span>
    `;
}

function renderStatusBadge(status) {
    return `
        <span class="status-badge status-${escapeHTML(status)}">
            ${status === "active" ? "Active" : escapeHTML(status)}
        </span>
    `;
}

function protectPage() {
    const user = getCurrentUser();

    const token = localStorage.getItem(
        APP_CONFIG.storage.token
    );

    if (!user || !token) {
        clearSession();
        window.location.replace("./index.html");
        return null;
    }

    const adminPages = [
        "users.html",
        "activity.html",
        "security.html"
    ];

    const currentPage = location.pathname.split("/").pop();

    if (
        adminPages.includes(currentPage) &&
        user.role !== "admin"
    ) {
        window.location.replace("./user-dashboard.html");
        return null;
    }

    return user;
}

function setupDashboard(user) {
    if (!user) return;

    const sidebarName = document.getElementById("sidebarName");

    if (sidebarName) {
        sidebarName.textContent = user.name || "User";
    }

    const sidebarRole = document.getElementById("sidebarRole");

    if (sidebarRole) {
        sidebarRole.textContent =
            user.role === "admin"
                ? "Administrator"
                : "User";
    }

    const initials = getInitials(user.name);

    [
        "sidebarAvatar",
        "topAvatar",
        "topbarAvatar",
        "profileAvatar"
    ].forEach(id => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = initials;
        }
    });

    const topName = document.getElementById("topName");

    if (topName) {
        topName.textContent = user.name || "User";
    }

    const topbarName = document.getElementById("topbarName");

    if (topbarName) {
        topbarName.textContent = user.name || "User";
    }

    document.querySelectorAll(".admin-only").forEach(element => {
        element.classList.toggle(
            "hidden",
            user.role !== "admin"
        );
    });

    document.body.classList.toggle(
        "dark-mode",
        localStorage.getItem(APP_CONFIG.storage.theme) === "true"
    );
}

function logoutUser() {
    if (window.isLoggingOut) return;

    window.isLoggingOut = true;

    const token = localStorage.getItem(
        APP_CONFIG.storage.token
    );

    clearSession();

    if (token && APP_CONFIG.API_BASE_URL) {
        fetch(`${APP_CONFIG.API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            keepalive: true
        }).catch(error => {
            console.warn("Backend logout notification failed:", error);
        });
    }

    
    window.location.replace("./index.html");
}

document.addEventListener("click", function (event) {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const logoutButton = target.closest("#logoutButton");

    if (!logoutButton) return;

    event.preventDefault();
    event.stopPropagation();

    logoutUser();
});

function setupDashboardEvents() {

    const themeToggle = document.getElementById("themeToggle");

    if (
        themeToggle &&
        themeToggle.dataset.themeAttached !== "true"
    ) {
        themeToggle.dataset.themeAttached = "true";

        themeToggle.addEventListener("click", toggleTheme);
    }

    const menuToggle =
        document.getElementById("menuToggle") ||
        document.getElementById("menuButton");

    if (
        menuToggle &&
        menuToggle.dataset.menuAttached !== "true"
    ) {
        menuToggle.dataset.menuAttached = "true";

        menuToggle.addEventListener("click", () => {
            document.getElementById("sidebar")
                ?.classList.toggle("open");
        });
    }
}

function toggleTheme() {
    const next =
        localStorage.getItem(APP_CONFIG.storage.theme) !== "true";

    localStorage.setItem(
        APP_CONFIG.storage.theme,
        String(next)
    );

    document.body.classList.toggle("dark-mode", next);
}
