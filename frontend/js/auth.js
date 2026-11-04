document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#loginForm");

    if (!form) return;

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const email = document
            .querySelector("#email")
            .value.trim()
            .toLowerCase();

        const password = document
            .querySelector("#password")
            .value;

        if (!email || !password) {
            showToast("Please enter email and password.");
            return;
        }

        const submitButton = form.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {

            const data = await apiRequest("/auth/login", {
                method: "POST",

                body: JSON.stringify({
                    email,
                    password
                })
            });

            setCurrentUser(data.user, data.token);

            showToast("Login successful!");

            setTimeout(() => {

                if (data.user.role === "admin") {
                    location.href = "dashboard.html";
                } else {
                    location.href = "user-dashboard.html";
                }

            }, 500);

        } catch (error) {

            showToast(error.message);

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
});