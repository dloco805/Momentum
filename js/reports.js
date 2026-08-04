/*
==========================================================
Momentum
Reports Module
Build v22.0.1
File: js/reports.js
==========================================================
*/

"use strict";

const Reports = (() => {
    const state = {
        container: null,
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
        return DateUtils.formatDate(value, { fallback: "" });
    }

    function csvEscape(value) {
        const text = String(value ?? "");
        return `"${text.replaceAll('"', '""')}"`;
    }

    function downloadCsv(filename, rows) {
        const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    function getFilteredStudents() {
        return StudentManager.getStudents({ includeArchived: false });
    }

    function countCheckIns(student) {
        return student.journey.checkIns.length;
    }

    function startOfCurrentWeek() {
        const today = new Date();
        const day = today.getDay();
        const offset = day === 0 ? -6 : 1 - day;
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        start.setDate(start.getDate() + offset);
        start.setHours(0, 0, 0, 0);
        return start;
    }

    function countCheckInsThisWeek(student) {
        const start = startOfCurrentWeek();
        const end = new Date(start);
        end.setDate(end.getDate() + 7);

        return student.journey.checkIns.filter((item) => {
            const timestamp = DateUtils.combineLocalDateTime(
                item.meetingDate,
                item.meetingTime || "12:00"
            ) || new Date(item.createdAt || 0);

            return timestamp >= start && timestamp < end;
        }).length;
    }

    function countOpenFollowUps(student) {
        return student.journey.followUps.filter((item) =>
            item.status !== "completed" && item.status !== "archived" && !item.archived && !item.completedAt
        ).length;
    }

    function countOverdueFollowUps(student) {
        return student.journey.followUps.filter((item) =>
            item.status !== "completed" && item.status !== "archived" && !item.archived &&
            !item.completedAt &&
            item.dueDate &&
            DateUtils.isOverdue(item.dueDate)
        ).length;
    }

    function groupCount(students, getter) {
        const counts = new Map();

        students.forEach((student) => {
            const value = getter(student) || "Not set";
            counts.set(value, (counts.get(value) || 0) + 1);
        });

        return [...counts.entries()].sort((a, b) => b[1] - a[1]);
    }

    function renderBars(items) {
        const max = Math.max(1, ...items.map(([, count]) => count));

        return `
            <div class="report-bar-list">
                ${items.map(([label, count]) => `
                    <div class="report-bar-row">
                        <span class="report-bar-label" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
                        <div class="report-bar-track" aria-hidden="true">
                            <div class="report-bar-fill" style="width: ${(count / max) * 100}%"></div>
                        </div>
                        <strong>${count}</strong>
                    </div>
                `).join("")}
            </div>
        `;
    }

    function latestMeetingTimestamp(student) {
        const latest = [...student.journey.checkIns]
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
            })[0];

        return latest
            ? DateUtils.formatDateTime(latest.meetingDate, latest.meetingTime)
            : "";
    }

    function latestMeetingMood(student) {
        const latest = [...student.journey.checkIns]
            .filter((item) => item.mood)
            .sort((a, b) =>
                new Date(b.meetingDate || b.createdAt) -
                new Date(a.meetingDate || a.createdAt)
            )[0];

        return latest ? latest.mood : "";
    }

    function currentItemTitle(items = []) {
        const current = [...items]
            .filter((item) => item && item.status !== "completed" && item.status !== "archived" && !item.archived)
            .sort((a, b) =>
                new Date(b.updatedAt || b.createdAt || 0).getTime() -
                new Date(a.updatedAt || a.createdAt || 0).getTime()
            )[0];

        return current ? current.title || "Untitled" : "";
    }

    function meetingsWithinDays(student, days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        cutoff.setHours(0, 0, 0, 0);

        return student.journey.checkIns.filter((item) => {
            const timestamp = DateUtils.combineLocalDateTime(
                item.meetingDate,
                item.meetingTime || "12:00"
            ) || new Date(item.createdAt || 0);

            return timestamp >= cutoff;
        }).length;
    }

    function recentCompletions(student) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);

        return [
            ...student.journey.currentProjects,
            ...student.journey.internships,
            ...student.journey.goals
        ].filter((item) =>
            item.status === "completed" &&
            new Date(item.completedAt || item.updatedAt || item.createdAt || 0) >= cutoff
        ).length;
    }

    function countWorkUpdates(student) {
        return [
            ...student.journey.currentProjects,
            ...student.journey.internships,
            ...student.journey.goals
        ].reduce(
            (sum, item) => sum + (Array.isArray(item.activityLog) ? item.activityLog.length : 0),
            0
        );
    }

    function activeGoals(student) {
        return student.journey.goals.filter((item) =>
            item.status !== "completed" &&
            item.status !== "archived" &&
            !item.archived
        );
    }

    function render() {
        if (!state.container) {
            return;
        }

        const students = getFilteredStudents();
        const openFollowUps = students.reduce((sum, student) => sum + countOpenFollowUps(student), 0);
        const overdueFollowUps = students.reduce((sum, student) => sum + countOverdueFollowUps(student), 0);
        const activeProjects = students.reduce((sum, student) =>
            sum + student.journey.currentProjects.filter((item) => item.status !== "completed" && item.status !== "archived" && !item.archived).length,
        0);
        const applications = students.reduce((sum, student) =>
            sum + student.journey.opportunityEngagements.filter((item) =>
                ["Applied", "Interviewing", "Accepted"].includes(item.status)
            ).length,
        0);
        const accepted = students.reduce((sum, student) =>
            sum + student.journey.opportunityEngagements.filter((item) =>
                item.status === "Accepted"
            ).length,
        0);

        const totalCheckIns = students.reduce(
            (sum, student) => sum + countCheckIns(student),
            0
        );
        const checkInsThisWeek = students.reduce(
            (sum, student) => sum + countCheckInsThisWeek(student),
            0
        );
        const checkInCounts = students
            .map((student) => [displayName(student), countCheckIns(student)])
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1]);

        state.container.innerHTML = `
            <div class="stats-grid">
                <article class="stat-card">
                    <p>Students in report</p>
                    <strong>${students.length}</strong>
                    <span>Active records</span>
                </article>
                <article class="stat-card">
                    <p>Open next steps</p>
                    <strong>${openFollowUps}</strong>
                    <span>${overdueFollowUps} overdue</span>
                </article>
                <article class="stat-card">
                    <p>Active projects</p>
                    <strong>${activeProjects}</strong>
                    <span>Across selected students</span>
                </article>
                <article class="stat-card">
                    <p>Total check-ins</p>
                    <strong>${totalCheckIns}</strong>
                    <span>${checkInsThisWeek} this current week</span>
                </article>
            </div>

            <div class="report-grid">
                <section class="panel">
                    <div class="panel-header">
                        <h3>Check-ins by student</h3>
                    </div>
                    ${checkInCounts.length
                        ? renderBars(checkInCounts.slice(0, 12))
                        : `<p class="empty-copy">No check-ins recorded yet.</p>`
                    }
                </section>

                <section class="panel">
                    <div class="panel-header">
                        <h3>Meeting activity</h3>
                    </div>
                    <div class="report-activity-summary">
                        <div>
                            <strong>${totalCheckIns}</strong>
                            <span>All check-ins</span>
                        </div>
                        <div>
                            <strong>${checkInsThisWeek}</strong>
                            <span>This current week</span>
                        </div>
                        <div>
                            <strong>${students.filter((student) => countCheckInsThisWeek(student) > 0).length}</strong>
                            <span>Students seen this week</span>
                        </div>
                    </div>
                </section>

                <section class="panel full-width" style="grid-column: 1 / -1;">
                    <div class="panel-header">
                        <h3>Student summary</h3>
                    </div>
                    ${students.length ? `
                        <div class="report-table-wrap">
                            <table class="report-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Total Check-Ins</th>
                                        <th>This Week</th>
                                        <th>Last 30 Days</th>
                                        <th>Recent Wins</th>
                                        <th>Work Updates</th>
                                        <th>Current Project</th>
                                        <th>Current Internship</th>
                                        <th>Active Goals</th>
                                        <th>Completed Goals</th>
                                        <th>Follow-ups</th>
                                        <th>Overdue</th>
                                        <th>Opportunity pipeline</th>
                                        <th>Last updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${students.map((student) => `
                                        <tr>
                                            <td>
                                                <button class="button button-ghost button-small" type="button"
                                                    data-action="view-student" data-student-id="${escapeHtml(student.id)}">
                                                    ${escapeHtml(displayName(student))}
                                                </button>
                                            </td>
                                            <td>${countCheckIns(student)}</td>
                                            <td>${countCheckInsThisWeek(student)}</td>
                                            <td>${meetingsWithinDays(student, 30)}</td>
                                            <td>${recentCompletions(student)}</td>
                                            <td>${countWorkUpdates(student)}</td>
                                            <td>${escapeHtml(currentItemTitle(student.journey.currentProjects) || "—")}</td>
                                            <td>${escapeHtml(currentItemTitle(student.journey.internships) || "—")}</td>
                                            <td>${activeGoals(student).length}</td>
                                            <td>${student.journey.goals.filter((item) => item.status === "completed").length}</td>
                                            <td>${countOpenFollowUps(student)}</td>
                                            <td>${countOverdueFollowUps(student)}</td>
                                            <td>${student.journey.opportunityEngagements.length}</td>
                                            <td>${escapeHtml(formatDate(student.meta.updatedAt))}</td>
                                        </tr>
                                    `).join("")}
                                </tbody>
                            </table>
                        </div>
                    ` : `<p class="empty-copy">No students match the selected filters.</p>`}
                </section>
            </div>
        `;
    }

    function reportTableRows(students, mode) {
        if (mode === "followups") {
            const rows = [];
            students.forEach((student) => {
                student.journey.followUps
                    .filter((item) => item.status !== "completed" && !item.completedAt)
                    .forEach((item) => {
                        rows.push(`
                            <tr>
                                <td>${escapeHtml(displayName(student))}</td>
                                <td>${escapeHtml(item.title || "Follow-up")}</td>
                                <td>${escapeHtml(item.assignedTo === "Advisor" ? "Educator" : (item.assignedTo || "Educator"))}</td>
                                <td>${escapeHtml(item.priority || "Normal")}</td>
                                <td>${escapeHtml(formatDate(item.dueDate) || "No due date")}</td>
                                <td>${item.dueDate && DateUtils.isOverdue(item.dueDate) ? "Overdue" : "Open"}</td>
                            </tr>
                        `);
                    });
            });
            return rows.join("");
        }

        return students.map((student) => `
            <tr>
                <td>${escapeHtml(displayName(student))}</td>
                <td>${countCheckIns(student)}</td>
                <td>${countCheckInsThisWeek(student)}</td>
                <td>${meetingsWithinDays(student, 30)}</td>
                <td>${escapeHtml(currentItemTitle(student.journey.currentProjects) || "—")}</td>
                <td>${escapeHtml(currentItemTitle(student.journey.internships) || "—")}</td>
                <td>${activeGoals(student).length}</td>
                <td>${countOpenFollowUps(student)}</td>
                <td>${countOverdueFollowUps(student)}</td>
                <td>${escapeHtml(formatDate(student.meta.updatedAt))}</td>
            </tr>
        `).join("");
    }

    function activeItems(items = []) {
        return items.filter((item) =>
            item.status !== "completed" &&
            item.status !== "archived" &&
            !item.archived &&
            !item.completedAt
        );
    }

    function completedItems(items = []) {
        return items.filter((item) =>
            item.status === "completed" ||
            Boolean(item.completedAt)
        );
    }

    function splitDateRange(value) {
        if (!value) {
            return null;
        }

        const parsed = DateUtils.parseLocalDate(value);
        return parsed && !Number.isNaN(parsed.getTime())
            ? parsed
            : null;
    }

    function itemFallsInRange(item, startDate, endDate) {
        if (!startDate && !endDate) {
            return true;
        }

        const candidate =
            item.meetingDate ||
            item.dueDate ||
            item.completedAt ||
            item.updatedAt ||
            item.createdAt ||
            item.startDate ||
            item.endDate ||
            "";

        if (!candidate) {
            return false;
        }

        const parsed = DateUtils.parseLocalDate(candidate) ||
            new Date(candidate);

        if (!parsed || Number.isNaN(parsed.getTime())) {
            return false;
        }

        if (startDate && parsed < startDate) {
            return false;
        }

        if (endDate) {
            const inclusiveEnd = new Date(endDate);
            inclusiveEnd.setHours(23, 59, 59, 999);
            if (parsed > inclusiveEnd) {
                return false;
            }
        }

        return true;
    }

    function reportBuilderTemplate() {
        const students = getFilteredStudents();

        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal custom-report-modal" role="dialog" aria-modal="true"
                    aria-labelledby="customReportTitle">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Build your own report</p>
                            <h2 id="customReportTitle">Custom Report Builder</h2>
                            <p>
                                Choose students, sections, dates, and detail level.
                                Momentum will generate one clean printable document.
                            </p>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-custom-report"
                            aria-label="Close">×</button>
                    </div>

                    <form id="customReportForm">
                        <div class="modal-body custom-report-body">
                            <section class="custom-report-section">
                                <div class="panel-header">
                                    <div>
                                        <p class="eyebrow">1. Students</p>
                                        <h3>Who should be included?</h3>
                                    </div>
                                    <div class="card-actions">
                                        <button class="button button-secondary button-small"
                                            type="button"
                                            data-action="select-all-report-students">
                                            Select All
                                        </button>
                                        <button class="button button-secondary button-small"
                                            type="button"
                                            data-action="clear-report-students">
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <label class="search-field custom-report-search">
                                    <span aria-hidden="true">⌕</span>
                                    <span class="visually-hidden">Search students in report builder</span>
                                    <input id="customReportStudentSearch" type="search"
                                        placeholder="Search students" autocomplete="off">
                                </label>

                                <div class="custom-report-student-list">
                                    ${students.map((student) => `
                                        <label class="custom-report-student-option"
                                            data-report-student-name="${escapeHtml(
                                                displayName(student).toLowerCase()
                                            )}">
                                            <input type="checkbox" name="studentIds"
                                                value="${escapeHtml(student.id)}" checked>
                                            <span>
                                                <strong>${escapeHtml(displayName(student))}</strong>
                                                <small>${escapeHtml(
                                                    student.journey.dreamJobs[0] ||
                                                    student.profile.interests.slice(0, 2).join(", ") ||
                                                    "Student"
                                                )}</small>
                                            </span>
                                        </label>
                                    `).join("")}
                                </div>
                            </section>

                            <section class="custom-report-section">
                                <p class="eyebrow">2. Date range</p>
                                <h3>Which activity period?</h3>
                                <div class="form-grid">
                                    <div class="form-field">
                                        <label for="customReportStartDate">Start date</label>
                                        <input id="customReportStartDate"
                                            name="startDate" type="date">
                                    </div>
                                    <div class="form-field">
                                        <label for="customReportEndDate">End date</label>
                                        <input id="customReportEndDate"
                                            name="endDate" type="date">
                                    </div>
                                </div>
                                <p class="field-help">
                                    Leave both blank to include all available history.
                                </p>
                            </section>

                            <section class="custom-report-section">
                                <p class="eyebrow">3. Sections</p>
                                <h3>What should the report show?</h3>
                                <div class="custom-report-checkbox-grid">
                                    ${[
                                        ["profile", "Student Snapshot"],
                                        ["meetings", "Meetings & Check-Ins"],
                                        ["projects", "Projects"],
                                        ["internships", "Internships"],
                                        ["goals", "Goals"],
                                        ["followups", "Next Steps"],
                                        ["opportunities", "Opportunities"],
                                        ["plans", "Meeting Action Plans"],
                                        ["story", "Student Story Narrative"]
                                    ].map(([value, label]) => `
                                        <label>
                                            <input type="checkbox" name="sections"
                                                value="${value}"
                                                ${["profile", "meetings", "projects", "goals", "followups"].includes(value)
                                                    ? "checked"
                                                    : ""
                                                }>
                                            <span>${label}</span>
                                        </label>
                                    `).join("")}
                                </div>
                            </section>

                            <section class="custom-report-section">
                                <p class="eyebrow">4. Format</p>
                                <h3>How detailed should it be?</h3>
                                <div class="custom-report-option-grid">
                                    <label>
                                        <input type="radio" name="detailLevel"
                                            value="summary" checked>
                                        <span>
                                            <strong>Summary</strong>
                                            <small>Key totals, current work, and latest updates.</small>
                                        </span>
                                    </label>
                                    <label>
                                        <input type="radio" name="detailLevel"
                                            value="detailed">
                                        <span>
                                            <strong>Detailed</strong>
                                            <small>Full selected records and descriptions.</small>
                                        </span>
                                    </label>
                                </div>

                                <div class="custom-report-option-grid">
                                    <label>
                                        <input type="radio" name="layout"
                                            value="combined" checked>
                                        <span>
                                            <strong>Combined Report</strong>
                                            <small>Students flow together in one document.</small>
                                        </span>
                                    </label>
                                    <label>
                                        <input type="radio" name="layout"
                                            value="student-pages">
                                        <span>
                                            <strong>One Page per Student</strong>
                                            <small>Each student begins on a new printed page.</small>
                                        </span>
                                    </label>
                                </div>
                            </section>

                            <section class="custom-report-section">
                                <p class="eyebrow">5. Title</p>
                                <div class="form-field">
                                    <label for="customReportTitleInput">Report title</label>
                                    <input id="customReportTitleInput"
                                        name="reportTitle"
                                        value="Momentum Custom Student Report">
                                </div>
                            </section>
                        </div>

                        <div class="modal-footer">
                            <button class="button button-secondary" type="button"
                                data-action="close-custom-report">Cancel</button>
                            <button class="button button-primary" type="submit">
                                Generate & Print
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function listHtml(items, emptyText = "None recorded.") {
        return items.length
            ? `<ul>${items.map((item) =>
                `<li>${escapeHtml(item)}</li>`
            ).join("")}</ul>`
            : `<p class="muted">${escapeHtml(emptyText)}</p>`;
    }

    function studentReportSection(student, settings) {
        const {
            sections,
            detailLevel,
            startDate,
            endDate
        } = settings;
        const detailed = detailLevel === "detailed";
        const sectionHtml = [];

        if (sections.has("profile")) {
            sectionHtml.push(`
                <section class="report-section">
                    <h2>Student Snapshot</h2>
                    <div class="grid">
                        <div class="card">
                            <span>Interests / Hobbies</span>
                            <strong>${escapeHtml(
                                student.profile.interests.join(", ") || "Not recorded"
                            )}</strong>
                        </div>
                        <div class="card">
                            <span>Dream Job</span>
                            <strong>${escapeHtml(
                                student.journey.dreamJobs.join(", ") || "Still exploring"
                            )}</strong>
                        </div>
                        <div class="card">
                            <span>Current Project</span>
                            <strong>${escapeHtml(
                                currentItemTitle(student.journey.currentProjects) ||
                                "No active project"
                            )}</strong>
                        </div>
                        <div class="card">
                            <span>Current Internship</span>
                            <strong>${escapeHtml(
                                currentItemTitle(student.journey.internships) ||
                                "No active internship"
                            )}</strong>
                        </div>
                        <div class="card">
                            <span>Active Goals</span>
                            <strong>${activeGoals(student).length}</strong>
                        </div>
                        <div class="card">
                            <span>Open Next Steps</span>
                            <strong>${countOpenFollowUps(student)}</strong>
                        </div>
                        ${student.profile.portfolioUrl ? `
                            <div class="card portfolio-print-card">
                                <span>Portfolio Website</span>
                                <strong>Google Sites</strong>
                                <p>${escapeHtml(student.profile.portfolioUrl)}</p>
                            </div>
                        ` : ""}
                    </div>
                </section>
            `);
        }

        if (sections.has("meetings")) {
            const meetings = [...student.journey.checkIns]
                .filter((item) => itemFallsInRange(item, startDate, endDate))
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
                });

            sectionHtml.push(`
                <section class="report-section">
                    <h2>Meetings & Check-Ins</h2>
                    ${meetings.length ? meetings
                        .slice(0, detailed ? meetings.length : 3)
                        .map((item) => `
                            <article class="record">
                                <h3>${escapeHtml(
                                    DateUtils.formatDateTime(
                                        item.meetingDate,
                                        item.meetingTime
                                    )
                                )}</h3>
                                <p><strong>Mood:</strong> ${escapeHtml(item.mood || "Not recorded")}</p>
                                <p>${escapeHtml(item.summary || "No summary recorded.")}</p>
                                ${detailed && item.reflection
                                    ? `<p><strong>Reflection:</strong> ${escapeHtml(item.reflection)}</p>`
                                    : ""
                                }
                                ${detailed
                                    ? listHtml(item.nextSteps || [], "No next steps recorded.")
                                    : ""
                                }
                            </article>
                        `).join("")
                        : `<p class="muted">No meetings in the selected date range.</p>`
                    }
                </section>
            `);
        }

        [
            ["projects", "Projects", student.journey.currentProjects],
            ["internships", "Internships", student.journey.internships],
            ["goals", "Goals", student.journey.goals]
        ].forEach(([key, label, items]) => {
            if (!sections.has(key)) {
                return;
            }

            const filtered = items.filter((item) =>
                itemFallsInRange(item, startDate, endDate)
            );

            sectionHtml.push(`
                <section class="report-section">
                    <h2>${label}</h2>
                    ${filtered.length ? filtered
                        .slice(0, detailed ? filtered.length : 5)
                        .map((item) => `
                            <article class="record">
                                <h3>${escapeHtml(item.title || label.slice(0, -1))}</h3>
                                <p>
                                    <strong>Status:</strong>
                                    ${escapeHtml(item.status || "Active")}
                                    ${item.dueDate
                                        ? ` · <strong>Due:</strong> ${escapeHtml(formatDate(item.dueDate))}`
                                        : ""
                                    }
                                </p>
                                ${detailed && item.description
                                    ? `<p>${escapeHtml(item.description)}</p>`
                                    : ""
                                }
                                ${detailed && Array.isArray(item.nextSteps)
                                    ? listHtml(item.nextSteps, "No next steps recorded.")
                                    : ""
                                }
                            </article>
                        `).join("")
                        : `<p class="muted">No ${label.toLowerCase()} in the selected date range.</p>`
                    }
                </section>
            `);
        });

        if (sections.has("followups")) {
            const followUps = student.journey.followUps.filter((item) =>
                itemFallsInRange(item, startDate, endDate)
            );

            sectionHtml.push(`
                <section class="report-section">
                    <h2>Next Steps</h2>
                    ${followUps.length ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>Next Step</th>
                                    <th>Owner</th>
                                    <th>Priority</th>
                                    <th>Due</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${followUps.map((item) => `
                                    <tr>
                                        <td>${escapeHtml(item.title || "Follow-up")}</td>
                                        <td>${escapeHtml(item.assignedTo === "Advisor" ? "Educator" : (item.assignedTo || "Educator"))}</td>
                                        <td>${escapeHtml(item.priority || "Normal")}</td>
                                        <td>${escapeHtml(formatDate(item.dueDate) || "—")}</td>
                                        <td>${escapeHtml(item.status || "Open")}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    ` : `<p class="muted">No next steps in the selected date range.</p>`}
                </section>
            `);
        }

        if (sections.has("opportunities")) {
            const engagements = student.journey.opportunityEngagements.filter((item) =>
                itemFallsInRange(item, startDate, endDate)
            );

            sectionHtml.push(`
                <section class="report-section">
                    <h2>Opportunities</h2>
                    ${engagements.length ? engagements.map((item) => {
                        const opportunity = OpportunityManager.getOpportunity(
                            item.opportunityId
                        );

                        return `
                            <article class="record">
                                <h3>${escapeHtml(
                                    opportunity?.title || "Opportunity"
                                )}</h3>
                                <p>
                                    ${escapeHtml(opportunity?.organization || "")}
                                    ${item.status ? ` · ${escapeHtml(item.status)}` : ""}
                                </p>
                                ${item.nextStep
                                    ? `<p><strong>Next:</strong> ${escapeHtml(item.nextStep)}</p>`
                                    : ""
                                }
                            </article>
                        `;
                    }).join("") : `<p class="muted">No opportunities in the selected date range.</p>`}
                </section>
            `);
        }

        if (sections.has("plans")) {
            const plans = student.journey.actionPlans.filter((item) =>
                itemFallsInRange(item, startDate, endDate)
            );

            sectionHtml.push(`
                <section class="report-section">
                    <h2>Meeting Action Plans</h2>
                    ${plans.length ? plans
                        .slice(0, detailed ? plans.length : 3)
                        .map((plan) => `
                            <article class="record">
                                <h3>${escapeHtml(
                                    DateUtils.formatDateTime(
                                        plan.meetingDate,
                                        plan.meetingTime
                                    )
                                )}</h3>
                                <p>${escapeHtml(plan.summary || "No summary recorded.")}</p>
                                <div class="two-column">
                                    <div>
                                        <strong>Student Next Steps</strong>
                                        ${listHtml(plan.studentCommitments || [], "None recorded.")}
                                    </div>
                                    <div>
                                        <strong>Educator Next Steps</strong>
                                        ${listHtml(plan.advisorCommitments || [], "None recorded.")}
                                    </div>
                                </div>
                            </article>
                        `).join("")
                        : `<p class="muted">No meeting plans in the selected date range.</p>`
                    }
                </section>
            `);
        }

        if (sections.has("story")) {
            const activeProject = currentItemTitle(
                student.journey.currentProjects
            );
            const activeInternship = currentItemTitle(
                student.journey.internships
            );
            const sentences = [
                `${displayName(student)} is exploring ${
                    student.profile.interests.slice(0, 3).join(", ") ||
                    "interests and future possibilities"
                }.`,
                activeProject
                    ? `Current work includes ${activeProject}.`
                    : "No active project is currently recorded.",
                activeInternship
                    ? `Career experience includes ${activeInternship}.`
                    : "No active internship is currently recorded.",
                `${activeGoals(student).length} active goal${
                    activeGoals(student).length === 1 ? "" : "s"
                } and ${countOpenFollowUps(student)} open next step${
                    countOpenFollowUps(student) === 1 ? "" : "s"
                } are recorded.`
            ];

            sectionHtml.push(`
                <section class="report-section">
                    <h2>Student Story</h2>
                    <p class="story-copy">${escapeHtml(sentences.join(" "))}</p>
                    ${student.profile.studentVoice
                        ? `<blockquote>${escapeHtml(student.profile.studentVoice)}</blockquote>`
                        : ""
                    }
                </section>
            `);
        }

        return `
            <article class="student-report-page">
                <header class="student-report-header">
                    <p class="muted">Momentum Student Report</p>
                    <h1>${escapeHtml(displayName(student))}</h1>
                    ${student.profile.portfolioUrl ? `
                        <p class="portfolio-print-link">
                            <strong>Portfolio:</strong>
                            ${escapeHtml(student.profile.portfolioUrl)}
                        </p>
                    ` : ""}
                    <p class="muted">
                        ${settings.startDate || settings.endDate
                            ? `Activity period: ${
                                settings.startDate
                                    ? escapeHtml(formatDate(settings.startDate))
                                    : "Beginning"
                              } – ${
                                settings.endDate
                                    ? escapeHtml(formatDate(settings.endDate))
                                    : "Present"
                              }`
                            : "All available history"
                        }
                    </p>
                </header>
                ${sectionHtml.join("")}
            </article>
        `;
    }

    function generateCustomReport(form) {
        const data = new FormData(form);
        const studentIds = data.getAll("studentIds").map(String);
        const sections = new Set(data.getAll("sections").map(String));
        const detailLevel = String(data.get("detailLevel") || "summary");
        const layout = String(data.get("layout") || "combined");
        const reportTitle = String(
            data.get("reportTitle") || "Momentum Custom Student Report"
        ).trim() || "Momentum Custom Student Report";
        const startDateValue = String(data.get("startDate") || "");
        const endDateValue = String(data.get("endDate") || "");
        const startDate = splitDateRange(startDateValue);
        const endDate = splitDateRange(endDateValue);

        if (!studentIds.length) {
            App.showToast("Select at least one student.", "error");
            return false;
        }

        if (!sections.size) {
            App.showToast("Select at least one report section.", "error");
            return false;
        }

        if (startDate && endDate && startDate > endDate) {
            App.showToast("The report start date must be before the end date.", "error");
            return false;
        }

        const studentsById = new Map(
            getFilteredStudents().map((student) => [student.id, student])
        );
        const students = studentIds
            .map((id) => studentsById.get(id))
            .filter(Boolean);

        const settings = {
            sections,
            detailLevel,
            layout,
            startDate,
            endDate,
            startDateValue,
            endDateValue
        };

        const generated = new Date().toLocaleString();
        const pages = students.map((student) =>
            studentReportSection(student, {
                ...settings,
                startDate: startDateValue,
                endDate: endDateValue
            })
        );

        const body = `
            <header class="custom-report-cover">
                <p class="muted">Momentum</p>
                <h1>${escapeHtml(reportTitle)}</h1>
                <p class="muted">
                    ${students.length} student${students.length === 1 ? "" : "s"}
                    · Generated ${escapeHtml(generated)}
                </p>
            </header>
            <div class="${layout === "student-pages"
                ? "student-page-layout"
                : "combined-report-layout"
            }">
                ${pages.join("")}
            </div>
            <footer>Generated by Momentum v5.6.0</footer>
        `;

        PrintManager.printHtml(reportTitle, body, {
            orientation: detailLevel === "detailed" ? "landscape" : "portrait",
            css: `
                .custom-report-cover {
                    border-bottom: 4px solid #4f63d9;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                }
                .student-report-page {
                    margin-bottom: 28px;
                }
                .student-page-layout .student-report-page {
                    break-before: page;
                }
                .student-page-layout .student-report-page:first-child {
                    break-before: auto;
                }
                .student-report-header {
                    border: 1px solid #ced8f1;
                    border-left: 7px solid #4f63d9;
                    border-radius: 12px;
                    margin-bottom: 18px;
                    padding: 14px 16px;
                    background: linear-gradient(135deg, #eef0ff, #ffffff 70%);
                }
                .student-report-header h1 {
                    margin: 0 0 4px;
                }
                .report-section {
                    break-inside: avoid;
                    margin: 20px 0;
                    padding: 15px;
                    border: 1px solid #dce3ef;
                    border-top: 5px solid #4f63d9;
                    border-radius: 12px;
                    background: #ffffff;
                }
                .report-section:nth-of-type(4n + 2) {
                    border-top-color: #8b57c7;
                    background: #fbf8ff;
                }
                .report-section:nth-of-type(4n + 3) {
                    border-top-color: #228a72;
                    background: #f7fcfa;
                }
                .report-section:nth-of-type(4n + 4) {
                    border-top-color: #c96b2c;
                    background: #fffaf6;
                }
                .report-section h2 {
                    border-bottom: 2px solid #dfe4ee;
                    margin-bottom: 10px;
                    padding-bottom: 5px;
                }
                .record {
                    break-inside: avoid;
                    border: 1px solid #dce3ef;
                    border-left: 5px solid #228a72;
                    border-radius: 10px;
                    margin: 9px 0;
                    padding: 12px;
                    background: linear-gradient(90deg, #e9f8f3, #ffffff 44%);
                }
                .portfolio-print-link {
                    margin: 7px 0 0;
                    color: #334dc4;
                    overflow-wrap: anywhere;
                }
                .portfolio-print-card p {
                    margin: 5px 0 0;
                    color: #667085;
                    font-size: 9px;
                    overflow-wrap: anywhere;
                }
                .record h3 {
                    margin: 0 0 5px;
                }
                .two-column {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                }
                blockquote {
                    border-left: 5px solid #4f63d9;
                    margin: 12px 0;
                    padding: 12px;
                    background: #eef0ff;
                }
                .story-copy {
                    font-size: 13px;
                    line-height: 1.65;
                }
            `
        });

        return true;
    }

    function printReport(mode = "overview") {
        const students = getFilteredStudents();
        const generated = new Date().toLocaleString();
        const titleMap = {
            overview: "Momentum Overview Report",
            students: "Student Progress Report",
            meetings: "Meeting Activity Report",
            followups: "Open Next Steps Report"
        };
        const title = titleMap[mode] || titleMap.overview;
        const totalCheckIns = students.reduce((sum, student) => sum + countCheckIns(student), 0);
        const thisWeek = students.reduce((sum, student) => sum + countCheckInsThisWeek(student), 0);
        const open = students.reduce((sum, student) => sum + countOpenFollowUps(student), 0);
        const overdue = students.reduce((sum, student) => sum + countOverdueFollowUps(student), 0);

        let content = `
            <header>
                <p class="muted">Momentum</p>
                <h1>${escapeHtml(title)}</h1>
                <p class="muted">Generated ${escapeHtml(generated)}</p>
            </header>
        `;

        if (mode === "overview") {
            content += `
                <div class="grid">
                    <div class="card"><strong>${students.length}</strong><span>Students</span></div>
                    <div class="card"><strong>${totalCheckIns}</strong><span>Total check-ins</span></div>
                    <div class="card"><strong>${thisWeek}</strong><span>Check-ins this week</span></div>
                    <div class="card"><strong>${overdue}</strong><span>Overdue next steps</span></div>
                </div>
                <h2>Student Progress Summary</h2>
                <table>
                    <thead><tr>
                        <th>Student</th><th>Check-Ins</th><th>This Week</th><th>Last 30 Days</th>
                        <th>Current Project</th><th>Current Internship</th><th>Active Goals</th>
                        <th>Open Next Steps</th><th>Overdue</th><th>Last Updated</th>
                    </tr></thead>
                    <tbody>${reportTableRows(students, "students")}</tbody>
                </table>
            `;
        } else if (mode === "students") {
            content += `
                <h2>Student Progress</h2>
                <table>
                    <thead><tr>
                        <th>Student</th><th>Check-Ins</th><th>This Week</th><th>Last 30 Days</th>
                        <th>Current Project</th><th>Current Internship</th><th>Active Goals</th>
                        <th>Open Next Steps</th><th>Overdue</th><th>Last Updated</th>
                    </tr></thead>
                    <tbody>${reportTableRows(students, "students")}</tbody>
                </table>
            `;
        } else if (mode === "meetings") {
            content += `
                <div class="grid">
                    <div class="card"><strong>${totalCheckIns}</strong><span>All check-ins</span></div>
                    <div class="card"><strong>${thisWeek}</strong><span>This week</span></div>
                    <div class="card"><strong>${students.filter((s) => countCheckInsThisWeek(s) > 0).length}</strong><span>Students seen this week</span></div>
                    <div class="card"><strong>${students.filter((s) => countCheckIns(s) === 0).length}</strong><span>No meeting recorded</span></div>
                </div>
                <h2>Meeting Activity by Student</h2>
                <table>
                    <thead><tr><th>Student</th><th>Total</th><th>This Week</th><th>Last 30 Days</th><th>Latest Meeting</th><th>Latest Mood</th></tr></thead>
                    <tbody>${students.map((student) => `
                        <tr><td>${escapeHtml(displayName(student))}</td><td>${countCheckIns(student)}</td>
                        <td>${countCheckInsThisWeek(student)}</td><td>${meetingsWithinDays(student, 30)}</td>
                        <td>${escapeHtml(latestMeetingTimestamp(student) || "—")}</td><td>${escapeHtml(latestMeetingMood(student) || "—")}</td></tr>
                    `).join("")}</tbody>
                </table>
            `;
        } else {
            content += `
                <div class="grid">
                    <div class="card"><strong>${open}</strong><span>Open next steps</span></div>
                    <div class="card"><strong>${overdue}</strong><span>Overdue</span></div>
                </div>
                <h2>Open Next Steps</h2>
                <table>
                    <thead><tr><th>Student</th><th>Next Step</th><th>Owner</th><th>Priority</th><th>Due Date</th><th>Status</th></tr></thead>
                    <tbody>${reportTableRows(students, "followups") || `<tr><td colspan="6">No open next steps.</td></tr>`}</tbody>
                </table>
            `;
        }

        content += `<footer>Generated by Momentum v5.6.0</footer>`;
        PrintManager.printHtml(title, content, {
            orientation: mode === "overview" || mode === "students" ? "landscape" : "portrait"
        });
    }

    function exportStudentsCsv() {
        const rows = [[
            "Student ID",
            "Preferred Name",
            "First Name",
            "Last Name",
            "Total Check-Ins",
            "Check-Ins This Week",
            "Check-Ins Last 30 Days",
            "Recent Completions",
            "Dated Work Updates",
            "Latest Meeting Timestamp",
            "Latest Meeting Mood",
            "Interests / Hobbies",
            "Dream Job",
            "Current Project",
            "Completed Projects",
            "Current Internship",
            "Completed Internships",
            "Internship Organization",
            "Internship Supervisor",
            "Internship Schedule",
            "Active Goals",
            "Completed Goals",
            "Open Next Steps",
            "Overdue Next Steps",
            "Opportunity Pipeline",
            "Last Updated"
        ]];

        getFilteredStudents().forEach((student) => {
            rows.push([
                student.id,
                student.profile.preferredName,
                student.profile.firstName,
                student.profile.lastName,
                countCheckIns(student),
                countCheckInsThisWeek(student),
                meetingsWithinDays(student, 30),
                recentCompletions(student),
                countWorkUpdates(student),
                latestMeetingTimestamp(student),
                latestMeetingMood(student),
                student.profile.interests.join("; "),
                student.journey.dreamJobs.join("; "),
                currentItemTitle(student.journey.currentProjects),
                student.journey.currentProjects.filter((item) => item.status === "completed").length,
                currentItemTitle(student.journey.internships),
                student.journey.internships.filter((item) => item.status === "completed").length,
                (() => {
                    const item = [...student.journey.internships]
                        .filter((entry) =>
                            entry.status !== "completed" &&
                            entry.status !== "archived" &&
                            !entry.archived
                        )
                        .sort((a, b) =>
                            new Date(b.updatedAt || b.createdAt || 0) -
                            new Date(a.updatedAt || a.createdAt || 0)
                        )[0];
                    return item ? item.organization || "" : "";
                })(),
                (() => {
                    const item = [...student.journey.internships]
                        .filter((entry) =>
                            entry.status !== "completed" &&
                            entry.status !== "archived" &&
                            !entry.archived
                        )
                        .sort((a, b) =>
                            new Date(b.updatedAt || b.createdAt || 0) -
                            new Date(a.updatedAt || a.createdAt || 0)
                        )[0];
                    return item ? item.supervisor || "" : "";
                })(),
                (() => {
                    const item = [...student.journey.internships]
                        .filter((entry) =>
                            entry.status !== "completed" &&
                            entry.status !== "archived" &&
                            !entry.archived
                        )
                        .sort((a, b) =>
                            new Date(b.updatedAt || b.createdAt || 0) -
                            new Date(a.updatedAt || a.createdAt || 0)
                        )[0];
                    return item ? item.schedule || "" : "";
                })(),
                activeGoals(student).length,
                student.journey.goals.filter((item) => item.status === "completed").length,
                countOpenFollowUps(student),
                countOverdueFollowUps(student),
                student.journey.opportunityEngagements.length,
                student.meta.updatedAt
            ]);
        });

        downloadCsv(`momentum-students-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    }

    function exportFollowUpsCsv() {
        const rows = [[
            "Student",
            "Next Step",
            "Description",
            "Status",
            "Assigned To",
            "Priority",
            "Due Date",
            "Completed At"
        ]];

        getFilteredStudents().forEach((student) => {
            student.journey.followUps.forEach((item) => {
                rows.push([
                    displayName(student),
                    item.title,
                    item.description,
                    item.status,
                    item.assignedTo,
                    item.priority,
                    item.dueDate,
                    item.completedAt
                ]);
            });
        });

        downloadCsv(`momentum-followups-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) {
            return;
        }

        if (target.dataset.action === "export-students-csv") {
            exportStudentsCsv();
            App.showToast("Student CSV exported.");
        } else if (target.dataset.action === "export-followups-csv") {
            exportFollowUpsCsv();
            App.showToast("Follow-up CSV exported.");
        } else if (target.dataset.action === "print-reports") {
            const selector = document.getElementById("reportPrintType");
            printReport(selector ? selector.value : "overview");
        } else if (target.dataset.action === "open-custom-report-builder") {
            state.modalRoot.innerHTML = reportBuilderTemplate();
            document.body.style.overflow = "hidden";
        } else if (target.dataset.action === "close-custom-report") {
            state.modalRoot.innerHTML = "";
            document.body.style.overflow = "";
        } else if (target.dataset.action === "select-all-report-students") {
            document.querySelectorAll(
                '.custom-report-student-list input[name="studentIds"]'
            ).forEach((input) => {
                input.checked = true;
            });
        } else if (target.dataset.action === "clear-report-students") {
            document.querySelectorAll(
                '.custom-report-student-list input[name="studentIds"]'
            ).forEach((input) => {
                input.checked = false;
            });
        }
    }

    function initialize() {
        state.container = document.getElementById("reportsContent");
        state.modalRoot = document.getElementById("modalRoot");

        document.addEventListener("click", handleClick);
        document.addEventListener("submit", (event) => {
            if (event.target.id !== "customReportForm") {
                return;
            }

            event.preventDefault();
            if (generateCustomReport(event.target)) {
                state.modalRoot.innerHTML = "";
                document.body.style.overflow = "";
                App.showToast("Custom report opened for printing.");
            }
        });
        document.addEventListener("input", (event) => {
            if (event.target.id !== "customReportStudentSearch") {
                return;
            }

            const query = event.target.value.trim().toLowerCase();
            document.querySelectorAll("[data-report-student-name]").forEach((row) => {
                row.hidden = Boolean(query) &&
                    !row.dataset.reportStudentName.includes(query);
            });
        });
        document.addEventListener(StudentManager.DATA_CHANGED_EVENT, render);

        render();
    }

    return Object.freeze({
        initialize,
        render,
        exportStudentsCsv,
        exportFollowUpsCsv,
        printReport,
        generateCustomReport
    });
})();
