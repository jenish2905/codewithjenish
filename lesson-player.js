  /* ==========================================
       AUTHENTICATION
    ========================================== */

    const loggedInUser =
        JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        window.location.href = "login.html";
    }

    if (loggedInUser) {
        document.getElementById("userName").textContent =
            loggedInUser.name || "Student";
    }


    /* ==========================================
       URL PARAMETERS
    ========================================== */

    const params = new URLSearchParams(window.location.search);

    const courseId = Number(params.get("course"));
    const lessonId = Number(params.get("lesson"));


    /* ==========================================
       DATA
    ========================================== */

    let courses =
        JSON.parse(localStorage.getItem("courses")) || [];

    let lessons =
        JSON.parse(localStorage.getItem("lessons")) || [];

    let enrollments =
        JSON.parse(localStorage.getItem("enrollments")) || [];


    /* ==========================================
       CURRENT COURSE
    ========================================== */

    const course =
        courses.find(c => Number(c.id) === courseId);


    if (!course) {

        alert("Course not found.");

        window.location.href = "courses.html";
    }


    /* ==========================================
       CURRENT ENROLLMENT
    ========================================== */

    let enrollment =
        enrollments.find(e =>
            e.userEmail === loggedInUser.email &&
            Number(e.courseId) === courseId
        );


    if (!enrollment) {

        alert("Please enroll in this course first.");

        window.location.href =
            "course-details.html?id=" + courseId;
    }


    /* ==========================================
       COURSE LESSONS
    ========================================== */

    let courseLessons = lessons
        .filter(l => Number(l.courseId) === courseId)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));


    /* ==========================================
       CURRENT LESSON
    ========================================== */

    let currentIndex =
        courseLessons.findIndex(
            l => Number(l.id) === lessonId
        );


    if (currentIndex < 0) {
        currentIndex = 0;
    }


    /* ==========================================
       LOAD LESSON
    ========================================== */

    function loadLesson() {

        const lesson = courseLessons[currentIndex];

        if (!lesson) {
            showToast("No lesson available.");
            return;
        }

        document.title =
            lesson.title + " | Code With Jenish";


        document.getElementById("courseBadge").textContent =
            course.name;


        document.getElementById("durationBadge").innerHTML =
            '<i class="fa-regular fa-clock"></i> ' +
            (lesson.duration || "10 min");


        document.getElementById("lessonNumberBadge").textContent =
            "Lesson " + (currentIndex + 1);


        document.getElementById("lessonTitle").textContent =
            lesson.title;


        document.getElementById("lessonDescription").textContent =
            lesson.description ||
            "Learn this important concept step by step.";


        document.getElementById("sidebarCourse").textContent =
            course.name;


        document.getElementById("lessonCountText").textContent =
            courseLessons.length + " lessons";


        loadVideo(lesson);

        renderLessonList();

        updateProgress();

        updateNavigation();

        updateCompleteButton();
    }


    /* ==========================================
       VIDEO
    ========================================== */

    function loadVideo(lesson) {

        const container =
            document.getElementById("videoContainer");


        if (lesson.video &&
            lesson.video.trim() !== "") {

            let videoURL = lesson.video.trim();


            /*
                You can store:
                1. YouTube embed URL
                2. Direct video URL
                3. iframe URL
            */


            if (
                videoURL.includes("youtube.com/watch") ||
                videoURL.includes("youtu.be/")
            ) {

                let videoId = "";

                if (videoURL.includes("youtu.be/")) {

                    videoId =
                        videoURL.split("youtu.be/")[1]
                        .split("?")[0];

                } else {

                    videoId =
                        new URL(videoURL)
                        .searchParams
                        .get("v");
                }


                if (videoId) {

                    videoURL =
                        "https://www.youtube.com/embed/" +
                        videoId;
                }
            }


            container.innerHTML = `
                <iframe
                    src="${escapeAttribute(videoURL)}"
                    title="${escapeAttribute(lesson.title)}"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            `;

        } else {

            container.innerHTML = `
                <div class="video-placeholder">
                    <i class="fa-solid fa-play"></i>

                    <h3>${escapeHTML(lesson.title)}</h3>

                    <p>
                        Add a video URL from the Admin Lessons page.
                    </p>
                </div>
            `;
        }
    }


    /* ==========================================
       LESSON LIST
    ========================================== */

    function renderLessonList() {

        const list =
            document.getElementById("lessonList");

        list.innerHTML = "";


        courseLessons.forEach((lesson, index) => {

            const completed =
                isLessonCompleted(lesson.id);


            const locked =
                lesson.locked === true;


            const item =
                document.createElement("div");


            item.className =
                "lesson-item" +
                (index === currentIndex
                    ? " current"
                    : "") +
                (completed
                    ? " completed-item"
                    : "") +
                (locked
                    ? " locked"
                    : "");


            item.innerHTML = `

                <div class="lesson-icon">

                    ${
                        completed
                        ? '<i class="fa-solid fa-check"></i>'
                        : '<i class="fa-solid fa-play"></i>'
                    }

                </div>


                <div class="lesson-text">

                    <h3>
                        ${index + 1}. ${escapeHTML(lesson.title)}
                    </h3>

                    <p>
                        ${escapeHTML(lesson.duration || "10 min")}
                    </p>

                </div>


                <div class="status-icon">

                    ${
                        locked
                        ? '<i class="fa-solid fa-lock lock"></i>'
                        : completed
                        ? '<i class="fa-solid fa-circle-check done"></i>'
                        : ''
                    }

                </div>
            `;


            item.onclick = () => {

                if (locked) {

                    showToast(
                        "This lesson is locked."
                    );

                    return;
                }


                currentIndex = index;

                loadLesson();
            };


            list.appendChild(item);

        });
    }


    /* ==========================================
       COMPLETION CHECK
    ========================================== */

    function isLessonCompleted(id) {

        return Array.isArray(
            enrollment.completedLessonIds
        ) &&
        enrollment.completedLessonIds
            .map(Number)
            .includes(Number(id));
    }


    /* ==========================================
       COMPLETE LESSON
    ========================================== */

    function completeLesson() {

        const lesson =
            courseLessons[currentIndex];


        if (!lesson) return;


        if (!Array.isArray(
            enrollment.completedLessonIds
        )) {

            enrollment.completedLessonIds = [];
        }


        if (!enrollment.completedLessonIds
            .map(Number)
            .includes(Number(lesson.id))) {

            enrollment.completedLessonIds.push(
                Number(lesson.id)
            );
        }


        enrollment.completedLessons =
            enrollment.completedLessonIds.length;


        enrollment.progress =
            courseLessons.length > 0
            ? Math.round(
                (
                    enrollment.completedLessons /
                    courseLessons.length
                ) * 100
            )
            : 0;


        enrollment.lastLessonId =
            lesson.id;


        enrollment.lastAccessed =
            new Date().toISOString();


        saveEnrollment();


        updateProgress();

        renderLessonList();

        updateCompleteButton();


        showToast(
            "Lesson completed successfully!"
        );


        /*
            Automatically open next lesson
            after completion.
        */

        if (
            currentIndex <
            courseLessons.length - 1
        ) {

            setTimeout(() => {

                currentIndex++;

                loadLesson();

            }, 800);

        } else {

            showToast(
                "🎉 Course lessons completed!"
            );
        }
    }


    /* ==========================================
       SAVE ENROLLMENT
    ========================================== */

    function saveEnrollment() {

        const index =
            enrollments.findIndex(e =>
                e.userEmail === loggedInUser.email &&
                Number(e.courseId) === courseId
            );


        if (index !== -1) {

            enrollments[index] =
                enrollment;

        } else {

            enrollments.push(enrollment);
        }


        localStorage.setItem(
            "enrollments",
            JSON.stringify(enrollments)
        );
    }


    /* ==========================================
       UPDATE PROGRESS
    ========================================== */

    function updateProgress() {

        const completed =
            enrollment.completedLessons || 0;


        const total =
            courseLessons.length;


        const percentage =
            total > 0
            ? Math.round(
                (completed / total) * 100
            )
            : 0;


        enrollment.progress =
            percentage;


        document.getElementById(
            "progressPercent"
        ).textContent =
            percentage + "%";


        document.getElementById(
            "progressFill"
        ).style.width =
            percentage + "%";
    }


    /* ==========================================
       COMPLETE BUTTON
    ========================================== */

    function updateCompleteButton() {

        const button =
            document.getElementById("completeBtn");


        const lesson =
            courseLessons[currentIndex];


        if (!lesson) return;


        const completed =
            isLessonCompleted(lesson.id);


        if (completed) {

            button.className =
                "btn completed";


            button.innerHTML =
                '<i class="fa-solid fa-circle-check"></i> Completed';


        } else {

            button.className =
                "btn primary";


            button.innerHTML =
                '<i class="fa-solid fa-check"></i> Mark as Complete';
        }
    }


    /* ==========================================
       NAVIGATION
    ========================================== */

    function updateNavigation() {

        const previous =
            document.getElementById("previousBtn");


        const next =
            document.getElementById("nextBtn");


        previous.disabled =
            currentIndex <= 0;


        next.disabled =
            currentIndex >=
            courseLessons.length - 1;


        previous.style.opacity =
            previous.disabled ? ".45" : "1";


        next.style.opacity =
            next.disabled ? ".45" : "1";
    }


    function previousLesson() {

        if (currentIndex <= 0) {

            showToast(
                "This is the first lesson."
            );

            return;
        }


        currentIndex--;

        loadLesson();
    }


    function nextLesson() {

        if (
            currentIndex >=
            courseLessons.length - 1
        ) {

            showToast(
                "This is the last lesson."
            );

            return;
        }


        /*
            Allow next lesson only after
            current lesson is completed.
        */

        const currentLesson =
            courseLessons[currentIndex];


        if (!isLessonCompleted(
            currentLesson.id
        )) {

            showToast(
                "Complete this lesson first."
            );

            return;
        }


        currentIndex++;

        loadLesson();
    }


    /* ==========================================
       BACK
    ========================================== */

    function goBack() {

        window.location.href =
            "course-details.html?id=" +
            courseId;
    }


    /* ==========================================
       LOGOUT
    ========================================== */

    function logout() {

        localStorage.removeItem(
            "loggedInUser"
        );

        window.location.href =
            "login.html";
    }


    /* ==========================================
       TOAST
    ========================================== */

    function showToast(message) {

        const toast =
            document.getElementById("toast");


        toast.textContent =
            message;


        toast.classList.add("show");


        setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);
    }


    /* ==========================================
       SECURITY HELPERS
    ========================================== */

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function escapeAttribute(value) {

        return escapeHTML(value);
    }


    /* ==========================================
       START
    ========================================== */

    if (
        loggedInUser &&
        course &&
        enrollment
    ) {

        loadLesson();
    }

