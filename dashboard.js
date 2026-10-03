  /* =========================
       LOAD USER
    ========================= */

    const user =
        JSON.parse(
            localStorage.getItem(
                "loggedInUser"
            )
        );


    /*
       Protect dashboard
    */

    if (!user) {

        window.location.href =
            "login.html";

    }


    /*
       Display user information
    */

    if (user) {

        const name =
            user.name || "Student";


        document.getElementById(
            "welcomeName"
        ).textContent = name;


        document.getElementById(
            "profileName"
        ).textContent = name;


        document.getElementById(
            "avatar"
        ).textContent =
            name.charAt(0).toUpperCase();

    }


    /* =========================
       MOBILE SIDEBAR
    ========================= */

    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    mobileMenu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );


    /* =========================
       LOGOUT
    ========================= */

    document.getElementById(
        "logoutBtn"
    ).addEventListener(
        "click",
        function(e) {

            e.preventDefault();


            localStorage.removeItem(
                "loggedInUser"
            );


            window.location.href =
                "login.html";

        }
    );

