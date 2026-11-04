document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#registerForm");

    if (!form) return;

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const name = document
            .querySelector("#name")
            .value.trim();

        const email = document
            .querySelector("#email")
            .value.trim()
            .toLowerCase();

        const password = document
            .querySelector("#password")
            .value;

        const confirmPassword = document
            .querySelector("#confirmPassword")
            .value;


        if (!name || !email || !password) {
            showToast("Please fill all required fields.");
            return;
        }

        if (password.length < 8) {
            showToast(
                "Password must contain at least 8 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            showToast("Passwords do not match.");
            return;
        }


        try {

            const data = await apiRequest("/auth/register", {
                method: "POST",

                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            showToast(
                data.message || "Registration successful."
            );

            setTimeout(() => {
                location.href = "index.html";
            }, 1000);

        } catch (error) {

            showToast(error.message);
        }
    });
});