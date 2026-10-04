  let user;
  try {
    user = JSON.parse(localStorage.getItem("loggedInUser"));
  } catch {
    user = null;
  }

  if (!user || !user.email) {
    window.location.href = "login.html";
  }

  const STORAGE_KEY = "courses";
  const grid = document.getElementById("courseGrid");
  const searchInput = document.getElementById("search");
  const categoryFilter = document.getElementById("categoryFilter");

  function readCourses() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    })[ch]);
  }

  function safeImageURL(value) {
    if (!value) return "";
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function populateCategories(courses) {
    const current = categoryFilter.value;
    const categories = [...new Set(
      courses.map(course => course.category).filter(Boolean)
    )].sort();

    categoryFilter.innerHTML =
      '<option value="all">All categories</option>' +
      categories.map(category =>
        `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
      ).join("");

    if (categories.includes(current)) categoryFilter.value = current;
  }

  function renderCourses() {
    const allCourses = readCourses();
    const published = allCourses.filter(course => course.status === "published");

    populateCategories(published);

    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    const filtered = published.filter(course => {
      const matchesSearch =
        String(course.name || "").toLowerCase().includes(query) ||
        String(course.description || "").toLowerCase().includes(query) ||
        String(course.category || "").toLowerCase().includes(query);

      return matchesSearch &&
        (category === "all" || course.category === category);
    });

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty">
          <h2>No courses found</h2>
          <p>Try another search or check back later for new courses.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(course => {
      const imageURL = safeImageURL(course.image);
      const imageMarkup = imageURL
        ? `<img src="${escapeHTML(imageURL)}" alt="${escapeHTML(course.name)}" loading="lazy">`
        : escapeHTML(course.icon || "📘");

      return `
        <article class="card">
          <div class="course-image">${imageMarkup}</div>
          <div class="card-content">
            <span class="category">${escapeHTML(course.category || "Course")}</span>
            <h2>${escapeHTML(course.name || "Untitled Course")}</h2>
            <p class="description">${escapeHTML(course.description || "Explore this course and start learning.")}</p>
            <div class="meta">
              <span>📖 ${Number(course.lessons || 0)} lessons</span>
              <span class="price">${Number(course.price || 0) === 0
                ? "Free"
                : "₹" + Number(course.price).toLocaleString("en-IN")}</span>
            </div>
            <a class="btn" href="course-details.html?id=${encodeURIComponent(course.id)}">
              View Course
            </a>
          </div>
        </article>
      `;
    }).join("");
  }

  searchInput.addEventListener("input", renderCourses);
  categoryFilter.addEventListener("change", renderCourses);

  // If admin edits courses in another browser tab, refresh the student catalog.
  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) renderCourses();
  });

  renderCourses();
