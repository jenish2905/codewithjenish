
    // ---------- LOGIN ----------
    let user;

    try {
      user = JSON.parse(localStorage.getItem("loggedInUser"));
    } catch (error) {
      user = null;
    }

    if (!user || !user.email) {
      window.location.href = "login.html";
    }

    // ---------- DATA ----------
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

    const email = String(user.email).toLowerCase();

    const myEnrollments = enrollments.filter(
      enrollment =>
        String(enrollment.userEmail || "").toLowerCase() === email
    );

    const select = document.getElementById("courseSelect");
    const certificate = document.getElementById("certificate");
    const message = document.getElementById("message");
    const printBtn = document.getElementById("printBtn");

    let completedCourses = [];

    // ---------- COURSE COMPLETION ----------
    function getCourse(courseId) {
      return courses.find(
        course => String(course.id) === String(courseId)
      );
    }

    function getCompletion(enrollment) {
      const courseLessons = lessons.filter(
        lesson => String(lesson.courseId) === String(enrollment.courseId)
      );

      const completedIds = Array.isArray(enrollment.completedLessonIds)
        ? enrollment.completedLessonIds
        : [];

      // We require lesson records and completed lesson IDs
      // to verify completion reliably.
      if (courseLessons.length === 0) {
        return {
          complete: false,
          completed: 0,
          total: 0
        };
      }

      const completed = courseLessons.filter(lesson =>
        completedIds.some(id => String(id) === String(lesson.id))
      ).length;

      return {
        complete: completed === courseLessons.length,
        completed,
        total: courseLessons.length
      };
    }

    // ---------- POPULATE SELECT ----------
    function loadCompletedCourses() {
      completedCourses = myEnrollments
        .map(enrollment => {
          const course = getCourse(enrollment.courseId);
          const progress = getCompletion(enrollment);

          return {
            enrollment,
            course,
            progress
          };
        })
        .filter(item => item.course && item.progress.complete);

      if (completedCourses.length === 0) {
        message.innerHTML = `
          No completed courses found yet.
          <br>
          Complete all lessons in a course to unlock its certificate.
          <br>
          <a href="my-progress.html">View My Progress</a>
        `;
        return;
      }

      completedCourses.forEach(item => {
        const option = document.createElement("option");
        option.value = String(item.enrollment.courseId);
        option.textContent = item.course.name;
        select.appendChild(option);
      });

      message.textContent = "Select a completed course to view your certificate.";
    }

    // ---------- CERTIFICATE ID ----------
    function makeCertificateId(courseId) {
      const raw = `${email}|${courseId}`;
      let hash = 0;

      for (let i = 0; i < raw.length; i++) {
        hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
      }

      return "CWJ-" + hash.toString(16).toUpperCase().padStart(8, "0");
    }

    // ---------- DISPLAY CERTIFICATE ----------
    function showCertificate(courseId) {
      const item = completedCourses.find(
        entry => String(entry.enrollment.courseId) === String(courseId)
      );

      if (!item) {
        certificate.classList.add("hidden");
        printBtn.disabled = true;
        message.classList.remove("hidden");
        return;
      }

      const { enrollment, course } = item;

      const completedAt =
        enrollment.completedAt ||
        enrollment.lastAccessed ||
        enrollment.enrolledAt;

      const date = completedAt
        ? new Date(completedAt)
        : new Date();

      document.getElementById("studentName").textContent =
        user.name || "Student";

      document.getElementById("courseName").textContent =
        course.name;

      document.getElementById("completionDate").textContent =
        date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric"
        });

      document.getElementById("certificateId").textContent =
        makeCertificateId(course.id);

      certificate.classList.remove("hidden");
      message.classList.add("hidden");
      printBtn.disabled = false;
    }

    select.addEventListener("change", () => {
      showCertificate(select.value);
    });

    // ---------- START ----------
    loadCompletedCourses();
