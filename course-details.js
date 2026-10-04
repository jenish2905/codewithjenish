    /* =========================
       USER
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
       COURSE ID
    ========================= */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const courseId =
        Number(params.get("id"));


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
       GET COURSES
    ========================= */

    function getCourses() {

        const courses =
            JSON.parse(
                localStorage.getItem("courses")
            );

        if (
            courses &&
            Array.isArray(courses)
        ) {
            return courses;
        }

        return defaultCourses;

    }


    /* =========================
       GET LESSONS
    ========================= */

    function getLessons() {

        const lessons =
            JSON.parse(
                localStorage.getItem("lessons")
            );

        if (
            lessons &&
            Array.isArray(lessons)
        ) {
            return lessons;
        }

        return [];

    }


    /* =========================
       GET CURRENT COURSE
    ========================= */

    function getCourse() {

        return getCourses().find(
            course =>
                Number(course.id) === courseId
        );

    }


    /* =========================
       RENDER COURSE
    ========================= */

    function renderCourse() {

        const course =
            getCourse();


        if (!course) {

            document.getElementById("courseArea")
                .style.display = "none";

            document.getElementById("notFound")
                .style.display = "flex";

            return;

        }


        document.title =
            course.name +
            " | Code With Jenish";


        document.getElementById(
            "breadcrumbCourse"
        ).textContent =
            course.name;


        document.getElementById(
            "courseCategory"
        ).textContent =
            course.category;


        document.getElementById(
            "courseName"
        ).textContent =
            course.name;


        document.getElementById(
            "courseDescription"
        ).textContent =
            course.description;


        document.getElementById(
            "lessonCount"
        ).textContent =
            (course.lessons || 0) +
            " Lessons";


        document.getElementById(
            "studentCount"
        ).textContent =
            (course.students || 0) +
            " Students";


        document.getElementById(
            "courseIcon"
        ).textContent =
            course.icon || "📚";


        const price =
            Number(course.price || 0);


        const priceElement =
            document.getElementById(
                "coursePrice"
            );


        if (price === 0) {

            priceElement.textContent =
                "FREE";

            priceElement.classList.add("free");

        } else {

            priceElement.textContent =
                "₹" + price;

        }


        document.getElementById(
            "statLessons"
        ).textContent =
            course.lessons || 0;


        document.getElementById(
            "statStudents"
        ).textContent =
            course.students || 0;


        renderLessons(course);

        updateEnrollmentButton();

    }


    /* =========================
       RENDER LESSONS
    ========================= */

    function renderLessons(course) {

        const list =
            document.getElementById(
                "lessonList"
            );


        const lessons =
            getLessons()
                .filter(
                    lesson =>
                        Number(lesson.courseId) ===
                        Number(course.id)
                )
                .sort(
                    (a, b) =>
                        Number(a.order || 0) -
                        Number(b.order || 0)
                );


        list.innerHTML = "";


        if (lessons.length === 0) {

            list.innerHTML = `

                <div style="
                    text-align:center;
                    padding:30px;
                    color:#68748b;
                    font-size:13px;
                ">

                    <i
                        class="fa-solid fa-video"
                        style="
                            font-size:30px;
                            color:#263149;
                            margin-bottom:10px;
                        "
                    ></i>

                    <p>
                        Lessons will be available soon.
                    </p>

                </div>

            `;

            return;

        }


        lessons.forEach(
            (lesson, index) => {

                const locked =
                    lesson.locked === true;


                const free =
                    lesson.free === true;


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "lesson" +
                    (
                        locked
                            ? " locked"
                            : ""
                    );


                div.innerHTML = `

                    <div class="lesson-number">
                        ${index + 1}
                    </div>

                    <div class="lesson-info">

                        <strong>
                            ${escapeHTML(
                                lesson.title ||
                                "Lesson " +
                                (index + 1)
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                lesson.duration ||
                                "Video Lesson"
                            )}

                            ${
                                free
                                ? " • Free Preview"
                                : ""
                            }
                        </span>

                    </div>

                    <div class="lesson-action">

                        ${
                            locked
                            ? '<i class="fa-solid fa-lock"></i>'
                            : '<i class="fa-solid fa-play"></i>'
                        }

                    </div>

                `;


                if (!locked) {

                    div.onclick =
                        function() {

                            openLesson(
                                lesson.id
                            );

                        };

                }


                list.appendChild(div);

            }
        );

    }


    /* =========================
       ENROLLMENT
    ========================= */

    function getEnrollments() {

        return JSON.parse(
            localStorage.getItem(
                "enrollments"
            )
        ) || [];

    }


    function isEnrolled() {

        if (!loggedInUser) {
            return false;
        }


        const enrollments =
            getEnrollments();


        return enrollments.some(
            enrollment =>

                String(enrollment.userEmail) ===
                String(loggedInUser.email)

                &&

                Number(enrollment.courseId) ===
                Number(courseId)
        );

    }


    function updateEnrollmentButton() {

        const button =
            document.getElementById(
                "enrollButton"
            );


        if (isEnrolled()) {

            button.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                Continue Learning
            `;

            button.classList.add(
                "enrolled"
            );

        } else {

            button.innerHTML = `
                <i class="fa-solid fa-graduation-cap"></i>
                Enroll Now
            `;

            button.classList.remove(
                "enrolled"
            );

        }

    }


    function enrollCourse() {

        if (!loggedInUser) {

            showToast(
                "Please login before enrolling."
            );

            setTimeout(
                () => {
                    window.location.href =
                        "login.html";
                },
                1000
            );

            return;

        }


        if (isEnrolled()) {

            window.location.href =
                "lesson-player.html?course=" +
                courseId;

            return;

        }


        const course =
            getCourse();


        if (!course) {
            return;
        }


        const enrollments =
            getEnrollments();


        enrollments.push({

            id:
                Date.now(),

            userEmail:
                loggedInUser.email,

            userName:
                loggedInUser.name || "Student",

            courseId:
                course.id,

            courseName:
                course.name,

            enrolledAt:
                new Date().toISOString(),

            progress:
                0,

            completedLessons:
                0

        });


        localStorage.setItem(
            "enrollments",
            JSON.stringify(
                enrollments
            )
        );


        updateEnrollmentButton();


        showToast(
            "Successfully enrolled in " +
            course.name
        );

    }


    /* =========================
       OPEN LESSON
    ========================= */

    function openLesson(lessonId) {

        if (!isEnrolled()) {

            showToast(
                "Please enroll in this course first."
            );

            return;

        }


        window.location.href =
            "lesson-player.html?course=" +
            courseId +
            "&lesson=" +
            lessonId;

    }


    /* =========================
       ESCAPE HTML
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
       TOAST
    ========================= */

    let toastTimer;


    function showToast(message) {

        const toast =
            document.getElementById(
                "toast"
            );

        const messageElement =
            document.getElementById(
                "toastMessage"
            );


        messageElement.textContent =
            message;


        toast.classList.add("show");


        clearTimeout(toastTimer);


        toastTimer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                3000
            );

    }


    /* =========================
       INITIALIZE
    ========================= */

    renderCourse();
