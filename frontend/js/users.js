let allUsers = [];

document.addEventListener("DOMContentLoaded", async () => {

    const user = protectPage();

    if (!user) return;

    if (user.role !== "admin") {
        location.href = "user-dashboard.html";
        return;
    }

    setupDashboard(user);
    setupDashboardEvents();


    ["userSearch", "roleFilter", "statusFilter"]
        .forEach(id => {

            const element = document.getElementById(id);

            element?.addEventListener("input", renderUsers);
            element?.addEventListener("change", renderUsers);
        });


    document.querySelector("#addUserButton")
        ?.addEventListener("click", () => {
            showToast(
                "New users can register from the Create Account page."
            );
        });


    try {

        allUsers = await loadUsers();

        renderUsers();

    } catch (error) {

        showToast(error.message);
    }
});

function renderUsers() {

    const search = (
        document.querySelector("#userSearch")?.value || ""
    ).trim().toLowerCase();

    const role =
        document.querySelector("#roleFilter")?.value || "all";

    const status =
        document.querySelector("#statusFilter")?.value || "all";


    const users = allUsers.filter(user => {

        const name = (user.name || "").toLowerCase();
        const email = (user.email || "").toLowerCase();

        return (
            (name.includes(search) || email.includes(search)) &&
            (role === "all" || user.role === role) &&
            (status === "all" || user.status === status)
        );
    });


    const tbody = document.querySelector("#usersTable");

    const count = document.querySelector("#userResultsCount");

    if (count) {
        count.textContent = `${users.length} users`;
    }

    if (!tbody) return;


    tbody.innerHTML = users.map(user => `

        <tr>

            <td>${renderUserCell(user)}</td>

            <td>${renderRoleBadge(user.role)}</td>

            <td>${renderStatusBadge(user.status)}</td>

            <td>${formatDate(user.joined)}</td>

            <td>

                <div class="row-actions">

                    ${
                        user.id !== String(getCurrentUser().id)
                        ? `
                            <button
                                class="row-action"
                                data-action="role"
                                data-id="${escapeHTML(user.id)}">
                                Role
                            </button>

                            <button
                                class="row-action"
                                data-action="status"
                                data-id="${escapeHTML(user.id)}">

                                ${user.status === "active"
                                    ? "Suspend"
                                    : "Activate"}

                            </button>

                            <button
                                class="row-action danger"
                                data-action="delete"
                                data-id="${escapeHTML(user.id)}">
                                Delete
                            </button>
                        `
                        : "You"
                    }

                </div>

            </td>

        </tr>

    `).join("") ||
    '<tr><td colspan="5" class="empty-state">No users found.</td></tr>';
}



document.addEventListener("click", async event => {

    const button = event.target.closest("[data-action]");

    if (!button) return;

    const user = allUsers.find(
        item => item.id === button.dataset.id
    );

    if (!user) return;

    if (user.id === String(getCurrentUser()?.id)) {
        showToast("You cannot modify your own account here.");
        return;
    }


    try {

        button.disabled = true;

        if (button.dataset.action === "delete") {

            if (!confirm(`Delete ${user.name}?`)) return;

            await apiRequest(
                `/admin/users/${user.id}`,
                { method: "DELETE" }
            );

        } else if (button.dataset.action === "status") {

            const newStatus =
                user.status === "active"
                    ? "suspended"
                    : "active";

            await apiRequest(
                `/admin/users/${user.id}/status`,
                {
                    method: "PATCH",

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

        } else if (button.dataset.action === "role") {

            const newRole =
                user.role === "admin"
                    ? "user"
                    : "admin";

            if (!confirm(`Change ${user.name}'s role to ${newRole}?`)) {
                return;
            }

            await apiRequest(
                `/admin/users/${user.id}/role`,
                {
                    method: "PATCH",

                    body: JSON.stringify({
                        role: newRole
                    })
                }
            );
        }


        allUsers = await loadUsers();

        renderUsers();

        showToast("User information updated successfully.");

    } catch (error) {

        showToast(error.message);

    } finally {

        button.disabled = false;
    }
});