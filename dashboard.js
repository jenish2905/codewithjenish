const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");
if (!user || !user.email) {
  location.href = "login.html";
} else {
  document.getElementById("welcome").textContent =
    "Welcome, " + (user.name || "Student") + "!";
}
function getData(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function safe(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
}
function renderDashboard() {
  const email = String(user.email).toLowerCase();
  const enrollments = getData("enrollments").filter(
    (e) => String(e.userEmail || "").toLowerCase() === email,
  );
  const results = getData("quizResults").filter(
    (r) => String(r.userEmail || "").toLowerCase() === email,
  );
  const courses = getData("courses");
  const lessons = getData("lessons");
  let totalProgress = 0;
  let completed = 0;
  enrollments.forEach((e) => {
    const courseLessons = lessons.filter(
      (l) => String(l.courseId) === String(e.courseId) && l.published === true,
    );
    const done = Array.isArray(e.completedLessonIds)
      ? e.completedLessonIds.length
      : Number(e.completedLessons) || 0;
    const progress = courseLessons.length
      ? Math.min(100, Math.round((done / courseLessons.length) * 100))
      : Math.min(100, Number(e.progress) || 0);
    totalProgress += progress;
    completed += done;
  });
  document.getElementById("courseCount").textContent = enrollments.length;
  document.getElementById("averageProgress").textContent = enrollments.length
    ? Math.round(totalProgress / enrollments.length) + "%"
    : "0%";
  document.getElementById("completedLessons").textContent = completed;
  document.getElementById("quizAttempts").textContent = results.length;
  const container = document.getElementById("courseList");
  container.replaceChildren();
  if (!enrollments.length) {
    container.innerHTML = ` <div class="card"> <p class="muted">You haven't enrolled in any courses yet.</p> <a href="student-enrollments.html" style="color:#00ffff;display:inline-block;margin-top:12px"> Explore enrollment options → </a> </div>`;
    return;
  }
  enrollments.forEach((e) => {
    const course = courses.find((c) => String(c.id) === String(e.courseId));
    const courseLessons = lessons.filter(
      (l) => String(l.courseId) === String(e.courseId) && l.published === true,
    );
    const done = Array.isArray(e.completedLessonIds)
      ? e.completedLessonIds.length
      : Number(e.completedLessons) || 0;
    const progress = courseLessons.length
      ? Math.min(100, Math.round((done / courseLessons.length) * 100))
      : Math.min(100, Number(e.progress) || 0);
    const card = document.createElement("article");
    card.className = "card course-card";
    card.innerHTML = ` <h3>${safe(e.courseName || course?.name || "Course")}</h3> <p class="muted">${done} lessons completed</p> <div class="progress-track"> <div class="progress-bar" style="width:${progress}%"></div> </div> <p class="muted">${progress}% complete</p> <a href="course-details.html?id=${encodeURIComponent(e.courseId)}"> Open Course → </a> `;
    container.appendChild(card);
  });
}
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  location.href = "login.html";
});
renderDashboard();
