const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener("submit", function(e) {

    e.preventDefault();


    const email =
        document.getElementById("email")
        .value
        .trim()
        .toLowerCase();


    const password =
        document.getElementById("password")
        .value;


    const message =
        document.getElementById("message");


    /*
       Get registered user
    */

    const user =
        JSON.parse(
            localStorage.getItem(
                "codeWithJenishUser"
            )
        );


    if (!user) {

        showMessage(
            "No account found. Please sign up first.",
            "error"
        );

        return;
    }


    /*
       Check login
    */

    if (
        user.email === email &&
        user.password === password
    ) {

        /*
           Save login session
        */

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(user)
        );


        showMessage(
            "Login successful! Redirecting...",
            "success"
        );


        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 1000);

    }

    else {

        showMessage(
            "Incorrect email or password.",
            "error"
        );

    }

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


function togglePassword() {

    const input =
        document.getElementById("password");


    input.type =
        input.type === "password"
        ? "text"
        : "password";

}

