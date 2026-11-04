
document.addEventListener("DOMContentLoaded", () => {

    const darkMode = document.getElementById("darkMode");

    const emailNotifications =
        document.getElementById("emailNotifications");

    const securityNotifications =
        document.getElementById("securityNotifications");

    const themeToggle =
        document.getElementById("themeToggle");

    const userMenuButton =
        document.getElementById("userMenuButton");

    const helpButton =
        document.getElementById("helpButton");

    function loadPreferences() {

        const savedTheme =
            localStorage.getItem(APP_CONFIG.storage.theme) === "true";

        const savedEmail =
            localStorage.getItem(
                "northstar_email_notifications"
            ) !== "false";

        const savedSecurity =
            localStorage.getItem(
                "northstar_security_notifications"
            ) !== "false";

        document.body.classList.toggle(
            "dark-mode",
            savedTheme
        );

        if (darkMode) {
            darkMode.checked = savedTheme;
        }

        if (emailNotifications) {
            emailNotifications.checked = savedEmail;
        }

        if (securityNotifications) {
            securityNotifications.checked = savedSecurity;
        }

    }

    if (darkMode) {

        darkMode.addEventListener("change", () => {

            const enabled = darkMode.checked;

            document.body.classList.toggle(
                "dark-mode",
                enabled
            );

            localStorage.setItem(
                APP_CONFIG.storage.theme,
                String(enabled)
            );

            showToast(
                enabled
                    ? "Dark mode enabled."
                    : "Light mode enabled."
            );

        });

    }

    if (themeToggle) {

        themeToggle.addEventListener("click", () => {
            requestAnimationFrame(() => {

                if (darkMode) {
                    darkMode.checked =
                        document.body.classList.contains("dark-mode");
                }

            });

        });

    }

    if (emailNotifications) {

        emailNotifications.addEventListener("change", () => {

            localStorage.setItem(
                "northstar_email_notifications",
                String(emailNotifications.checked)
            );

            showToast(
                emailNotifications.checked
                    ? "Email notifications enabled."
                    : "Email notifications disabled."
            );

        });

    }
    if (securityNotifications) {

        securityNotifications.addEventListener("change", () => {

            localStorage.setItem(
                "northstar_security_notifications",
                String(securityNotifications.checked)
            );

            showToast(
                securityNotifications.checked
                    ? "Security notifications enabled."
                    : "Security notifications disabled."
            );

        });

    }

    if (userMenuButton) {

        userMenuButton.addEventListener("click", () => {

            window.location.href = "profile.html";

        });

    }

    if (helpButton) {

        helpButton.addEventListener("click", () => {

            showToast("Help center is coming soon.");

        });

    }
    loadPreferences();

});
