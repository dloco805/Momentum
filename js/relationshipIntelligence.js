/*
==========================================================
Momentum
Educator Relationship Intelligence
Build v22.0.1
File: js/relationshipIntelligence.js
==========================================================
*/

"use strict";

const RelationshipIntelligence = (() => {
    const state = {
        container: null,
        filter: "all",
        search: ""
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
            [student.profile.firstName, student.profile.lastName]
                .filter(Boolean)
                .join(" ") ||
            "Unnamed Student";
    }

    function meetingDate(item) {
        return DateUtils.combineLocalDateTime(
            item.meetingDate,
            item.meetingTime || "12:00"
        ) || new Date(item.createdAt || 0);
    }

    function latestMeeting(student) {
        return [...student.journey.checkIns]
            .sort((a, b) => meetingDate(b) - meetingDate(a))[0] || null;
    }

    function daysSince(date) {
        if (!date || Number.isNaN(date.getTime())) return null;
        return Math.floor((DateUtils.startOfToday() - date) / 86400000);
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

    function activeItems(items = []) {
        return items.filter((item) =>
            item.status !== "completed" &&
            item.status !== "archived" &&
            !item.archived &&
            !item.completedAt
        );
    }

    function normalizedText(student) {
        return [
            ...student.profile.interests,
            ...student.profile.discovery.favoriteYouTube,
            ...student.profile.discovery.favoriteGames,
            ...student.profile.discovery.favoriteMedia,
            ...student.profile.discovery.freeTime,
            ...student.profile.discovery.curiosities,
            ...student.profile.discovery.thingsToTry,
            ...student.profile.discovery.thingsToLearn,
            ...student.profile.discovery.othersNotice,
            ...student.journey.observations.flatMap((item) => [
                item.note,
                item.barrier,
                item.nextMove
            ]),
            ...student.journey.checkIns.flatMap((item) => [
                item.summary,
                item.reflection,
                item.newQuestions,
                item.nextSteps
            ])
        ].flat(Infinity).filter(Boolean).join(" ").toLowerCase();
    }

    function repeatedPatterns(student) {
        const text = normalizedText(student);
        const definitions = [
            ["Transportation", ["transportation", "ride", "bus", "car", "license"]],
            ["Attendance", ["attendance", "absent", "late", "tardy"]],
            ["Motivation", ["motivation", "unmotivated", "stuck", "avoid"]],
            ["Anxiety / Confidence", ["anxious", "anxiety", "confidence", "nervous"]],
            ["Project Progress", ["project", "milestone", "prototype", "progress"]],
            ["Work Readiness", ["internship", "work", "resume", "interview"]],
            ["Family Responsibilities", ["family", "siblings", "childcare", "home"]],
            ["Technology Access", ["computer", "internet", "wifi", "device"]]
        ];

        return definitions
            .map(([label, terms]) => ({
                label,
                count: terms.reduce((count, term) => {
                    const matches = text.match(new RegExp(`\\b${term}\\b`, "g"));
                    return count + (matches ? matches.length : 0);
                }, 0)
            }))
            .filter((item) => item.count >= 2)
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);
    }

    function discoveryCompleteness(student) {
        const d = student.profile.discovery;
        const fields = [
            student.profile.interests,
            d.favoriteYouTube,
            d.favoriteGames,
            d.favoriteMedia,
            d.freeTime,
            d.curiosities,
            d.thingsToTry,
            d.thingsToLearn,
            d.othersNotice
        ];
        return fields.filter((items) => Array.isArray(items) && items.length).length;
    }

    function relationshipSignals(student) {
        const last = latestMeeting(student);
        const lastDate = last ? meetingDate(last) : null;
        const since = lastDate ? daysSince(lastDate) : null;
        const overdue = overdueFollowUps(student);
        const open = openFollowUps(student);
        const patterns = repeatedPatterns(student);
        const activeProjects = activeItems(student.journey.currentProjects);
        const activeInternships = activeItems(student.journey.internships);
        const discoveryCount = discoveryCompleteness(student);
        const signals = [];
        let attention = 0;

        if (!last) {
            signals.push({
                tone: "danger",
                label: "No meeting recorded",
                detail: "This student has not had a documented meeting."
            });
            attention += 35;
        } else if (since >= 28) {
            signals.push({
                tone: "danger",
                label: `${since} days since meeting`,
                detail: "Relationship contact is overdue."
            });
            attention += 30;
        } else if (since >= 14) {
            signals.push({
                tone: "warning",
                label: `${since} days since meeting`,
                detail: "Consider scheduling the next check-in."
            });
            attention += 15;
        } else {
            signals.push({
                tone: "success",
                label: `Met ${since === 0 ? "today" : `${since} days ago`}`,
                detail: "Recent relationship contact is documented."
            });
        }

        if (overdue.length) {
            signals.push({
                tone: "danger",
                label: `${overdue.length} overdue next step${overdue.length === 1 ? "" : "s"}`,
                detail: overdue[0].title || "Follow-through needs attention."
            });
            attention += Math.min(30, overdue.length * 10);
        } else if (open.length >= 3) {
            signals.push({
                tone: "warning",
                label: `${open.length} open next steps`,
                detail: "The follow-through load may be growing."
            });
            attention += 10;
        }

        if (!activeProjects.length) {
            signals.push({
                tone: "danger",
                label: "No active project",
                detail: "A current project has not been recorded."
            });
            attention += 18;
        }

        if (!activeInternships.length) {
            signals.push({
                tone: "danger",
                label: "No active internship",
                detail: "An active internship or work experience has not been recorded."
            });
            attention += 14;
        }

        if (discoveryCount <= 2) {
            signals.push({
                tone: "warning",
                label: "Discovery picture is still thin",
                detail: "Use Discovering Me questions before pushing toward a plan."
            });
            attention += 8;
        }

        if (
            student.profile.transportation.primaryMode === "No reliable transportation" ||
            (!student.profile.transportation.hasReliableAccess &&
             student.profile.transportation.primaryMode)
        ) {
            signals.push({
                tone: "danger",
                label: "Transportation barrier",
                detail: student.profile.transportation.notes ||
                    "Reliable transportation has not been confirmed."
            });
            attention += 12;
        }

        patterns.forEach((pattern) => {
            signals.push({
                tone: "pattern",
                label: `${pattern.label} mentioned repeatedly`,
                detail: `${pattern.count} related mentions across meetings and observations.`
            });
            attention += Math.min(8, pattern.count);
        });

        const noCommunityExperience =
            student.journey.opportunityEngagements.length === 0 &&
            student.journey.partnerEngagements.length === 0 &&
            student.journey.internships.length === 0;

        if (noCommunityExperience) {
            signals.push({
                tone: "danger",
                label: "No active community experience",
                detail: "No opportunity, partner, internship, or community engagement is recorded."
            });
            attention += 14;
        }

        return {
            student,
            last,
            daysSinceMeeting: since,
            overdue,
            open,
            patterns,
            signals,
            attention: Math.min(100, attention),
            activeProjects,
            activeInternships,
            discoveryCount,
            noCommunityExperience
        };
    }

    function allRows() {
        return StudentManager.getStudents({ includeArchived: false })
            .map(relationshipSignals)
            .sort((a, b) =>
                b.attention - a.attention ||
                displayName(a.student).localeCompare(displayName(b.student))
            );
    }

    function summary(rows) {
        return {
            total: rows.length,
            overdueContact: rows.filter((row) =>
                row.daysSinceMeeting === null || row.daysSinceMeeting >= 28
            ).length,
            dueSoon: rows.filter((row) =>
                row.daysSinceMeeting !== null &&
                row.daysSinceMeeting >= 14 &&
                row.daysSinceMeeting < 28
            ).length,
            overdueActions: rows.filter((row) => row.overdue.length).length,
            transportation: rows.filter((row) =>
                row.signals.some((signal) => signal.label === "Transportation barrier")
            ).length,
            discoveryGaps: rows.filter((row) => row.discoveryCount <= 2).length,
            noCommunity: rows.filter((row) => row.noCommunityExperience).length
        };
    }

    function filterRows(rows) {
        const query = state.search.trim().toLowerCase();

        return rows.filter((row) => {
            const student = row.student;
            const matchesSearch = !query || [
                displayName(student),
                student.profile.interests.join(" "),
                row.signals.map((item) => `${item.label} ${item.detail}`).join(" ")
            ].join(" ").toLowerCase().includes(query);

            const matchesFilter =
                state.filter === "all" ||
                (state.filter === "contact" &&
                    (row.daysSinceMeeting === null || row.daysSinceMeeting >= 14)) ||
                (state.filter === "followups" && row.overdue.length) ||
                (state.filter === "transportation" &&
                    row.signals.some((signal) => signal.label === "Transportation barrier")) ||
                (state.filter === "discovery" && row.discoveryCount <= 2) ||
                (state.filter === "community" && row.noCommunityExperience) ||
                (state.filter === "patterns" && row.patterns.length);

            return matchesSearch && matchesFilter;
        });
    }

    function statusLabel(attention) {
        if (attention >= 50) return "High attention";
        if (attention >= 25) return "Needs review";
        return "On track";
    }

    function renderSignal(signal) {
        return `
            <article class="relationship-signal signal-${escapeHtml(signal.tone)}">
                <strong>${escapeHtml(signal.label)}</strong>
                <p>${escapeHtml(signal.detail)}</p>
            </article>
        `;
    }

    function renderRow(row) {
        const student = row.student;
        return `
            <article class="relationship-student-card">
                <div class="relationship-card-header">
                    <div>
                        <button class="student-name-link" type="button"
                            data-action="open-insight-student"
                            data-student-id="${escapeHtml(student.id)}">
                            ${escapeHtml(displayName(student))}
                        </button>
                        <p>${escapeHtml(statusLabel(row.attention))}</p>
                    </div>
                    <span class="relationship-attention attention-${
                        row.attention >= 50 ? "high" :
                        row.attention >= 25 ? "medium" : "low"
                    }">${row.attention >= 50 ? "Act soon" :
                        row.attention >= 25 ? "Review" : "On track"}</span>
                </div>

                <div class="relationship-signal-list">
                    ${row.signals.slice(0, 5).map(renderSignal).join("")}
                </div>

                <div class="relationship-card-actions">
                    <button class="button button-primary button-small" type="button"
                        data-action="start-insight-meeting"
                        data-student-id="${escapeHtml(student.id)}">
                        Start Meeting
                    </button>
                    <button class="button button-secondary button-small" type="button"
                        data-action="open-insight-student"
                        data-student-id="${escapeHtml(student.id)}">
                        Open Student
                    </button>
                    ${row.overdue.length ? `
                        <button class="button button-secondary button-small" type="button"
                            data-action="open-insight-followups"
                            data-student-id="${escapeHtml(student.id)}">
                            Needs Attention
                        </button>
                    ` : ""}
                </div>
            </article>
        `;
    }

    function render() {
        if (!state.container) return;

        const rows = allRows();
        const visible = filterRows(rows);
        const totals = summary(rows);

        state.container.innerHTML = `
            <section class="relationship-summary-grid">
                <button class="insight-summary-danger"
                    data-action="set-insight-filter" data-filter="contact">
                    <strong>${totals.overdueContact}</strong>
                    <span>Overdue for contact</span>
                </button>
                <button class="insight-summary-danger"
                    data-action="set-insight-filter" data-filter="followups">
                    <strong>${totals.overdueActions}</strong>
                    <span>Overdue action items</span>
                </button>
                <button class="insight-summary-danger"
                    data-action="set-insight-filter" data-filter="transportation">
                    <strong>${totals.transportation}</strong>
                    <span>Transportation barriers</span>
                </button>
                <button class="insight-summary-warning"
                    data-action="set-insight-filter" data-filter="discovery">
                    <strong>${totals.discoveryGaps}</strong>
                    <span>Discovery gaps</span>
                </button>
                <button class="insight-summary-danger"
                    data-action="set-insight-filter" data-filter="community">
                    <strong>${totals.noCommunity}</strong>
                    <span>No active community experience</span>
                </button>
            </section>

            <section class="relationship-toolbar">
                <label class="search-field">
                    <span aria-hidden="true">⌕</span>
                    <span class="visually-hidden">Search relationship insights</span>
                    <input id="relationshipInsightSearch" type="search"
                        value="${escapeHtml(state.search)}"
                        placeholder="Search students or patterns">
                </label>

                <div class="relationship-filter-row">
                    ${[
                        ["all", "All"],
                        ["contact", "Contact"],
                        ["followups", "Needs Attention"],
                        ["transportation", "Transportation"],
                        ["discovery", "Discovery"],
                        ["community", "Community"],
                        ["patterns", "Repeated Patterns"]
                    ].map(([value, label]) => `
                        <button class="relationship-filter ${
                            state.filter === value ? "is-active" : ""
                        }" type="button" data-action="set-insight-filter"
                            data-filter="${value}">
                            ${label}
                        </button>
                    `).join("")}
                </div>
            </section>

            <section class="relationship-priority-section">
                <div class="panel-header">
                    <div>
                        <p class="eyebrow">Highest attention first</p>
                        <h3>Caseload Priority Queue</h3>
                    </div>
                    <span class="support-count">${visible.length}</span>
                </div>

                ${visible.length ? `
                    <div class="relationship-grid">
                        ${visible.map(renderRow).join("")}
                    </div>
                ` : `
                    <div class="empty-state">
                        <h3>No students match this view</h3>
                        <p>Try another filter or clear the search.</p>
                    </div>
                `}
            </section>
        `;
    }

    function renderStudentSignals(student) {
        const row = relationshipSignals(student);

        return `
            <div class="student-signals-view">
                <section class="relationship-hero compact-relationship-hero">
                    <div>
                        <p class="eyebrow">Relationship and follow-through</p>
                        <h3>Student Signals</h3>
                        <p>
                            Patterns that may help you prepare, prioritize,
                            and decide what to ask next.
                        </p>
                    </div>
                    <button class="button button-primary" type="button"
                        data-action="start-student-meeting"
                        data-student-id="${escapeHtml(student.id)}">
                        Start Meeting
                    </button>
                </section>

                <section class="student-signal-summary">
                    <article>
                        <strong>${row.last
                            ? escapeHtml(DateUtils.formatDateTime(
                                row.last.meetingDate,
                                row.last.meetingTime
                            ))
                            : "Never"
                        }</strong>
                        <span>Last meeting</span>
                    </article>
                    <article>
                        <strong>${row.open.length}</strong>
                        <span>Open next steps</span>
                    </article>
                    <article>
                        <strong>${row.overdue.length}</strong>
                        <span>Overdue next steps</span>
                    </article>
                    <article>
                        <strong>${row.patterns.length}</strong>
                        <span>Repeated patterns</span>
                    </article>
                </section>

                <section class="student-signal-list">
                    ${row.signals.map(renderSignal).join("")}
                </section>

                ${row.patterns.length ? `
                    <section class="relationship-pattern-panel">
                        <div class="panel-header">
                            <div>
                                <p class="eyebrow">Across meetings and observations</p>
                                <h3>Repeated Themes</h3>
                            </div>
                        </div>
                        <div class="tag-list">
                            ${row.patterns.map((item) => `
                                <span class="tag">${escapeHtml(item.label)} · ${item.count}</span>
                            `).join("")}
                        </div>
                    </section>
                ` : ""}
            </div>
        `;
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;

        const action = target.dataset.action;
        const studentId = target.dataset.studentId;

        if (action === "set-insight-filter") {
            state.filter = target.dataset.filter || "all";
            render();
        } else if (action === "open-insight-student") {
            document.dispatchEvent(new CustomEvent("viewStudent", {
                detail: { studentId }
            }));
        } else if (action === "start-insight-meeting") {
            document.dispatchEvent(new CustomEvent("openStudentMeeting", {
                detail: { studentId }
            }));
        } else if (action === "open-insight-followups") {
            document.dispatchEvent(new CustomEvent("momentumNavigate", {
                detail: { view: "followups", studentId }
            }));
        }
    }

    function initialize() {
        state.container = document.getElementById("relationshipInsightsContent");
        if (!state.container) return;

        document.addEventListener("click", handleClick);
        document.addEventListener("input", (event) => {
            if (event.target.id === "relationshipInsightSearch") {
                state.search = event.target.value;
                render();
                const input = document.getElementById("relationshipInsightSearch");
                if (input) {
                    input.focus();
                    input.setSelectionRange(input.value.length, input.value.length);
                }
            }
        });
        document.addEventListener(StudentManager.DATA_CHANGED_EVENT, render);
        render();
    }

    return Object.freeze({
        initialize,
        render,
        renderStudentSignals,
        relationshipSignals
    });
})();
