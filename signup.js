const form = document.getElementById("signupForm");

form.addEventListener("submit", function(e) {

    e.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim().toLowerCase();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const message =
        document.getElementById("message");


    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match.",
            "error"
        );

        return;
    }


    const existingUser =
        JSON.parse(localStorage.getItem("codeWithJenishUser"));


    if (existingUser &&
        existingUser.email === email) {

        showMessage(
            "An account with this email already exists.",
            "error"
        );

        return;
    }


    const user = {

        name: name,
        email: email,
        password: password,

        progress: 0,

        courses: []

    };


    localStorage.setItem(
        "codeWithJenishUser",
        JSON.stringify(user)
    );


    showMessage(
        "Account created successfully! Redirecting...",
        "success"
    );


    setTimeout(() => {

        window.location.href = "login.html";

    }, 1200);

});


function showMessage(text, type) {

    const message =
        document.getElementById("message");

    message.style.display = "block";

    message.textContent = text;

    if (type === "success") {

        message.style.background =
            "rgba(34,197,94,0.12)";

        message.style.color =
            "#4ade80";

    } else {

        message.style.background =
            "rgba(239,68,68,0.12)";

        message.style.color =
            "#f87171";
    }
}


function togglePassword(id) {

    const input =
        document.getElementById(id);

    if (input.type === "password") {

        input.type = "text";

    } else {

        input.type = "password";

    }

}

