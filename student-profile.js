 // Authentication
    let user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) {
        window.location.href = "login.html";
    }

    // Load data
    let enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    const quizResults = JSON.parse(localStorage.getItem("quizResults")) || [];
    const lessons = JSON.parse(localStorage.getItem("lessons")) || [];

    let isEditing = false;

    // Student-specific data
    function getStudentEnrollments() {
        return enrollments.filter(e => e.userEmail === user.email);
    }

    function getStudentResults() {
        return quizResults.filter(r => r.userEmail === user.email);
    }

    // Load profile fields
    function loadProfile() {
        document.getElementById("name").value = user.name || "";
        document.getElementById("email").value = user.email || "";
        document.getElementById("phone").value = user.phone || "";
        document.getElementById("city").value = user.city || "";

        document.getElementById("profileName").textContent =
            user.name || "Student";

        document.getElementById("profileEmail").textContent =
            user.email || "";

        const avatar = document.getElementById("avatar");
        avatar.textContent =
            (user.name || "S").trim().charAt(0).toUpperCase() || "S";
    }

    // Edit profile
    function enableEdit() {
        isEditing = true;

        ["name", "phone", "city"].forEach(id => {
            document.getElementById(id).disabled = false;
        });

        document.getElementById("formActions").classList.remove("hidden");
        document.getElementById("editBtn").classList.add("hidden");
    }

    function cancelEdit() {
        isEditing = false;
        loadProfile();

        ["name", "phone", "city"].forEach(id => {
            document.getElementById(id).disabled = true;
        });

        document.getElementById("formActions").classList.add("hidden");
        document.getElementById("editBtn").classList.remove("hidden");
    }

    // Save profile
    document.getElementById("profileForm").addEventListener("submit", function(event) {
        event.preventDefault();

        if (!isEditing) return;

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const city = document.getElementById("city").value.trim();

        if (!name) {
            showToast("Please enter your name.");
            return;
        }

        user.name = name;
        user.phone = phone;
        user.city = city;

        localStorage.setItem("loggedInUser", JSON.stringify(user));

        // Also update the corresponding signup user record if present
        let users = JSON.parse(localStorage.getItem("users")) || [];

        const index = users.findIndex(u => u.email === user.email);

        if (index !== -1) {
            users[index] = {
                ...users[index],
                name,
                phone,
                city
            };

            localStorage.setItem("users", JSON.stringify(users));
        }

        // Update the name in enrollment records
        enrollments = enrollments.map(e => {
            if (e.userEmail === user.email) {
                return { ...e, userName: name };
            }
            return e;
        });

        localStorage.setItem("enrollments", JSON.stringify(enrollments));

        cancelEdit();
        renderProfile();
        showToast("Profile updated successfully!");
    });

    // Render enrolled courses
    function renderCourses() {
        const container = document.getElementById("courseList");
        container.innerHTML = "";

        const studentEnrollments = getStudentEnrollments();

        if (!studentEnrollments.length) {
            const empty = document.createElement("div");
            empty.className = "empty";
            empty.innerHTML = `
                <p>You have not enrolled in any courses yet.</p>
                <a href="courses.html">Browse Courses</a>
            `;
            container.appendChild(empty);
            return;
        }

        studentEnrollments.forEach(enrollment => {
            const course = courses.find(c =>
                Number(c.id) === Number(enrollment.courseId)
            );

            const item = document.createElement("div");
            item.className = "course-item";

            const icon = document.createElement("div");
            icon.className = "course-icon";
            icon.textContent = course?.icon || "📘";

            const info = document.createElement("div");
            info.className = "course-info";

            const title = document.createElement("h3");
            title.textContent =
                course?.name || enrollment.courseName || "Course";

            const progress = document.createElement("div");
            progress.className = "course-progress";

            const fill = document.createElement("div");
            const percentage = Math.max(
                0,
                Math.min(100, Number(enrollment.progress || 0))
            );
            fill.style.width = percentage + "%";

            progress.appendChild(fill);
            info.append(title, progress);

            const percent = document.createElement("div");
            percent.className = "course-percent";
            percent.textContent = percentage + "%";

            item.append(icon, info, percent);
            container.appendChild(item);
        });
    }

    // Render learning statistics and profile card
    function renderProfile() {
        const studentEnrollments = getStudentEnrollments();
        const studentResults = getStudentResults();

        const completedLessons = studentEnrollments.reduce(
            (sum, enrollment) =>
                sum + Number(enrollment.completedLessons || 0),
            0
        );

        const average = studentResults.length
            ? Math.round(
                studentResults.reduce(
                    (sum, result) => sum + Number(result.score || 0),
                    0
                ) / studentResults.length
            )
            : 0;

        document.getElementById("quickCourses").textContent =
            studentEnrollments.length;

        document.getElementById("quickLessons").textContent =
            completedLessons;

        document.getElementById("quickQuizzes").textContent =
            studentResults.length;

        document.getElementById("totalCourses").textContent =
            studentEnrollments.length;

        document.getElementById("totalLessons").textContent =
            completedLessons;

        document.getElementById("averageQuiz").textContent =
            average + "%";

        renderCourses();
    }

    // Toast
    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    // Logout
    function logout() {
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
    }

    // Start
    if (user) {
        loadProfile();
        renderProfile();
    }