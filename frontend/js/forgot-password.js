document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#forgotForm");

    if (!form) return;

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const email = document
            .querySelector("#email")
            .value.trim()
            .toLowerCase();

        if (!email) {
            showToast("Please enter your email address.");
            return;
        }

        try {

            const data = await apiRequest(
                "/auth/forgot-password",
                {
                    method: "POST",

                    body: JSON.stringify({
                        email
                    })
                }
            );

            showToast(data.message);

        } catch (error) {

            showToast(error.message);
        }
    });
});