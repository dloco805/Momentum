/*
==========================================================
Momentum
Calendar & Planner
Build v23.2.1
File: js/calendarUI.js
==========================================================
*/
"use strict";

const CalendarUI = (() => {
    const state = {
        root: null,
        modalRoot: null,
        mode: "month",
        anchor: new Date(),
        selectedDate: DateUtils.today(),
        dayPanelOpen: false,
        filters: new Set([
            "meeting", "circle", "activity", "internship",
            "l2l", "planning", "project", "goal", "followup", "other"
        ])
    };

    function esc(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function dateKey(value) {
        if (!value) return "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    function displayName(student) {
        return student.profile.preferredName ||
            [student.profile.firstName, student.profile.lastName].filter(Boolean).join(" ") ||
            "Student";
    }

    function typeLabel(type) {
        return {
            meeting: "Meeting / Check-In",
            circle: "Circle",
            activity: "Activity",
            internship: "Internship / Career",
            l2l: "Leaving 2 Learn",
            planning: "Planning",
            project: "Project",
            goal: "Goal",
            followup: "Needs Attention",
            other: "Other"
        }[type] || "Other";
    }

    function statusLabel(status) {
        return {
            planned: "Planned",
            completed: "Completed",
            postponed: "Postponed",
            cancelled: "Cancelled"
        }[status] || "Planned";
    }

    function getEvents() {
        const events = [];

        StudentManager.getStudents({ includeArchived: false }).forEach((student) => {
            const studentName = displayName(student);

            (student.journey.checkIns || []).forEach((item) => {
                events.push({
                    id: item.id,
                    source: "student",
                    type: "meeting",
                    status: "completed",
                    date: dateKey(item.meetingDate || item.createdAt),
                    time: item.meetingTime || "",
                    title: studentName,
                    detail: item.summary || "Student meeting",
                    studentId: student.id
                });
            });

            [
                ["currentProjects", "project", "Project"],
                ["internships", "internship", "Internship"],
                ["goals", "goal", "Goal"],
                ["followUps", "followup", "Needs Attention"]
            ].forEach(([collection, type, label]) => {
                (student.journey[collection] || []).forEach((item) => {
                    const created = dateKey(item.createdAt);
                    if (created) {
                        events.push({
                            id: `${item.id}-created`,
                            source: "student",
                            type,
                            status: "completed",
                            date: created,
                            time: "",
                            title: `${label}: ${item.title || item.organization || "Update"}`,
                            detail: studentName,
                            studentId: student.id
                        });
                    }

                    const completed = dateKey(item.completedAt);
                    if (completed && completed !== created) {
                        events.push({
                            id: `${item.id}-completed`,
                            source: "student",
                            type,
                            status: "completed",
                            date: completed,
                            time: "",
                            title: `${label} completed: ${item.title || item.organization || "Completed"}`,
                            detail: studentName,
                            studentId: student.id
                        });
                    }

                    const due = dateKey(item.dueDate);
                    if (due) {
                        events.push({
                            id: `${item.id}-due`,
                            source: "student",
                            type,
                            status: "planned",
                            date: due,
                            time: "",
                            title: `${label} due: ${item.title || "Due"}`,
                            detail: studentName,
                            studentId: student.id
                        });
                    }
                });
            });
        });

        if (typeof CircleManager !== "undefined") {
            CircleManager.getCircles().forEach((circle) => {
                events.push({
                    id: circle.id,
                    source: "circle",
                    type: "circle",
                    status: "completed",
                    date: dateKey(circle.date),
                    time: circle.time || "",
                    title: `Circle: ${circle.topic || circle.title || "Class Circle"}`,
                    detail: circle.absentStudentIds?.length
                        ? `${circle.absentStudentIds.length} absent`
                        : circle.summary || ""
                });
            });
        }

        if (typeof ActivityManager !== "undefined") {
            ActivityManager.getActivities().forEach((activity) => {
                (activity.uses || []).forEach((use) => {
                    events.push({
                        id: use.id,
                        source: "activity",
                        type: "activity",
                        status: "completed",
                        date: dateKey(use.date),
                        time: use.time || "",
                        title: `Activity: ${activity.title}`,
                        detail: use.howItWent || activity.category || "Class activity"
                    });
                });
            });
        }

        if (typeof PlannerManager !== "undefined") {
            PlannerManager.getEvents().forEach((item) => {
                events.push({
                    ...item,
                    source: "planner",
                    type: item.category,
                    date: dateKey(item.date)
                });
            });
        }

        return events
            .filter((item) => item.date && state.filters.has(item.type))
            .sort((a, b) =>
                `${a.date}T${a.time || "23:59"}`.localeCompare(
                    `${b.date}T${b.time || "23:59"}`
                )
            );
    }

    function longDate(key) {
        const [year, month, day] = key.split("-").map(Number);
        return new Date(year, month - 1, day).toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    }

    function eventsFor(key, events) {
        return events.filter((item) => item.date === key);
    }

    function renderEventRows(items) {
        if (!items.length) {
            return `<p class="empty-copy">Nothing recorded or planned for this day.</p>`;
        }

        return `
            <div class="calendar-event-list">
                ${items.map((item) => `
                    <button class="calendar-event-row calendar-tone-${esc(item.type)}
                        calendar-status-${esc(item.status || "completed")}" type="button"
                        ${item.source === "planner"
                            ? `data-edit-planner-event="${esc(item.id)}"`
                            : item.studentId
                                ? `data-calendar-student="${esc(item.studentId)}"`
                                : ""
                        }>
                        <span>${esc(item.time || typeLabel(item.type))}</span>
                        <strong>${esc(item.title)}</strong>
                        <small>
                            ${esc(item.detail || "")}
                            ${item.status && item.status !== "completed"
                                ? ` · ${esc(statusLabel(item.status))}`
                                : ""
                            }
                        </small>
                    </button>
                `).join("")}
            </div>
        `;
    }

    function renderDayPanel(key, events) {
        return `
            <section class="calendar-day-detail">
                <div class="calendar-day-heading">
                    <h3>${esc(longDate(key))}</h3>
                    <div class="calendar-day-actions">
                        <button class="button button-primary button-small" type="button"
                            data-add-planner-event="${esc(key)}">
                            + Add Plan or Event
                        </button>
                        <button class="icon-button" type="button"
                            data-action="close-calendar-day"
                            aria-label="Close selected day">×</button>
                    </div>
                </div>
                ${renderEventRows(eventsFor(key, events))}
            </section>
        `;
    }

    function renderMonth(events) {
        const first = new Date(state.anchor.getFullYear(), state.anchor.getMonth(), 1);
        const start = new Date(first);
        start.setDate(1 - first.getDay());

        const days = Array.from({ length: 42 }, (_, index) => {
            const date = new Date(start);
            date.setDate(start.getDate() + index);
            return date;
        });

        return `
            <div class="calendar-month-wrap">
                <div class="calendar-month-grid">
                    ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                        .map((day) => `<div class="calendar-weekday">${day}</div>`)
                        .join("")}

                    ${days.map((date) => {
                        const key = dateKey(date);
                        const items = eventsFor(key, events);
                        const outside = date.getMonth() !== state.anchor.getMonth();

                        return `
                            <button type="button"
                                class="calendar-day ${outside ? "is-outside" : ""}
                                    ${key === state.selectedDate ? "is-selected" : ""}"
                                data-calendar-date="${key}">
                                <span>${date.getDate()}</span>
                                <div class="calendar-day-markers">
                                    ${items.slice(0, 5).map((item) => `
                                        <i class="calendar-dot calendar-tone-${esc(item.type)}
                                            calendar-status-${esc(item.status || "completed")}"
                                            title="${esc(item.title)}"></i>
                                    `).join("")}
                                </div>
                                ${items.length
                                    ? `<small>${items.length} moment${items.length === 1 ? "" : "s"}</small>`
                                    : ""
                                }
                            </button>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }

    function weekStart(date) {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());
        return start;
    }

    function renderWeek(events) {
        const start = weekStart(state.anchor);
        const days = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(start);
            date.setDate(start.getDate() + index);
            return date;
        });

        return `
            <div class="calendar-week-grid">
                ${days.map((date) => {
                    const key = dateKey(date);
                    return `
                        <section class="calendar-week-day">
                            <button type="button" data-calendar-date="${key}">
                                <span>${date.toLocaleDateString(undefined, { weekday: "short" })}</span>
                                <strong>${date.getDate()}</strong>
                            </button>
                            ${renderEventRows(eventsFor(key, events))}
                            <button class="calendar-add-inline" type="button"
                                data-add-planner-event="${key}">
                                + Add
                            </button>
                        </section>
                    `;
                }).join("")}
            </div>
        `;
    }

    function renderRhythm(events) {
        const month = state.anchor.getMonth();
        const year = state.anchor.getFullYear();
        const monthEvents = events.filter((item) => {
            const [eventYear, eventMonth] = item.date.split("-").map(Number);
            return eventYear === year && eventMonth - 1 === month;
        });

        const types = ["circle", "meeting", "activity", "internship", "l2l"];
        const postponed = monthEvents.filter((item) => item.status === "postponed").length;

        return `
            <div class="calendar-rhythm">
                ${types.map((type) => `
                    <div class="calendar-rhythm-item calendar-tone-${type}">
                        <span>${typeLabel(type)}</span>
                        <strong>${monthEvents.filter((item) =>
                            item.type === type && item.status !== "cancelled"
                        ).length}</strong>
                    </div>
                `).join("")}
                <div class="calendar-rhythm-item calendar-status-postponed">
                    <span>Postponed</span>
                    <strong>${postponed}</strong>
                </div>
            </div>
        `;
    }

    function eventForm(item = null, selectedDate = "") {
        const event = item || {
            id: "",
            title: "",
            date: selectedDate || state.selectedDate || DateUtils.today(),
            time: "",
            category: "planning",
            status: "planned",
            notes: "",
            wins: "",
            challenges: "",
            nextTime: ""
        };

        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal planner-event-modal" role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Calendar & Planner</p>
                            <h2>${item ? "Edit Event" : "Add Plan or Event"}</h2>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-planner-modal">×</button>
                    </div>

                    <form id="plannerEventForm">
                        <input type="hidden" name="eventId" value="${esc(event.id)}">

                        <div class="modal-body">
                            <div class="form-field">
                                <label>Title</label>
                                <input name="title" required value="${esc(event.title)}"
                                    placeholder="Example: College campus visit">
                            </div>

                            <div class="form-grid">
                                <div class="form-field">
                                    <label>Date</label>
                                    <input type="date" name="date" required value="${esc(event.date)}">
                                </div>
                                <div class="form-field">
                                    <label>Time</label>
                                    <input type="time" name="time" value="${esc(event.time)}">
                                </div>
                            </div>

                            <div class="form-grid">
                                <div class="form-field">
                                    <label>Category</label>
                                    <select name="category">
                                        ${[
                                            ["circle", "Circle"],
                                            ["meeting", "Meeting / Check-In"],
                                            ["activity", "Activity / Lesson"],
                                            ["internship", "Internship / Career Visit"],
                                            ["l2l", "Leaving 2 Learn (L2L)"],
                                            ["planning", "Planning / Prep"],
                                            ["other", "Other"]
                                        ].map(([value, label]) => `
                                            <option value="${value}"
                                                ${event.category === value ? "selected" : ""}>
                                                ${label}
                                            </option>
                                        `).join("")}
                                    </select>
                                </div>

                                <div class="form-field">
                                    <label>Status</label>
                                    <select name="status">
                                        ${[
                                            ["planned", "Planned"],
                                            ["completed", "Completed"],
                                            ["postponed", "Postponed / Snoozed"],
                                            ["cancelled", "Cancelled"]
                                        ].map(([value, label]) => `
                                            <option value="${value}"
                                                ${event.status === value ? "selected" : ""}>
                                                ${label}
                                            </option>
                                        `).join("")}
                                    </select>
                                </div>
                            </div>

                            <div class="form-field">
                                <label>Notes</label>
                                <textarea name="notes"
                                    placeholder="Plan, materials, people involved, reminders, or what happened.">${esc(event.notes)}</textarea>
                            </div>

                            <details class="planner-reflection-details"
                                ${event.status === "completed" ? "open" : ""}>
                                <summary>Quick reflection</summary>
                                <div class="form-field">
                                    <label>Wins</label>
                                    <textarea name="wins" placeholder="What went well?">${esc(event.wins)}</textarea>
                                </div>
                                <div class="form-field">
                                    <label>Challenges</label>
                                    <textarea name="challenges"
                                        placeholder="What should change?">${esc(event.challenges)}</textarea>
                                </div>
                                <div class="form-field">
                                    <label>Next time</label>
                                    <textarea name="nextTime"
                                        placeholder="One thing to remember.">${esc(event.nextTime)}</textarea>
                                </div>
                            </details>
                        </div>

                        <div class="modal-footer">
                            ${item ? `
                                <button class="button button-danger" type="button"
                                    data-action="delete-planner-event"
                                    data-event-id="${esc(event.id)}">
                                    Delete
                                </button>
                            ` : ""}
                            <button class="button button-secondary" type="button"
                                data-action="close-planner-modal">Cancel</button>
                            <button class="button button-primary" type="submit">
                                Save Event
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function closeModal() {
        if (state.modalRoot) state.modalRoot.innerHTML = "";
        document.body.style.overflow = "";
    }

    function render() {
        if (!state.root) return;

        const events = getEvents();
        const heading = state.mode === "month"
            ? state.anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
            : state.mode === "week"
                ? `Week of ${weekStart(state.anchor).toLocaleDateString(undefined, {
                    month: "long", day: "numeric", year: "numeric"
                })}`
                : longDate(state.selectedDate);

        state.root.innerHTML = `
            <div class="calendar-toolbar">
                <div class="calendar-navigation">
                    <button type="button" data-calendar-shift="-1">‹</button>
                    <button type="button" data-calendar-today>Today</button>
                    <button type="button" data-calendar-shift="1">›</button>
                    <strong>${esc(heading)}</strong>
                </div>

                <div class="calendar-modes">
                    ${["day", "week", "month"].map((mode) => `
                        <button type="button"
                            class="${state.mode === mode ? "is-active" : ""}"
                            data-calendar-mode="${mode}">
                            ${mode[0].toUpperCase() + mode.slice(1)}
                        </button>
                    `).join("")}
                    <button class="calendar-add-main" type="button"
                        data-add-planner-event="${esc(state.selectedDate)}">
                        + Add
                    </button>
                </div>
            </div>

            ${renderRhythm(events)}

            ${state.mode === "month"
                ? renderMonth(events)
                : state.mode === "week"
                    ? renderWeek(events)
                    : ""
            }

            ${state.dayPanelOpen || state.mode === "day"
                ? renderDayPanel(state.selectedDate, events)
                : ""
            }

            <details class="calendar-filter-details">
                <summary>Filter calendar</summary>
                <div class="calendar-filter-strip">
                    ${[
                        "circle", "meeting", "activity", "internship", "l2l",
                        "planning", "project", "goal", "followup", "other"
                    ].map((type) => `
                        <label class="calendar-filter-chip calendar-tone-${type}">
                            <input type="checkbox" value="${type}" data-calendar-filter
                                ${state.filters.has(type) ? "checked" : ""}>
                            <span class="calendar-dot calendar-tone-${type}"></span>
                            ${typeLabel(type)}
                        </label>
                    `).join("")}
                </div>
            </details>
        `;
    }


    function openPlannerEvent(eventId) {
        const item = typeof PlannerManager !== "undefined"
            ? PlannerManager.getEvent(eventId)
            : null;
        if (!item || !state.root || !state.modalRoot) return false;

        state.selectedDate = dateKey(item.date) || DateUtils.today();
        const [year, month, day] = state.selectedDate.split("-").map(Number);
        state.anchor = new Date(year, month - 1, day);
        state.mode = "day";
        state.dayPanelOpen = true;
        render();
        state.modalRoot.innerHTML = eventForm(item);
        document.body.style.overflow = "hidden";
        return true;
    }

    function initialize() {
        state.root = document.getElementById("calendarContent");
        state.modalRoot = document.getElementById("modalRoot");
        if (!state.root) return;

        document.addEventListener("click", (event) => {
            const mode = event.target.closest("[data-calendar-mode]");
            if (mode) {
                state.mode = mode.dataset.calendarMode;
                if (state.mode === "day") state.dayPanelOpen = true;
                render();
                return;
            }

            const shift = event.target.closest("[data-calendar-shift]");
            if (shift) {
                const amount = Number(shift.dataset.calendarShift);
                if (state.mode === "month") {
                    state.anchor.setMonth(state.anchor.getMonth() + amount);
                } else {
                    state.anchor.setDate(
                        state.anchor.getDate() + amount * (state.mode === "week" ? 7 : 1)
                    );
                }
                state.selectedDate = dateKey(state.anchor);
                render();
                return;
            }

            if (event.target.closest("[data-calendar-today]")) {
                state.anchor = new Date();
                state.selectedDate = DateUtils.today();
                state.dayPanelOpen = true;
                render();
                return;
            }

            const dateTarget = event.target.closest("[data-calendar-date]");
            if (dateTarget) {
                state.selectedDate = dateTarget.dataset.calendarDate;
                const [year, month, day] = state.selectedDate.split("-").map(Number);
                state.anchor = new Date(year, month - 1, day);
                state.dayPanelOpen = true;
                render();
                return;
            }

            const add = event.target.closest("[data-add-planner-event]");
            if (add) {
                state.modalRoot.innerHTML = eventForm(null, add.dataset.addPlannerEvent);
                document.body.style.overflow = "hidden";
                return;
            }

            const edit = event.target.closest("[data-edit-planner-event]");
            if (edit) {
                const item = PlannerManager.getEvent(edit.dataset.editPlannerEvent);
                if (item) {
                    state.modalRoot.innerHTML = eventForm(item);
                    document.body.style.overflow = "hidden";
                }
                return;
            }

            const student = event.target.closest("[data-calendar-student]");
            if (student) {
                document.dispatchEvent(new CustomEvent("viewStudent", {
                    detail: { studentId: student.dataset.calendarStudent }
                }));
                return;
            }

            const action = event.target.closest("[data-action]");
            if (!action) return;

            if (action.dataset.action === "close-calendar-day") {
                state.dayPanelOpen = false;
                render();
            } else if (action.dataset.action === "close-planner-modal") {
                closeModal();
            } else if (action.dataset.action === "delete-planner-event") {
                const item = PlannerManager.getEvent(action.dataset.eventId);
                if (item && window.confirm(`Delete “${item.title}”?`)) {
                    PlannerManager.removeEvent(item.id);
                    closeModal();
                    App.showToast("Event deleted.");
                }
            }
        });

        document.addEventListener("change", (event) => {
            if (!event.target.matches("[data-calendar-filter]")) return;
            event.target.checked
                ? state.filters.add(event.target.value)
                : state.filters.delete(event.target.value);
            render();
        });

        document.addEventListener("submit", (event) => {
            if (event.target.id !== "plannerEventForm") return;
            event.preventDefault();

            const data = new FormData(event.target);
            const eventId = String(data.get("eventId") || "");
            const payload = {
                title: data.get("title"),
                date: data.get("date"),
                time: data.get("time"),
                category: data.get("category"),
                status: data.get("status"),
                notes: data.get("notes"),
                wins: data.get("wins"),
                challenges: data.get("challenges"),
                nextTime: data.get("nextTime")
            };

            eventId
                ? PlannerManager.updateEvent(eventId, payload)
                : PlannerManager.addEvent(payload);

            state.selectedDate = String(payload.date || DateUtils.today());
            const [year, month, day] = state.selectedDate.split("-").map(Number);
            state.anchor = new Date(year, month - 1, day);
            closeModal();
            render();
            App.showToast(eventId ? "Event updated." : "Event added to the Planner.");
        });

        [
            "studentDataChanged",
            "circleDataChanged",
            "activityDataChanged",
            "plannerDataChanged"
        ].forEach((name) => document.addEventListener(name, render));

        render();
    }

    return Object.freeze({ initialize, render, openPlannerEvent });
})();
