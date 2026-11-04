document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#resetForm");

    if (!form) return;

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const token = new URLSearchParams(
            location.search
        ).get("token");

        const password = document
            .querySelector("#newPassword")
            .value;

        const confirmPassword = document
            .querySelector("#confirmPassword")
            .value;


        if (!token) {
            showToast("Invalid or missing password reset link.");
            return;
        }

        if (password.length < 8) {
            showToast("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showToast("Passwords do not match.");
            return;
        }


        try {

            const data = await apiRequest(
                "/auth/reset-password",
                {
                    method: "POST",

                    body: JSON.stringify({
                        token,
                        password
                    })
                }
            );


            showToast(
                data.message || "Password reset successful."
            );


            setTimeout(() => {
                location.href = "index.html";
            }, 1200);

        } catch (error) {

            showToast(error.message);
        }
    });
});