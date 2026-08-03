/*
==========================================================
Momentum
Check-In Center Module
Build v21.0.0
File: js/checkInCenter.js
==========================================================
*/

"use strict";

const CheckInCenter = (() => {
    const state = {
        content: null,
        summary: null,
        search: null,
        statusFilter: null,
        sortSelect: null,
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

    function formatMeetingTimestamp(item) {
        return DateUtils.formatDateTime(
            item.meetingDate || DateUtils.toDateInputValue(item.createdAt),
            item.meetingTime || DateUtils.toTimeInputValue(item.createdAt)
        );
    }


    function splitList(value) {
        return String(value || "")
            .split(/[\n,;]+/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function getAllCheckIns() {
        return StudentManager.getStudents({ includeArchived: false })
            .flatMap((student) => student.journey.checkIns.map((checkIn) => ({
                ...checkIn,
                studentId: student.id,
                studentName: displayName(student)
            })))
            .sort((a, b) =>
                new Date(b.meetingDate || b.createdAt).getTime() -
                new Date(a.meetingDate || a.createdAt).getTime()
            );
    }

    function checkInIntervalDays() {
        return (
            typeof Settings !== "undefined"
                ? Number(Settings.get("checkInIntervalDays"))
                : 14
        ) || 14;
    }

    function meetingDateTime(item) {
        return DateUtils.combineLocalDateTime(
            item.meetingDate || DateUtils.toDateInputValue(item.createdAt),
            item.meetingTime || "12:00"
        ) || new Date(item.createdAt || 0);
    }

    function studentRows() {
        const intervalDays = checkInIntervalDays();
        const intervalMs = intervalDays * 86400000;
        const now = Date.now();
        const byStudent = getAllCheckIns().reduce((map, item) => {
            if (!map.has(item.studentId)) map.set(item.studentId, []);
            map.get(item.studentId).push(item);
            return map;
        }, new Map());

        return StudentManager.getStudents({ includeArchived: false }).map((student) => {
            const items = byStudent.get(student.id) || [];
            const latest = items[0] || null;
            const ageDays = latest
                ? Math.max(0, Math.floor(
                    (now - meetingDateTime(latest).getTime()) / 86400000
                ))
                : null;
            const never = !latest;
            const due = never || ageDays > intervalDays;

            return {
                student,
                studentId: student.id,
                studentName: displayName(student),
                items,
                latest,
                ageDays,
                never,
                due,
                status: never ? "never" : due ? "due" : "recent"
            };
        });
    }

    function getFilteredStudentRows() {
        const query = state.search.value.trim().toLowerCase();
        const status = state.statusFilter.value;
        const sort = state.sortSelect.value;

        const rows = studentRows().filter((row) => {
            if (status !== "all" && row.status !== status) return false;
            if (!query) return true;

            const history = row.items.map((item) => [
                item.summary,
                item.reflection,
                ...item.projectUpdates,
                ...item.opportunityUpdates,
                ...item.followUpUpdates,
                ...item.newQuestions,
                ...item.nextSteps
            ].join(" ")).join(" ");

            return [row.studentName, row.advisor, history]
                .join(" ")
                .toLowerCase()
                .includes(query);
        });

        rows.sort((a, b) => {
            if (sort === "recent-first") {
                return (b.latest ? meetingDateTime(b.latest).getTime() : 0) -
                    (a.latest ? meetingDateTime(a.latest).getTime() : 0);
            }
            if (sort === "recent-last") {
                return (a.latest ? meetingDateTime(a.latest).getTime() : 0) -
                    (b.latest ? meetingDateTime(b.latest).getTime() : 0);
            }
            if (sort === "due-first") {
                return Number(b.due) - Number(a.due) ||
                    Number(b.never) - Number(a.never) ||
                    (b.ageDays ?? 9999) - (a.ageDays ?? 9999) ||
                    a.studentName.localeCompare(b.studentName);
            }
            if (sort === "count") {
                return b.items.length - a.items.length ||
                    a.studentName.localeCompare(b.studentName);
            }
            return a.studentName.localeCompare(b.studentName);
        });

        return rows;
    }

    function renderSummary() {
        const rows = studentRows();
        const dueRows = rows.filter((row) => row.due);
        const recentRows = rows.filter((row) => row.status === "recent");
        const neverRows = rows.filter((row) => row.never);

        state.summary.innerHTML = `
            <section class="checkin-overview">
                <div class="checkin-overview-heading">
                    <div>
                        <p class="eyebrow">Check-in rhythm</p>
                        <h3>${rows.length} students</h3>
                    </div>
                    <div class="checkin-overview-counts">
                        <span class="checkin-count recent">${recentRows.length} recent</span>
                        <span class="checkin-count due">${dueRows.length} due</span>
                        ${neverRows.length
                            ? `<span class="checkin-count never">${neverRows.length} never</span>`
                            : ""
                        }
                    </div>
                </div>

                ${dueRows.length ? `
                    <div class="checkin-due-list">
                        <strong>Due for a check-in</strong>
                        <div>
                            ${dueRows
                                .sort((a, b) =>
                                    Number(b.never) - Number(a.never) ||
                                    (b.ageDays ?? 9999) - (a.ageDays ?? 9999)
                                )
                                .map((row) => `
                                    <button type="button"
                                        data-action="new-checkin"
                                        data-student-id="${escapeHtml(row.studentId)}">
                                        ${escapeHtml(row.studentName)}
                                        <span>${row.never
                                            ? "Never checked in"
                                            : `${row.ageDays} days ago`
                                        }</span>
                                    </button>
                                `).join("")}
                        </div>
                    </div>
                ` : `
                    <div class="checkin-all-current">
                        Everyone has had a check-in within the last
                        ${checkInIntervalDays()} days.
                    </div>
                `}
            </section>
        `;
    }

    function briefList(items, empty = "") {
        const clean = (items || []).filter(Boolean);
        if (!clean.length) return empty;
        return `${clean[0]}${clean.length > 1 ? ` +${clean.length - 1} more` : ""}`;
    }

    function renderCheckIn(item) {
        const details = [
            item.projectUpdates.length
                ? ["Project", briefList(item.projectUpdates)]
                : null,
            item.opportunityUpdates.length
                ? ["Internship / Work", briefList(item.opportunityUpdates)]
                : null,
            item.followUpUpdates.length
                ? ["Action Item", briefList(item.followUpUpdates)]
                : null,
            item.nextSteps.length
                ? ["Goal / Next Step", briefList(item.nextSteps)]
                : null,
            item.newQuestions.length
                ? ["Questions", briefList(item.newQuestions)]
                : null
        ].filter(Boolean);

        return `
            <article class="checkin-history-card">
                <div class="checkin-card-header">
                    <div>
                        <p class="eyebrow">${escapeHtml(formatMeetingTimestamp(item))}</p>
                        <div class="badges">
                            ${MoodUtils.renderBadges(item.mood, escapeHtml)}
                        </div>
                    </div>
                    <button class="button button-secondary button-small" type="button"
                        data-action="edit-checkin"
                        data-student-id="${escapeHtml(item.studentId)}"
                        data-checkin-id="${escapeHtml(item.id)}">
                        Edit
                    </button>
                </div>

                <p class="checkin-summary">${escapeHtml(
                    item.summary || item.reflection || "No summary recorded."
                )}</p>

                ${details.length ? `
                    <div class="checkin-update-details">
                        ${details.map(([label, detail]) => `
                            <div>
                                <span>${escapeHtml(label)}</span>
                                <strong>${escapeHtml(detail)}</strong>
                            </div>
                        `).join("")}
                    </div>
                ` : ""}

                ${item.nextMeetingDate ? `
                    <span class="checkin-next-date">
                        Next meeting ${escapeHtml(formatDate(item.nextMeetingDate))}
                    </span>
                ` : ""}
            </article>
        `;
    }

    function renderStudentCheckInCard(row) {
        const latest = row.latest;
        const highlights = latest ? [
            latest.projectUpdates.length
                ? ["Project", briefList(latest.projectUpdates)]
                : null,
            latest.opportunityUpdates.length
                ? ["Internship / Work", briefList(latest.opportunityUpdates)]
                : null,
            latest.nextSteps.length
                ? ["Goal / Next Step", briefList(latest.nextSteps)]
                : null,
            latest.newQuestions.length
                ? ["Questions", briefList(latest.newQuestions)]
                : null
        ].filter(Boolean).slice(0, 3) : [];

        const tone = row.never ? "never" : row.due ? "due" : "recent";

        return `
            <article class="checkin-student-card checkin-tone-${tone}">
                <div class="checkin-student-card-heading">
                    <button class="checkin-student-name" type="button"
                        data-action="view-student"
                        data-student-id="${escapeHtml(row.studentId)}">
                        ${escapeHtml(row.studentName)}
                    </button>
                    <span class="checkin-status-label">${row.never
                        ? "Never checked in"
                        : row.due
                            ? "Due for check-in"
                            : "Recently checked in"
                    }</span>
                </div>

                <div class="checkin-latest-summary">
                    <span>Most recent check-in</span>
                    <strong>${latest
                        ? escapeHtml(formatMeetingTimestamp(latest))
                        : "No check-in recorded"
                    }</strong>
                    <p>${latest
                        ? escapeHtml(
                            latest.summary ||
                            latest.reflection ||
                            "No summary recorded."
                        )
                        : "Start the first check-in to begin this student's meeting history."
                    }</p>
                </div>

                ${highlights.length ? `
                    <div class="checkin-latest-highlights">
                        ${highlights.map(([label, detail]) => `
                            <div>
                                <span>${escapeHtml(label)}</span>
                                <strong>${escapeHtml(detail)}</strong>
                            </div>
                        `).join("")}
                    </div>
                ` : ""}

                <div class="checkin-student-card-footer">
                    <div class="checkin-total">
                        <strong>${row.items.length}</strong>
                        <span>Total check-ins</span>
                    </div>
                    <div class="card-actions">
                        <button class="button button-primary button-small" type="button"
                            data-action="new-checkin"
                            data-student-id="${escapeHtml(row.studentId)}">
                            + Check In
                        </button>
                        ${row.items.length ? `
                            <button class="button button-secondary button-small"
                                type="button"
                                data-action="toggle-checkin-history"
                                data-student-id="${escapeHtml(row.studentId)}">
                                View History
                            </button>
                        ` : ""}
                    </div>
                </div>

                ${row.items.length ? `
                    <div class="checkin-history-panel"
                        data-checkin-history="${escapeHtml(row.studentId)}"
                        hidden>
                        ${row.items.map(renderCheckIn).join("")}
                    </div>
                ` : ""}
            </article>
        `;
    }

    function render() {
        if (!state.content) return;

        const rows = getFilteredStudentRows();
        renderSummary();

        state.content.innerHTML = rows.length
            ? `<div class="checkin-student-list">
                ${rows.map(renderStudentCheckInCard).join("")}
            </div>`
            : `<div class="empty-state">
                <h3>No students match these filters</h3>
                <p>Try a different search, status, or sort option.</p>
            </div>`;
    }

    function formTemplate(studentId = "", checkInId = "") {
        const students = StudentManager.getStudents({ includeArchived: false });
        const selectedStudent = studentId ? StudentManager.getStudent(studentId) : null;
        const checkIn = selectedStudent
            ? selectedStudent.journey.checkIns.find((item) => item.id === checkInId)
            : null;

        const today = DateUtils.today();
        const currentTime = DateUtils.nowTime();

        return `
            <div class="modal-backdrop">
                <section class="modal" role="dialog" aria-modal="true" aria-labelledby="checkInFormTitle">
                    <div class="modal-header">
                        <div>
                            <h2 id="checkInFormTitle">${checkIn ? "Edit Student Meeting" : "New Student Meeting"}</h2>
                            <p>A check-in is the dated meeting itself. Record what was discussed and what changed.</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-checkin-modal" aria-label="Close">×</button>
                    </div>

                    <form id="checkInForm">
                        <div class="modal-body">
                            <input type="hidden" name="checkInId" value="${escapeHtml(checkIn ? checkIn.id : "")}">

                            <section class="form-section">
                                <h3>Meeting details</h3>
                                <div class="form-grid">
                                    <div class="form-field">
                                        <label for="checkInStudent">Student *</label>
                                        <select id="checkInStudent" name="studentId" required ${checkIn ? "disabled" : ""}>
                                            <option value="">Select a student</option>
                                            ${students.map((student) => `
                                                <option value="${escapeHtml(student.id)}" ${student.id === studentId ? "selected" : ""}>
                                                    ${escapeHtml(displayName(student))}
                                                </option>
                                            `).join("")}
                                        </select>
                                        ${checkIn ? `<input type="hidden" name="studentId" value="${escapeHtml(studentId)}">` : ""}
                                    </div>

                                    <div class="form-field">
                                        <label for="checkInDate">Meeting date *</label>
                                        <input id="checkInDate" name="meetingDate" type="date" required
                                            value="${escapeHtml(checkIn ? checkIn.meetingDate : today)}">
                                    </div>

                                    <div class="form-field">
                                        <label for="checkInTime">Start time *</label>
                                        <input id="checkInTime" name="meetingTime" type="time" required
                                            value="${escapeHtml(checkIn ? checkIn.meetingTime || currentTime : currentTime)}">
                                    </div>

                                    <div class="form-field">
                                        <label for="checkInNextMeetingDate">Next meeting date</label>
                                        <input id="checkInNextMeetingDate" name="nextMeetingDate" type="date"
                                            value="${escapeHtml(checkIn ? checkIn.nextMeetingDate : "")}">
                                    </div>

                                    <div class="form-field full-width">
                                        <label>Student mood during this meeting — select all that apply</label>
                                        <div class="mood-options">
                                            ${MoodUtils.renderCheckboxes(checkIn ? checkIn.mood : "", "checkInMoods")}
                                        </div>
                                        <input name="checkInMoodCustom"
                                            placeholder="Other feelings during this meeting, separated by commas">
                                    </div>

                                    <div class="form-field full-width">
                                        <label for="checkInSummary">Meeting summary</label>
                                        <textarea id="checkInSummary" name="summary"
                                            placeholder="What did you discuss today?">${escapeHtml(checkIn ? checkIn.summary : "")}</textarea>
                                    </div>
                                </div>
                            </section>

                            <section class="form-section simple-notes-section">
                                <h3>What changed today?</h3>
                                <p class="field-help">Use only the sections that matter.</p>
                                <div class="simple-note-grid">
                                    <div class="form-field">
                                        <label>Project</label>
                                        <textarea name="projectUpdates"
                                            placeholder="Progress, roadblocks, evidence, or next work">${escapeHtml(checkIn ? checkIn.projectUpdates.join("\n") : "")}</textarea>
                                    </div>
                                    <div class="form-field">
                                        <label>Internship / Work</label>
                                        <textarea name="opportunityUpdates"
                                            placeholder="Placement, schedule, supervisor, or workplace progress">${escapeHtml(checkIn ? checkIn.opportunityUpdates.join("\n") : "")}</textarea>
                                    </div>
                                    <div class="form-field">
                                        <label>Goals</label>
                                        <textarea name="nextSteps"
                                            placeholder="Goal progress or the next concrete step">${escapeHtml(checkIn ? checkIn.nextSteps.join("\n") : "")}</textarea>
                                    </div>
                                    <div class="form-field">
                                        <label>Questions</label>
                                        <textarea name="newQuestions"
                                            placeholder="Questions or curiosities to explore">${escapeHtml(checkIn ? checkIn.newQuestions.join("\n") : "")}</textarea>
                                    </div>
                                    <div class="form-field full-width">
                                        <label>Other</label>
                                        <textarea name="reflection"
                                            placeholder="Anything else worth remembering">${escapeHtml(checkIn ? checkIn.reflection : "")}</textarea>
                                    </div>
                                </div>
                                <input type="hidden" name="followUpUpdates"
                                    value="${escapeHtml(checkIn ? checkIn.followUpUpdates.join("; ") : "")}">
                            </section>
                        </div>

                        <div class="modal-footer">
                            <button class="button button-secondary" type="button" data-action="close-checkin-modal">Cancel</button>
                            <button class="button button-primary" type="submit">${checkIn ? "Save Check-In" : "Record Check-In"}</button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function openForm(studentId = "", checkInId = "") {
        state.modalRoot.innerHTML = formTemplate(studentId, checkInId);
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

        if (target.dataset.action === "new-checkin") {
            openForm(target.dataset.studentId || "");
        } else if (target.dataset.action === "toggle-checkin-history") {
            const studentId = target.dataset.studentId;
            const panel = document.querySelector(
                `[data-checkin-history="${CSS.escape(studentId)}"]`
            );
            if (panel) {
                panel.hidden = !panel.hidden;
                target.textContent = panel.hidden ? "View History" : "Hide History";
            }
        } else if (target.dataset.action === "edit-checkin") {
            openForm(target.dataset.studentId, target.dataset.checkinId);
        } else if (target.dataset.action === "close-checkin-modal") {
            closeModal();
        }
    }

    function handleSubmit(event) {
        if (event.target.id !== "checkInForm") {
            return;
        }

        event.preventDefault();
        const formData = new FormData(event.target);
        const studentId = String(formData.get("studentId") || "");
        const checkInId = String(formData.get("checkInId") || "");

        if (!studentId || !formData.get("meetingDate")) {
            return;
        }

        const payload = {
            meetingDate: formData.get("meetingDate"),
            meetingTime: formData.get("meetingTime"),
            summary: formData.get("summary"),
            mood: MoodUtils.collectFromForm(
                formData,
                "checkInMoods",
                "checkInMoodCustom"
            ),
            projectUpdates: splitList(formData.get("projectUpdates")),
            opportunityUpdates: splitList(formData.get("opportunityUpdates")),
            followUpUpdates: splitList(formData.get("followUpUpdates")),
            reflection: formData.get("reflection"),
            newQuestions: splitList(formData.get("newQuestions")),
            nextSteps: splitList(formData.get("nextSteps")),
            nextMeetingDate: formData.get("nextMeetingDate")
        };

        if (checkInId) {
            StudentManager.updateCheckIn(studentId, checkInId, payload);
            App.showToast("Check-in updated.");
        } else {
            StudentManager.addCheckIn(studentId, payload);
            App.showToast("Check-in recorded.");
        }

        closeModal();
        render();
    }

    function initialize() {
        state.content = document.getElementById("checkinCenterContent");
        state.summary = document.getElementById("checkinSummary");
        state.search = document.getElementById("checkinSearchInput");
        state.statusFilter = document.getElementById("checkinStatusFilter");
        state.sortSelect = document.getElementById("checkinSortSelect");
        state.modalRoot = document.getElementById("modalRoot");

        state.search.addEventListener("input", render);
        state.statusFilter.addEventListener("change", render);
        state.sortSelect.addEventListener("change", render);
        document.addEventListener("click", handleClick);
        document.addEventListener("submit", handleSubmit);
        document.addEventListener(StudentManager.DATA_CHANGED_EVENT, () => {
            render();
        });
        document.addEventListener("momentumSettingsChanged", render);

        render();
    }

    return Object.freeze({
        initialize,
        render,
        openForm
    });
})();
