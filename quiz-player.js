    // Authentication
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) {
        window.location.href = "login.html";
    }

    if (user) {
        document.getElementById("studentName").textContent =
            user.name || "Student";
    }

    // URL parameters
    const params = new URLSearchParams(window.location.search);
    const quizId = Number(params.get("id"));

    // Load data
    const quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    let results = JSON.parse(localStorage.getItem("quizResults")) || [];

    const quiz = quizzes.find(q => Number(q.id) === quizId);

    if (!quiz || quiz.status !== "published") {
        alert("Quiz not found or not published.");
        window.location.href = "courses.html";
    }

    const course = courses.find(c =>
        Number(c.id) === Number(quiz.courseId)
    );

    const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];

    const enrollment = enrollments.find(e =>
        e.userEmail === user.email &&
        Number(e.courseId) === Number(quiz.courseId)
    );

    if (!enrollment) {
        alert("Please enroll in this course before taking the quiz.");
        window.location.href =
            "course-details.html?id=" + quiz.courseId;
    }

    // Normalize questions from admin quiz format
    const questions = Array.isArray(quiz.questionData)
        ? quiz.questionData
        : [];

    let currentQuestion = 0;
    let answers = {};
    let submitted = false;

    // Initialize page
    document.getElementById("quizTitle").textContent = quiz.title;
    document.getElementById("quizDescription").textContent =
        quiz.description || "Test your knowledge.";

    document.getElementById("questionCount").textContent =
        questions.length + " Questions";

    document.getElementById("passingScore").textContent =
        "Passing: " + (quiz.passing || 50) + "%";

    document.getElementById("courseName").textContent =
        course ? course.name : "Course";

    function renderQuestion() {
        if (!questions.length) {
            document.getElementById("quizArea").innerHTML =
                "<p>No questions have been added to this quiz yet.</p>";
            return;
        }

        const question = questions[currentQuestion];

        document.getElementById("questionPosition").textContent =
            `Question ${currentQuestion + 1} of ${questions.length}`;

        document.getElementById("questionText").textContent =
            question.question || question.text || "Untitled question";

        document.getElementById("answeredCount").textContent =
            Object.keys(answers).length + " answered";

        const optionsContainer = document.getElementById("options");
        optionsContainer.innerHTML = "";

        const options = question.options || [];

        options.forEach((option, index) => {
            const label = document.createElement("label");
            label.className = "option";

            if (answers[currentQuestion] === index) {
                label.classList.add("selected");
            }

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "answer";
            input.value = index;
            input.checked = answers[currentQuestion] === index;

            input.addEventListener("change", () => {
                answers[currentQuestion] = index;
                renderQuestion();
            });

            const text = document.createElement("span");
            text.textContent = option;

            label.appendChild(input);
            label.appendChild(text);
            optionsContainer.appendChild(label);
        });

        document.getElementById("previousBtn").disabled =
            currentQuestion === 0;

        document.getElementById("nextBtn").disabled =
            currentQuestion === questions.length - 1;

        renderNavigator();
    }

    function renderNavigator() {
        const grid = document.getElementById("questionGrid");
        grid.innerHTML = "";

        questions.forEach((_, index) => {
            const button = document.createElement("button");
            button.className = "question-number";
            button.textContent = index + 1;

            if (index === currentQuestion) {
                button.classList.add("active");
            }

            if (answers[index] !== undefined) {
                button.classList.add("answered");
            }

            button.onclick = () => {
                currentQuestion = index;
                renderQuestion();
            };

            grid.appendChild(button);
        });
    }

    function previousQuestion() {
        if (currentQuestion > 0) {
            currentQuestion--;
            renderQuestion();
        }
    }

    function nextQuestion() {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            renderQuestion();
        }
    }

    function submitQuiz() {
        if (submitted) return;

        const unanswered = questions.length - Object.keys(answers).length;

        const confirmation = unanswered > 0
            ? `You have ${unanswered} unanswered question(s). Submit anyway?`
            : "Are you sure you want to submit the quiz?";

        if (!confirm(confirmation)) return;

        submitted = true;
        calculateResult();
    }

    function calculateResult() {
        let correct = 0;

        questions.forEach((question, index) => {
            const selected = answers[index];

            // Admin quiz should store correctAnswer as option index.
            const correctAnswer = Number(question.correctAnswer);

            if (
                selected !== undefined &&
                selected === correctAnswer
            ) {
                correct++;
            }
        });

        const total = questions.length;
        const percentage = total > 0
            ? Math.round((correct / total) * 100)
            : 0;

        const passing = Number(quiz.passing || 50);
        const passed = percentage >= passing;

        const result = {
            id: Date.now(),
            quizId: quiz.id,
            quizTitle: quiz.title,
            courseId: quiz.courseId,
            courseName: course ? course.name : "",
            userEmail: user.email,
            userName: user.name || "Student",
            totalQuestions: total,
            correctAnswers: correct,
            score: percentage,
            passed,
            submittedAt: new Date().toISOString()
        };

        results.push(result);
        localStorage.setItem("quizResults", JSON.stringify(results));

        // Update attempt and average stats in the demo data
        const quizIndex = quizzes.findIndex(q =>
            Number(q.id) === Number(quiz.id)
        );

        if (quizIndex !== -1) {
            const oldAttempts = Number(quizzes[quizIndex].attempts || 0);
            const oldAverage = Number(quizzes[quizIndex].average || 0);

            quizzes[quizIndex].attempts = oldAttempts + 1;
            quizzes[quizIndex].average = Math.round(
                ((oldAverage * oldAttempts) + percentage) /
                (oldAttempts + 1)
            );

            localStorage.setItem("quizzes", JSON.stringify(quizzes));
        }

        showResult(correct, total, percentage, passed);
    }

    function showResult(correct, total, percentage, passed) {
        document.getElementById("quizArea").classList.add("hidden");
        document.getElementById("resultArea").classList.remove("hidden");

        document.getElementById("scoreText").textContent =
            percentage + "%";

        document.getElementById("resultTitle").textContent =
            passed ? "Congratulations!" : "Keep Practicing!";

        document.getElementById("resultMessage").textContent =
            passed
                ? "You passed this quiz. Keep learning and improving your skills!"
                : "You did not reach the passing score. Review the lessons and try again.";

        document.getElementById("resultIcon").innerHTML =
            passed
                ? '<i class="fa-solid fa-trophy"></i>'
                : '<i class="fa-solid fa-book-open"></i>';

        document.getElementById("correctCount").textContent = correct;
        document.getElementById("wrongCount").textContent = total - correct;
        document.getElementById("totalCount").textContent = total;
    }

    function goToCourse() {
        window.location.href =
            "course-details.html?id=" + quiz.courseId;
    }

    function logout() {
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
    }

    if (user && quiz && enrollment && questions.length > 0) {
        renderQuestion();
    }
 user = JSON.parse(
      localStorage.getItem("loggedInUser") || "null"
    );

    if (!user) location.href = "login.html";

     quizzes = JSON.parse(
      localStorage.getItem("quizzes") || "[]"
    );
    enrollments = JSON.parse(
      localStorage.getItem("enrollments") || "[]"
    );
     results = JSON.parse(
      localStorage.getItem("quizResults") || "[]"
    );

    const enrolledCourseIds = enrollments
      .filter(e => e.userEmail?.toLowerCase() ===
        user.email?.toLowerCase())
      .map(e => String(e.courseId));

    const available = quizzes.filter(q =>
      q.published === true &&
      enrolledCourseIds.includes(String(q.courseId))
    );

    const list = document.getElementById("quizList");

    if (!available.length) {
      list.textContent =
        "No quizzes available. Enroll in a course or check again later.";
    }

    available.forEach(quiz => {
      const card = document.createElement("section");
      card.className = "card";

      const title = document.createElement("h2");
      title.textContent = quiz.quizTitle || quiz.title || "Quiz";

      const description = document.createElement("p");
      description.className = "muted";
      description.textContent = quiz.description || quiz.courseName || "";

      const count = document.createElement("p");
      count.textContent =
        `${quiz.questionData?.length || 0} questions`;

      const previousResults = results.filter(r =>
        String(r.quizId) === String(quiz.id) &&
        r.userEmail?.toLowerCase() === user.email?.toLowerCase()
      );

      const attempts = document.createElement("p");
      attempts.className = "muted";
      attempts.textContent =
        `Attempts: ${previousResults.length}`;

      const start = document.createElement("a");
      start.href =
        `quiz-player.html?id=${encodeURIComponent(quiz.id)}`;
      start.textContent = "Start Quiz";

      card.append(title, description, count, attempts, start);
      list.appendChild(card);
    });