/*
==========================================================
Momentum
Caseload Review Module
Build v21.0.0
File: js/caseloadReview.js
==========================================================
*/

"use strict";

const CaseloadReview = (() => {
    const state = {
        content: null,
        summary: null,
        search: null,
        needFilter: null,
        sortSelect: null
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

    function latestMeeting(student) {
        return [...student.journey.checkIns]
            .sort((a, b) => {
                const bDate = DateUtils.combineLocalDateTime(
                    b.meetingDate,
                    b.meetingTime || "12:00"
                ) || new Date(b.createdAt || 0);
                const aDate = DateUtils.combineLocalDateTime(
                    a.meetingDate,
                    a.meetingTime || "12:00"
                ) || new Date(a.createdAt || 0);
                return bDate - aDate;
            })[0] || null;
    }

    function latestNextMeeting(student) {
        return [...student.journey.checkIns]
            .filter((item) => item.nextMeetingDate)
            .sort((a, b) => {
                const bDate = DateUtils.combineLocalDateTime(
                    b.meetingDate,
                    b.meetingTime || "12:00"
                ) || new Date(b.createdAt || 0);
                const aDate = DateUtils.combineLocalDateTime(
                    a.meetingDate,
                    a.meetingTime || "12:00"
                ) || new Date(a.createdAt || 0);
                return bDate - aDate;
            })[0]?.nextMeetingDate || "";
    }

    function currentItem(items) {
        return [...items]
            .filter((item) =>
                item &&
                item.status !== "completed" &&
                item.status !== "archived" &&
                !item.archived
            )
            .sort((a, b) =>
                new Date(b.updatedAt || b.createdAt || 0) -
                new Date(a.updatedAt || a.createdAt || 0)
            )[0] || null;
    }

    function openFollowUps(student) {
        return student.journey.followUps.filter((item) =>
            item.status !== "completed" && !item.completedAt
        );
    }

    function overdueFollowUps(student) {
        return openFollowUps(student).filter((item) =>
            item.dueDate && DateUtils.isOverdue(item.dueDate)
        );
    }

    function meetingState(student) {
        const latest = latestMeeting(student);
        const nextDate = latestNextMeeting(student);
        const interval = (
            typeof Settings !== "undefined"
                ? Number(Settings.get("checkInIntervalDays"))
                : 14
        ) || 14;

        if (nextDate && DateUtils.isOverdue(nextDate)) {
            return {
                key: "overdue",
                label: `Scheduled ${DateUtils.formatDate(nextDate)} — overdue`,
                score: 5
            };
        }

        if (nextDate && DateUtils.isToday(nextDate)) {
            return {
                key: "today",
                label: "Meeting due today",
                score: 4
            };
        }

        if (!latest) {
            return {
                key: "overdue",
                label: "No meeting recorded",
                score: 5
            };
        }

        const daysSince = DateUtils.daysBetween(latest.meetingDate || latest.createdAt) || 0;

        if (daysSince >= interval) {
            return {
                key: "overdue",
                label: `${daysSince} days since meeting`,
                score: 4
            };
        }

        if (nextDate) {
            return {
                key: "scheduled",
                label: `Next meeting ${DateUtils.formatDate(nextDate)}`,
                score: 0
            };
        }

        return {
            key: "unscheduled",
            label: "No next meeting scheduled",
            score: 1
        };
    }

    function buildReview(student) {
        const project = currentItem(student.journey.currentProjects);
        const internship = currentItem(student.journey.internships);
        const latest = latestMeeting(student);
        const nextMeeting = latestNextMeeting(student);
        const overdue = overdueFollowUps(student);
        const open = openFollowUps(student);
        const meeting = meetingState(student);

        const needs = [];
        if (!project) needs.push("project");
        if (!internship) needs.push("internship");
        if (meeting.key === "overdue" || meeting.key === "today") needs.push("meeting");
        if (meeting.key === "unscheduled") needs.push("unscheduled");
        if (overdue.length) needs.push("followup");

        const attentionScore =
            meeting.score +
            (project ? 0 : 2) +
            (internship ? 0 : 2) +
            Math.min(overdue.length * 2, 6) +
            student.journey.followUps.filter((item) =>
                item.status !== "completed" &&
                ["High", "Urgent"].includes(item.priority)
            ).length;

        return {
            student,
            project,
            internship,
            latest,
            nextMeeting,
            overdue,
            open,
            meeting,
            needs,
            attentionScore
        };
    }

    function getRows() {
        const query = state.search.value.trim().toLowerCase();
        const need = state.needFilter.value;
        const sort = state.sortSelect.value;

        const rows = StudentManager.getStudents({ includeArchived: false })
            .map(buildReview)
            .filter((row) => {
                const { student, project, internship } = row;

                if (need && !row.needs.includes(need)) {
                    return false;
                }

                if (!query) {
                    return true;
                }

                return [
                    displayName(student),
                    student.profile.interests.join(" "),
                    student.journey.dreamJobs.join(" "),
                    project ? project.title : "",
                    internship ? internship.title : "",
                    internship ? internship.organization : ""
                ].join(" ").toLowerCase().includes(query);
            });

        rows.sort((a, b) => {
            if (sort === "name") {
                return displayName(a.student).localeCompare(displayName(b.student));
            }

            if (sort === "meeting") {
                if (b.meeting.score !== a.meeting.score) {
                    return b.meeting.score - a.meeting.score;
                }
            }

            if (sort === "updated") {
                return new Date(b.student.meta.updatedAt) - new Date(a.student.meta.updatedAt);
            }

            if (b.attentionScore !== a.attentionScore) {
                return b.attentionScore - a.attentionScore;
            }

            return displayName(a.student).localeCompare(displayName(b.student));
        });

        return rows;
    }

    function renderSummary() {
        if (state.summary) state.summary.innerHTML = "";
    }

    function renderWorkCell(label, item, emptyLabel, className) {
        return `
            <div class="caseload-work ${item ? "" : "is-missing"} ${escapeHtml(className)}">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(item ? item.title || "Untitled" : emptyLabel)}</strong>
                ${item && item.status ? `<small>${escapeHtml(item.status)}</small>` : ""}
            </div>
        `;
    }

    function renderRow(row) {
        const { student, project, internship, latest, overdue, open, meeting } = row;
        const goal = currentItem(student.journey.goals || []);
        const manualAttention = student.journey.followUps.some((item) =>
            item.title === "Dashboard attention" &&
            item.status !== "completed" &&
            !item.completedAt
        );

        return `
            <article class="caseload-card">
                <div class="caseload-student">
                    <div class="avatar avatar-small" aria-hidden="true">
                        ${escapeHtml(
                            displayName(student)
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((part) => part.charAt(0).toUpperCase())
                                .join("") || "?"
                        )}
                    </div>
                    <div>
                        <button class="student-name-link student-card-name" type="button"
                            data-action="view-student"
                            data-student-id="${escapeHtml(student.id)}">
                            ${escapeHtml(displayName(student))}
                        </button>
                    </div>
                </div>

                <div class="caseload-meeting status-${escapeHtml(meeting.key)}">
                    <span>Meeting status</span>
                    <strong>${escapeHtml(meeting.label)}</strong>
                    <small>${latest
                        ? `Last: ${escapeHtml(DateUtils.formatDateTime(latest.meetingDate, latest.meetingTime))}`
                        : "No prior meeting"
                    }</small>
                </div>

                <div class="caseload-current-work caseload-current-work-three">
                    ${renderWorkCell("Current project", project, "Needs project", "project")}
                    ${renderWorkCell("Current internship", internship, "Needs internship", "internship")}
                    ${renderWorkCell("Current goal", goal, "Needs goal", "goal")}
                </div>

                <div class="caseload-actions-summary">
                    <div>
                        <strong>${open.length}</strong>
                        <span>Open action items</span>
                    </div>
                    <div class="${overdue.length ? "has-overdue" : ""}">
                        <strong>${overdue.length}</strong>
                        <span>Overdue</span>
                    </div>
                </div>

                <div class="card-actions">
                    <button class="button button-primary button-small" type="button"
                        data-action="start-caseload-meeting"
                        data-student-id="${escapeHtml(student.id)}">
                        Start Meeting
                    </button>
                    <button class="button button-secondary button-small
                        ${manualAttention ? "is-active-attention" : ""}" type="button"
                        data-action="toggle-dashboard-attention"
                        data-student-id="${escapeHtml(student.id)}">
                        ${manualAttention ? "On Needs Attention" : "Add to Needs Attention"}
                    </button>
                </div>
            </article>
        `;
    }

    function render() {
        const rows = getRows();
        renderSummary(rows);

        if (!rows.length) {
            state.content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon" aria-hidden="true">▥</div>
                    <h3>No students match this review</h3>
                    <p>Adjust the search or support filters.</p>
                </div>
            `;
            return;
        }

        state.content.innerHTML = `
            <div class="caseload-grid">
                ${rows.map(renderRow).join("")}
            </div>
        `;
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) {
            return;
        }

        const studentId = target.dataset.studentId;

        if (target.dataset.action === "start-caseload-meeting") {
            document.dispatchEvent(new CustomEvent("openStudentMeeting", {
                detail: { studentId }
            }));
        } else if (target.dataset.action === "toggle-dashboard-attention") {
            const student = StudentManager.getStudent(studentId);
            if (!student) return;

            const existing = student.journey.followUps.find((item) =>
                item.title === "Dashboard attention" &&
                item.status !== "completed" &&
                !item.completedAt
            );

            if (existing) {
                StudentManager.updateJourneyItem(
                    studentId,
                    "followUps",
                    existing.id,
                    {
                        status: "completed",
                        completedAt: new Date().toISOString()
                    }
                );
                App.showToast("Removed from Needs Attention.");
            } else {
                StudentManager.addJourneyItem(studentId, "followUps", {
                    title: "Dashboard attention",
                    description: "Manually added from the Students page.",
                    status: "open",
                    priority: "High"
                });
                App.showToast("Added to Needs Attention.");
            }

            render();
        }
    }

    function initialize() {
        state.content = document.getElementById("caseloadContent");
        state.summary = document.getElementById("caseloadSummary");
        state.search = document.getElementById("caseloadSearchInput");
        state.needFilter = document.getElementById("caseloadNeedFilter");
        state.sortSelect = document.getElementById("caseloadSortSelect");

        state.search.addEventListener("input", render);
        state.needFilter.addEventListener("change", render);
        state.sortSelect.addEventListener("change", render);
        document.addEventListener("click", handleClick);
        document.addEventListener(StudentManager.DATA_CHANGED_EVENT, () => {
                render();
        });
        document.addEventListener("momentumSettingsChanged", render);

        render();
    }

    return Object.freeze({
        initialize,
        render
    });
})();
