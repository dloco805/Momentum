/*
==========================================================
Momentum
Question Lab
Build v21.0.0
==========================================================
*/
"use strict";

const QuestionLabUI = (() => {
    const FAVORITES_KEY = "momentum.questionLabFavorites";
    const FUTURE_CIRCLES_KEY = "momentum.futureCircleQuestions";
    const COLLECTIONS = {"Big Life Questions": ["What does a successful life actually look like—and who gets to decide?", "What is something adults misunderstand about being a teenager today?", "Is it better to be respected, liked, trusted, or understood?", "When does quitting become a smart decision instead of giving up?", "What should every person learn before becoming an adult?", "Can someone be a good person and still make a terrible choice?", "What is worth failing at?", "How much should your past determine your future?", "Would you rather be excellent at one thing or pretty good at many things?", "What makes a life feel meaningful?"], "Curiosity Starters": ["Why do some ideas spread while better ideas disappear?", "What everyday object is overdue for a complete redesign?", "How does an app seem to know what you will watch next?", "Why do people willingly wait in line for hours?", "What makes one neighborhood feel alive and another feel empty?", "How could our school create almost no trash?", "Why do some sounds instantly change our mood?", "What question could you investigate using only things found in Lompoc?", "What hidden system affects your life every day?", "What would become possible if one common technology suddenly disappeared?"], "Community Challenges": ["What is one problem in Lompoc that teenagers could realistically help solve?", "Where in our community do people feel welcome—and where do they not?", "What local business should exist but does not?", "How could downtown become more interesting for young people?", "What public space would you redesign first, and why?", "How could transportation work better for teenagers?", "What local story deserves more attention?", "How could students make one neighborhood safer, healthier, or more connected?", "What resource exists locally that most students do not know about?", "What would make more young people want to stay in this community?"], "Entrepreneurship": ["What problem annoys people enough that they would pay to solve it?", "What business could you build around something you already enjoy?", "What product should exist but somehow does not?", "What local service could teenagers provide better than adults expect?", "What would make someone choose your business instead of a larger company?", "What is something people waste money on because the alternatives are bad?", "How could a boring business become memorable?", "What would you sell if you had to earn $100 this weekend?", "What could be rented instead of purchased?", "What small business could improve life at school?"], "Psychology & Human Behavior": ["Why do people procrastinate on things they genuinely care about?", "Why are embarrassing memories so hard to forget?", "What makes someone influential without having authority?", "Why do rumors move faster than corrections?", "When do people follow a crowd even when they disagree?", "Why can criticism from one person outweigh praise from ten?", "What makes people trust a stranger?", "Why do people defend beliefs after evidence proves them wrong?", "What makes a habit difficult to break?", "Why are some people energized by attention while others avoid it?"], "Pop Culture": ["What makes something go viral—and can it be designed?", "Are influencers celebrities, advertisers, or something else?", "Has streaming made entertainment better or just endless?", "What makes a fictional character feel real?", "Who shapes culture more today: artists, athletes, creators, or algorithms?", "When does inspiration become copying?", "What old movie, show, game, or song deserves a remake?", "Why do some trends return every twenty years?", "Should creators be responsible for how audiences use their work?", "What piece of pop culture says the most about this generation?"], "Future & Technology": ["What job will exist in twenty years that sounds strange today?", "What should robots or AI never be allowed to do?", "What would school look like if students designed it from scratch?", "Which technology would be hardest to explain to someone from 1926?", "What skill will become more valuable as AI improves?", "Would you trust an AI doctor, teacher, judge, or therapist—and why?", "What problem should technology stop trying to solve?", "How might social media look completely different in ten years?", "What human ability should never be automated?", "If privacy disappeared, what else would change?"], "Makers & Design": ["What could you build that would save a teacher ten minutes every day?", "How could you redesign a backpack for real student life?", "What object at school is badly designed?", "How could lunch lines become faster without adding staff?", "What could make bus travel safer or less stressful?", "How would you design a room that helps people focus?", "What could be made from materials people usually throw away?", "What simple invention could help someone with limited mobility?", "How could you make instructions impossible to misunderstand?", "What would you prototype if materials and cost did not matter?"], "Connection & Circle Questions": ["When do you feel most respected?", "What is something people often misunderstand about you?", "What makes it easier to be honest with someone?", "When have you felt truly included?", "What is a small act of kindness you still remember?", "What do you wish people asked you more often?", "What makes an apology feel sincere?", "How can someone disagree with you while still showing respect?", "What helps you feel safe enough to try something difficult?", "What is one thing a strong community does differently?"], "Random Curiosity": ["If gravity were half as strong, what would change first?", "What invention is wildly overrated?", "What animal would be most terrifying if it were the size of a horse?", "What rule does everyone follow without questioning?", "What ordinary object would confuse an alien most?", "If you could interview any person for ten minutes, what would you ask?", "What would happen if nobody needed sleep?", "Which smell should be turned into a flavor?", "What would become a sport if enough people watched it?", "What mystery would you solve if the answer had no practical value?"]};
    const state = {
        root: null,
        search: "",
        activeCollection: "",
        currentQuestion: "",
        favorites: new Set()
    };

    function esc(value) {
        return String(value ?? "")
            .replaceAll("&","&amp;").replaceAll("<","&lt;")
            .replaceAll(">","&gt;").replaceAll('"',"&quot;");
    }

    function allQuestions() {
        return Object.entries(COLLECTIONS).flatMap(([collection, items]) =>
            items.map((question) => ({ collection, question }))
        );
    }

    function loadFavorites() {
        try {
            state.favorites = new Set(JSON.parse(
                localStorage.getItem(FAVORITES_KEY) || "[]"
            ));
        } catch {
            state.favorites = new Set();
        }
    }

    function saveFavorites() {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...state.favorites]));
    }

    function randomQuestion() {
        const pool = allQuestions();
        return pool[Math.floor(Math.random() * pool.length)]?.question || "";
    }

    function addToNotepad(question) {
        if (typeof ActivityManager === "undefined") return;
        const existing = ActivityManager.getNotepad();
        const line = `• ${question}`;
        ActivityManager.saveNotepad(
            existing.trim() ? `${existing.trim()}\n${line}` : line
        );
        App.showToast("Question added to Activity Notepad.");
    }

    function loadFutureCircleQuestions() {
        try {
            const parsed = JSON.parse(localStorage.getItem(FUTURE_CIRCLES_KEY) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    }

    function saveForFutureCircle(question) {
        const saved = loadFutureCircleQuestions();
        if (!saved.includes(question)) {
            saved.push(question);
            localStorage.setItem(FUTURE_CIRCLES_KEY, JSON.stringify(saved));
            document.dispatchEvent(new CustomEvent("futureCircleQuestionsChanged"));
            App.showToast("Saved for a future Circle.");
        } else {
            App.showToast("Already saved for a future Circle.");
        }
    }

    function renderQuestionCard(item) {
        const favorite = state.favorites.has(item.question);
        return `
            <article class="question-lab-card">
                <span>${esc(item.collection)}</span>
                <blockquote>${esc(item.question)}</blockquote>
                <div class="question-card-actions">
                    <button class="button button-secondary button-small"
                        type="button" data-action="favorite-question"
                        data-question="${esc(item.question)}">
                        ${favorite ? "★ Favorited" : "☆ Favorite"}
                    </button>
                    <button class="button button-secondary button-small"
                        type="button" data-action="save-future-circle-question"
                        data-question="${esc(item.question)}">Save for Future Circle</button>
                    <button class="button button-secondary button-small"
                        type="button" data-action="question-to-circle"
                        data-question="${esc(item.question)}">Use in Circle</button>
                    <button class="button button-secondary button-small"
                        type="button" data-action="question-to-project-ideas"
                        data-question="${esc(item.question)}">
                        Project Idea
                    </button>
                    <button class="button button-secondary button-small"
                        type="button" data-action="question-to-notepad"
                        data-question="${esc(item.question)}">
                        Add to Notepad
                    </button>
                    <button class="button button-secondary button-small"
                        type="button" data-action="question-to-calendar"
                        data-question="${esc(item.question)}">
                        Add to Calendar
                    </button>
                    <button class="button button-secondary button-small"
                        type="button" data-action="copy-question"
                        data-question="${esc(item.question)}">
                        Copy
                    </button>
                </div>
            </article>
        `;
    }

    function render() {
        if (!state.root) return;
        if (!state.currentQuestion) state.currentQuestion = randomQuestion();

        const q = state.search.trim().toLowerCase();
        const visible = allQuestions().filter((item) =>
            (!state.activeCollection || item.collection === state.activeCollection) &&
            (!q || `${item.collection} ${item.question}`.toLowerCase().includes(q))
        );

        state.root.innerHTML = `
            <section class="question-spark">
                <div>
                    <p class="eyebrow">Today's Spark</p>
                    <blockquote>${esc(state.currentQuestion)}</blockquote>
                </div>
                <div class="card-actions">
                    <button class="button button-primary" type="button"
                        data-action="another-question">Another Question</button>
                    <button class="button button-secondary" type="button"
                        data-action="save-future-circle-question"
                        data-question="${esc(state.currentQuestion)}">Save for Future Circle</button>
                    <button class="button button-secondary" type="button"
                        data-action="question-to-circle"
                        data-question="${esc(state.currentQuestion)}">Use in Circle</button>
                    <button class="button button-secondary" type="button"
                        data-action="question-to-project-ideas"
                        data-question="${esc(state.currentQuestion)}">Project Idea</button>
                    <button class="button button-secondary" type="button"
                        data-action="question-to-notepad"
                        data-question="${esc(state.currentQuestion)}">Add to Notepad</button>
                </div>
            </section>

            <div class="question-lab-toolbar">
                <label class="search-field">
                    <span aria-hidden="true">⌕</span>
                    <input id="questionLabSearch" type="search"
                        value="${esc(state.search)}"
                        placeholder="Search music, cars, money, animals, technology...">
                </label>
                <button class="question-filter ${!state.activeCollection ? "is-active" : ""}"
                    type="button" data-question-collection="">All Questions</button>
                <button class="question-filter ${state.activeCollection === "favorites" ? "is-active" : ""}"
                    type="button" data-question-collection="favorites">★ Favorites</button>
            </div>

            <div class="question-collection-grid">
                ${Object.entries(COLLECTIONS).map(([name, items]) => `
                    <button class="question-collection-card
                        ${state.activeCollection === name ? "is-active" : ""}"
                        type="button" data-question-collection="${esc(name)}">
                        <strong>${esc(name)}</strong>
                        <span>${items.length} questions</span>
                    </button>
                `).join("")}
            </div>

            <div class="question-results-heading">
                <h3>${state.activeCollection === "favorites"
                    ? "Favorite Questions"
                    : esc(state.activeCollection || "Browse Questions")
                }</h3>
                <span>${state.activeCollection === "favorites"
                    ? state.favorites.size
                    : visible.length
                }</span>
            </div>

            <div class="question-lab-list">
                ${(state.activeCollection === "favorites"
                    ? allQuestions().filter((item) => state.favorites.has(item.question))
                    : visible
                ).map(renderQuestionCard).join("") ||
                    `<div class="empty-state"><h3>No questions found</h3>
                    <p>Try another topic or collection.</p></div>`
                }
            </div>
        `;
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action], [data-question-collection]");
        if (!target) return;

        if (target.hasAttribute("data-question-collection")) {
            state.activeCollection = target.dataset.questionCollection;
            render();
            return;
        }

        const action = target.dataset.action;
        const question = target.dataset.question || state.currentQuestion;

        if (action === "another-question") {
            state.currentQuestion = randomQuestion();
            render();
        } else if (action === "favorite-question") {
            state.favorites.has(question)
                ? state.favorites.delete(question)
                : state.favorites.add(question);
            saveFavorites();
            render();
        } else if (action === "question-to-notepad") {
            addToNotepad(question);
        } else if (action === "save-future-circle-question") {
            saveForFutureCircle(question);
        } else if (action === "question-to-circle") {
            document.dispatchEvent(new CustomEvent("openCircleForm", {
                detail: { question }
            }));
        } else if (action === "copy-question") {
            navigator.clipboard?.writeText(question);
            App.showToast("Question copied.");
        }
    }

    function initialize() {
        state.root = document.getElementById("questionLabContent");
        if (!state.root) return;
        loadFavorites();

        document.addEventListener("click", handleClick);
        document.addEventListener("input", (event) => {
            if (event.target.id !== "questionLabSearch") return;
            state.search = event.target.value;
            render();
            const input = document.getElementById("questionLabSearch");
            input?.focus();
            input?.setSelectionRange(state.search.length, state.search.length);
        });
        render();
    }

    function getStudentQuestion(student) {
        const interests = [
            ...(student?.profile?.interests || []),
            ...(student?.profile?.passions || []),
            ...(student?.journey?.careerInterests || [])
        ].map((item) => String(item).toLowerCase());

        const pool = allQuestions();
        const matched = pool.filter((item) =>
            interests.some((interest) =>
                `${item.collection} ${item.question}`.toLowerCase().includes(interest)
            )
        );

        const choices = matched.length ? matched : pool;
        if (!choices.length) return "";

        const seed = String(student?.id || student?.profile?.preferredName || "student")
            .split("")
            .reduce((total, character) => total + character.charCodeAt(0), 0);

        return choices[seed % choices.length].question;
    }

    function questionsForSituation() {
        return allQuestions().map((item) => item.question);
    }

    return Object.freeze({
        initialize,
        render,
        getStudentQuestion,
        questionsForSituation
    });
})();
