


document.addEventListener("DOMContentLoaded", async () => {

    const user = protectPage();

    if (!user) return;

    setupDashboard(user);
    setupDashboardEvents();

    try {

        const data = await apiRequest("/users/profile");

        if (!data.user) {
            throw new Error("Profile information not found.");
        }

        const latestUser = data.user;
        const updatedUser = {
            ...user,
            ...latestUser,
            id: String(latestUser.id || latestUser._id || user.id)
        };

        setCurrentUser(updatedUser);

        renderProfile(updatedUser);

    } catch (error) {

        console.error("Profile loading error:", error);

        showToast(error.message || "Unable to load profile.");

    }

    const profileForm = document.getElementById("profileForm");

    profileForm?.addEventListener("submit", updateProfile);

    const passwordForm =
        document.getElementById("changePasswordForm");

    passwordForm?.addEventListener("submit", changePassword);


    document.getElementById("helpButton")
        ?.addEventListener("click", () => {

            showToast("Help center is coming soon.");

        });

    document.getElementById("userMenuButton")
        ?.addEventListener("click", () => {

            showToast("You are viewing your profile.");

        });

});

function renderProfile(user) {

    const setValue = (id, value) => {

        const element = document.getElementById(id);

        if (element) {
            element.value = value ?? "";
        }

    };


    const setText = (id, value) => {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = value ?? "";
        }

    };

    setValue("profileName", user.name);

    setValue("profileEmail", user.email);

    setValue(
        "profileRole",
        user.role === "admin"
            ? "Administrator"
            : "User"
    );

    setValue("profilePhone", user.phone);

    setValue("profileLocation", user.location);

    setValue("profileBio", user.bio);

    setText("profileDisplayName", user.name);

    setText("profileDisplayEmail", user.email);

    setText(
        "profileDisplayRole",
        user.role === "admin"
            ? "Administrator"
            : "User"
    );

    const initials = getInitials(user.name);

    setText("profileAvatar", initials);

    setText("topbarName", user.name);

    setText("topName", user.name);

    setText("sidebarName", user.name);

    setText("sidebarRole", user.role === "admin"
        ? "Administrator"
        : "User"
    );

    setText("sidebarAvatar", initials);

    setText("topbarAvatar", initials);

    setText("topAvatar", initials);

}

async function updateProfile(event) {

    event.preventDefault();

    const user = getCurrentUser();

    if (!user) {
        showToast("Please log in again.");
        return;
    }


    const name = document
        .getElementById("profileName")
        .value.trim();

    const phone = document
        .getElementById("profilePhone")
        ?.value.trim() || "";

    const location = document
        .getElementById("profileLocation")
        ?.value.trim() || "";

    const bio = document
        .getElementById("profileBio")
        ?.value.trim() || "";


    if (!name) {
        showToast("Name cannot be empty.");
        return;
    }


    const button = document.getElementById("saveProfileButton");

    if (button) {
        button.disabled = true;
        button.textContent = "Saving...";
    }


    try {

        const data = await apiRequest("/users/profile", {

            method: "PUT",

            body: JSON.stringify({
                name,
                phone,
                location,
                bio
            })

        });


        if (!data.user) {
            throw new Error(
                data.message || "Profile update failed."
            );
        }


        const updatedUser = {
            ...user,
            ...data.user,
            id: String(data.user.id || data.user._id || user.id)
        };

        setCurrentUser(updatedUser);

        renderProfile(updatedUser);


        showToast(
            data.message || "Profile updated successfully."
        );


    } catch (error) {

        console.error("Profile update error:", error);

        showToast(error.message || "Unable to update profile.");

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent = "Save changes";
        }

    }

}


async function changePassword(event) {

    event.preventDefault();


    const currentPassword = document
        .getElementById("currentPassword")
        .value;

    const newPassword = document
        .getElementById("newPassword")
        .value;

    const confirmPassword = document
        .getElementById("confirmPassword")
        .value;



    if (!currentPassword || !newPassword || !confirmPassword) {

        showToast("Please fill all password fields.");

        return;
    }


    if (newPassword.length < 8) {

        showToast(
            "New password must contain at least 8 characters."
        );

        return;
    }


    if (newPassword !== confirmPassword) {

        showToast("New passwords do not match.");

        return;
    }


    if (currentPassword === newPassword) {

        showToast(
            "New password must be different from current password."
        );

        return;
    }


    const button = document.getElementById(
        "changePasswordButton"
    );

    if (button) {

        button.disabled = true;

        button.textContent = "Updating...";

    }


    try {

        const data = await apiRequest(
            "/users/change-password",
            {

                method: "PUT",

                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })

            }
        );



        event.target.reset();


        showToast(
            data.message || "Password updated successfully."
        );


    } catch (error) {

        console.error("Password update error:", error);

        showToast(
            error.message || "Unable to update password."
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent = "Update password";

        }

    }

}
