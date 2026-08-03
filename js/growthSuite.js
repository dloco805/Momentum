/*
==========================================================
Momentum
Growth Intelligence Suite
Build v19.0.0
File: js/growthSuite.js
==========================================================
*/

"use strict";

const GrowthSuite = (() => {
    const state = {
        content: null,
        studentFilter: "",
        section: "overview"
    };

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function students() {
        return typeof StudentManager !== "undefined"
            ? StudentManager.getStudents().filter((student) => !student.meta?.archived)
            : [];
    }

    function active(items = []) {
        return items.filter((item) =>
            item.status !== "completed" &&
            item.status !== "archived" &&
            !item.archived &&
            !item.completedAt
        );
    }

    function completed(items = []) {
        return items.filter((item) =>
            item.status === "completed" || Boolean(item.completedAt)
        );
    }

    function latestCheckIn(student) {
        return [...(student.journey.checkIns || [])]
            .sort((a, b) => new Date(
                `${b.meetingDate || "1970-01-01"}T${b.meetingTime || "12:00"}`
            ) - new Date(
                `${a.meetingDate || "1970-01-01"}T${a.meetingTime || "12:00"}`
            ))[0] || null;
    }

    function daysSince(value) {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;
        return Math.floor((Date.now() - date.getTime()) / 86400000);
    }

    function displayName(student) {
        return student.profile.preferredName ||
            [student.profile.firstName, student.profile.lastName]
                .filter(Boolean).join(" ") ||
            "Student";
    }

    function studentTimeline(student) {
        const items = [];

        (student.journey.checkIns || []).forEach((item) => items.push({
            date: item.meetingDate || item.createdAt,
            type: "Meeting",
            title: item.summary || "Student check-in",
            detail: item.nextSteps?.[0] || ""
        }));

        [
            ["currentProjects", "Project"],
            ["internships", "Internship"],
            ["goals", "Goal"],
            ["reflections", "Reflection"],
            ["evidence", "Evidence"],
            ["milestones", "Milestone"],
            ["observations", "Observation"],
            ["followUps", "Follow-Up"]
        ].forEach(([collection, type]) => {
            (student.journey[collection] || []).forEach((item) => items.push({
                date: item.updatedAt || item.completedAt || item.createdAt || item.dueDate,
                type,
                title: item.title || item.description || type,
                detail: item.nextSteps?.[0] || item.note || ""
            }));
        });

        return items
            .filter((item) => item.date)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function buildStory(student) {
        const project = active(student.journey.currentProjects)[0];
        const internship = active(student.journey.internships)[0];
        const goals = active(student.journey.goals);
        const doneGoals = completed(student.journey.goals);
        const interests = student.profile.interests || [];
        const focus = student.profile.currentFocus;
        const parts = [];

        if (interests.length) {
            parts.push(`${displayName(student)} has shown interest in ${interests.slice(0, 3).join(", ")}.`);
        } else {
            parts.push(`${displayName(student)} is still exploring interests and future directions.`);
        }

        if (focus) {
            parts.push(`The current focus is ${focus.toLowerCase()}.`);
        }

        if (project) {
            parts.push(`Current learning is centered on the project “${project.title}.”`);
        }

        if (internship) {
            parts.push(`Real-world experience includes ${internship.organization || internship.title}.`);
        }

        if (goals.length) {
            parts.push(`There ${goals.length === 1 ? "is" : "are"} ${goals.length} active goal${goals.length === 1 ? "" : "s"}.`);
        }

        if (doneGoals.length) {
            parts.push(`${doneGoals.length} goal${doneGoals.length === 1 ? " has" : "s have"} already been completed.`);
        }

        return parts.join(" ");
    }

    function attentionItems() {
        const rows = [];

        students().forEach((student) => {
            const last = latestCheckIn(student);
            const meetingDays = daysSince(last?.meetingDate || last?.createdAt);
            const openFollowUps = (student.journey.followUps || []).filter((item) =>
                item.status !== "completed" && !item.completedAt
            );
            const overdue = openFollowUps.filter((item) =>
                item.dueDate && new Date(item.dueDate) < new Date()
            );
            const activeGoals = active(student.journey.goals);
            const activeInternships = active(student.journey.internships);

            if (meetingDays === null || meetingDays >= 14) {
                rows.push({
                    student,
                    priority: meetingDays === null ? 4 : Math.min(5, 2 + Math.floor(meetingDays / 14)),
                    label: meetingDays === null ? "No meeting recorded" : `${meetingDays} days since meeting`,
                    action: "Schedule a check-in"
                });
            }

            if (overdue.length) {
                rows.push({
                    student,
                    priority: 5,
                    label: `${overdue.length} overdue follow-up${overdue.length === 1 ? "" : "s"}`,
                    action: overdue[0].title || "Review follow-up"
                });
            }

            if (!activeGoals.length) {
                rows.push({
                    student,
                    priority: 2,
                    label: "No current goals",
                    action: "Set a current goal"
                });
            }

            if (activeInternships[0]?.nextShift) {
                rows.push({
                    student,
                    priority: 1,
                    label: `Next internship shift: ${activeInternships[0].nextShift}`,
                    action: activeInternships[0].currentObjective || "Review internship objective"
                });
            }
        });

        return rows.sort((a, b) => b.priority - a.priority);
    }

    function insightItems() {
        const insights = [];

        students().forEach((student) => {
            const recent = studentTimeline(student);
            const completedThisMonth = recent.filter((item) => {
                const date = new Date(item.date);
                const now = new Date();
                return item.type === "Goal" &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear() &&
                    completed(student.journey.goals).some((goal) =>
                        (goal.title || "") === item.title
                    );
            }).length;

            if (completedThisMonth) {
                insights.push({
                    student,
                    tone: "success",
                    title: `${completedThisMonth} goal${completedThisMonth === 1 ? "" : "s"} completed this month`,
                    detail: "Momentum is building through visible follow-through."
                });
            }

            const last = latestCheckIn(student);
            const gap = daysSince(last?.meetingDate || last?.createdAt);
            if (gap !== null && gap >= 18) {
                insights.push({
                    student,
                    tone: "warning",
                    title: `No meeting for ${gap} days`,
                    detail: "A check-in may help reconnect current goals and next actions."
                });
            }

            const recentMeetings = [...(student.journey.checkIns || [])]
                .sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate))
                .slice(0, 4);
            const withNextSteps = recentMeetings.filter((item) => item.nextSteps?.length).length;
            if (recentMeetings.length >= 3 && withNextSteps === recentMeetings.length) {
                insights.push({
                    student,
                    tone: "success",
                    title: "Strong meeting follow-through",
                    detail: "Recent meetings consistently ended with concrete next steps."
                });
            }
        });

        return insights;
    }

    function opportunityMatches() {
        if (typeof OpportunityManager === "undefined") return [];
        const opportunities = OpportunityManager.getOpportunities?.() || [];
        const matches = [];

        students().forEach((student) => {
            const interests = [
                ...(student.profile.interests || []),
                ...(student.journey.careerInterests || []),
                ...(student.profile.strengths || [])
            ].map((item) => String(item).toLowerCase());

            opportunities.forEach((opportunity) => {
                const text = [
                    opportunity.title,
                    opportunity.organization,
                    opportunity.description,
                    ...(opportunity.tags || []),
                    ...(opportunity.skills || [])
                ].join(" ").toLowerCase();

                const reasons = interests
                    .filter((interest) => interest && text.includes(interest))
                    .slice(0, 3);

                const transport = student.profile.transportation;
                if (transport?.hasReliableAccess || transport?.modes?.length) {
                    reasons.push("transportation plan recorded");
                }

                if (reasons.length) {
                    matches.push({ student, opportunity, reasons });
                }
            });
        });

        return matches.slice(0, 12);
    }

    function circlePatterns() {
        if (typeof CircleManager === "undefined") return [];
        const counts = new Map();

        (CircleManager.getCircles?.() || []).forEach((circle) => {
            [
                circle.topic,
                ...(circle.studentThemes || []),
                ...(circle.questionsRaised || [])
            ].filter(Boolean).forEach((value) => {
                const key = String(value).trim();
                if (!key) return;
                counts.set(key, (counts.get(key) || 0) + 1);
            });
        });

        return [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12);
    }

    function partnershipRows() {
        if (typeof PartnerManager === "undefined") return [];
        const partners = PartnerManager.getPartners?.() || [];

        return partners.map((partner) => {
            const placements = students().filter((student) =>
                (student.journey.partnerEngagements || [])
                    .some((item) => item.partnerId === partner.id)
            );
            return { partner, placements };
        }).sort((a, b) => b.placements.length - a.placements.length);
    }

    function portfolioReadiness(student) {
        const values = [
            completed(student.journey.currentProjects).length > 0,
            completed(student.journey.internships).length > 0,
            completed(student.journey.goals).length > 0,
            (student.journey.evidence || []).length > 0,
            Boolean(student.profile.portfolioUrl),
            (student.journey.reflections || []).length > 0
        ];
        return values.filter(Boolean).length;
    }

    function topStats() {
        const all = students();
        return {
            students: all.length,
            needsAttention: new Set(attentionItems().filter((item) => item.priority >= 4)
                .map((item) => item.student.id)).size,
            activeInternships: all.reduce((sum, student) =>
                sum + active(student.journey.internships).length, 0),
            completedGoals: all.reduce((sum, student) =>
                sum + completed(student.journey.goals).length, 0)
        };
    }

    function navButton(id, label) {
        return `<button type="button"
            class="${state.section === id ? "is-active" : ""}"
            data-growth-section="${id}">${label}</button>`;
    }

    function renderOverview() {
        const stats = topStats();
        const inbox = attentionItems().slice(0, 10);
        const insights = insightItems().slice(0, 8);

        return `
            <div class="growth-stat-grid">
                <article><strong>${stats.students}</strong><span>Students</span></article>
                <article><strong>${stats.needsAttention}</strong><span>Need attention</span></article>
                <article><strong>${stats.activeInternships}</strong><span>Active internships</span></article>
                <article><strong>${stats.completedGoals}</strong><span>Goals completed</span></article>
            </div>

            <div class="growth-two-column">
                <section class="growth-section">
                    <div class="growth-section-heading">
                        <h3>Caseload Inbox</h3>
                        <button type="button" data-view="caseload">Open Caseload</button>
                    </div>
                    <div class="growth-list">
                        ${inbox.length ? inbox.map((item) => `
                            <button type="button" data-growth-student="${escapeHtml(item.student.id)}">
                                <span>${escapeHtml(item.label)}</span>
                                <strong>${escapeHtml(displayName(item.student))}</strong>
                                <small>${escapeHtml(item.action)}</small>
                            </button>
                        `).join("") : `<p class="empty-copy">Nothing urgent right now.</p>`}
                    </div>
                </section>

                <section class="growth-section">
                    <div class="growth-section-heading">
                        <h3>Automatic Insights</h3>
                        <button type="button" data-view="insights">Open Insights</button>
                    </div>
                    <div class="growth-insight-list">
                        ${insights.length ? insights.map((item) => `
                            <button type="button" class="tone-${item.tone}"
                                data-growth-student="${escapeHtml(item.student.id)}">
                                <strong>${escapeHtml(item.title)}</strong>
                                <span>${escapeHtml(displayName(item.student))}</span>
                                <small>${escapeHtml(item.detail)}</small>
                            </button>
                        `).join("") : `<p class="empty-copy">Insights will appear as records grow.</p>`}
                    </div>
                </section>
            </div>
        `;
    }

    function renderStudents() {
        return `
            <div class="growth-student-story-list">
                ${students().map((student) => {
                    const timeline = studentTimeline(student).slice(0, 4);
                    const readiness = portfolioReadiness(student);
                    return `
                        <details class="growth-student-story">
                            <summary>
                                <div>
                                    <strong>${escapeHtml(displayName(student))}</strong>
                                    <span>${escapeHtml(student.profile.currentFocus || "Still exploring")}</span>
                                </div>
                                <small>${readiness}/6 portfolio elements ready</small>
                            </summary>
                            <div class="growth-story-body">
                                <section>
                                    <h4>Student Story</h4>
                                    <p>${escapeHtml(buildStory(student))}</p>
                                    <button type="button"
                                        data-growth-student="${escapeHtml(student.id)}">
                                        Open Student Binder
                                    </button>
                                </section>
                                <section>
                                    <h4>Recent Timeline</h4>
                                    <div class="growth-mini-timeline">
                                        ${timeline.length ? timeline.map((item) => `
                                            <article>
                                                <span>${escapeHtml(item.type)}</span>
                                                <strong>${escapeHtml(item.title)}</strong>
                                                <small>${escapeHtml(
                                                    DateUtils.formatDate(item.date)
                                                )}</small>
                                            </article>
                                        `).join("") : `<p class="empty-copy">No activity yet.</p>`}
                                    </div>
                                </section>
                            </div>
                        </details>
                    `;
                }).join("")}
            </div>
        `;
    }

    function renderOpportunities() {
        const matches = opportunityMatches();
        return `
            <section class="growth-section">
                <div class="growth-section-heading">
                    <h3>Opportunity Matches</h3>
                    <button type="button" data-view="community">Open Community</button>
                </div>
                <div class="growth-match-list">
                    ${matches.length ? matches.map((match) => `
                        <article>
                            <div>
                                <span>${escapeHtml(displayName(match.student))}</span>
                                <h4>${escapeHtml(match.opportunity.title || "Opportunity")}</h4>
                                <p>${escapeHtml(
                                    match.opportunity.organization || ""
                                )}</p>
                            </div>
                            <div class="tag-list">
                                ${match.reasons.map((reason) =>
                                    `<span class="tag">${escapeHtml(reason)}</span>`
                                ).join("")}
                            </div>
                            <button type="button"
                                data-growth-student="${escapeHtml(match.student.id)}">
                                Student
                            </button>
                        </article>
                    `).join("") : `
                        <p class="empty-copy">
                            Add opportunity descriptions, tags, and student interests to see matches.
                        </p>
                    `}
                </div>
            </section>
        `;
    }

    function renderCircles() {
        const patterns = circlePatterns();
        return `
            <div class="growth-two-column">
                <section class="growth-section">
                    <div class="growth-section-heading">
                        <h3>Circle Patterns</h3>
                        <button type="button" data-view="circles">Open Circles</button>
                    </div>
                    <div class="growth-pattern-list">
                        ${patterns.length ? patterns.map(([label, count]) => `
                            <article>
                                <strong>${escapeHtml(label)}</strong>
                                <span>${count} mention${count === 1 ? "" : "s"}</span>
                            </article>
                        `).join("") : `<p class="empty-copy">Record Circles to reveal recurring themes.</p>`}
                    </div>
                </section>

                <section class="growth-section">
                    <div class="growth-section-heading">
                        <h3>Questions to Revisit</h3>
                        <button type="button" data-view="questionlab">Question Lab</button>
                    </div>
                    <div class="growth-list">
                        ${(CircleManager.getCircles?.() || [])
                            .flatMap((circle) => circle.questionsRaised || [])
                            .slice(-10).reverse().map((question) => `
                                <div class="growth-static-row">
                                    <strong>${escapeHtml(question)}</strong>
                                </div>
                            `).join("") || `<p class="empty-copy">No student questions recorded yet.</p>`}
                    </div>
                </section>
            </div>
        `;
    }

    function renderPartners() {
        const rows = partnershipRows();
        return `
            <section class="growth-section">
                <div class="growth-section-heading">
                    <h3>Opportunity CRM</h3>
                    <button type="button" data-view="community">Open Community</button>
                </div>
                <div class="growth-partner-table">
                    ${rows.length ? rows.map(({ partner, placements }) => `
                        <article>
                            <div>
                                <strong>${escapeHtml(
                                    partner.organization || partner.name || "Community Partner"
                                )}</strong>
                                <span>${escapeHtml(
                                    partner.contactName || partner.primaryContact || ""
                                )}</span>
                            </div>
                            <div>
                                <strong>${placements.length}</strong>
                                <span>students connected</span>
                            </div>
                            <div>
                                <span>${escapeHtml(
                                    partner.status || partner.relationshipStatus || "Active"
                                )}</span>
                            </div>
                        </article>
                    `).join("") : `<p class="empty-copy">Add partners to build the relationship pipeline.</p>`}
                </div>
            </section>
        `;
    }

    function renderPortfolio() {
        const all = students()
            .map((student) => ({
                student,
                score: portfolioReadiness(student),
                completedProjects: completed(student.journey.currentProjects).length,
                completedInternships: completed(student.journey.internships).length,
                evidence: (student.journey.evidence || []).length
            }))
            .sort((a, b) => b.score - a.score);

        return `
            <section class="growth-section">
                <div class="growth-section-heading">
                    <h3>Portfolio Builder</h3>
                    <button type="button" data-view="reports">Open Reports</button>
                </div>
                <div class="growth-portfolio-list">
                    ${all.map((row) => `
                        <article>
                            <div>
                                <strong>${escapeHtml(displayName(row.student))}</strong>
                                <span>${row.score}/6 portfolio elements ready</span>
                            </div>
                            <div>
                                <span>${row.completedProjects} projects</span>
                                <span>${row.completedInternships} internships</span>
                                <span>${row.evidence} evidence items</span>
                            </div>
                            <button type="button"
                                data-growth-student="${escapeHtml(row.student.id)}">
                                Open Portfolio
                            </button>
                        </article>
                    `).join("")}
                </div>
            </section>
        `;
    }

    function render() {
        if (!state.content) return;

        const body = state.section === "students"
            ? renderStudents()
            : state.section === "opportunities"
                ? renderOpportunities()
                : state.section === "circles"
                    ? renderCircles()
                    : state.section === "partners"
                        ? renderPartners()
                        : state.section === "portfolio"
                            ? renderPortfolio()
                            : renderOverview();

        state.content.innerHTML = `
            <nav class="growth-suite-tabs" aria-label="Growth intelligence sections">
                ${navButton("overview", "Overview")}
                ${navButton("students", "Student Stories")}
                ${navButton("opportunities", "Matches")}
                ${navButton("circles", "Circle Patterns")}
                ${navButton("partners", "Partnerships")}
                ${navButton("portfolio", "Portfolio Builder")}
            </nav>
            <div class="growth-suite-content">${body}</div>
        `;
    }

    function initialize() {
        state.content = document.getElementById("growthSuiteContent");
        if (!state.content) return;

        document.addEventListener("click", (event) => {
            const section = event.target.closest("[data-growth-section]");
            if (section) {
                state.section = section.dataset.growthSection || "overview";
                render();
                return;
            }

            const student = event.target.closest("[data-growth-student]");
            if (student) {
                document.dispatchEvent(new CustomEvent("viewStudent", {
                    detail: {
                        studentId: student.dataset.growthStudent,
                        tab: state.section === "portfolio" ? "portfolio" : "myMomentum"
                    }
                }));
            }
        });

        [
            StudentManager.DATA_CHANGED_EVENT,
            "studentDataChanged",
            "circleDataChanged",
            "opportunityDataChanged",
            "partnerDataChanged"
        ].filter(Boolean).forEach((eventName) => {
            document.addEventListener(eventName, render);
        });

        render();
    }

    return Object.freeze({ initialize, render });
})();
