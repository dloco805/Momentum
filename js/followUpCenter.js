/*
==========================================================
Momentum
Follow-Up Center Module
Build v19.0.0
File: js/followUpCenter.js
==========================================================
*/

"use strict";

const FollowUpCenter = (() => {
    const state = {
        content: null,
        summary: null,
        search: null,
        statusFilter: null,
        advisorFilter: null,
        ownerFilter: null,
        priorityFilter: null,
        focusedStudentId: "",
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

    function displayName(student) {
        return student.profile.preferredName ||
            [student.profile.firstName, student.profile.lastName].filter(Boolean).join(" ") ||
            "Unnamed Student";
    }

    function formatDate(value) {
        return DateUtils.formatLongDate(value);
    }

    function startOfToday() {
        return DateUtils.startOfToday().getTime();
    }

    function dateValue(value) {
        const date = DateUtils.parseLocalDate(value);
        return date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() : null;
    }

    function getAllFollowUps() {
        return StudentManager.getStudents({ includeArchived: false })
            .flatMap((student) => student.journey.followUps.map((item) => ({
                ...item,
                studentId: student.id,
                studentName: displayName(student),
                grade: student.profile.grade,
                advisor: student.profile.advisor
            })));
    }

    function isCompleted(item) {
        return item.status === "completed" || Boolean(item.completedAt);
    }

    function classify(item) {
        if (isCompleted(item)) {
            return "completed";
        }

        const due = dateValue(item.dueDate);
        if (due === null) {
            return "unscheduled";
        }

        const today = startOfToday();

        if (due < today) {
            return "overdue";
        }

        if (due === today) {
            return "today";
        }

        const sevenDays = today + (7 * 86400000);
        if (due <= sevenDays) {
            return "thisweek";
        }

        return "later";
    }

    function populateAdvisorFilter() {
        const current = state.advisorFilter.value;
        const advisors = [...new Set(
            StudentManager.getStudents({ includeArchived: false })
                .map((student) => student.profile.advisor)
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));

        state.advisorFilter.innerHTML = `
            <option value="">All advisors</option>
            ${advisors.map((advisor) => `
                <option value="${escapeHtml(advisor)}">${escapeHtml(advisor)}</option>
            `).join("")}
        `;

        state.advisorFilter.value = advisors.includes(current) ? current : "";
    }

    function getFilteredFollowUps() {
        const query = state.search.value.trim().toLowerCase();
        const status = state.statusFilter.value;
        const advisor = state.advisorFilter.value;
        const owner = state.ownerFilter.value;
        const priority = state.priorityFilter.value;
        const today = startOfToday();

        return getAllFollowUps()
            .filter((item) => {
                const category = classify(item);

                if (state.focusedStudentId && item.studentId !== state.focusedStudentId) {
                    return false;
                }

                if (advisor && item.advisor !== advisor) {
                    return false;
                }

                if (owner && item.assignedTo !== owner) {
                    return false;
                }

                if (priority && item.priority !== priority) {
                    return false;
                }

                if (query) {
                    const searchable = [
                        item.title,
                        item.description,
                        item.studentName,
                        item.grade,
                        item.advisor
                    ].join(" ").toLowerCase();

                    if (!searchable.includes(query)) {
                        return false;
                    }
                }

                if (status === "open" && isCompleted(item)) {
                    return false;
                }
                if (status === "overdue" && category !== "overdue") {
                    return false;
                }
                if (status === "upcoming" && !["today", "thisweek", "later"].includes(category)) {
                    return false;
                }
                if (status === "unscheduled" && category !== "unscheduled") {
                    return false;
                }
                if (status === "completed" && category !== "completed") {
                    return false;
                }

                return true;
            })
            .sort((a, b) => {
                const aCompleted = isCompleted(a);
                const bCompleted = isCompleted(b);

                if (aCompleted !== bCompleted) {
                    return aCompleted ? 1 : -1;
                }

                const aDue = dateValue(a.dueDate);
                const bDue = dateValue(b.dueDate);

                if (aDue === null && bDue === null) {
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                }
                if (aDue === null) {
                    return 1;
                }
                if (bDue === null) {
                    return -1;
                }

                return aDue - bDue;
            });
    }

    function renderSummary(items) {
        const all = getAllFollowUps();
        const overdue = all.filter((item) => classify(item) === "overdue").length;
        const today = all.filter((item) => classify(item) === "today").length;
        const upcoming = all.filter((item) => ["thisweek", "later"].includes(classify(item))).length;
        const unscheduled = all.filter((item) => classify(item) === "unscheduled").length;

        state.summary.innerHTML = `
            <article class="stat-card">
                <p>Visible follow-ups</p>
                <strong>${items.length}</strong>
                <span>Current filters</span>
            </article>
            <article class="stat-card">
                <p>Overdue</p>
                <strong>${overdue}</strong>
                <span>Need attention</span>
            </article>
            <article class="stat-card">
                <p>Due today</p>
                <strong>${today}</strong>
                <span>Today’s priorities</span>
            </article>
            <article class="stat-card">
                <p>Upcoming</p>
                <strong>${upcoming}</strong>
                <span>${unscheduled} without due dates</span>
            </article>
        `;
    }

    function renderItem(item) {
        const category = classify(item);
        const className = [
            "followup-center-item",
            category === "overdue" ? "followup-overdue" : "",
            category === "today" ? "followup-today" : "",
            category === "completed" ? "followup-completed" : ""
        ].filter(Boolean).join(" ");

        let dateBadge = "";
        if (category === "overdue") {
            dateBadge = `<span class="badge badge-danger">Overdue</span>`;
        } else if (category === "today") {
            dateBadge = `<span class="badge badge-warning">Due today</span>`;
        } else if (category === "completed") {
            dateBadge = `<span class="badge badge-success">Completed</span>`;
        } else if (category === "unscheduled") {
            dateBadge = `<span class="badge">No due date</span>`;
        } else {
            dateBadge = `<span class="badge badge-success">Upcoming</span>`;
        }

        return `
            <article class="${className}">
                <div class="followup-center-main">
                    <h4>${escapeHtml(item.title || "Follow-up")}</h4>
                    <p>${escapeHtml(item.description || "No details added.")}</p>
                </div>

                <div class="followup-center-meta">
                    <strong>${escapeHtml(item.studentName)}</strong>
                    <p>
                        ${escapeHtml(item.grade || "Grade not set")}
                        ${item.advisor ? ` · ${escapeHtml(item.advisor)}` : ""}
                    </p>
                </div>

                <div class="followup-center-date">
                    ${dateBadge}
                    <span class="badge owner-badge">${escapeHtml(item.assignedTo || "Advisor")}</span>
                    <span class="badge priority-${escapeHtml((item.priority || "Normal").toLowerCase())}">
                        ${escapeHtml(item.priority || "Normal")}
                    </span>
                    <p>${escapeHtml(formatDate(item.dueDate))}</p>
                </div>

                <div class="followup-center-actions">
                    <button class="button button-ghost button-small" type="button"
                        data-action="view-student" data-student-id="${escapeHtml(item.studentId)}">
                        Student
                    </button>

                    <button class="button button-secondary button-small" type="button"
                        data-action="edit-global-followup"
                        data-student-id="${escapeHtml(item.studentId)}"
                        data-followup-id="${escapeHtml(item.id)}">
                        Edit
                    </button>

                    ${isCompleted(item) ? `
                        <button class="button button-secondary button-small" type="button"
                            data-action="reopen-global-followup"
                            data-student-id="${escapeHtml(item.studentId)}"
                            data-followup-id="${escapeHtml(item.id)}">
                            Reopen
                        </button>
                    ` : `
                        ${item.status !== "in-progress" ? `
                            <button class="button button-secondary button-small" type="button"
                                data-action="progress-global-followup"
                                data-student-id="${escapeHtml(item.studentId)}"
                                data-followup-id="${escapeHtml(item.id)}">
                                In Progress
                            </button>
                        ` : ""}
                        <button class="button button-primary button-small" type="button"
                            data-action="complete-global-followup"
                            data-student-id="${escapeHtml(item.studentId)}"
                            data-followup-id="${escapeHtml(item.id)}">
                            Complete
                        </button>
                    `}
                </div>
            </article>
        `;
    }

    function render() {
        if (!state.content) {
            return;
        }

        const items = getFilteredFollowUps();
        renderSummary(items);

        if (!items.length) {
            state.content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon" aria-hidden="true">✓</div>
                    <h3>No action items found</h3>
                    <p>Adjust the filters or create a follow-up task for a student.</p>
                    <button class="button button-primary" type="button" data-action="new-global-followup">
                        + New Follow-Up
                    </button>
                </div>
            `;
            return;
        }

        const groups = [
            ["overdue", "Overdue"],
            ["today", "Due Today"],
            ["thisweek", "Due This Week"],
            ["later", "Later"],
            ["unscheduled", "No Due Date"],
            ["completed", "Completed"]
        ];

        state.content.innerHTML = `
            <div class="followup-groups">
                ${groups.map(([key, label]) => {
                    const groupItems = items.filter((item) => classify(item) === key);
                    if (!groupItems.length) {
                        return "";
                    }

                    return `
                        <section class="followup-group">
                            <div class="followup-group-header">
                                <h3>${escapeHtml(label)}</h3>
                                <span class="followup-group-count">
                                    ${groupItems.length} ${groupItems.length === 1 ? "item" : "items"}
                                </span>
                            </div>
                            <div class="followup-center-list">
                                ${groupItems.map(renderItem).join("")}
                            </div>
                        </section>
                    `;
                }).join("")}
            </div>
        `;
    }

    function formTemplate(studentId = "", followUpId = "") {
        const students = StudentManager.getStudents({ includeArchived: false });
        const selectedStudent = studentId ? StudentManager.getStudent(studentId) : null;
        const followUp = selectedStudent
            ? selectedStudent.journey.followUps.find((item) => item.id === followUpId)
            : null;

        return `
            <div class="modal-backdrop">
                <section class="modal modal-small" role="dialog" aria-modal="true" aria-labelledby="globalFollowUpTitle">
                    <div class="modal-header">
                        <div>
                            <h2 id="globalFollowUpTitle">${followUp ? "Edit Action Item" : "New Action Item"}</h2>
                            <p>A follow-up is a task that should happen after a student meeting.</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-followup-modal" aria-label="Close">×</button>
                    </div>

                    <form id="globalFollowUpForm">
                        <div class="modal-body">
                            <input type="hidden" name="followUpId" value="${escapeHtml(followUp ? followUp.id : "")}">

                            <div class="form-field">
                                <label for="globalFollowUpStudent">Student *</label>
                                <select id="globalFollowUpStudent" name="studentId" required ${followUp ? "disabled" : ""}>
                                    <option value="">Select a student</option>
                                    ${students.map((student) => `
                                        <option value="${escapeHtml(student.id)}"
                                            ${student.id === studentId ? "selected" : ""}>
                                            ${escapeHtml(displayName(student))}
                                        </option>
                                    `).join("")}
                                </select>
                                ${followUp ? `<input type="hidden" name="studentId" value="${escapeHtml(studentId)}">` : ""}
                            </div>

                            <div class="form-field">
                                <label for="globalFollowUpName">Follow-up *</label>
                                <input id="globalFollowUpName" name="title" required
                                    value="${escapeHtml(followUp ? followUp.title : "")}">
                            </div>

                            <div class="form-field">
                                <label for="globalFollowUpDescription">Details</label>
                                <textarea id="globalFollowUpDescription" name="description">${escapeHtml(followUp ? followUp.description : "")}</textarea>
                            </div>

                            <div class="form-field">
                                <label for="globalFollowUpDueDate">Due date</label>
                                <input id="globalFollowUpDueDate" name="dueDate" type="date"
                                    value="${escapeHtml(followUp ? followUp.dueDate : "")}">
                            </div>

                            <div class="form-field">
                                <label for="globalFollowUpOwner">Assigned to</label>
                                <select id="globalFollowUpOwner" name="assignedTo">
                                    ${["Advisor","Student","Both"].map((owner) => `
                                        <option value="${owner}"
                                            ${(followUp ? followUp.assignedTo : "Advisor") === owner ? "selected" : ""}>
                                            ${owner}
                                        </option>
                                    `).join("")}
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="globalFollowUpPriority">Priority</label>
                                <select id="globalFollowUpPriority" name="priority">
                                    ${["Low","Normal","High","Urgent"].map((priority) => `
                                        <option value="${priority}"
                                            ${(followUp ? followUp.priority : "Normal") === priority ? "selected" : ""}>
                                            ${priority}
                                        </option>
                                    `).join("")}
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="globalFollowUpStatus">Status</label>
                                <select id="globalFollowUpStatus" name="status">
                                    ${[
                                        ["open","Open"],
                                        ["in-progress","In Progress"],
                                        ["completed","Completed"]
                                    ].map(([value, label]) => `
                                        <option value="${value}"
                                            ${(followUp ? followUp.status : "open") === value ? "selected" : ""}>
                                            ${label}
                                        </option>
                                    `).join("")}
                                </select>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button class="button button-secondary" type="button" data-action="close-followup-modal">Cancel</button>
                            <button class="button button-primary" type="submit">${followUp ? "Save Changes" : "Create Follow-Up"}</button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function openForm(studentId = "", followUpId = "") {
        state.modalRoot.innerHTML = formTemplate(studentId, followUpId);
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        state.modalRoot.innerHTML = "";
        document.body.style.overflow = "";
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) {
            return;
        }

        const action = target.dataset.action;
        const studentId = target.dataset.studentId;
        const followUpId = target.dataset.followupId;

        if (action === "new-global-followup") {
            openForm();
        } else if (action === "edit-global-followup") {
            openForm(studentId, followUpId);
        } else if (action === "progress-global-followup") {
            StudentManager.updateJourneyItem(studentId, "followUps", followUpId, {
                status: "in-progress",
                completedAt: ""
            });
            App.showToast("Action item marked in progress.");
        } else if (action === "complete-global-followup") {
            StudentManager.updateJourneyItem(studentId, "followUps", followUpId, {
                status: "completed",
                completedAt: new Date().toISOString()
            });
            App.showToast("Follow-up completed.");
        } else if (action === "reopen-global-followup") {
            StudentManager.updateJourneyItem(studentId, "followUps", followUpId, {
                status: "open",
                completedAt: ""
            });
            App.showToast("Follow-up reopened.");
        } else if (action === "close-followup-modal") {
            closeModal();
        }
    }

    function handleSubmit(event) {
        if (event.target.id !== "globalFollowUpForm") {
            return;
        }

        event.preventDefault();
        const formData = new FormData(event.target);
        const studentId = String(formData.get("studentId") || "");
        const followUpId = String(formData.get("followUpId") || "");
        const title = String(formData.get("title") || "").trim();

        if (!studentId || !title) {
            return;
        }

        const status = String(formData.get("status") || "open");
        const payload = {
            title,
            description: formData.get("description"),
            dueDate: formData.get("dueDate"),
            assignedTo: formData.get("assignedTo"),
            priority: formData.get("priority"),
            status,
            completedAt: status === "completed" ? new Date().toISOString() : ""
        };

        if (followUpId) {
            StudentManager.updateJourneyItem(studentId, "followUps", followUpId, payload);
            App.showToast("Follow-up updated.");
        } else {
            StudentManager.addJourneyItem(studentId, "followUps", payload);
            App.showToast("Follow-up created.");
        }

        closeModal();
    }

    function focusStudent(studentId = "") {
        state.focusedStudentId = String(studentId || "");
        render();
    }

    function initialize() {
        state.content = document.getElementById("followupCenterContent");
        state.summary = document.getElementById("followupSummary");
        state.search = document.getElementById("followupSearchInput");
        state.statusFilter = document.getElementById("followupStatusFilter");
        state.advisorFilter = document.getElementById("followupAdvisorFilter");
        state.ownerFilter = document.getElementById("followupOwnerFilter");
        state.priorityFilter = document.getElementById("followupPriorityFilter");
        state.modalRoot = document.getElementById("modalRoot");

        state.search.addEventListener("input", render);
        state.statusFilter.addEventListener("change", render);
        state.advisorFilter.addEventListener("change", render);
        state.ownerFilter.addEventListener("change", render);
        state.priorityFilter.addEventListener("change", render);
        document.addEventListener("click", handleClick);
        document.addEventListener("submit", handleSubmit);
        document.addEventListener(StudentManager.DATA_CHANGED_EVENT, () => {
            populateAdvisorFilter();
            render();
        });

        populateAdvisorFilter();
        render();
    }

    return Object.freeze({
        initialize,
        render,
        focusStudent,
        openForm
    });
})();
