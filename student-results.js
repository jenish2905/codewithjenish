    // Authentication
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) {
        window.location.href = "login.html";
    }

    if (user) {
        document.getElementById("studentName").textContent =
            user.name || "Student";
    }

    // Data
    const allResults =
        JSON.parse(localStorage.getItem("quizResults")) || [];

    // Only current student's results
    const studentResults = allResults
        .filter(result => result.userEmail === user.email)
        .sort((a, b) =>
            new Date(b.submittedAt) - new Date(a.submittedAt)
        );

    // Summary
    function renderStats() {
        const count = studentResults.length;

        const average = count
            ? Math.round(
                studentResults.reduce(
                    (sum, result) => sum + Number(result.score || 0), 0
                ) / count
            )
            : 0;

        const passed = studentResults.filter(
            result => result.passed === true
        ).length;

        const highest = count
            ? Math.max(...studentResults.map(
                result => Number(result.score || 0)
            ))
            : 0;

        document.getElementById("attemptCount").textContent = count;
        document.getElementById("averageScore").textContent = average + "%";
        document.getElementById("passedCount").textContent = passed;
        document.getElementById("highestScore").textContent = highest + "%";
    }

    // Date formatting
    function formatDate(dateString) {
        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "Unknown date";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    // History table
    function renderResults() {
        const body = document.getElementById("resultsBody");
        const empty = document.getElementById("emptyState");
        const tableArea = document.getElementById("tableArea");

        const search =
            document.getElementById("searchInput").value
                .trim().toLowerCase();

        const filter =
            document.getElementById("statusFilter").value;

        const filtered = studentResults.filter(result => {
            const matchesSearch =
                (result.quizTitle || "").toLowerCase().includes(search) ||
                (result.courseName || "").toLowerCase().includes(search);

            const matchesStatus =
                filter === "all" ||
                (filter === "passed" && result.passed === true) ||
                (filter === "failed" && result.passed === false);

            return matchesSearch && matchesStatus;
        });

        body.innerHTML = "";

        if (!filtered.length) {
            tableArea.classList.add("hidden");
            empty.classList.remove("hidden");
            return;
        }

        tableArea.classList.remove("hidden");
        empty.classList.add("hidden");

        filtered.forEach(result => {
            const row = document.createElement("tr");

            const quizCell = document.createElement("td");
            const quizTitle = document.createElement("span");
            quizTitle.className = "quiz-title";
            quizTitle.textContent = result.quizTitle || "Untitled Quiz";

            const courseName = document.createElement("span");
            courseName.className = "course-name";
            courseName.textContent = result.courseName || "Course";

            quizCell.append(quizTitle, courseName);

            const dateCell = document.createElement("td");
            dateCell.textContent = formatDate(result.submittedAt);

            const scoreCell = document.createElement("td");
            scoreCell.className = "score-cell";
            scoreCell.textContent = Number(result.score || 0) + "%";

            const correctCell = document.createElement("td");
            correctCell.textContent =
                `${result.correctAnswers || 0} / ${result.totalQuestions || 0}`;

            const statusCell = document.createElement("td");
            const status = document.createElement("span");
            status.className =
                "status " + (result.passed ? "pass" : "fail");

            status.innerHTML = result.passed
                ? '<i class="fa-solid fa-check"></i> Passed'
                : '<i class="fa-solid fa-xmark"></i> Failed';

            statusCell.appendChild(status);

            row.append(
                quizCell,
                dateCell,
                scoreCell,
                correctCell,
                statusCell
            );

            body.appendChild(row);
        });
    }

    // Performance bars: latest attempt for each quiz
    function renderPerformance() {
        const container =
            document.getElementById("performanceList");

        container.innerHTML = "";

        const latestByQuiz = new Map();

        studentResults.forEach(result => {
            if (!latestByQuiz.has(result.quizId)) {
                latestByQuiz.set(result.quizId, result);
            }
        });

        const latest = [...latestByQuiz.values()];

        if (!latest.length) {
            container.textContent =
                "Your performance chart will appear after your first quiz.";
            container.style.color = "var(--muted)";
            return;
        }

        latest.forEach(result => {
            const item = document.createElement("div");
            item.className = "performance-item";

            const label = document.createElement("div");
            label.className = "performance-label";
            label.textContent = result.quizTitle || "Quiz";

            const bar = document.createElement("div");
            bar.className = "bar";

            const fill = document.createElement("div");
            fill.className = "bar-fill";
            fill.style.width =
                Math.min(100, Math.max(0, Number(result.score || 0))) + "%";

            bar.appendChild(fill);

            const value = document.createElement("div");
            value.className = "bar-value";
            value.textContent = Number(result.score || 0) + "%";

            item.append(label, bar, value);
            container.appendChild(item);
        });
    }

    function logout() {
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
    }

    renderStats();
    renderResults();
    renderPerformance();
