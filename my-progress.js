 // ---------- LOGIN CHECK ----------
    let user;

    try {
      user = JSON.parse(localStorage.getItem("loggedInUser"));
    } catch (error) {
      user = null;
    }

    if (!user || !user.email) {
      window.location.href = "login.html";
    }

    // ---------- SAFE DATA LOADING ----------
    function readArray(key) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
      } catch (error) {
        return [];
      }
    }

    const courses = readArray("courses");
    const lessons = readArray("lessons");
    const enrollments = readArray("enrollments");
    const quizResults = readArray("quizResults");

    const userEmail = String(user.email).toLowerCase();

    const myEnrollments = enrollments.filter(
      item => String(item.userEmail || "").toLowerCase() === userEmail
    );

    const myResults = quizResults
      .filter(item => String(item.userEmail || "").toLowerCase() === userEmail)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // ---------- HELPERS ----------
    function escapeHTML(value) {
      return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);
    }

    function getCourse(courseId) {
      return courses.find(course => String(course.id) === String(courseId));
    }

    function getCourseLessons(courseId) {
      return lessons.filter(
        lesson => String(lesson.courseId) === String(courseId)
      );
    }

    function getProgress(enrollment, courseLessons) {
      const completedIds = Array.isArray(enrollment.completedLessonIds)
        ? enrollment.completedLessonIds
        : [];

      const total = courseLessons.length || Number(enrollment.totalLessons) || 0;

      if (total > 0) {
        const completed = courseLessons.filter(lesson =>
          completedIds.some(id => String(id) === String(lesson.id))
        ).length;

        return {
          total,
          completed,
          percent: Math.round((completed / total) * 100)
        };
      }

      const completed = Number(enrollment.completedLessons) || 0;
      const percent = Math.max(
        0,
        Math.min(100, Number(enrollment.progress) || 0)
      );

      return {
        total,
        completed,
        percent
      };
    }

    // ---------- SUMMARY ----------
    function renderSummary() {
      const totalCompleted = myEnrollments.reduce((sum, enrollment) => {
        const courseLessons = getCourseLessons(enrollment.courseId);
        return sum + getProgress(enrollment, courseLessons).completed;
      }, 0);

      const average = myResults.length
        ? Math.round(
            myResults.reduce((sum, result) => sum + Number(result.score || 0), 0)
            / myResults.length
          )
        : 0;

      document.getElementById("welcomeText").textContent =
        `Welcome back, ${user.name || "Student"}! Here's your learning overview.`;

      document.getElementById("totalCourses").textContent =
        myEnrollments.length;

      document.getElementById("completedLessons").textContent =
        totalCompleted;

      document.getElementById("quizAttempts").textContent =
        myResults.length;

      document.getElementById("averageScore").textContent =
        average + "%";
    }

    // ---------- COURSE PROGRESS ----------
    function renderCourses() {
      const container = document.getElementById("courseList");

      if (myEnrollments.length === 0) {
        container.innerHTML = `
          <div class="empty">
            You haven't enrolled in any courses yet.
            <br>
            <a href="courses.html">Browse courses</a> to start learning.
          </div>
        `;
        return;
      }

      container.innerHTML = myEnrollments.map(enrollment => {
        const course = getCourse(enrollment.courseId);
        const courseLessons = getCourseLessons(enrollment.courseId);
        const progress = getProgress(enrollment, courseLessons);

        const name = course?.name || enrollment.courseName || "Course";
        const icon = course?.icon || "📘";

        return `
          <article class="course-card">
            <div class="course-top">
              <div class="course-icon">${escapeHTML(icon)}</div>
              <div class="course-info">
                <h3>${escapeHTML(name)}</h3>
                <p>Enrolled: ${escapeHTML(
                  enrollment.enrolledAt
                    ? new Date(enrollment.enrolledAt).toLocaleDateString()
                    : "Date unavailable"
                )}</p>
              </div>
            </div>

            <div class="progress-label">
              <span>Learning Progress</span>
              <span>${progress.percent}%</span>
            </div>

            <div
              class="progress-track"
              role="progressbar"
              aria-valuenow="${progress.percent}"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="${escapeHTML(name)} progress"
            >
              <div class="progress-fill" style="width:${progress.percent}%"></div>
            </div>

            <div class="course-details">
              <span>Completed: ${progress.completed}</span>
              <span>Total lessons: ${progress.total || "—"}</span>
            </div>

            <div class="course-actions">
              <a class="btn" href="course-details.html?id=${encodeURIComponent(enrollment.courseId)}">
                Continue Learning
              </a>
            </div>
          </article>
        `;
      }).join("");
    }

    // ---------- QUIZ PERFORMANCE ----------
    function renderQuizResults() {
      const table = document.getElementById("quizTable");
      const empty = document.getElementById("quizEmpty");

      if (myResults.length === 0) {
        table.innerHTML = "";
        empty.style.display = "block";
        return;
      }

      empty.style.display = "none";

      table.innerHTML = myResults.slice(0, 10).map(result => {
        const course = getCourse(result.courseId);
        const courseName = course?.name || result.courseName || "—";
        const score = Math.max(0, Math.min(100, Number(result.score) || 0));

        const date = result.submittedAt
          ? new Date(result.submittedAt).toLocaleDateString()
          : "—";

        const passed = Boolean(result.passed);

        return `
          <tr>
            <td>${escapeHTML(result.quizTitle || "Quiz")}</td>
            <td>${escapeHTML(courseName)}</td>
            <td>${score}%</td>
            <td>${escapeHTML(date)}</td>
            <td>
              <span class="status ${passed ? "passed" : "failed"}">
                ${passed ? "Passed" : "Not Passed"}
              </span>
            </td>
          </tr>
        `;
      }).join("");
    }

    // ---------- INITIALIZE ----------
    renderSummary();
    renderCourses();
    renderQuizResults();