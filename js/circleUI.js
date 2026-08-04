/*
==========================================================
Momentum
Circles Workspace
Build v23.2.1
==========================================================
*/
"use strict";

const CircleUI = (() => {
    const state = {
        content: null,
        search: null,
        modalRoot: null
    };

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function splitList(value) {
        return String(value || "")
            .split(/\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function formTemplate(circle = null) {
        const item = circle || {
            id: "",
            date: DateUtils.today(),
            time: DateUtils.nowTime(),
            title: "",
            topic: "",
            guidingQuestion: "",
            summary: "",
            studentThemes: [],
            plannedQuestions: [],
            questionsRaised: [],
            followUpIdeas: [],
            participationNotes: "",
            absentStudentIds: [],
            outcomes: [],
            classGroup: ""
        };

        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal circle-modal" role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Whole-class conversation</p>
                            <h2>${circle ? "Edit Circle" : "Record a Circle"}</h2>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-circle-modal">×</button>
                    </div>

                    <form id="circleForm">
                        <input type="hidden" name="circleId"
                            value="${escapeHtml(item.id)}">
                        <div class="modal-body">
                            <div class="form-grid">
                                <div class="form-field">
                                    <label>Date</label>
                                    <input name="date" type="date"
                                        value="${escapeHtml(item.date)}" required>
                                </div>
                                <div class="form-field">
                                    <label>Time</label>
                                    <input name="time" type="time"
                                        value="${escapeHtml(item.time)}">
                                </div>
                            </div>

                            <div class="form-field">
                                <label>Main topic</label>
                                <input name="topic" required
                                    value="${escapeHtml(item.topic || item.title)}"
                                    placeholder="What was the Circle about?">
                            </div>

                            <div class="form-field">
                                <label>Planned questions</label>
                                <textarea name="plannedQuestions"
                                    placeholder="One question per line">${escapeHtml(
                                        (item.plannedQuestions || []).join("\n")
                                    )}</textarea>
                            </div>

                            <div class="form-field">
                                <label>Notes</label>
                                <textarea name="summary" class="simple-note-area"
                                    placeholder="What changed, mattered, or should be remembered?">${escapeHtml(item.summary)}</textarea>
                            </div>

                            <div class="form-grid simple-circle-notes">
                                <div class="form-field">
                                    <label>Questions</label>
                                    <textarea name="questionsRaised"
                                        placeholder="Questions students raised">${escapeHtml(item.questionsRaised.join("\n"))}</textarea>
                                </div>
                                <div class="form-field">
                                    <label>Ideas to revisit</label>
                                    <textarea name="followUpIdeas"
                                        placeholder="Topics or actions to return to">${escapeHtml(item.followUpIdeas.join("\n"))}</textarea>
                                </div>
                            </div>

                            <fieldset class="circle-attendance-fieldset">
                                <legend>Students absent</legend>
                                <p class="field-help">Check only students who were absent.</p>
                                <div class="circle-attendance-grid">
                                    ${StudentManager.getStudents({ includeArchived: false })
                                        .sort((a, b) => (
                                            a.profile.preferredName ||
                                            a.profile.firstName ||
                                            ""
                                        ).localeCompare(
                                            b.profile.preferredName ||
                                            b.profile.firstName ||
                                            ""
                                        ))
                                        .map((student) => {
                                            const name = student.profile.preferredName ||
                                                [student.profile.firstName, student.profile.lastName]
                                                    .filter(Boolean).join(" ") ||
                                                "Student";
                                            return `
                                                <label class="circle-attendance-option">
                                                    <input type="checkbox"
                                                        name="absentStudentIds"
                                                        value="${escapeHtml(student.id)}"
                                                        ${item.absentStudentIds?.includes(student.id) ? "checked" : ""}>
                                                    <span>${escapeHtml(name)}</span>
                                                </label>
                                            `;
                                        }).join("")}
                                </div>
                            </fieldset>

                            <fieldset class="circle-outcome-fieldset">
                                <legend>Circle outcomes</legend>
                                <div class="circle-outcome-grid">
                                    ${[
                                        "Great discussion",
                                        "Highly engaged",
                                        "Revisit this topic",
                                        "Generated follow-up questions",
                                        "Students requested more discussion"
                                    ].map((outcome) => `
                                        <label>
                                            <input type="checkbox" name="outcomes"
                                                value="${escapeHtml(outcome)}"
                                                ${item.outcomes?.includes(outcome) ? "checked" : ""}>
                                            <span>${escapeHtml(outcome)}</span>
                                        </label>
                                    `).join("")}
                                </div>
                            </fieldset>
                        </div>

                        <div class="modal-footer">
                            <button class="button button-secondary" type="button"
                                data-action="close-circle-modal">Cancel</button>
                            <button class="button button-primary" type="submit">
                                Save Circle
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function renderCard(item, index) {
        return `
            <article class="circle-card circle-card-variant-${index % 4}">
                <div class="circle-card-date">
                    <span class="circle-record-label">Circle ${String(index + 1).padStart(2, "0")}</span>
                    <strong>${escapeHtml(DateUtils.formatDateTime(item.date, item.time))}</strong>
                </div>

                <div class="circle-card-main">
                    <h3>${escapeHtml(item.topic || item.title || "Class Circle")}</h3>
                    ${item.guidingQuestion ? `
                        <blockquote>${escapeHtml(item.guidingQuestion)}</blockquote>
                    ` : ""}
                    ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ""}

                    ${item.plannedQuestions?.length ? `
                        <div class="circle-section circle-planned-questions">
                            <strong>Planned questions</strong>
                            <ol>${item.plannedQuestions.map((question) =>
                                `<li>${escapeHtml(question)}</li>`
                            ).join("")}</ol>
                        </div>
                    ` : ""}

                    ${item.studentThemes.length ? `
                        <div class="circle-section">
                            <strong>Student themes</strong>
                            <div class="tag-list">
                                ${item.studentThemes.map((theme) =>
                                    `<span class="tag">${escapeHtml(theme)}</span>`
                                ).join("")}
                            </div>
                        </div>
                    ` : ""}

                    ${item.questionsRaised.length ? `
                        <div class="circle-section">
                            <strong>Questions raised</strong>
                            <ul>${item.questionsRaised.map((question) =>
                                `<li>${escapeHtml(question)}</li>`
                            ).join("")}</ul>
                        </div>
                    ` : ""}

                    ${item.followUpIdeas.length ? `
                        <div class="circle-section">
                            <strong>Follow-up ideas</strong>
                            <ul>${item.followUpIdeas.map((idea) =>
                                `<li>${escapeHtml(idea)}</li>`
                            ).join("")}</ul>
                        </div>
                    ` : ""}

                    ${item.absentStudentIds?.length ? `
                        <div class="circle-section">
                            <strong>Absent</strong>
                            <p>${escapeHtml(item.absentStudentIds.map((id) => {
                                const student = StudentManager.getStudent(id);
                                return student
                                    ? student.profile.preferredName ||
                                        [student.profile.firstName, student.profile.lastName]
                                            .filter(Boolean).join(" ")
                                    : "Former student";
                            }).join(", "))}</p>
                        </div>
                    ` : ""}

                    ${item.outcomes?.length ? `
                        <div class="circle-section">
                            <strong>Outcomes</strong>
                            <div class="tag-list">
                                ${item.outcomes.map((outcome) =>
                                    `<span class="tag">${escapeHtml(outcome)}</span>`
                                ).join("")}
                            </div>
                        </div>
                    ` : ""}
                </div>

                <div class="circle-card-actions">
                    <button class="button button-secondary button-small" type="button"
                        data-action="edit-circle" data-circle-id="${escapeHtml(item.id)}">
                        Edit
                    </button>
                    <button class="button button-danger button-small" type="button"
                        data-action="delete-circle" data-circle-id="${escapeHtml(item.id)}">
                        Delete
                    </button>
                </div>
            </article>
        `;
    }

    const FUTURE_CIRCLES_KEY = "momentum.futureCircleQuestions";

    function futureCircleQuestions() {
        try {
            const parsed = JSON.parse(localStorage.getItem(FUTURE_CIRCLES_KEY) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    }

    function saveFutureCircleQuestions(questions) {
        localStorage.setItem(FUTURE_CIRCLES_KEY, JSON.stringify([...new Set(questions)]));
        document.dispatchEvent(new CustomEvent("futureCircleQuestionsChanged"));
    }

    function renderFutureQuestionShelf() {
        const questions = futureCircleQuestions();
        if (!questions.length) return "";
        return `
            <section class="future-circle-shelf">
                <div class="panel-header">
                    <div><p class="eyebrow">Saved from Question Lab</p><h3>Future Circle Questions</h3></div>
                    <span>${questions.length} saved</span>
                </div>
                <div class="future-circle-question-list">
                    ${questions.map((question,index)=>`
                        <article>
                            <p>${escapeHtml(question)}</p>
                            <div class="card-actions">
                                <button class="button button-primary button-small" type="button"
                                    data-action="use-saved-circle-question"
                                    data-question="${escapeHtml(question)}">Plan Circle</button>
                                <button class="button button-secondary button-small" type="button"
                                    data-action="remove-saved-circle-question"
                                    data-question-index="${index}">Remove</button>
                            </div>
                        </article>`).join("")}
                </div>
            </section>`;
    }

    function render() {
        if (!state.content) return;
        const query = state.search ? state.search.value.trim().toLowerCase() : "";
        const circles = CircleManager.getCircles()
            .filter((item) => !query || [
                item.title,item.topic,item.guidingQuestion,item.summary,
                (item.plannedQuestions || []).join(" "),
                item.studentThemes.join(" "),item.questionsRaised.join(" "),
                item.followUpIdeas.join(" ")
            ].join(" ").toLowerCase().includes(query))
            .sort((a,b)=>{
                const bd=DateUtils.combineLocalDateTime(b.date,b.time||"12:00")||new Date(b.createdAt);
                const ad=DateUtils.combineLocalDateTime(a.date,a.time||"12:00")||new Date(a.createdAt);
                return bd-ad;
            });

        state.content.innerHTML = `
            ${renderFutureQuestionShelf()}
            ${circles.length ? `
                <div class="circle-list">${circles.map(renderCard).join("")}</div>
            ` : `
                <div class="empty-state">
                    <h3>${query ? "No matching circles" : "No circles recorded yet"}</h3>
                    <p>${query ? "Try a different topic, question, or theme." :
                        "Record the first class circle to begin a topic history."}</p>
                </div>
            `}
        `;
    }

    function closeModal() {
        state.modalRoot.innerHTML = "";
        document.body.style.overflow = "";
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;

        const action = target.dataset.action;
        if (action === "new-circle") {
            state.modalRoot.innerHTML = formTemplate();
            document.body.style.overflow = "hidden";
        } else if (action === "edit-circle") {
            const item = CircleManager.getCircle(target.dataset.circleId);
            if (item) {
                state.modalRoot.innerHTML = formTemplate(item);
                document.body.style.overflow = "hidden";
            }
        } else if (action === "delete-circle") {
            if (window.confirm("Delete this circle record?")) {
                CircleManager.removeCircle(target.dataset.circleId);
                App.showToast("Circle deleted.");
            }
        } else if (action === "add-question-to-existing-circle") {
            const item = CircleManager.getCircle(target.dataset.circleId);
            const question = target.dataset.question || "";
            if (!item || !question) return;

            const plannedQuestions = [
                ...(item.plannedQuestions || [])
            ];
            if (!plannedQuestions.includes(question)) {
                plannedQuestions.push(question);
            }

            CircleManager.updateCircle(item.id, { plannedQuestions });
            closeModal();
            document.dispatchEvent(new CustomEvent("momentumNavigate", {
                detail: { view: "circles" }
            }));
            App.showToast("Question added to Circle.");
        } else if (action === "create-circle-from-question") {
            const question = target.dataset.question || "";
            const preset = {
                id: "",
                date: DateUtils.today(),
                time: DateUtils.nowTime(),
                title: "Class Circle",
                topic: question,
                plannedQuestions: [question],
                summary: "",
                studentThemes: [],
                questionsRaised: [],
                followUpIdeas: [],
                participationNotes: "",
                absentStudentIds: [],
                outcomes: [],
                classGroup: ""
            };
            state.modalRoot.innerHTML = formTemplate(preset);
        } else if (action === "use-saved-circle-question") {
            const question = target.dataset.question || "";
            state.modalRoot.innerHTML = formTemplate({
                id:"",date:DateUtils.today(),time:DateUtils.nowTime(),
                title:"Class Circle",topic:question,plannedQuestions:[question],
                summary:"",studentThemes:[],questionsRaised:[],followUpIdeas:[],
                participationNotes:"",absentStudentIds:[],outcomes:[],classGroup:""
            });
            document.body.style.overflow = "hidden";
        } else if (action === "remove-saved-circle-question") {
            const index = Number(target.dataset.questionIndex);
            const questions = futureCircleQuestions();
            if (Number.isInteger(index) && index >= 0) {
                questions.splice(index,1);
                saveFutureCircleQuestions(questions);
                render();
            }
        } else if (action === "close-circle-modal") {
            closeModal();
        }
    }

    function handleSubmit(event) {
        if (event.target.id !== "circleForm") return;
        event.preventDefault();

        const data = new FormData(event.target);
        const circleId = String(data.get("circleId") || "");
        const payload = {
            date: data.get("date"),
            time: data.get("time"),
            classGroup: "",
            title: data.get("topic"),
            topic: data.get("topic"),
            guidingQuestion: "",
            summary: data.get("summary"),
            plannedQuestions: splitList(data.get("plannedQuestions")),
            studentThemes: [],
            questionsRaised: splitList(data.get("questionsRaised")),
            followUpIdeas: splitList(data.get("followUpIdeas")),
            participationNotes: "",
            absentStudentIds: data.getAll("absentStudentIds").map(String),
            outcomes: data.getAll("outcomes").map(String)
        };

        if (circleId) {
            CircleManager.updateCircle(circleId, payload);
            App.showToast("Circle updated.");
        } else {
            CircleManager.addCircle(payload);
            saveFutureCircleQuestions(
                futureCircleQuestions().filter(q => !payload.plannedQuestions.includes(q))
            );
            App.showToast("Circle saved.");
        }
        closeModal();
    }

    function questionCirclePickerTemplate(question) {
        const circles = CircleManager.getCircles()
            .sort((a, b) => {
                const ad = DateUtils.combineLocalDateTime(a.date, a.time || "12:00")
                    || new Date(a.createdAt || 0);
                const bd = DateUtils.combineLocalDateTime(b.date, b.time || "12:00")
                    || new Date(b.createdAt || 0);
                return ad - bd;
            });

        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal modal-small circle-question-picker"
                    role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Question Lab</p>
                            <h2>Add to Circle</h2>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-circle-modal">×</button>
                    </div>

                    <div class="modal-body">
                        <blockquote>${escapeHtml(question)}</blockquote>

                        <div class="circle-picker-list">
                            ${circles.length ? circles.map((circle) => `
                                <button type="button"
                                    data-action="add-question-to-existing-circle"
                                    data-circle-id="${escapeHtml(circle.id)}"
                                    data-question="${escapeHtml(question)}">
                                    <strong>${escapeHtml(
                                        circle.topic || circle.title || "Class Circle"
                                    )}</strong>
                                    <span>${escapeHtml(
                                        DateUtils.formatDateTime(circle.date, circle.time)
                                    )}</span>
                                </button>
                            `).join("") : `
                                <p class="empty-copy">No Circles have been created yet.</p>
                            `}
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="button button-secondary" type="button"
                            data-action="close-circle-modal">Cancel</button>
                        <button class="button button-primary" type="button"
                            data-action="create-circle-from-question"
                            data-question="${escapeHtml(question)}">
                            + New Circle
                        </button>
                    </div>
                </section>
            </div>
        `;
    }

    function openQuestionPicker(question) {
        if (!question) return;
        state.modalRoot.innerHTML = questionCirclePickerTemplate(question);
        document.body.style.overflow = "hidden";
    }

    function initialize() {
        state.content = document.getElementById("circlesContent");
        state.search = document.getElementById("circleSearchInput");
        state.modalRoot = document.getElementById("modalRoot");

        if (!state.content) return;
        CircleManager.initialize();
        state.search.addEventListener("input", render);
        document.addEventListener("click", handleClick);
        document.addEventListener("submit", handleSubmit);
        document.addEventListener(CircleManager.DATA_CHANGED_EVENT, render);
        document.addEventListener("futureCircleQuestionsChanged", render);
        document.addEventListener("openCircleForm", (event) => {
            const detail = event.detail || {};
            openQuestionPicker(detail.question || detail.topic || "");
        });
        render();
    }


    function openFromResource(resource) {
        if (!resource) return;
        const preset = {
            id: "",
            date: DateUtils.today(),
            time: DateUtils.nowTime(),
            classGroup: "",
            title: resource.title || "Class Circle",
            topic: resource.title || (resource.tags || []).slice(0, 3).join(", ") || "Class Circle",
            guidingQuestion: resource.essentialQuestion || "",
            summary: "",
            studentThemes: [],
            plannedQuestions: resource.prompts || [],
            questionsRaised: [],
            followUpIdeas: [
                resource.reflection || "",
                resource.activity || ""
            ].filter(Boolean),
            participationNotes: "",
            absentStudentIds: [],
            outcomes: []
        };
        state.modalRoot.innerHTML = formTemplate(preset);
        document.body.style.overflow = "hidden";
    }

    return Object.freeze({
        initialize,
        render,
        openFromResource,
        openQuestionPicker
    });
})();
