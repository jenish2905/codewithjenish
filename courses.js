    /* =========================
       STUDENT LOGIN
    ========================= */

    const loggedInUser =
        JSON.parse(
            localStorage.getItem("loggedInUser")
        );


    if (loggedInUser) {

        const name =
            loggedInUser.name || "Student";

        document.getElementById("userName")
            .textContent = name;

        document.getElementById("avatar")
            .textContent =
            name.charAt(0).toUpperCase();

    }


    /* =========================
       DEFAULT COURSES
    ========================= */

    const defaultCourses = [

        {
            id: 1,
            name: "C Programming",
            description:
                "Learn C programming from fundamentals to advanced concepts.",
            category: "Programming",
            price: 499,
            lessons: 35,
            students: 124,
            status: "published",
            icon: "💻"
        },

        {
            id: 2,
            name: "HTML & CSS",
            description:
                "Build modern responsive websites using HTML and CSS.",
            category: "Web Development",
            price: 399,
            lessons: 28,
            students: 186,
            status: "published",
            icon: "🌐"
        },

        {
            id: 3,
            name: "JavaScript",
            description:
                "Master JavaScript and build interactive web applications.",
            category: "Web Development",
            price: 699,
            lessons: 42,
            students: 153,
            status: "published",
            icon: "⚡"
        },

        {
            id: 4,
            name: "Python Programming",
            description:
                "Learn Python programming, projects and problem solving.",
            category: "Programming",
            price: 599,
            lessons: 40,
            students: 98,
            status: "published",
            icon: "🐍"
        },

        {
            id: 5,
            name: "MySQL Database",
            description:
                "Learn SQL, database design and MySQL.",
            category: "Database",
            price: 449,
            lessons: 25,
            students: 72,
            status: "published",
            icon: "🗄️"
        },

        {
            id: 6,
            name: "Artificial Intelligence",
            description:
                "Introduction to AI concepts, tools and applications.",
            category: "AI",
            price: 799,
            lessons: 45,
            students: 61,
            status: "published",
            icon: "🤖"
        }

    ];


    /* =========================
       LOAD COURSES
    ========================= */

    function getCourses() {

        let courses =
            JSON.parse(
                localStorage.getItem("courses")
            );


        if (!courses || !Array.isArray(courses)) {

            courses = defaultCourses;

            localStorage.setItem(
                "courses",
                JSON.stringify(courses)
            );

        }


        return courses;

    }


    /* =========================
       RENDER COURSES
    ========================= */

    function renderCourses() {

        const grid =
            document.getElementById("courseGrid");

        const empty =
            document.getElementById("emptyState");


        const search =
            document.getElementById("searchInput")
                .value
                .toLowerCase()
                .trim();


        const category =
            document.getElementById("categoryFilter")
                .value;


        const courses =
            getCourses();


        const filtered =
            courses.filter(course => {

                const isPublished =
                    course.status === "published";


                const matchesSearch =
                    course.name
                        .toLowerCase()
                        .includes(search)
                    ||
                    course.description
                        .toLowerCase()
                        .includes(search);


                const matchesCategory =
                    category === "all"
                    ||
                    course.category === category;


                return (
                    isPublished &&
                    matchesSearch &&
                    matchesCategory
                );

            });


        grid.innerHTML = "";


        if (filtered.length === 0) {

            empty.style.display =
                "block";

            return;

        }


        empty.style.display =
            "none";


        filtered.forEach(course => {

            const price =
                Number(course.price || 0);


            const card =
                document.createElement("div");

            card.className =
                "course-card";


            card.innerHTML = `

                <div class="course-top">

                    <div class="category">
                        ${escapeHTML(course.category)}
                    </div>

                    <div class="course-icon">
                        ${course.icon || "📚"}
                    </div>

                </div>


                <div class="course-body">

                    <h3>
                        ${escapeHTML(course.name)}
                    </h3>

                    <p class="description">
                        ${escapeHTML(course.description)}
                    </p>


                    <div class="course-info">

                        <span>
                            <i class="fa-solid fa-book"></i>
                            ${course.lessons || 0} Lessons
                        </span>

                        <span>
                            <i class="fa-solid fa-users"></i>
                            ${course.students || 0} Students
                        </span>

                        <span>
                            <i class="fa-solid fa-signal"></i>
                            Beginner
                        </span>

                    </div>


                    <div class="course-footer">

                        <div class="price ${price === 0 ? "free" : ""}">
                            ${
                                price === 0
                                ? "FREE"
                                : "₹" + price
                            }
                        </div>

                        <button
                            class="view-btn"
                            onclick="openCourse(${course.id})"
                        >
                            View Course
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>

                    </div>

                </div>
            `;


            grid.appendChild(card);

        });

    }


    /* =========================
       OPEN COURSE
    ========================= */

    function openCourse(courseId) {

        window.location.href =
            "course-details.html?id=" + courseId;

    }


    /* =========================
       HTML SECURITY
    ========================= */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =========================
       MOBILE MENU
    ========================= */

    function toggleMobileMenu() {

        const nav =
            document.querySelector(".nav-links");


        if (nav.style.display === "flex") {

            nav.style.display = "none";

        } else {

            nav.style.display = "flex";

            nav.style.position = "absolute";
            nav.style.top = "70px";
            nav.style.left = "4%";
            nav.style.right = "4%";

            nav.style.flexDirection = "column";
            nav.style.alignItems = "stretch";

            nav.style.padding = "10px";

            nav.style.background =
                "rgba(8, 13, 32, 0.98)";

            nav.style.border =
                "1px solid rgba(0,255,255,0.12)";

            nav.style.borderRadius = "12px";
        }

    }


    /* =========================
       INITIALIZE
    ========================= */

    renderCourses();

