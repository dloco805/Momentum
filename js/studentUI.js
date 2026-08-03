/*
==========================================================
Momentum
Student UI Module
Build v21.0.0
File: js/studentUI.js
==========================================================
*/

"use strict";

const StudentUI = (() => {
    const state = {
        browser: null,
        count: null,
        searchInput: null,
        statusFilter: null,
        advisorFilter: null,
        gradeFilter: null,
        supportFilter: null,
        sortSelect: null,
        detailContainer: null,
        modalRoot: null,
        currentStudentId: null,
        activeProfileTab: "myMomentum"
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
        const profile = student.profile;
        return profile.preferredName ||
            [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
            "Unnamed Student";
    }

    function fullName(student) {
        return [student.profile.firstName, student.profile.lastName]
            .filter(Boolean)
            .join(" ");
    }

    function initials(student) {
        const source = displayName(student);
        return source
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "?";
    }

    function formatDate(value) {
        return DateUtils.formatDate(value);
    }

    function countOpenFollowUps(student) {
        return student.journey.followUps.filter((item) =>
            item.status !== "completed" && !item.completedAt
        ).length;
    }

    function normalizePortfolioUrl(value) {
        const trimmed = String(value || "").trim();
        if (!trimmed) return "";

        const candidate = /^https?:\/\//i.test(trimmed)
            ? trimmed
            : `https://${trimmed}`;

        try {
            const url = new URL(candidate);
            return ["http:", "https:"].includes(url.protocol)
                ? url.href
                : "";
        } catch (error) {
            return "";
        }
    }

    function portfolioLink(student, options = {}) {
        const url = normalizePortfolioUrl(student.profile.portfolioUrl);
        if (!url) return options.empty || "";

        return `
            <a class="${escapeHtml(options.className || "button button-secondary")}"
                href="${escapeHtml(url)}"
                target="_blank"
                rel="noopener noreferrer">
                ${escapeHtml(options.label || "Open Google Sites Portfolio")}
            </a>
        `;
    }

    function splitList(value) {
        return String(value || "")
            .split(/[\n,;]+/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function renderTags(items, emptyMessage = "None added") {
        if (!items || !items.length) {
            return `<p class="empty-copy">${escapeHtml(emptyMessage)}</p>`;
        }

        return `
            <div class="tag-list">
                ${items.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}
            </div>
        `;
    }

    function profileTabButton(tabId, label) {
        const active = state.activeProfileTab === tabId;
        return `
            <button class="profile-tab ${active ? "is-active" : ""}" type="button"
                data-action="switch-profile-tab" data-profile-tab="${escapeHtml(tabId)}">
                ${escapeHtml(label)}
            </button>
        `;
    }

    function getCurrentJourneyItem(items = []) {
        return [...items]
            .filter((item) =>
                item &&
                item.status !== "completed" &&
                item.status !== "archived" &&
                !item.archived
            )
            .sort((a, b) =>
                new Date(b.updatedAt || b.createdAt || 0).getTime() -
                new Date(a.updatedAt || a.createdAt || 0).getTime()
            )[0] || null;
    }

    function formatJourneyStatus(item, fallback = "Active") {
        if (!item || !item.status) {
            return fallback;
        }

        return String(item.status)
            .replaceAll("-", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    function renderCurrentWorkItem(
        label,
        item,
        emptyLabel,
        emptyClass,
        studentId,
        collection
    ) {
        if (!item) {
            return `
                <div class="current-work-item is-missing ${escapeHtml(emptyClass)}">
                    <span class="current-work-label">${escapeHtml(label)}</span>
                    <strong>${escapeHtml(emptyLabel)}</strong>
                    <span class="current-work-status">Needs support</span>
                </div>
            `;
        }

        return `
            <div class="current-work-item">
                <span class="current-work-label">${escapeHtml(label)}</span>
                <button class="current-work-link" type="button"
                    title="${escapeHtml(item.title || "Untitled")}"
                    data-action="view-journey-item"
                    data-student-id="${escapeHtml(studentId)}"
                    data-collection="${escapeHtml(collection)}"
                    data-item-id="${escapeHtml(item.id)}">
                    ${escapeHtml(item.title || "Untitled")}
                </button>
                <span class="current-work-status">${escapeHtml(formatJourneyStatus(item))}</span>
            </div>
        `;
    }

    function latestMeetingMood(student) {
        const latest = [...student.journey.checkIns]
            .filter((item) => item.mood)
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

        return latest ? latest.mood : "";
    }

    function renderStudentCard(student) {
        const currentProject = getCurrentJourneyItem(student.journey.currentProjects);
        const currentInternship = getCurrentJourneyItem(student.journey.internships);
        const followUpCount = countOpenFollowUps(student);
        const overdueFollowUps = student.journey.followUps.filter((item) =>
            item.status !== "completed" &&
            !item.completedAt &&
            item.dueDate &&
            DateUtils.isOverdue(item.dueDate)
        ).length;
        const interests = student.profile.interests.slice(0, 3);

        const colorIndex = String(student.id || displayName(student))
            .split("")
            .reduce((sum, character) => sum + character.charCodeAt(0), 0) % 8;

        return `
            <article class="student-card record-tone-student student-color-${colorIndex} ${student.meta.archived ? "is-archived" : ""}">
                <div class="student-card-header">
                    <div>
                        <button class="student-name-link" type="button"
                        data-action="view-student"
                        data-student-id="${escapeHtml(student.id)}">
                        ${escapeHtml(displayName(student))}
                    </button>
                        <p class="student-card-subtitle">
                            ${escapeHtml(fullName(student) || "Full name not set")}
                        </p>
                    </div>
                </div>

                <div class="badges">
                    ${student.journey.dreamJobs.slice(0, 2).map((job) => `
                        <span class="badge dream-job-badge">★ ${escapeHtml(job)}</span>
                    `).join("")}
                    ${student.meta.archived ? `<span class="badge badge-warning">Archived</span>` : ""}
                </div>

                <div class="tag-list" style="margin-top: 14px;">
                    ${interests.length
                        ? interests.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")
                        : `<span class="badge">No interests added</span>`
                    }
                </div>

                <div class="student-current-work">
                    ${renderCurrentWorkItem(
                        "Current Project",
                        currentProject,
                        "Needs project",
                        "needs-project",
                        student.id,
                        "currentProjects"
                    )}
                    ${renderCurrentWorkItem(
                        "Current Internship",
                        currentInternship,
                        "Needs internship",
                        "needs-internship",
                        student.id,
                        "internships"
                    )}
                </div>

                <div class="student-card-footer-meta">
                    <span class="followup-indicator ${overdueFollowUps ? "has-overdue" : ""}">
                        ${followUpCount} open next step${followUpCount === 1 ? "" : "s"}
                        ${overdueFollowUps ? ` · ${overdueFollowUps} overdue` : ""}
                    </span>
                    <span>Updated ${escapeHtml(formatDate(student.meta.updatedAt))}</span>
                </div>

                <div class="card-actions">
                    <button class="button button-secondary button-small" type="button"
                        data-action="quick-next step" data-student-id="${escapeHtml(student.id)}">Follow-up</button>
                    ${student.meta.archived
                        ? ``
                        : ``
                    }
                </div>
            </article>
        `;
    }

    function populateFilterOptions() {
        const students = StudentManager.getStudents();
        const advisors = [...new Set(
            students.map((student) => student.profile.advisor).filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));
        const grades = [...new Set(
            students.map((student) => student.profile.grade).filter(Boolean)
        )].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));

        const currentAdvisor = state.advisorFilter ? state.advisorFilter.value : "";
        const currentGrade = state.gradeFilter ? state.gradeFilter.value : "";

        if (state.advisorFilter) {
            state.advisorFilter.innerHTML = `
                <option value="">All educators</option>
                ${advisors.map((advisor) => `
                    <option value="${escapeHtml(advisor)}">${escapeHtml(advisor)}</option>
                `).join("")}
            `;
            state.advisorFilter.value = advisors.includes(currentAdvisor) ? currentAdvisor : "";
        }

        if (state.gradeFilter) {
            state.gradeFilter.innerHTML = `
                <option value="">All students</option>
                ${grades.map((grade) => `
                    <option value="${escapeHtml(grade)}">${escapeHtml(grade)}</option>
                `).join("")}
            `;
            state.gradeFilter.value = grades.includes(currentGrade) ? currentGrade : "";
        }
    }

    function renderBrowser() {
        if (!state.browser) {
            return;
        }

        const query = state.searchInput ? state.searchInput.value : "";
        const status = state.statusFilter ? state.statusFilter.value : "active";
        let students = StudentManager.searchStudents(query, { status });
        const advisor = state.advisorFilter ? state.advisorFilter.value : "";
        const grade = state.gradeFilter ? state.gradeFilter.value : "";

        if (advisor) {
            students = students.filter((student) => student.profile.advisor === advisor);
        }

        if (grade) {
            students = students.filter((student) => student.profile.grade === grade);
        }

        const supportNeed = state.supportFilter ? state.supportFilter.value : "";
        const meetingInterval = (
            typeof Settings !== "undefined"
                ? Number(Settings.get("checkInIntervalDays"))
                : 14
        ) || 14;

        if (supportNeed === "project") {
            students = students.filter((student) =>
                !getCurrentJourneyItem(student.journey.currentProjects)
            );
        } else if (supportNeed === "internship") {
            students = students.filter((student) =>
                !getCurrentJourneyItem(student.journey.internships)
            );
        } else if (supportNeed === "meeting") {
            students = students.filter((student) => {
                const latest = [...student.journey.checkIns]
                    .sort((a, b) =>
                        new Date(b.meetingDate || b.createdAt) -
                        new Date(a.meetingDate || a.createdAt)
                    )[0];

                return !latest ||
                    (DateUtils.daysBetween(latest.meetingDate || latest.createdAt) || 0) >= meetingInterval;
            });
        } else if (supportNeed === "followup") {
            students = students.filter((student) =>
                student.journey.followUps.some((item) =>
                    item.status !== "completed" &&
                    !item.completedAt &&
                    item.dueDate &&
                    DateUtils.isOverdue(item.dueDate)
                )
            );
        }

        const sortMode = state.sortSelect ? state.sortSelect.value : "updated";

        students.sort((a, b) => {
            if (sortMode === "name") {
                return displayName(a).localeCompare(displayName(b));
            }
            if (sortMode === "followups") {
                return countOpenFollowUps(b) - countOpenFollowUps(a);
            }
            if (sortMode === "project") {
                const aProject = getCurrentJourneyItem(a.journey.currentProjects);
                const bProject = getCurrentJourneyItem(b.journey.currentProjects);
                return String(aProject ? aProject.title : "ZZZ").localeCompare(
                    String(bProject ? bProject.title : "ZZZ")
                );
            }
            if (sortMode === "internship") {
                const aInternship = getCurrentJourneyItem(a.journey.internships);
                const bInternship = getCurrentJourneyItem(b.journey.internships);
                return String(aInternship ? aInternship.title : "ZZZ").localeCompare(
                    String(bInternship ? bInternship.title : "ZZZ")
                );
            }
            return new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime();
        });

        const noun = students.length === 1 ? "Student" : "Students";

        if (state.count) {
            state.count.textContent = `${students.length} ${noun}`;
        }

        if (!students.length) {
            const hasSearch = Boolean(query.trim());
            state.browser.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon" aria-hidden="true">⌕</div>
                    <h3>${hasSearch ? "No matching students" : "No students yet"}</h3>
                    <p>${hasSearch
                        ? "Try a different name, grade, advisor, or interest."
                        : "Click “New Student” to add your first student."
                    }</p>
                    ${hasSearch ? "" : `
                        <button class="button button-primary" type="button" data-action="new-student">
                            + New Student
                        </button>
                    `}
                </div>
            `;
            return;
        }

        state.browser.innerHTML = `
            <div class="student-grid">
                ${students.map(renderStudentCard).join("")}
            </div>
        `;
    }

    function buildTimeline(student) {
        const entries = [];

        function pushEntries(items, type, label, titleGetter) {
            items.forEach((item) => {
                entries.push({
                    type,
                    label,
                    title: titleGetter(item),
                    description: item.description || item.notes || item.nextStep || "",
                    date: item.updatedAt || item.createdAt || item.dueDate || student.meta.updatedAt
                });
            });
        }

        pushEntries(
            student.journey.currentProjects,
            "project",
            "Project",
            (item) => item.title || "Untitled project"
        );
        pushEntries(
            student.journey.followUps,
            "next step",
            "Follow-up",
            (item) => item.title || "Follow-up"
        );
        pushEntries(
            student.journey.notes,
            "note",
            "Note",
            (item) => item.title || "Student note"
        );
        pushEntries(
            student.journey.reflections,
            "reflection",
            "Reflection",
            (item) => item.title || "Reflection"
        );
        pushEntries(
            student.journey.milestones,
            "milestone",
            "Milestone",
            (item) => item.title || "Milestone"
        );
        pushEntries(
            student.journey.internships,
            "internship",
            "Internship",
            (item) => item.title || "Internship"
        );
        pushEntries(
            student.journey.goals,
            "goal",
            "Goal",
            (item) => item.title || "Goal"
        );
        pushEntries(
            student.journey.evidence,
            "evidence",
            "Evidence",
            (item) => item.title || "Evidence"
        );

        student.journey.checkIns.forEach((checkIn) => {
            entries.push({
                type: "check-in",
                label: "Check-In",
                title: checkIn.summary || "Student meeting",
                description: [
                    checkIn.mood ? `Mood: ${checkIn.mood}` : "",
                    checkIn.nextSteps.length ? `Next steps: ${checkIn.nextSteps.join(", ")}` : ""
                ].filter(Boolean).join(" · "),
                date: DateUtils.combineLocalDateTime(
                    checkIn.meetingDate,
                    checkIn.meetingTime || "12:00"
                )?.toISOString() || checkIn.createdAt
            });
        });

        student.journey.partnerEngagements.forEach((engagement) => {
            const partner = typeof PartnerManager !== "undefined"
                ? PartnerManager.getPartner(engagement.partnerId)
                : null;

            entries.push({
                type: "partner",
                label: "Community Partner",
                title: partner ? partner.organization : "Partner update",
                description: [
                    engagement.relationshipType,
                    engagement.status,
                    engagement.nextStep ? `Next: ${engagement.nextStep}` : ""
                ].filter(Boolean).join(" · "),
                date: engagement.updatedAt || engagement.createdAt
            });
        });

        student.journey.opportunityEngagements.forEach((engagement) => {
            const opportunity = typeof OpportunityManager !== "undefined"
                ? OpportunityManager.getOpportunity(engagement.opportunityId)
                : null;

            entries.push({
                type: "opportunity",
                label: "Opportunity",
                title: opportunity ? opportunity.title : "Opportunity update",
                description: [
                    engagement.status,
                    engagement.nextStep ? `Next: ${engagement.nextStep}` : ""
                ].filter(Boolean).join(" · "),
                date: engagement.updatedAt || engagement.createdAt
            });
        });

        return entries
            .filter((entry) => entry.date)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 30);
    }

    function renderTimeline(student) {
        const entries = buildTimeline(student);

        if (!entries.length) {
            return `<p class="empty-copy">No timeline activity yet.</p>`;
        }

        return `
            <div class="timeline-feed">
                ${entries.map((entry) => `
                    <article class="timeline-entry">
                        <div class="timeline-entry-marker" aria-hidden="true"></div>
                        <div class="timeline-entry-content">
                            <strong>${escapeHtml(entry.label)} · ${escapeHtml(entry.title)}</strong>
                            ${entry.description ? `<p>${escapeHtml(entry.description)}</p>` : ""}
                            <p>${escapeHtml(formatDate(entry.date))}</p>
                        </div>
                    </article>
                `).join("")}
            </div>
        `;
    }

    function isLifecycleCollection(collection) {
        return ["currentProjects", "goals", "internships"].includes(collection);
    }

    function lifecycleStatus(item) {
        if (item.archived || item.status === "archived") {
            return "archived";
        }

        if (item.status === "completed") {
            return "completed";
        }

        return "active";
    }

    function lifecycleBadge(item) {
        const status = lifecycleStatus(item);
        const label = status === "active"
            ? "Active"
            : status === "completed"
                ? "Completed"
                : "Archived";

        const className = status === "archived"
            ? "badge-warning"
            : "badge-success";

        return `<span class="badge ${className}">${label}</span>`;
    }

    function renderProjectDetails(item) {
        const rows = [
            item.phase ? ["Phase", item.phase] : null,
            item.projectQuestion ? ["Project question", item.projectQuestion] : null,
            item.skills && item.skills.length ? ["Skills", item.skills.join(", ")] : null,
            item.partners && item.partners.length ? ["Partners", item.partners.join(", ")] : null,
            item.evidence && item.evidence.length ? ["Evidence", item.evidence.join(", ")] : null,
            item.reflections && item.reflections.length ? ["Reflections", item.reflections.join(", ")] : null,
            item.nextSteps && item.nextSteps.length ? ["Next steps", item.nextSteps.join(", ")] : null
        ].filter(Boolean);

        if (!rows.length) {
            return "";
        }

        return `
            <dl class="project-detail-list">
                ${rows.map(([label, value]) => `
                    <div>
                        <dt>${escapeHtml(label)}</dt>
                        <dd>${escapeHtml(value)}</dd>
                    </div>
                `).join("")}
            </dl>
        `;
    }


    function renderInternshipDetails(item) {
        const rows = [
            item.organization ? ["Organization", item.organization] : null,
            item.supervisor ? ["Supervisor", item.supervisor] : null,
            item.supervisorEmail ? ["Supervisor email", item.supervisorEmail] : null,
            item.supervisorPhone ? ["Supervisor phone", item.supervisorPhone] : null,
            item.location ? ["Location", item.location] : null,
            item.schedule ? ["Schedule", item.schedule] : null,
            item.hoursPerWeek ? ["Hours per week", item.hoursPerWeek] : null,
            item.currentObjective ? ["Current objective", item.currentObjective] : null,
            item.nextShift ? ["Next shift", item.nextShift] : null,
            item.startDate ? ["Start date", formatDate(item.startDate)] : null,
            item.endDate ? ["End date", formatDate(item.endDate)] : null,
            item.responsibilities && item.responsibilities.length
                ? ["Responsibilities", item.responsibilities.join(", ")]
                : null,
            item.skills && item.skills.length ? ["Skills", item.skills.join(", ")] : null,
            item.reflections && item.reflections.length
                ? ["Reflections", item.reflections.join(", ")]
                : null,
            item.nextSteps && item.nextSteps.length
                ? ["Next steps", item.nextSteps.join(", ")]
                : null
        ].filter(Boolean);

        if (!rows.length) {
            return "";
        }

        return `
            <dl class="project-detail-list internship-detail-list">
                ${rows.map(([label, value]) => `
                    <div>
                        <dt>${escapeHtml(label)}</dt>
                        <dd>${escapeHtml(value)}</dd>
                    </div>
                `).join("")}
            </dl>
        `;
    }

    function renderGoalDetails(item) {
        const rows = [
            item.category ? ["Category", item.category] : null,
            item.dueDate ? ["Target date", formatDate(item.dueDate)] : null,
            item.successCriteria ? ["Success looks like", item.successCriteria] : null,
            item.supportNeeded ? ["Support needed", item.supportNeeded] : null,
            item.checkpoints && item.checkpoints.length
                ? ["Checkpoints", item.checkpoints.join(", ")]
                : null,
            item.nextSteps && item.nextSteps.length
                ? ["Next steps", item.nextSteps.join(", ")]
                : null,
            item.progressNotes && item.progressNotes.length
                ? ["Progress notes", item.progressNotes.join(" • ")]
                : null
        ].filter(Boolean);

        if (!rows.length) {
            return "";
        }

        return `
            <dl class="project-detail-list goal-detail-list">
                ${rows.map(([label, value]) => `
                    <div>
                        <dt>${escapeHtml(label)}</dt>
                        <dd>${escapeHtml(value)}</dd>
                    </div>
                `).join("")}
            </dl>
        `;
    }

    function detailList(title, items, collection, studentId) {
        const sortedItems = isLifecycleCollection(collection)
            ? [...items].sort((a, b) => {
                const order = { active: 0, completed: 1, archived: 2 };
                const statusDifference = order[lifecycleStatus(a)] - order[lifecycleStatus(b)];
                if (statusDifference !== 0) {
                    return statusDifference;
                }

                return new Date(b.updatedAt || b.createdAt || 0) -
                    new Date(a.updatedAt || a.createdAt || 0);
            })
            : items;

        return `
            <section class="detail-section record-section-${escapeHtml(collection)}">
                <div class="panel-header">
                    <h3>${escapeHtml(title)}</h3>
                    <button class="button button-ghost button-small" type="button"
                        data-action="add-journey-item"
                        data-collection="${escapeHtml(collection)}"
                        data-student-id="${escapeHtml(studentId)}">+ Add</button>
                </div>
                ${sortedItems.length ? `
                    <ul class="data-list">
                        ${sortedItems.map((item) => `
                            <li class="data-list-item ${lifecycleStatus(item) !== "active" ? "is-inactive" : ""}">
                                <div class="data-list-content">
                                    <div class="detail-item-heading">
                                        ${["currentProjects", "internships", "goals"].includes(collection) ? `
                                            <button class="project-title-button" type="button"
                                                data-action="view-journey-item"
                                                data-collection="${escapeHtml(collection)}"
                                                data-item-id="${escapeHtml(item.id)}"
                                                data-student-id="${escapeHtml(studentId)}">
                                                ${escapeHtml(item.title || "Untitled")}
                                            </button>
                                        ` : `
                                            <strong>${escapeHtml(item.title || "Untitled")}</strong>
                                        `}
                                        ${isLifecycleCollection(collection) ? lifecycleBadge(item) : ""}
                                    </div>

                                    ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
                                    ${collection === "currentProjects" ? renderProjectDetails(item) : ""}
                                    ${collection === "internships" ? renderInternshipDetails(item) : ""}
                                    ${collection === "goals" ? renderGoalDetails(item) : ""}

                                    ${collection === "followUps" ? `
                                        <div class="badges">
                                            <span class="badge owner-badge">${escapeHtml(item.assignedTo === "Advisor" ? "Educator" : (item.assignedTo || "Educator"))}</span>
                                            <span class="badge priority-${escapeHtml((item.priority || "Normal").toLowerCase())}">
                                                ${escapeHtml(item.priority || "Normal")}
                                            </span>
                                            <span class="badge">${escapeHtml(
                                                item.status === "in-progress" ? "In Progress" :
                                                item.status === "completed" ? "Completed" : "Open"
                                            )}</span>
                                        </div>
                                    ` : ""}

                                    ${item.dueDate ? `<p>Due ${escapeHtml(formatDate(item.dueDate))}</p>` : ""}
                                </div>

                                <div class="card-actions">
                                    ${collection === "followUps" && item.status !== "completed" ? `
                                        <button class="button button-secondary button-small" type="button"
                                            data-action="complete-journey-item"
                                            data-collection="${escapeHtml(collection)}"
                                            data-item-id="${escapeHtml(item.id)}"
                                            data-student-id="${escapeHtml(studentId)}">Complete</button>
                                    ` : ""}

                                    ${isLifecycleCollection(collection) ? `
                                        <button class="button button-secondary button-small" type="button"
                                            data-action="view-journey-item"
                                            data-collection="${escapeHtml(collection)}"
                                            data-item-id="${escapeHtml(item.id)}"
                                            data-student-id="${escapeHtml(studentId)}">View</button>

                                        ${lifecycleStatus(item) === "active" ? `
                                            <button class="button button-primary button-small" type="button"
                                                data-action="complete-lifecycle-item"
                                                data-collection="${escapeHtml(collection)}"
                                                data-item-id="${escapeHtml(item.id)}"
                                                data-student-id="${escapeHtml(studentId)}">Mark Complete</button>
                                            <button class="button button-secondary button-small" type="button"
                                                data-action="archive-lifecycle-item"
                                                data-collection="${escapeHtml(collection)}"
                                                data-item-id="${escapeHtml(item.id)}"
                                                data-student-id="${escapeHtml(studentId)}">Archive</button>
                                        ` : `
                                            <button class="button button-secondary button-small" type="button"
                                                data-action="restore-lifecycle-item"
                                                data-collection="${escapeHtml(collection)}"
                                                data-item-id="${escapeHtml(item.id)}"
                                                data-student-id="${escapeHtml(studentId)}">Restore Active</button>
                                        `}
                                    ` : `
                                        <button class="button button-danger button-small" type="button"
                                            data-action="delete-journey-item"
                                            data-collection="${escapeHtml(collection)}"
                                            data-item-id="${escapeHtml(item.id)}"
                                            data-student-id="${escapeHtml(studentId)}">Delete</button>
                                    `}
                                </div>
                            </li>
                        `).join("")}
                    </ul>
                ` : `<p class="empty-copy">Nothing added yet.</p>`}
            </section>
        `;
    }

    function latestCheckIn(student) {
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

    function getMeetingCadence(student) {
        const intervalDays = (
            typeof Settings !== "undefined"
                ? Number(Settings.get("checkInIntervalDays"))
                : 14
        ) || 14;

        const latest = latestCheckIn(student);
        if (!latest) {
            return {
                label: "No meeting recorded",
                tone: "danger",
                daysSince: null,
                intervalDays
            };
        }

        const daysSince = DateUtils.daysBetween(latest.meetingDate || latest.createdAt);
        const remaining = Math.max(0, intervalDays - Math.max(0, daysSince || 0));

        if ((daysSince || 0) >= intervalDays) {
            return {
                label: `${daysSince} days since meeting`,
                tone: "danger",
                daysSince,
                intervalDays
            };
        }

        if (remaining <= 3) {
            return {
                label: `Meeting due in ${remaining} day${remaining === 1 ? "" : "s"}`,
                tone: "warning",
                daysSince,
                intervalDays
            };
        }

        return {
            label: `Meeting current · ${remaining} days remaining`,
            tone: "success",
            daysSince,
            intervalDays
        };
    }

    function renderMoodTrend(student) {
        const checkIns = [...student.journey.checkIns]
            .filter((item) => item.mood)
            .sort((a, b) =>
                new Date(b.meetingDate || b.createdAt) -
                new Date(a.meetingDate || a.createdAt)
            )
            .slice(0, 5);

        if (!checkIns.length) {
            return `<p class="empty-copy">No mood history yet.</p>`;
        }

        return `
            <div class="mood-trend-list">
                ${checkIns.map((item) => `
                    <div class="mood-trend-row">
                        <span class="mood-trend-date">${escapeHtml(
                            item.meetingDate
                                ? DateUtils.formatDateTime(item.meetingDate, item.meetingTime)
                                : DateUtils.formatDate(item.createdAt)
                        )}</span>
                        <div class="badges">
                            ${MoodUtils.renderBadges(item.mood, escapeHtml)}
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    function latestNextMeetingDate(student) {
        return [...student.journey.checkIns]
            .filter((item) => item.nextMeetingDate)
            .sort((a, b) =>
                new Date(b.meetingDate || b.createdAt) -
                new Date(a.meetingDate || a.createdAt)
            )[0]?.nextMeetingDate || "";
    }

    function renderProgressSnapshot(student) {
        const cadence = getMeetingCadence(student);
        const nextMeetingDate = latestNextMeetingDate(student);
        const openFollowUps = countOpenFollowUps(student);
        const overdueFollowUps = student.journey.followUps.filter((item) =>
            item.status !== "completed" &&
            !item.completedAt &&
            item.dueDate &&
            DateUtils.isOverdue(item.dueDate)
        ).length;
        const activeProjects = student.journey.currentProjects.filter((item) =>
            item.status !== "completed"
        ).length;
        const activeOpportunities = student.journey.opportunityEngagements.filter((item) =>
            !["Accepted", "Declined"].includes(item.status)
        ).length;
        const activePartners = student.journey.partnerEngagements.filter((item) =>
            !["Completed", "Paused"].includes(item.status)
        ).length;
        const activeGoals = student.journey.goals.filter((item) =>
            item.status !== "completed"
        ).length;

        const toneClass = {
            success: "snapshot-success",
            warning: "snapshot-warning",
            danger: "snapshot-danger"
        }[cadence.tone] || "";

        return `
            <section class="student-snapshot full-width">
                <div class="snapshot-header">
                    <div>
                        <p class="eyebrow">Student progress snapshot</p>
                        <h3>Current momentum</h3>
                    </div>
                    <button class="button button-primary button-small" type="button"
                        data-action="start-student-meeting" data-student-id="${escapeHtml(student.id)}">
                        Start Meeting
                    </button>
                </div>

                <div class="snapshot-grid">
                    <article class="snapshot-card ${toneClass}">
                        <span>Meeting cadence</span>
                        <strong>${escapeHtml(cadence.label)}</strong>
                        <small>${nextMeetingDate ? `Next: ${escapeHtml(formatDate(nextMeetingDate))}` : "No next meeting scheduled"}</small>
                    </article>
                    <article class="snapshot-card">
                        <span>Active projects</span>
                        <strong>${activeProjects}</strong>
                    </article>
                    <article class="snapshot-card ${overdueFollowUps ? "snapshot-danger" : ""}">
                        <span>Open next steps</span>
                        <strong>${openFollowUps}</strong>
                        <small>${overdueFollowUps} overdue</small>
                    </article>
                    <article class="snapshot-card">
                        <span>Opportunity pipeline</span>
                        <strong>${activeOpportunities}</strong>
                    </article>
                    <article class="snapshot-card">
                        <span>Active partners</span>
                        <strong>${activePartners}</strong>
                    </article>
                    <article class="snapshot-card">
                        <span>Active goals</span>
                        <strong>${activeGoals}</strong>
                    </article>
                </div>
            </section>
        `;
    }

    function renderInterestSummary(student) {
        const interests = student.profile.interests;

        if (!interests.length) {
            return `
                <section class="interest-summary-card interest-summary-empty">
                    <div>
                        <p class="eyebrow">Interests / Hobbies</p>
                        <h3>No interests or hobbies recorded yet</h3>
                        <p>Add interests or hobbies to improve projects, opportunities, and meeting conversations.</p>
                    </div>
                    <button class="button button-primary button-small" type="button"
                        data-action="edit-student" data-student-id="${escapeHtml(student.id)}">
                        Add Interests / Hobbies
                    </button>
                </section>
            `;
        }

        return `
            <section class="interest-summary-card">
                <div>
                    <p class="eyebrow">Interests / Hobbies</p>
                    <h3>${escapeHtml(interests.slice(0, 3).join(" · "))}</h3>
                    <p>${interests.length} recorded interest${interests.length === 1 ? "" : "s"}</p>
                </div>
                <div class="tag-list">
                    ${interests.slice(0, 8).map((interest) => `
                        <span class="tag">${escapeHtml(interest)}</span>
                    `).join("")}
                </div>
            </section>
        `;
    }

    function portfolioCompletedProjects(student) {
        return student.journey.currentProjects
            .filter((item) => item.status === "completed")
            .sort((a, b) =>
                new Date(b.completedAt || b.updatedAt || b.createdAt || 0) -
                new Date(a.completedAt || a.updatedAt || a.createdAt || 0)
            );
    }

    function portfolioCompletedInternships(student) {
        return student.journey.internships
            .filter((item) => item.status === "completed")
            .sort((a, b) =>
                new Date(b.completedAt || b.endDate || b.updatedAt || 0) -
                new Date(a.completedAt || a.endDate || a.updatedAt || 0)
            );
    }

    function portfolioSkills(student) {
        return [...new Set([
            ...student.journey.currentProjects.flatMap((item) => item.skills || []),
            ...student.journey.internships.flatMap((item) => item.skills || [])
        ].map((item) => String(item || "").trim()).filter(Boolean))];
    }

    function portfolioEvidence(student) {
        return [...new Set([
            ...student.journey.currentProjects.flatMap((item) => item.evidence || []),
            ...student.journey.evidence.map((item) => item.title || item.description || "")
        ].map((item) => String(item || "").trim()).filter(Boolean))];
    }

    function studentViewActiveItems(items) {
        return items.filter((item) =>
            item.status !== "completed" &&
            item.status !== "archived" &&
            !item.archived &&
            !item.completedAt
        );
    }

    function studentViewLatestMeeting(student) {
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

    function studentViewNextMeeting(student) {
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

    function renderStudentView(student) {
        const activeProjects = studentViewActiveItems(
            student.journey.currentProjects
        );
        const activeInternships = studentViewActiveItems(
            student.journey.internships
        );
        const activeGoals = studentViewActiveItems(student.journey.goals);
        const latestMeeting = studentViewLatestMeeting(student);
        const nextMeeting = studentViewNextMeeting(student);
        const assignedOpportunities = student.journey.opportunityEngagements
            .filter((engagement) =>
                !["Declined", "Closed"].includes(engagement.status)
            )
            .slice(0, 6);
        const completedProjects = portfolioCompletedProjects(student).slice(0, 3);
        const completedInternships = portfolioCompletedInternships(student).slice(0, 3);
        const completedGoals = completedLifecycleItems(student.journey.goals).slice(0, 4);

        return `
            <div class="student-facing-view">
                <section class="student-facing-section student-facing-about student-facing-tone-student">
                    <div class="panel-header">
                        <div>
                            <p class="eyebrow">About me</p>
                            <h3>Interests and direction</h3>
                        </div>
                    </div>

                    <div class="student-facing-about-grid">
                        <article>
                            <span>Interests / Hobbies</span>
                            ${student.profile.interests.length
                                ? renderTags(student.profile.interests)
                                : `<p class="empty-copy">Still exploring my interests.</p>`
                            }
                        </article>

                        <article>
                            <span>Dream Job</span>
                            ${student.journey.dreamJobs.length
                                ? `<div class="dream-job-list">
                                    ${student.journey.dreamJobs.map((job) => `
                                        <span class="dream-job-highlight">★ ${escapeHtml(job)}</span>
                                    `).join("")}
                                </div>`
                                : `<p class="empty-copy">Still exploring career ideas.</p>`
                            }
                        </article>

                        <article>
                            <span>After High School</span>
                            ${student.profile.postSecondaryGoals.length
                                ? renderTags(student.profile.postSecondaryGoals)
                                : `<p class="empty-copy">Plans are still developing.</p>`
                            }
                        </article>

                        <article>
                            <span>My Voice</span>
                            <p>${escapeHtml(
                                student.profile.studentVoice ||
                                "I have not added a student voice statement yet."
                            )}</p>
                        </article>

                        <article class="student-portfolio-link-card">
                            <span>My Portfolio Website</span>
                            ${student.profile.portfolioUrl
                                ? portfolioLink(student, {
                                    label: "Visit My Portfolio",
                                    className: "button button-primary button-small"
                                })
                                : `<p class="empty-copy">No portfolio website has been added yet.</p>`
                            }
                        </article>
                    </div>
                </section>

                <div class="student-facing-grid">
                    <section class="student-facing-section student-facing-tone-project ${activeProjects.length ? "" : "student-facing-missing"}">
                        <div class="panel-header">
                            <div>
                                <p class="eyebrow">What I am working on</p>
                                <h3>Current Project</h3>
                            </div>
                        </div>
                        ${activeProjects.length ? `
                            <div class="student-facing-record-list">
                                ${activeProjects.slice(0, 3).map((project) => `
                                    <article>
                                        <h4>${escapeHtml(project.title || "Project")}</h4>
                                        ${project.projectQuestion
                                            ? `<p><strong>Question:</strong> ${escapeHtml(project.projectQuestion)}</p>`
                                            : ""
                                        }
                                        ${project.description
                                            ? `<p>${escapeHtml(project.description)}</p>`
                                            : ""
                                        }
                                        ${project.phase
                                            ? `<span class="badge">${escapeHtml(project.phase)}</span>`
                                            : ""
                                        }
                                        ${project.nextSteps?.length ? `
                                            <div class="student-facing-next">
                                                <strong>Next steps</strong>
                                                <ul>
                                                    ${project.nextSteps.slice(0, 4).map((step) =>
                                                        `<li>${escapeHtml(step)}</li>`
                                                    ).join("")}
                                                </ul>
                                            </div>
                                        ` : ""}
                                    </article>
                                `).join("")}
                            </div>
                        ` : `<p class="empty-copy">No active project yet.</p>`}
                    </section>

                    <section class="student-facing-section student-facing-tone-internship ${activeInternships.length ? "" : "student-facing-missing"}">
                        <div class="panel-header">
                            <div>
                                <p class="eyebrow">Career experience</p>
                                <h3>Current Internship</h3>
                            </div>
                        </div>
                        ${activeInternships.length ? `
                            <div class="student-facing-record-list">
                                ${activeInternships.slice(0, 3).map((internship) => `
                                    <article>
                                        <h4>${escapeHtml(internship.title || "Internship")}</h4>
                                        ${internship.organization
                                            ? `<p><strong>Organization:</strong> ${escapeHtml(internship.organization)}</p>`
                                            : ""
                                        }
                                        ${internship.schedule
                                            ? `<p><strong>Schedule:</strong> ${escapeHtml(internship.schedule)}</p>`
                                            : ""
                                        }
                                        ${internship.responsibilities?.length ? `
                                            <div>
                                                <strong>What I am doing</strong>
                                                <ul>
                                                    ${internship.responsibilities.slice(0, 5).map((item) =>
                                                        `<li>${escapeHtml(item)}</li>`
                                                    ).join("")}
                                                </ul>
                                            </div>
                                        ` : ""}
                                        ${internship.nextSteps?.length ? `
                                            <div class="student-facing-next">
                                                <strong>Next steps</strong>
                                                <ul>
                                                    ${internship.nextSteps.slice(0, 4).map((step) =>
                                                        `<li>${escapeHtml(step)}</li>`
                                                    ).join("")}
                                                </ul>
                                            </div>
                                        ` : ""}
                                    </article>
                                `).join("")}
                            </div>
                        ` : `<p class="empty-copy">No active internship yet.</p>`}
                    </section>

                    <section class="student-facing-section student-facing-tone-goal ${activeGoals.length ? "" : "student-facing-missing"}">
                        <div class="panel-header">
                            <div>
                                <p class="eyebrow">Where I am headed</p>
                                <h3>My Goals</h3>
                            </div>
                        </div>
                        ${activeGoals.length ? `
                            <div class="student-facing-record-list">
                                ${activeGoals.slice(0, 6).map((goal) => `
                                    <article>
                                        <div class="student-facing-record-heading">
                                            <h4>${escapeHtml(goal.title || "Goal")}</h4>
                                            <span class="badge badge-success">Active</span>
                                        </div>
                                        ${goal.description
                                            ? `<p>${escapeHtml(goal.description)}</p>`
                                            : ""
                                        }
                                        ${goal.dueDate
                                            ? `<p><strong>Target:</strong> ${escapeHtml(formatDate(goal.dueDate))}</p>`
                                            : ""
                                        }
                                        ${goal.nextSteps?.length ? `
                                            <div class="student-facing-next">
                                                <strong>Next steps</strong>
                                                <ul>
                                                    ${goal.nextSteps.slice(0, 4).map((step) =>
                                                        `<li>${escapeHtml(step)}</li>`
                                                    ).join("")}
                                                </ul>
                                            </div>
                                        ` : ""}
                                    </article>
                                `).join("")}
                            </div>
                        ` : `<p class="empty-copy">No active goals yet.</p>`}
                    </section>

                    <section class="student-facing-section student-facing-tone-meeting">
                        <div class="panel-header">
                            <div>
                                <p class="eyebrow">Our latest conversation</p>
                                <h3>Latest Check-In</h3>
                            </div>
                        </div>
                        ${latestMeeting ? `
                            <div class="student-facing-checkin">
                                <div class="student-facing-checkin-heading">
                                    <strong>${escapeHtml(DateUtils.formatDateTime(
                                        latestMeeting.meetingDate,
                                        latestMeeting.meetingTime
                                    ))}</strong>
                                    <div class="badges">
                                        ${MoodUtils.renderBadges(latestMeeting.mood, escapeHtml)}
                                    </div>
                                </div>
                                <p>${escapeHtml(
                                    latestMeeting.summary ||
                                    "No meeting summary was recorded."
                                )}</p>
                                ${latestMeeting.nextSteps?.length ? `
                                    <div class="student-facing-next">
                                        <strong>My next steps</strong>
                                        <ul>
                                            ${latestMeeting.nextSteps.map((step) =>
                                                `<li>${escapeHtml(step)}</li>`
                                            ).join("")}
                                        </ul>
                                    </div>
                                ` : ""}
                                ${nextMeeting ? `
                                    <p class="student-facing-next-meeting">
                                        <strong>Next meeting:</strong>
                                        ${escapeHtml(formatDate(nextMeeting))}
                                    </p>
                                ` : ""}
                            </div>
                        ` : `<p class="empty-copy">No check-in has been recorded yet.</p>`}
                    </section>
                </div>

                <section class="student-facing-section student-facing-tone-opportunity">
                    <div class="panel-header">
                        <div>
                            <p class="eyebrow">Possibilities</p>
                            <h3>My Opportunities</h3>
                        </div>
                    </div>
                    ${assignedOpportunities.length ? `
                        <div class="student-facing-opportunity-grid">
                            ${assignedOpportunities.map((engagement) => {
                                const opportunity = OpportunityManager.getOpportunity(
                                    engagement.opportunityId
                                );
                                return `
                                    <article>
                                        <span class="badge">${escapeHtml(engagement.status || "Assigned")}</span>
                                        <h4>${escapeHtml(
                                            opportunity?.title || "Opportunity"
                                        )}</h4>
                                        ${opportunity?.organization
                                            ? `<p>${escapeHtml(opportunity.organization)}</p>`
                                            : ""
                                        }
                                        ${engagement.nextStep
                                            ? `<p><strong>Next:</strong> ${escapeHtml(engagement.nextStep)}</p>`
                                            : ""
                                        }
                                        ${engagement.dueDate
                                            ? `<p><strong>Due:</strong> ${escapeHtml(formatDate(engagement.dueDate))}</p>`
                                            : ""
                                        }
                                    </article>
                                `;
                            }).join("")}
                        </div>
                    ` : `<p class="empty-copy">No opportunities are currently assigned.</p>`}
                </section>

                <section class="student-facing-section student-facing-achievements student-facing-tone-success">
                    <div class="panel-header">
                        <div>
                            <p class="eyebrow">What I have accomplished</p>
                            <h3>Portfolio Highlights</h3>
                        </div>
                    </div>

                    <div class="student-facing-achievement-grid">
                        <article>
                            <strong>${completedProjects.length}</strong>
                            <span>Completed projects</span>
                            <ul>
                                ${completedProjects.map((item) =>
                                    `<li>${escapeHtml(item.title || "Project")}</li>`
                                ).join("")}
                            </ul>
                        </article>
                        <article>
                            <strong>${completedInternships.length}</strong>
                            <span>Completed internships</span>
                            <ul>
                                ${completedInternships.map((item) =>
                                    `<li>${escapeHtml(item.title || "Internship")}</li>`
                                ).join("")}
                            </ul>
                        </article>
                        <article>
                            <strong>${completedGoals.length}</strong>
                            <span>Completed goals</span>
                            <ul>
                                ${completedGoals.map((item) =>
                                    `<li>${escapeHtml(item.title || "Goal")}</li>`
                                ).join("")}
                            </ul>
                        </article>
                    </div>
                </section>

                <div class="student-facing-bottom-actions">
                    <button class="button button-primary" type="button"
                        data-action="print-student-view"
                        data-student-id="${escapeHtml(student.id)}">
                        Print / Save as PDF
                    </button>
                </div>

                <section class="student-facing-privacy">
                    <strong>My Momentum</strong>
                    <p>
                        This page intentionally excludes advisor notes, internal next steps,
                        support warnings, administrative information, and editing controls.
                    </p>
                </section>
            </div>
        `;
    }

    function printStudentView(studentId) {
        const student = StudentManager.getStudent(studentId);
        if (!student) {
            App.showToast("Student record could not be opened.", "error");
            return;
        }

        const activeProjects = studentViewActiveItems(
            student.journey.currentProjects
        );
        const activeInternships = studentViewActiveItems(
            student.journey.internships
        );
        const activeGoals = studentViewActiveItems(student.journey.goals);
        const latestMeeting = studentViewLatestMeeting(student);
        const nextMeeting = studentViewNextMeeting(student);
        const popup = PrintManager.createWindow();

        if (!popup) {
            App.showToast("Allow pop-ups to print My Momentum.", "error");
            return;
        }

        const simpleList = (items, emptyText) => items.length
            ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : `<p>${escapeHtml(emptyText)}</p>`;

        popup.document.write(`
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${escapeHtml(displayName(student))} — My Momentum</title>
                <style>
                    body{font-family:Arial,sans-serif;margin:34px;color:#172033;line-height:1.5}
                    header{border-bottom:3px solid #3157d5;margin-bottom:24px;padding-bottom:16px}
                    h1{margin:0 0 6px} h2{margin-top:28px;border-bottom:1px solid #dfe4ee;padding-bottom:6px}
                    h3{margin:0 0 6px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
                    .card{break-inside:avoid;border:1px solid #dfe4ee;border-radius:10px;padding:14px;margin:10px 0}
                    .muted{color:#657086}.tag{display:inline-block;margin:3px;padding:4px 9px;border-radius:999px;background:#eef2ff}
                    footer{margin-top:30px;color:#657086;font-size:12px}
                </style>

                <style>
                    .legacy-print-toolbar {
                        position: fixed;
                        top: 0;
                        right: 0;
                        left: 0;
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        padding: 10px 16px;
                        border-bottom: 1px solid #ccd3e0;
                        background: #ffffff;
                    }
                    .legacy-print-toolbar div {
                        display: flex;
                        gap: 8px;
                    }
                    .legacy-print-toolbar button {
                        padding: 8px 12px;
                        border: 1px solid #cfd6e3;
                        border-radius: 7px;
                        font: inherit;
                        font-weight: 700;
                        background: #ffffff;
                    }
                    .legacy-print-toolbar button:first-child {
                        color: #ffffff;
                        border-color: #4057b7;
                        background: #4057b7;
                    }
                    body {
                        padding-top: 62px !important;
                    }
                    @media print {
                        .legacy-print-toolbar {
                            display: none !important;
                        }
                        body {
                            padding-top: 0 !important;
                        }
                        * {
                            box-shadow: none !important;
                        }
                    }
                </style>
            </head>
            <body>
                <header>
                    <p class="muted">My Momentum</p>
                    <h1>${escapeHtml(displayName(student))}</h1>
                    <p>${escapeHtml(student.profile.studentVoice || "")}</p>
                    ${student.profile.portfolioUrl
                        ? `<p><strong>Portfolio:</strong> ${escapeHtml(
                            normalizePortfolioUrl(student.profile.portfolioUrl)
                        )}</p>`
                        : ""
                    }
                </header>

                <h2>Interests and Direction</h2>
                <div class="card">
                    <p><strong>Interests / Hobbies:</strong>
                        ${escapeHtml(student.profile.interests.join(", ") || "Still exploring")}
                    </p>
                    <p><strong>Dream Job:</strong>
                        ${escapeHtml(student.journey.dreamJobs.join(", ") || "Still exploring")}
                    </p>
                    <p><strong>After High School:</strong>
                        ${escapeHtml(student.profile.postSecondaryGoals.join(", ") || "Plans are developing")}
                    </p>
                </div>

                <h2>Current Work</h2>
                <div class="grid">
                    <div class="card">
                        <h3>Projects</h3>
                        ${simpleList(
                            activeProjects.map((item) => item.title || "Project"),
                            "No active project yet."
                        )}
                    </div>
                    <div class="card">
                        <h3>Internships</h3>
                        ${simpleList(
                            activeInternships.map((item) => item.title || "Internship"),
                            "No active internship yet."
                        )}
                    </div>
                </div>

                <h2>My Goals</h2>
                ${activeGoals.length
                    ? activeGoals.map((goal) => `
                        <div class="card">
                            <h3>${escapeHtml(goal.title || "Goal")}</h3>
                            ${goal.description ? `<p>${escapeHtml(goal.description)}</p>` : ""}
                            ${goal.dueDate ? `<p><strong>Target:</strong> ${escapeHtml(formatDate(goal.dueDate))}</p>` : ""}
                            ${goal.nextSteps?.length
                                ? simpleList(goal.nextSteps, "")
                                : ""
                            }
                        </div>
                    `).join("")
                    : "<p>No active goals yet.</p>"
                }

                <h2>Latest Check-In</h2>
                ${latestMeeting ? `
                    <div class="card">
                        <h3>${escapeHtml(DateUtils.formatDateTime(
                            latestMeeting.meetingDate,
                            latestMeeting.meetingTime
                        ))}</h3>
                        <p>${escapeHtml(latestMeeting.summary || "No summary recorded.")}</p>
                        ${latestMeeting.nextSteps?.length
                            ? `<p><strong>Next steps</strong></p>${simpleList(latestMeeting.nextSteps, "")}`
                            : ""
                        }
                        ${nextMeeting
                            ? `<p><strong>Next meeting:</strong> ${escapeHtml(formatDate(nextMeeting))}</p>`
                            : ""
                        }
                    </div>
                ` : "<p>No check-in has been recorded yet.</p>"}

                <footer>
                    Generated by Momentum. Internal support records are excluded.
                </footer>
                <div class="legacy-print-toolbar">
                    <strong>Momentum Print Preview</strong>
                    <div>
                        <button id="legacyPrintButton" type="button">Print / Save as PDF</button>
                        <button id="legacyCloseButton" type="button">Close Preview</button>
                    </div>
                </div>
                <script>
                    (() => {
                        const printButton = document.getElementById("legacyPrintButton");
                        const closeButton = document.getElementById("legacyCloseButton");
                        if (printButton) {
                            printButton.addEventListener("click", () => {
                                printButton.disabled = true;
                                window.setTimeout(() => {
                                    try { window.print(); }
                                    finally { printButton.disabled = false; }
                                }, 50);
                            });
                        }
                        if (closeButton) {
                            closeButton.addEventListener("click", () => window.close());
                        }
                    })();
                <\/script>
            </body>
            </html>
        `);
        popup.document.close();
    }

    function renderPortfolioRecord(item, type) {
        const project = type === "project";
        const details = project
            ? [
                item.projectQuestion ? ["Question", item.projectQuestion] : null,
                item.phase ? ["Final phase", item.phase] : null,
                item.skills && item.skills.length ? ["Skills", item.skills.join(", ")] : null,
                item.partners && item.partners.length ? ["Partners", item.partners.join(", ")] : null,
                item.reflections && item.reflections.length ? ["Reflection", item.reflections.join(" ")] : null
            ].filter(Boolean)
            : [
                item.organization ? ["Organization", item.organization] : null,
                item.supervisor ? ["Supervisor", item.supervisor] : null,
                item.schedule ? ["Schedule", item.schedule] : null,
                item.responsibilities && item.responsibilities.length
                    ? ["Responsibilities", item.responsibilities.join(", ")]
                    : null,
                item.skills && item.skills.length ? ["Skills", item.skills.join(", ")] : null,
                item.reflections && item.reflections.length ? ["Reflection", item.reflections.join(" ")] : null
            ].filter(Boolean);

        return `
            <article class="portfolio-record">
                <div class="portfolio-record-header">
                    <div>
                        <p class="eyebrow">${project ? "Completed project" : "Completed internship"}</p>
                        <h4>${escapeHtml(item.title || (project ? "Untitled Project" : "Untitled Internship"))}</h4>
                    </div>
                    <span class="badge badge-success">Completed</span>
                </div>
                ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
                ${details.length ? `
                    <dl class="portfolio-record-details">
                        ${details.map(([label, value]) => `
                            <div>
                                <dt>${escapeHtml(label)}</dt>
                                <dd>${escapeHtml(value)}</dd>
                            </div>
                        `).join("")}
                    </dl>
                ` : ""}
                ${item.evidence && item.evidence.length ? `
                    <div class="portfolio-evidence-list">
                        <strong>Evidence</strong>
                        <ul>
                            ${item.evidence.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}
                        </ul>
                    </div>
                ` : ""}
            </article>
        `;
    }

    function renderPortfolio(student) {
        const projects = portfolioCompletedProjects(student);
        const internships = portfolioCompletedInternships(student);
        const completedGoals = completedLifecycleItems(student.journey.goals);
        const skills = portfolioSkills(student);
        const evidence = portfolioEvidence(student);
        const milestones = [...student.journey.milestones]
            .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
        const reflections = [...student.journey.reflections]
            .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
            .slice(0, 8);

        return `
            <div class="portfolio-view">
                <section class="portfolio-link-strip">
                    <div>
                        <span>Google Sites Portfolio</span>
                        <strong>${student.profile.portfolioUrl
                            ? "Connected"
                            : "No site added"
                        }</strong>
                    </div>
                    <div class="portfolio-link-actions">
                        ${student.profile.portfolioUrl
                            ? portfolioLink(student, {
                                label: "Open Google Site",
                                className: "button button-secondary button-small"
                            })
                            : `<button class="button button-secondary button-small"
                                type="button"
                                data-action="edit-student"
                                data-student-id="${escapeHtml(student.id)}">
                                Add Google Site
                            </button>`
                        }
                        <button class="button button-secondary button-small"
                            type="button"
                            data-action="print-student-portfolio"
                            data-student-id="${escapeHtml(student.id)}">
                            Print / Save PDF
                        </button>
                    </div>
                </section>

                <div class="portfolio-summary-grid">
                    <article>
                        <strong>${projects.length}</strong>
                        <span>Completed projects</span>
                    </article>
                    <article>
                        <strong>${internships.length}</strong>
                        <span>Completed internships</span>
                    </article>
                    <article>
                        <strong>${completedLifecycleItems(student.journey.goals).length}</strong>
                        <span>Completed goals</span>
                    </article>
                    <article>
                        <strong>${skills.length}</strong>
                        <span>Skills demonstrated</span>
                    </article>
                </div>

                <section class="portfolio-section">
                    <div class="panel-header">
                        <h3>Completed goals</h3>
                    </div>
                    ${completedLifecycleItems(student.journey.goals).length ? `
                        <div class="portfolio-record-grid">
                            ${completedLifecycleItems(student.journey.goals).map((goal) => `
                                <article class="portfolio-record">
                                    <div class="portfolio-record-header">
                                        <div>
                                            <p class="eyebrow">Completed goal</p>
                                            <h4>${escapeHtml(goal.title || "Goal")}</h4>
                                        </div>
                                        <span class="badge badge-success">Completed</span>
                                    </div>
                                    ${goal.description ? `<p>${escapeHtml(goal.description)}</p>` : ""}
                                    ${goal.successCriteria ? `
                                        <dl class="portfolio-record-details">
                                            <div>
                                                <dt>Success looked like</dt>
                                                <dd>${escapeHtml(goal.successCriteria)}</dd>
                                            </div>
                                        </dl>
                                    ` : ""}
                                </article>
                            `).join("")}
                        </div>
                    ` : `<p class="empty-copy">No completed goals yet.</p>`}
                </section>

                <section class="portfolio-section">
                    <div class="panel-header">
                        <h3>Completed projects</h3>
                    </div>
                    ${projects.length
                        ? `<div class="portfolio-record-grid">
                            ${projects.map((item) => renderPortfolioRecord(item, "project")).join("")}
                        </div>`
                        : `<p class="empty-copy">No completed projects yet.</p>`
                    }
                </section>

                <section class="portfolio-section">
                    <div class="panel-header">
                        <h3>Completed internships</h3>
                    </div>
                    ${internships.length
                        ? `<div class="portfolio-record-grid">
                            ${internships.map((item) => renderPortfolioRecord(item, "internship")).join("")}
                        </div>`
                        : `<p class="empty-copy">No completed internships yet.</p>`
                    }
                </section>

                <div class="portfolio-two-column">
                    <section class="portfolio-section">
                        <div class="panel-header"><h3>Skills</h3></div>
                        ${skills.length ? renderTags(skills) : `<p class="empty-copy">No skills documented yet.</p>`}
                    </section>

                    <section class="portfolio-section">
                        <div class="panel-header"><h3>Milestones</h3></div>
                        ${milestones.length ? `
                            <ul class="portfolio-simple-list">
                                ${milestones.map((item) => `
                                    <li>
                                        <strong>${escapeHtml(item.title || "Milestone")}</strong>
                                        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
                                    </li>
                                `).join("")}
                            </ul>
                        ` : `<p class="empty-copy">No milestones documented yet.</p>`}
                    </section>
                </div>

                <div class="portfolio-two-column">
                    <section class="portfolio-section">
                        <div class="panel-header"><h3>Evidence and artifacts</h3></div>
                        ${evidence.length ? `
                            <ul class="portfolio-simple-list">
                                ${evidence.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                            </ul>
                        ` : `<p class="empty-copy">No evidence documented yet.</p>`}
                    </section>

                    <section class="portfolio-section">
                        <div class="panel-header"><h3>Reflections</h3></div>
                        ${reflections.length ? `
                            <ul class="portfolio-simple-list">
                                ${reflections.map((item) => `
                                    <li>
                                        <strong>${escapeHtml(item.title || "Reflection")}</strong>
                                        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
                                    </li>
                                `).join("")}
                            </ul>
                        ` : `<p class="empty-copy">No reflections documented yet.</p>`}
                    </section>
                </div>


            </div>
        `;
    }

    function printStudentPortfolio(studentId) {
        const student = StudentManager.getStudent(studentId);
        if (!student) {
            return;
        }

        const projects = portfolioCompletedProjects(student);
        const internships = portfolioCompletedInternships(student);
        const completedGoals = completedLifecycleItems(student.journey.goals);
        const skills = portfolioSkills(student);
        const evidence = portfolioEvidence(student);
        const milestones = student.journey.milestones;
        const reflections = student.journey.reflections.slice(-8).reverse();

        const printWindow = PrintManager.createWindow();
        if (!printWindow) {
            App.showToast("Allow pop-ups to print the portfolio.", "error");
            return;
        }

        const list = (items, emptyText) => items.length
            ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : `<p>${escapeHtml(emptyText)}</p>`;

        const record = (item, label) => `
            <article class="record">
                <p class="label">${escapeHtml(label)}</p>
                <h2>${escapeHtml(item.title || "Untitled")}</h2>
                ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
                ${item.organization ? `<p><strong>Organization:</strong> ${escapeHtml(item.organization)}</p>` : ""}
                ${item.projectQuestion ? `<p><strong>Project question:</strong> ${escapeHtml(item.projectQuestion)}</p>` : ""}
                ${item.skills && item.skills.length ? `<p><strong>Skills:</strong> ${escapeHtml(item.skills.join(", "))}</p>` : ""}
                ${item.reflections && item.reflections.length ? `<p><strong>Reflection:</strong> ${escapeHtml(item.reflections.join(" "))}</p>` : ""}
            </article>
        `;

        printWindow.document.write(`
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${escapeHtml(displayName(student))} — Momentum Portfolio</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 36px; color: #172033; line-height: 1.5; }
                    header { border-bottom: 3px solid #3157d5; padding-bottom: 18px; margin-bottom: 26px; }
                    h1 { margin: 0 0 6px; font-size: 30px; }
                    h2 { margin: 4px 0 10px; font-size: 20px; }
                    h3 { margin-top: 28px; padding-bottom: 6px; border-bottom: 1px solid #ccd3e0; }
                    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 22px 0; }
                    .summary div { border: 1px solid #ccd3e0; border-radius: 8px; padding: 12px; }
                    .summary strong { display: block; font-size: 24px; color: #3157d5; }
                    .record { break-inside: avoid; border: 1px solid #ccd3e0; border-radius: 10px; padding: 16px; margin: 12px 0; }
                    .label { margin: 0; text-transform: uppercase; font-size: 11px; font-weight: bold; color: #64708a; }
                    ul { padding-left: 20px; }
                    footer { margin-top: 36px; color: #64708a; font-size: 12px; }
                    @media print { body { margin: 20px; } button { display: none; } }
                </style>

                <style>
                    .legacy-print-toolbar {
                        position: fixed;
                        top: 0;
                        right: 0;
                        left: 0;
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        padding: 10px 16px;
                        border-bottom: 1px solid #ccd3e0;
                        background: #ffffff;
                    }
                    .legacy-print-toolbar div {
                        display: flex;
                        gap: 8px;
                    }
                    .legacy-print-toolbar button {
                        padding: 8px 12px;
                        border: 1px solid #cfd6e3;
                        border-radius: 7px;
                        font: inherit;
                        font-weight: 700;
                        background: #ffffff;
                    }
                    .legacy-print-toolbar button:first-child {
                        color: #ffffff;
                        border-color: #4057b7;
                        background: #4057b7;
                    }
                    body {
                        padding-top: 62px !important;
                    }
                    @media print {
                        .legacy-print-toolbar {
                            display: none !important;
                        }
                        body {
                            padding-top: 0 !important;
                        }
                        * {
                            box-shadow: none !important;
                        }
                    }
                </style>
            </head>
            <body>
                <header>
                    <h1>${escapeHtml(displayName(student))}</h1>
                    <p>${escapeHtml(fullName(student) || "")}</p>
                    <p><strong>Interests:</strong> ${escapeHtml(student.profile.interests.join(", ") || "Not recorded")}</p>
                    <p><strong>Dream Job:</strong> ${escapeHtml(student.journey.dreamJobs.join(", ") || "Still developing")}</p>
                </header>

                <div class="summary">
                    <div><strong>${projects.length}</strong>Completed projects</div>
                    <div><strong>${internships.length}</strong>Completed internships</div>
                    <div><strong>${completedGoals.length}</strong>Completed goals</div>
                    <div><strong>${skills.length}</strong>Skills</div>
                </div>

                <h3>Completed Projects</h3>
                ${projects.length ? projects.map((item) => record(item, "Completed project")).join("") : "<p>No completed projects yet.</p>"}

                <h3>Completed Internships</h3>
                ${internships.length ? internships.map((item) => record(item, "Completed internship")).join("") : "<p>No completed internships yet.</p>"}

                <h3>Completed Goals</h3>
                ${completedGoals.length
                    ? completedGoals.map((goal) => `
                        <article class="record">
                            <p class="label">Completed goal</p>
                            <h2>${escapeHtml(goal.title || "Goal")}</h2>
                            ${goal.description ? `<p>${escapeHtml(goal.description)}</p>` : ""}
                            ${goal.successCriteria
                                ? `<p><strong>Success looked like:</strong> ${escapeHtml(goal.successCriteria)}</p>`
                                : ""
                            }
                        </article>
                    `).join("")
                    : "<p>No completed goals yet.</p>"
                }

                <h3>Skills Demonstrated</h3>
                ${list(skills, "No skills documented yet.")}

                <h3>Milestones</h3>
                ${list(milestones.map((item) => item.title || item.description || "Milestone"), "No milestones documented yet.")}

                <h3>Evidence and Artifacts</h3>
                ${list(evidence, "No evidence documented yet.")}

                <h3>Reflections</h3>
                ${list(reflections.map((item) => item.description || item.title || "Reflection"), "No reflections documented yet.")}

                <footer>
                    Generated by Momentum on ${escapeHtml(DateUtils.formatDate(new Date()))}
                </footer>

                <div class="legacy-print-toolbar">
                    <strong>Momentum Print Preview</strong>
                    <div>
                        <button id="legacyPrintButton" type="button">Print / Save as PDF</button>
                        <button id="legacyCloseButton" type="button">Close Preview</button>
                    </div>
                </div>
                <script>
                    (() => {
                        const printButton = document.getElementById("legacyPrintButton");
                        const closeButton = document.getElementById("legacyCloseButton");
                        if (printButton) {
                            printButton.addEventListener("click", () => {
                                printButton.disabled = true;
                                window.setTimeout(() => {
                                    try { window.print(); }
                                    finally { printButton.disabled = false; }
                                }, 50);
                            });
                        }
                        if (closeButton) {
                            closeButton.addEventListener("click", () => window.close());
                        }
                    })();
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    function renderCheckInSection(label, value) {
        const items = Array.isArray(value)
            ? value.filter(Boolean)
            : String(value || "").trim()
                ? [String(value).trim()]
                : [];

        if (!items.length) {
            return "";
        }

        return `
            <div class="checkin-section">
                <strong>${escapeHtml(label)}</strong>
                ${items.length === 1
                    ? `<p>${escapeHtml(items[0])}</p>`
                    : `<ul>
                        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                    </ul>`
                }
            </div>
        `;
    }

    function renderStructuredCheckIn(checkIn) {
        const sections = [
            renderCheckInSection("Summary", checkIn.summary),
            renderCheckInSection("Project updates", checkIn.projectUpdates),
            renderCheckInSection("Opportunity and internship updates", checkIn.opportunityUpdates),
            renderCheckInSection("Follow-up updates", checkIn.followUpUpdates),
            renderCheckInSection("Reflection", checkIn.reflection),
            renderCheckInSection("New questions", checkIn.newQuestions),
            renderCheckInSection("Next steps", checkIn.nextSteps)
        ].filter(Boolean);

        return sections.length
            ? `<div class="checkin-section-grid">${sections.join("")}</div>`
            : `<p class="empty-copy">No meeting details recorded.</p>`;
    }

    function formatTimelineTimestamp(value) {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "No timestamp";
        }

        return date.toLocaleString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function meetingDateTime(checkIn) {
        return DateUtils.combineLocalDateTime(
            checkIn.meetingDate,
            checkIn.meetingTime || "12:00"
        ) || new Date(checkIn.createdAt || 0);
    }

    function checkInsWithinDays(student, days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        cutoff.setHours(0, 0, 0, 0);

        return student.journey.checkIns
            .filter((item) => meetingDateTime(item) >= cutoff)
            .sort((a, b) => meetingDateTime(b) - meetingDateTime(a));
    }

    function activeLifecycleItems(items) {
        return items.filter((item) =>
            item.status !== "completed" &&
            item.status !== "archived" &&
            !item.archived
        );
    }

    function completedLifecycleItems(items) {
        return items.filter((item) => item.status === "completed");
    }

    function nextScheduledMeeting(student) {
        return [...student.journey.checkIns]
            .filter((item) => item.nextMeetingDate)
            .sort((a, b) => meetingDateTime(b) - meetingDateTime(a))[0]?.nextMeetingDate || "";
    }

    function upcomingStudentDates(student) {
        const entries = [];

        const nextMeeting = nextScheduledMeeting(student);
        if (nextMeeting) {
            entries.push({
                type: "Next meeting",
                title: "Student meeting",
                date: nextMeeting
            });
        }

        activeLifecycleItems(student.journey.goals)
            .filter((item) => item.dueDate)
            .forEach((item) => entries.push({
                type: "Goal target",
                title: item.title || "Goal",
                date: item.dueDate
            }));

        activeLifecycleItems(student.journey.currentProjects)
            .filter((item) => item.dueDate)
            .forEach((item) => entries.push({
                type: "Project due",
                title: item.title || "Project",
                date: item.dueDate
            }));

        student.journey.followUps
            .filter((item) =>
                item.status !== "completed" &&
                !item.completedAt &&
                item.dueDate
            )
            .forEach((item) => entries.push({
                type: "Action item",
                title: item.title || "Follow-up",
                date: item.dueDate
            }));

        return entries
            .sort((a, b) =>
                DateUtils.parseLocalDate(a.date) - DateUtils.parseLocalDate(b.date)
            )
            .slice(0, 8);
    }

    function recentStudentWins(student) {
        const wins = [];

        completedLifecycleItems(student.journey.currentProjects).forEach((item) => {
            wins.push({
                type: "Project completed",
                title: item.title || "Project",
                date: item.completedAt || item.updatedAt || item.createdAt
            });
        });

        completedLifecycleItems(student.journey.internships).forEach((item) => {
            wins.push({
                type: "Internship completed",
                title: item.title || "Internship",
                date: item.completedAt || item.endDate || item.updatedAt
            });
        });

        completedLifecycleItems(student.journey.goals).forEach((item) => {
            wins.push({
                type: "Goal completed",
                title: item.title || "Goal",
                date: item.completedAt || item.updatedAt || item.createdAt
            });
        });

        return wins
            .filter((item) => item.date)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8);
    }

    function renderProgressReview(student) {
        const recentMeetings = checkInsWithinDays(student, 30);
        const activeProjects = activeLifecycleItems(student.journey.currentProjects);
        const activeInternships = activeLifecycleItems(student.journey.internships);
        const activeGoals = activeLifecycleItems(student.journey.goals);
        const openFollowUps = student.journey.followUps.filter((item) =>
            item.status !== "completed" && !item.completedAt
        );
        const overdueFollowUps = openFollowUps.filter((item) =>
            item.dueDate && DateUtils.isOverdue(item.dueDate)
        );
        const upcomingDates = upcomingStudentDates(student);
        const wins = recentStudentWins(student);
        const moodMeetings = [...student.journey.checkIns]
            .filter((item) => item.mood)
            .sort((a, b) => meetingDateTime(b) - meetingDateTime(a))
            .slice(0, 6);
        const lastMeeting = [...student.journey.checkIns]
            .sort((a, b) => meetingDateTime(b) - meetingDateTime(a))[0] || null;
        const needsAttention = [];

        if (!activeProjects.length) {
            needsAttention.push({
                label: "No active project",
                detail: "Help the student identify or begin a current project."
            });
        }

        if (!activeInternships.length) {
            needsAttention.push({
                label: "No active internship",
                detail: "Explore placement, job-shadow, or internship options."
            });
        }

        if (!activeGoals.length) {
            needsAttention.push({
                label: "No active goals",
                detail: "Create a clear next goal with the student."
            });
        }

        if (overdueFollowUps.length) {
            needsAttention.push({
                label: `${overdueFollowUps.length} overdue action item${overdueFollowUps.length === 1 ? "" : "s"}`,
                detail: "Review and update overdue next steps."
            });
        }

        if (!lastMeeting) {
            needsAttention.push({
                label: "No meeting recorded",
                detail: "Start the first student meeting or check-in."
            });
        } else if ((DateUtils.daysBetween(lastMeeting.meetingDate || lastMeeting.createdAt) || 0) >= 14) {
            needsAttention.push({
                label: "Meeting may be due",
                detail: "The most recent recorded meeting was at least 14 days ago."
            });
        }

        const currentProject = activeProjects[0] || null;
        const currentInternship = activeInternships[0] || null;

        return `
            <div class="progress-review overview-layout">
                <div class="progress-review-grid">
                    <section class="progress-review-panel full-width profile-direction-panel overview-tone-student">
                        <div class="panel-header">
                            <div>
                                <p class="eyebrow">Who this student is</p>
                                <h3>Student Snapshot</h3>
                            </div>
                            <button class="button button-secondary button-small" type="button"
                                data-action="edit-student"
                                data-student-id="${escapeHtml(student.id)}">
                                Edit Snapshot
                            </button>
                        </div>

                        <div class="profile-direction-grid snapshot-direction-grid">
                            <div class="profile-direction-item profile-direction-wide">
                                <span>Interests / Hobbies</span>
                                ${student.profile.interests.length
                                    ? renderTags(student.profile.interests)
                                    : `<p class="empty-copy">No interests or hobbies recorded.</p>`
                                }
                            </div>

                            <div class="profile-direction-item profile-direction-wide">
                                <span>Dream Job</span>
                                ${student.journey.dreamJobs.length
                                    ? `<div class="dream-job-list">
                                        ${student.journey.dreamJobs.map((job) => `
                                            <span class="dream-job-highlight">★ ${escapeHtml(job)}</span>
                                        `).join("")}
                                    </div>`
                                    : `<p class="empty-copy">No dream job recorded.</p>`
                                }
                            </div>

                            <div class="profile-direction-item profile-direction-wide">
                                <span>Post-secondary goals</span>
                                ${student.profile.postSecondaryGoals.length
                                    ? renderTags(student.profile.postSecondaryGoals)
                                    : `<p class="empty-copy">No post-secondary goals recorded.</p>`
                                }
                            </div>

                            <div class="profile-direction-item profile-direction-wide">
                                <span>Student voice</span>
                                <p>${escapeHtml(
                                    student.profile.studentVoice ||
                                    "No student voice statement recorded."
                                )}</p>
                            </div>
                        </div>
                    </section>

                    <section class="progress-review-panel overview-tone-project">
                        <div class="panel-header">
                            <h3>Current work</h3>
                        </div>
                        <div class="progress-current-work overview-current-work">
                            <div>
                                <span>Project</span>
                                ${currentProject ? `
                                    <button class="overview-record-link" type="button"
                                        data-action="view-journey-item"
                                        data-student-id="${escapeHtml(student.id)}"
                                        data-collection="currentProjects"
                                        data-item-id="${escapeHtml(currentProject.id)}">
                                        ${escapeHtml(currentProject.title || "Untitled Project")}
                                    </button>
                                ` : `<strong>No active project</strong>`}
                                ${currentProject?.phase
                                    ? `<small>${escapeHtml(currentProject.phase)}</small>`
                                    : ""
                                }
                            </div>
                            <div>
                                <span>Internship</span>
                                ${currentInternship ? `
                                    <button class="overview-record-link" type="button"
                                        data-action="view-journey-item"
                                        data-student-id="${escapeHtml(student.id)}"
                                        data-collection="internships"
                                        data-item-id="${escapeHtml(currentInternship.id)}">
                                        ${escapeHtml(currentInternship.title || "Untitled Internship")}
                                    </button>
                                ` : `<strong>No active internship</strong>`}
                                ${currentInternship?.organization
                                    ? `<small>${escapeHtml(currentInternship.organization)}</small>`
                                    : ""
                                }
                            </div>
                        </div>
                    </section>

                    <section class="progress-review-panel overview-tone-goal">
                        <div class="panel-header">
                            <h3>Active goals</h3>
                        </div>
                        ${activeGoals.length ? `
                            <div class="progress-goal-list">
                                ${activeGoals.slice(0, 6).map((goal) => `
                                    <article>
                                        <div>
                                            <button class="overview-record-link" type="button"
                                                data-action="view-journey-item"
                                                data-student-id="${escapeHtml(student.id)}"
                                                data-collection="goals"
                                                data-item-id="${escapeHtml(goal.id)}">
                                                ${escapeHtml(goal.title || "Goal")}
                                            </button>
                                            <span class="badge badge-success">Active</span>
                                        </div>
                                        ${goal.category ? `<small>${escapeHtml(goal.category)}</small>` : ""}
                                        ${goal.dueDate
                                            ? `<small>Target: ${escapeHtml(formatDate(goal.dueDate))}</small>`
                                            : ""
                                        }
                                        ${goal.nextSteps?.length
                                            ? `<ul>${goal.nextSteps.slice(0, 3).map((step) =>
                                                `<li>${escapeHtml(step)}</li>`
                                            ).join("")}</ul>`
                                            : ""
                                        }
                                    </article>
                                `).join("")}
                            </div>
                        ` : `<p class="empty-copy">No active goals.</p>`}
                    </section>

                    <section class="progress-review-panel overview-tone-meeting">
                        <div class="panel-header">
                            <h3>Recent meeting moods</h3>
                        </div>
                        ${moodMeetings.length ? `
                            <div class="progress-mood-list">
                                ${moodMeetings.map((item) => `
                                    <div>
                                        <span>${escapeHtml(DateUtils.formatDateTime(
                                            item.meetingDate,
                                            item.meetingTime
                                        ))}</span>
                                        <div class="badges">
                                            ${MoodUtils.renderBadges(item.mood, escapeHtml)}
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        ` : `<p class="empty-copy">No meeting moods recorded yet.</p>`}
                    </section>

                    <section class="progress-review-panel overview-tone-opportunity">
                        <div class="panel-header">
                            <h3>Upcoming dates</h3>
                        </div>
                        ${upcomingDates.length ? `
                            <ul class="progress-review-list">
                                ${upcomingDates.map((item) => `
                                    <li>
                                        <div>
                                            <strong>${escapeHtml(item.title)}</strong>
                                            <span>${escapeHtml(item.type)}</span>
                                        </div>
                                        <time>${escapeHtml(formatDate(item.date))}</time>
                                    </li>
                                `).join("")}
                            </ul>
                        ` : `<p class="empty-copy">No upcoming dates recorded.</p>`}
                    </section>

                    <section class="progress-review-panel full-width overview-attention-panel overview-tone-followup">
                        <div class="panel-header">
                            <div>
                                <p class="eyebrow">Next actions</p>
                                <h3>Needs Attention</h3>
                            </div>
                            <span class="support-count">${needsAttention.length}</span>
                        </div>
                        ${needsAttention.length ? `
                            <div class="overview-attention-grid">
                                ${needsAttention.map((item) => `
                                    <article>
                                        <strong>${escapeHtml(item.label)}</strong>
                                        <p>${escapeHtml(item.detail)}</p>
                                    </article>
                                `).join("")}
                            </div>
                        ` : `
                            <div class="overview-all-clear">
                                <strong>No immediate concerns</strong>
                                <p>Current work, goals, meetings, and next steps are in place.</p>
                            </div>
                        `}
                    </section>

                    <section class="progress-review-panel full-width overview-tone-success">
                        <div class="panel-header">
                            <h3>Recent wins</h3>
                        </div>
                        ${wins.length ? `
                            <div class="progress-win-grid">
                                ${wins.map((item) => `
                                    <article>
                                        <span>${escapeHtml(item.type)}</span>
                                        <strong>${escapeHtml(item.title)}</strong>
                                        <small>${escapeHtml(formatDate(item.date))}</small>
                                    </article>
                                `).join("")}
                            </div>
                        ` : `<p class="empty-copy">No completed projects, internships, or goals yet.</p>`}
                    </section>

                    <section class="progress-review-panel full-width overview-tone-meeting">
                        <div class="panel-header">
                            <h3>Recent meeting summaries</h3>
                        </div>
                        ${recentMeetings.length ? `
                            <div class="progress-meeting-list">
                                ${recentMeetings.slice(0, 6).map((item) => `
                                    <article>
                                        <div>
                                            <strong>${escapeHtml(DateUtils.formatDateTime(
                                                item.meetingDate,
                                                item.meetingTime
                                            ))}</strong>
                                            <div class="badges">
                                                ${MoodUtils.renderBadges(item.mood, escapeHtml)}
                                            </div>
                                        </div>
                                        <p>${escapeHtml(item.summary || "No summary recorded.")}</p>
                                        ${item.nextSteps?.length
                                            ? `<ul>${item.nextSteps.map((step) =>
                                                `<li>${escapeHtml(step)}</li>`
                                            ).join("")}</ul>`
                                            : ""
                                        }
                                    </article>
                                `).join("")}
                            </div>
                        ` : `<p class="empty-copy">No check-ins during the past 30 days.</p>`}
                    </section>
                </div>

                <section class="overview-review-footer">
                    <div>
                        <p class="eyebrow">Review summary</p>
                        <h3>Check-ins, goals, and action items</h3>
                        <p>Use this section when reviewing or sharing the student's current progress.</p>
                    </div>

                    <div class="progress-review-stats overview-bottom-stats">
                        <article>
                            <strong>${student.journey.checkIns.length}</strong>
                            <span>Total check-ins</span>
                        </article>
                        <article>
                            <strong>${recentMeetings.length}</strong>
                            <span>Check-ins in 30 days</span>
                        </article>
                        <article>
                            <strong>${activeGoals.length}</strong>
                            <span>Active goals</span>
                        </article>
                        <article>
                            <strong>${completedLifecycleItems(student.journey.goals).length}</strong>
                            <span>Completed goals</span>
                        </article>
                        <article>
                            <strong>${openFollowUps.length}</strong>
                            <span>Open action items</span>
                        </article>
                        <article class="${overdueFollowUps.length ? "has-alert" : ""}">
                            <strong>${overdueFollowUps.length}</strong>
                            <span>Overdue action items</span>
                        </article>
                    </div>

                    <div class="overview-share-actions">
                        <button class="button button-secondary" type="button"
                            data-action="print-student-portfolio"
                            data-student-id="${escapeHtml(student.id)}">
                            Print Portfolio
                        </button>
                        <button class="button button-primary" type="button"
                            data-action="print-progress-review"
                            data-student-id="${escapeHtml(student.id)}">
                            Print Progress Review
                        </button>
                    </div>
                </section>
            </div>
        `;
    }


    function printProgressReview(studentId) {
        const student = StudentManager.getStudent(studentId);
        if (!student) {
            return;
        }

        const recentMeetings = checkInsWithinDays(student, 30);
        const activeProjects = activeLifecycleItems(student.journey.currentProjects);
        const activeInternships = activeLifecycleItems(student.journey.internships);
        const activeGoals = activeLifecycleItems(student.journey.goals);
        const openFollowUps = student.journey.followUps.filter((item) =>
            item.status !== "completed" && !item.completedAt
        );
        const overdueFollowUps = openFollowUps.filter((item) =>
            item.dueDate && DateUtils.isOverdue(item.dueDate)
        );
        const upcomingDates = upcomingStudentDates(student);
        const wins = recentStudentWins(student);
        const printWindow = PrintManager.createWindow();

        if (!printWindow) {
            App.showToast("Allow pop-ups to print the progress review.", "error");
            return;
        }

        const list = (items, emptyText) => items.length
            ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : `<p>${escapeHtml(emptyText)}</p>`;

        printWindow.document.write(`
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${escapeHtml(displayName(student))} — Progress Review</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 34px; color: #172033; line-height: 1.45; }
                    header { border-bottom: 3px solid #3157d5; margin-bottom: 24px; padding-bottom: 16px; }
                    h1 { margin: 0 0 6px; }
                    h2 { margin-top: 26px; border-bottom: 1px solid #dfe4ee; padding-bottom: 5px; }
                    h3 { margin: 0 0 6px; }
                    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                    .stats div { border: 1px solid #dfe4ee; border-radius: 8px; padding: 12px; }
                    .stats strong { display: block; color: #3157d5; font-size: 22px; }
                    .card { break-inside: avoid; border: 1px solid #dfe4ee; border-radius: 9px; padding: 14px; margin: 10px 0; }
                    .muted { color: #657086; }
                    ul { padding-left: 20px; }
                    footer { margin-top: 30px; color: #657086; font-size: 12px; }
                </style>

                <style>
                    .legacy-print-toolbar {
                        position: fixed;
                        top: 0;
                        right: 0;
                        left: 0;
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        padding: 10px 16px;
                        border-bottom: 1px solid #ccd3e0;
                        background: #ffffff;
                    }
                    .legacy-print-toolbar div {
                        display: flex;
                        gap: 8px;
                    }
                    .legacy-print-toolbar button {
                        padding: 8px 12px;
                        border: 1px solid #cfd6e3;
                        border-radius: 7px;
                        font: inherit;
                        font-weight: 700;
                        background: #ffffff;
                    }
                    .legacy-print-toolbar button:first-child {
                        color: #ffffff;
                        border-color: #4057b7;
                        background: #4057b7;
                    }
                    body {
                        padding-top: 62px !important;
                    }
                    @media print {
                        .legacy-print-toolbar {
                            display: none !important;
                        }
                        body {
                            padding-top: 0 !important;
                        }
                        * {
                            box-shadow: none !important;
                        }
                    }
                </style>
            </head>
            <body>
                <header>
                    <h1>${escapeHtml(displayName(student))}</h1>
                    <p>${escapeHtml(fullName(student) || "")}</p>
                    <p><strong>Interests / Hobbies:</strong>
                        ${escapeHtml(student.profile.interests.join(", ") || "Not recorded")}
                    </p>
                    <p><strong>Dream Job:</strong>
                        ${escapeHtml(student.journey.dreamJobs.join(", ") || "Still developing")}
                    </p>
                </header>

                <div class="stats">
                    <div><strong>${student.journey.checkIns.length}</strong>Total check-ins</div>
                    <div><strong>${recentMeetings.length}</strong>Check-ins in 30 days</div>
                    <div><strong>${activeGoals.length}</strong>Active goals</div>
                    <div><strong>${openFollowUps.length}</strong>Open action items</div>
                    <div><strong>${overdueFollowUps.length}</strong>Overdue action items</div>
                    <div><strong>${wins.length}</strong>Recent wins</div>
                </div>

                <h2>Current Work</h2>
                <div class="card">
                    <h3>Project</h3>
                    <p>${escapeHtml(activeProjects[0]?.title || "No active project")}</p>
                    <h3>Internship</h3>
                    <p>${escapeHtml(activeInternships[0]?.title || "No active internship")}</p>
                </div>

                <h2>Active Goals</h2>
                ${activeGoals.length
                    ? activeGoals.map((goal) => `
                        <div class="card">
                            <h3>${escapeHtml(goal.title || "Goal")}</h3>
                            ${goal.description ? `<p>${escapeHtml(goal.description)}</p>` : ""}
                            ${goal.dueDate ? `<p class="muted">Target: ${escapeHtml(formatDate(goal.dueDate))}</p>` : ""}
                            ${goal.nextSteps?.length ? list(goal.nextSteps, "") : ""}
                        </div>
                    `).join("")
                    : "<p>No active goals.</p>"
                }

                <h2>Recent Meetings</h2>
                ${recentMeetings.length
                    ? recentMeetings.slice(0, 8).map((item) => `
                        <div class="card">
                            <h3>${escapeHtml(DateUtils.formatDateTime(item.meetingDate, item.meetingTime))}</h3>
                            <p>${escapeHtml(item.summary || "No summary recorded.")}</p>
                            ${item.nextSteps?.length ? list(item.nextSteps, "") : ""}
                        </div>
                    `).join("")
                    : "<p>No check-ins during the past 30 days.</p>"
                }

                <h2>Upcoming Dates</h2>
                ${upcomingDates.length
                    ? `<ul>${upcomingDates.map((item) => `
                        <li>${escapeHtml(formatDate(item.date))} — ${escapeHtml(item.type)}: ${escapeHtml(item.title)}</li>
                    `).join("")}</ul>`
                    : "<p>No upcoming dates recorded.</p>"
                }

                <h2>Recent Wins</h2>
                ${wins.length
                    ? `<ul>${wins.map((item) => `
                        <li>${escapeHtml(item.type)}: ${escapeHtml(item.title)}</li>
                    `).join("")}</ul>`
                    : "<p>No recent completed work yet.</p>"
                }

                <footer>
                    Generated by Momentum on ${escapeHtml(DateUtils.formatDate(new Date()))}
                </footer>
                <div class="legacy-print-toolbar">
                    <strong>Momentum Print Preview</strong>
                    <div>
                        <button id="legacyPrintButton" type="button">Print / Save as PDF</button>
                        <button id="legacyCloseButton" type="button">Close Preview</button>
                    </div>
                </div>
                <script>
                    (() => {
                        const printButton = document.getElementById("legacyPrintButton");
                        const closeButton = document.getElementById("legacyCloseButton");
                        if (printButton) {
                            printButton.addEventListener("click", () => {
                                printButton.disabled = true;
                                window.setTimeout(() => {
                                    try { window.print(); }
                                    finally { printButton.disabled = false; }
                                }, 50);
                            });
                        }
                        if (closeButton) {
                            closeButton.addEventListener("click", () => window.close());
                        }
                    })();
                <\/script>
            </body>
            </html>
        `);

        printWindow.document.close();
    }

    function renderActionPlanCard(student, plan) {
        return `
            <article class="meeting-plan-card">
                <div class="meeting-plan-card-header">
                    <div>
                        <p class="eyebrow">${escapeHtml(DateUtils.formatDateTime(
                            plan.meetingDate,
                            plan.meetingTime
                        ))}</p>
                        <h4>${escapeHtml(plan.summary || "Meeting Action Plan")}</h4>
                    </div>
                    <div class="badges">
                        ${MoodUtils.renderBadges(plan.mood, escapeHtml)}
                    </div>
                </div>

                <div class="meeting-plan-commitments">
                    <div>
                        <span>Student next steps</span>
                        ${plan.studentCommitments.length
                            ? `<ul>${plan.studentCommitments.map((item) =>
                                `<li>${escapeHtml(item)}</li>`
                            ).join("")}</ul>`
                            : `<p class="empty-copy">None recorded.</p>`
                        }
                    </div>
                    <div>
                        <span>Educator next steps</span>
                        ${plan.advisorCommitments.length
                            ? `<ul>${plan.advisorCommitments.map((item) =>
                                `<li>${escapeHtml(item)}</li>`
                            ).join("")}</ul>`
                            : `<p class="empty-copy">None recorded.</p>`
                        }
                    </div>
                </div>

                <div class="meeting-plan-card-footer">
                    <span>
                        ${plan.nextMeetingDate
                            ? `Next meeting: ${escapeHtml(formatDate(plan.nextMeetingDate))}`
                            : "No next meeting scheduled"
                        }
                    </span>
                    <div class="card-actions">
                        <button class="button button-secondary button-small" type="button"
                            data-action="view-meeting-action-plan"
                            data-student-id="${escapeHtml(student.id)}"
                            data-plan-id="${escapeHtml(plan.id)}">View</button>
                        <button class="button button-primary button-small" type="button"
                            data-action="print-meeting-action-plan"
                            data-student-id="${escapeHtml(student.id)}"
                            data-plan-id="${escapeHtml(plan.id)}">Print</button>
                    </div>
                </div>
            </article>
        `;
    }

    function actionPlanModalTemplate(student, plan) {
        const list = (items, emptyText) => items.length
            ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : `<p class="empty-copy">${escapeHtml(emptyText)}</p>`;

        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal action-plan-modal" role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Meeting Action Plan</p>
                            <h2>${escapeHtml(displayName(student))}</h2>
                            <p>${escapeHtml(DateUtils.formatDateTime(
                                plan.meetingDate,
                                plan.meetingTime
                            ))}</p>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-modal" aria-label="Close">×</button>
                    </div>

                    <div class="modal-body">
                        <section class="action-plan-summary">
                            <div class="badges">
                                ${MoodUtils.renderBadges(plan.mood, escapeHtml)}
                            </div>
                            <h3>Meeting Summary</h3>
                            <p>${escapeHtml(plan.summary || "No summary recorded.")}</p>
                        </section>

                        <div class="action-plan-grid">
                            <section class="action-plan-block tone-project">
                                <h3>Current Project</h3>
                                ${list(plan.currentProjects, "No active project.")}
                            </section>
                            <section class="action-plan-block tone-internship">
                                <h3>Current Internship</h3>
                                ${list(plan.currentInternships, "No active internship.")}
                            </section>
                            <section class="action-plan-block tone-goal">
                                <h3>Goals Reviewed</h3>
                                ${list(plan.goalsReviewed, "No goals selected.")}
                            </section>
                            <section class="action-plan-block tone-meeting">
                                <h3>Next Meeting</h3>
                                <p>${plan.nextMeetingDate
                                    ? escapeHtml(formatDate(plan.nextMeetingDate))
                                    : "Not scheduled"
                                }</p>
                            </section>
                            <section class="action-plan-block tone-student">
                                <h3>Student Next Steps</h3>
                                ${list(plan.studentCommitments, "None recorded.")}
                            </section>
                            <section class="action-plan-block tone-followup">
                                <h3>Educator Next Steps</h3>
                                ${list(plan.advisorCommitments, "None recorded.")}
                            </section>
                        </div>

                        ${plan.followUps.length ? `
                            <section class="action-plan-followups">
                                <h3>Next Steps</h3>
                                ${plan.followUps.map((item) => `
                                    <article>
                                        <strong>${escapeHtml(item.title)}</strong>
                                        <span>
                                            ${escapeHtml(item.assignedTo === "Advisor" ? "Educator" : (item.assignedTo || "Educator"))}
                                            ${item.priority ? ` · ${escapeHtml(item.priority)}` : ""}
                                            ${item.dueDate ? ` · Due ${escapeHtml(formatDate(item.dueDate))}` : ""}
                                        </span>
                                    </article>
                                `).join("")}
                            </section>
                        ` : ""}

                        ${plan.reflection ? `
                            <section class="action-plan-reflection">
                                <h3>Student Reflection</h3>
                                <p>${escapeHtml(plan.reflection)}</p>
                            </section>
                        ` : ""}
                    </div>

                    <div class="modal-footer">
                        <button class="button button-secondary" type="button"
                            data-action="close-modal">Close</button>
                        <button class="button button-primary" type="button"
                            data-action="print-meeting-action-plan"
                            data-student-id="${escapeHtml(student.id)}"
                            data-plan-id="${escapeHtml(plan.id)}">
                            Print / Save as PDF
                        </button>
                    </div>
                </section>
            </div>
        `;
    }

    function printMeetingActionPlan(studentId, planId) {
        const student = StudentManager.getStudent(studentId);
        const plan = student
            ? student.journey.actionPlans.find((item) => item.id === planId)
            : null;

        if (!student || !plan) {
            App.showToast("Meeting action plan could not be opened.", "error");
            return;
        }

        const popup = PrintManager.createWindow();
        if (!popup) {
            App.showToast("Allow pop-ups to print the meeting action plan.", "error");
            return;
        }

        const list = (items, emptyText) => items.length
            ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : `<p class="muted">${escapeHtml(emptyText)}</p>`;

        popup.document.write(`
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${escapeHtml(displayName(student))} — Meeting Action Plan</title>
                <style>
                    body{font-family:Arial,sans-serif;margin:32px;color:#172033;line-height:1.45}
                    header{border-bottom:4px solid #228a72;padding-bottom:16px;margin-bottom:22px}
                    h1{margin:0 0 4px} h2{font-size:18px;margin:24px 0 8px;border-bottom:1px solid #dfe4ee;padding-bottom:5px}
                    .meta{display:flex;gap:18px;flex-wrap:wrap;color:#657086}
                    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
                    .card{break-inside:avoid;border:1px solid #dfe4ee;border-radius:9px;padding:13px}
                    .student{border-left:5px solid #4f63d9}.advisor{border-left:5px solid #c64c5b}
                    .muted{color:#657086}ul{margin:6px 0 0;padding-left:20px}
                    footer{margin-top:28px;color:#657086;font-size:12px}
                </style>

                <style>
                    .legacy-print-toolbar {
                        position: fixed;
                        top: 0;
                        right: 0;
                        left: 0;
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        padding: 10px 16px;
                        border-bottom: 1px solid #ccd3e0;
                        background: #ffffff;
                    }
                    .legacy-print-toolbar div {
                        display: flex;
                        gap: 8px;
                    }
                    .legacy-print-toolbar button {
                        padding: 8px 12px;
                        border: 1px solid #cfd6e3;
                        border-radius: 7px;
                        font: inherit;
                        font-weight: 700;
                        background: #ffffff;
                    }
                    .legacy-print-toolbar button:first-child {
                        color: #ffffff;
                        border-color: #4057b7;
                        background: #4057b7;
                    }
                    body {
                        padding-top: 62px !important;
                    }
                    @media print {
                        .legacy-print-toolbar {
                            display: none !important;
                        }
                        body {
                            padding-top: 0 !important;
                        }
                        * {
                            box-shadow: none !important;
                        }
                    }
                </style>
            </head>
            <body>
                <header>
                    <p class="muted">Momentum Meeting Action Plan</p>
                    <h1>${escapeHtml(displayName(student))}</h1>
                    <div class="meta">
                        <span>${escapeHtml(DateUtils.formatDateTime(plan.meetingDate, plan.meetingTime))}</span>
                        ${plan.mood ? `<span>Mood: ${escapeHtml(plan.mood)}</span>` : ""}
                        ${plan.nextMeetingDate ? `<span>Next meeting: ${escapeHtml(formatDate(plan.nextMeetingDate))}</span>` : ""}
                    </div>
                </header>
                <h2>Meeting Summary</h2>
                <div class="card"><p>${escapeHtml(plan.summary || "No summary recorded.")}</p></div>
                <div class="grid">
                    <div class="card"><h2>Current Project</h2>${list(plan.currentProjects, "No active project.")}</div>
                    <div class="card"><h2>Current Internship</h2>${list(plan.currentInternships, "No active internship.")}</div>
                </div>
                <h2>Goals Reviewed</h2>
                <div class="card">${list(plan.goalsReviewed, "No goals selected.")}</div>
                <div class="grid">
                    <div class="card student"><h2>Student Next Steps</h2>${list(plan.studentCommitments, "None recorded.")}</div>
                    <div class="card advisor"><h2>Educator Next Steps</h2>${list(plan.advisorCommitments, "None recorded.")}</div>
                </div>
                <h2>Next Steps</h2>
                ${plan.followUps.length
                    ? plan.followUps.map((item) => `
                        <div class="card">
                            <strong>${escapeHtml(item.title)}</strong>
                            <p class="muted">${escapeHtml(item.assignedTo === "Advisor" ? "Educator" : (item.assignedTo || "Educator"))}
                            ${item.priority ? ` · ${escapeHtml(item.priority)}` : ""}
                            ${item.dueDate ? ` · Due ${escapeHtml(formatDate(item.dueDate))}` : ""}</p>
                        </div>
                    `).join("")
                    : `<p class="muted">No next steps created.</p>`
                }
                ${plan.reflection ? `<h2>Student Reflection</h2><div class="card"><p>${escapeHtml(plan.reflection)}</p></div>` : ""}
                <footer>Generated by Momentum. Review this plan at the next meeting.</footer>
                <div class="legacy-print-toolbar">
                    <strong>Momentum Print Preview</strong>
                    <div>
                        <button id="legacyPrintButton" type="button">Print / Save as PDF</button>
                        <button id="legacyCloseButton" type="button">Close Preview</button>
                    </div>
                </div>
                <script>
                    (() => {
                        const printButton = document.getElementById("legacyPrintButton");
                        const closeButton = document.getElementById("legacyCloseButton");
                        if (printButton) {
                            printButton.addEventListener("click", () => {
                                printButton.disabled = true;
                                window.setTimeout(() => {
                                    try { window.print(); }
                                    finally { printButton.disabled = false; }
                                }, 50);
                            });
                        }
                        if (closeButton) {
                            closeButton.addEventListener("click", () => window.close());
                        }
                    })();
                <\/script>
            </body>
            </html>
        `);
        popup.document.close();
    }

    function storyActiveItems(items) {
        return items.filter((item) =>
            item.status !== "completed" &&
            item.status !== "archived" &&
            !item.archived &&
            !item.completedAt
        );
    }

    function storyMoodTrend(student) {
        const moods = [...student.journey.checkIns]
            .filter((item) => item.mood)
            .sort((a, b) => meetingDateTime(a) - meetingDateTime(b))
            .slice(-8);

        return moods.map((item) => ({
            mood: item.mood,
            date: item.meetingDate
        }));
    }

    function storyAchievements(student) {
        const achievements = [];
        const completedProjects = completedLifecycleItems(
            student.journey.currentProjects
        );
        const completedInternships = completedLifecycleItems(
            student.journey.internships
        );
        const completedGoals = completedLifecycleItems(student.journey.goals);
        const checkIns = student.journey.checkIns.length;

        if (student.journey.currentProjects.length) {
            achievements.push({
                icon: "🌱",
                title: "Project Explorer",
                detail: "Started a first project"
            });
        }
        if (completedProjects.length) {
            achievements.push({
                icon: "🛠",
                title: "Project Builder",
                detail: `${completedProjects.length} project${completedProjects.length === 1 ? "" : "s"} completed`
            });
        }
        if (student.journey.internships.length) {
            achievements.push({
                icon: "💼",
                title: "Career Explorer",
                detail: "Started a first internship"
            });
        }
        if (completedInternships.length) {
            achievements.push({
                icon: "⭐",
                title: "Workplace Experience",
                detail: `${completedInternships.length} internship${completedInternships.length === 1 ? "" : "s"} completed`
            });
        }
        if (student.journey.goals.length >= 1) {
            achievements.push({
                icon: "🎯",
                title: "Goal Setter",
                detail: "Created a first goal"
            });
        }
        if (completedGoals.length >= 1) {
            achievements.push({
                icon: "🏁",
                title: "Goal Finisher",
                detail: `${completedGoals.length} goal${completedGoals.length === 1 ? "" : "s"} completed`
            });
        }
        if (checkIns >= 5) {
            achievements.push({
                icon: "💬",
                title: "Reflection Builder",
                detail: `${checkIns} check-ins completed`
            });
        }
        if (student.journey.partnerEngagements.length) {
            achievements.push({
                icon: "🤝",
                title: "Community Connector",
                detail: "Connected with a community partner"
            });
        }
        if (student.journey.opportunityEngagements.length) {
            achievements.push({
                icon: "🚪",
                title: "Opportunity Explorer",
                detail: "Exploring a community opportunity"
            });
        }

        return achievements.slice(0, 8);
    }

    function storyRecentChanges(student) {
        const events = [];
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);

        const addEvent = (date, tone, label, title) => {
            const parsed = new Date(date || 0);
            if (!date || Number.isNaN(parsed.getTime()) || parsed < cutoff) return;
            events.push({ date, tone, label, title });
        };

        student.journey.currentProjects.forEach((item) => {
            addEvent(
                item.completedAt || item.updatedAt || item.createdAt,
                item.status === "completed" ? "success" : "project",
                item.status === "completed" ? "Project completed" : "Project updated",
                item.title || "Project"
            );
        });

        student.journey.internships.forEach((item) => {
            addEvent(
                item.completedAt || item.updatedAt || item.createdAt,
                item.status === "completed" ? "success" : "internship",
                item.status === "completed" ? "Internship completed" : "Internship updated",
                item.title || "Internship"
            );
        });

        student.journey.goals.forEach((item) => {
            addEvent(
                item.completedAt || item.updatedAt || item.createdAt,
                item.status === "completed" ? "success" : "goal",
                item.status === "completed" ? "Goal completed" : "Goal updated",
                item.title || "Goal"
            );
        });

        student.journey.checkIns.forEach((item) => {
            addEvent(
                item.meetingDate || item.createdAt,
                "meeting",
                "Check-in completed",
                item.summary || "Student meeting"
            );
        });

        student.journey.opportunityEngagements.forEach((item) => {
            addEvent(
                item.updatedAt || item.createdAt,
                "opportunity",
                "Opportunity updated",
                item.status || "Opportunity"
            );
        });

        return events
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8);
    }

    function buildStudentStoryNarrative(student) {
        const activeProjects = storyActiveItems(student.journey.currentProjects);
        const activeInternships = storyActiveItems(student.journey.internships);
        const activeGoals = storyActiveItems(student.journey.goals);
        const completedProjects = completedLifecycleItems(
            student.journey.currentProjects
        );
        const completedInternships = completedLifecycleItems(
            student.journey.internships
        );
        const completedGoals = completedLifecycleItems(student.journey.goals);
        const latest = studentViewLatestMeeting(student);
        const name = displayName(student);
        const sentences = [];

        if (student.profile.interests.length || student.journey.dreamJobs.length) {
            const interests = student.profile.interests.slice(0, 3).join(", ");
            const dreams = student.journey.dreamJobs.slice(0, 2).join(" and ");
            sentences.push(
                `${name} is exploring ${
                    interests || dreams || "new interests and career possibilities"
                }${dreams && interests ? `, with interest in becoming ${dreams}` : ""}.`
            );
        } else {
            sentences.push(
                `${name} is continuing to explore interests, strengths, and future possibilities.`
            );
        }

        if (activeProjects.length) {
            sentences.push(
                `${name} is currently working on ${
                    activeProjects.slice(0, 2).map((item) => item.title || "a project").join(" and ")
                }.`
            );
        } else if (completedProjects.length) {
            sentences.push(
                `${name} has completed ${completedProjects.length} project${
                    completedProjects.length === 1 ? "" : "s"
                }.`
            );
        }

        if (activeInternships.length) {
            sentences.push(
                `${name} is building career experience through ${
                    activeInternships.slice(0, 2).map((item) =>
                        item.organization || item.title || "an internship"
                    ).join(" and ")
                }.`
            );
        } else if (completedInternships.length) {
            sentences.push(
                `${name} has completed ${completedInternships.length} internship experience${
                    completedInternships.length === 1 ? "" : "s"
                }.`
            );
        }

        if (activeGoals.length || completedGoals.length) {
            sentences.push(
                `${name} has ${activeGoals.length} active goal${
                    activeGoals.length === 1 ? "" : "s"
                } and has completed ${completedGoals.length}.`
            );
        }

        if (latest) {
            sentences.push(
                `The most recent check-in was ${formatDate(latest.meetingDate)}${
                    latest.mood ? `, with mood recorded as ${latest.mood}` : ""
                }.`
            );
        }

        const nextSteps = latest?.nextSteps || [];
        if (nextSteps.length) {
            sentences.push(
                `The next focus is ${nextSteps.slice(0, 2).join(" and ")}.`
            );
        } else if (activeGoals.length) {
            sentences.push(
                `The next focus is continued progress toward ${
                    activeGoals[0].title || "the current goal"
                }.`
            );
        }

        return sentences.join(" ");
    }

    function renderStudentStory(student) {
        const activeProjects = storyActiveItems(student.journey.currentProjects);
        const activeInternships = storyActiveItems(student.journey.internships);
        const activeGoals = storyActiveItems(student.journey.goals);
        const latest = studentViewLatestMeeting(student);
        const moodTrend = storyMoodTrend(student);
        const achievements = storyAchievements(student);
        const recentChanges = storyRecentChanges(student);
        const narrative = buildStudentStoryNarrative(student);
        const completedProjects = completedLifecycleItems(
            student.journey.currentProjects
        ).length;
        const completedInternships = completedLifecycleItems(
            student.journey.internships
        ).length;
        const completedGoals = completedLifecycleItems(student.journey.goals).length;

        return `
            <div class="student-story-view">
                <section class="student-story-hero">
                    <div>
                        <p class="eyebrow">Shareable student story</p>
                        <h3>${escapeHtml(displayName(student))}</h3>
                        <p>
                            A concise narrative and visual summary built from the detailed
                            records in Momentum.
                        </p>
                    </div>
                    <div class="card-actions">
                        ${student.profile.portfolioUrl
                            ? portfolioLink(student, {
                                label: "Open Portfolio Website",
                                className: "button button-secondary"
                            })
                            : ""
                        }
                        <button class="button button-primary" type="button"
                            data-action="print-student-story"
                            data-student-id="${escapeHtml(student.id)}">
                            Print / Save as PDF
                        </button>
                    </div>
                </section>

                <section class="student-story-narrative">
                    <div class="panel-header">
                        <div>
                            <p class="eyebrow">Student journey</p>
                            <h3>The Story So Far</h3>
                        </div>
                    </div>
                    <p>${escapeHtml(narrative)}</p>
                </section>

                <section class="student-story-snapshot">
                    <article class="story-snapshot-card tone-student">
                        <span>Dream Job</span>
                        <strong>${escapeHtml(
                            student.journey.dreamJobs.join(", ") ||
                            "Still exploring"
                        )}</strong>
                    </article>
                    <article class="story-snapshot-card tone-project">
                        <span>Current Project</span>
                        <strong>${escapeHtml(
                            activeProjects[0]?.title || "No active project"
                        )}</strong>
                    </article>
                    <article class="story-snapshot-card tone-internship">
                        <span>Current Internship</span>
                        <strong>${escapeHtml(
                            activeInternships[0]?.title ||
                            activeInternships[0]?.organization ||
                            "No active internship"
                        )}</strong>
                    </article>
                    <article class="story-snapshot-card tone-goal">
                        <span>Active Goals</span>
                        <strong>${activeGoals.length}</strong>
                    </article>
                    <article class="story-snapshot-card tone-meeting">
                        <span>Check-Ins</span>
                        <strong>${student.journey.checkIns.length}</strong>
                    </article>
                    <article class="story-snapshot-card tone-opportunity">
                        <span>Community Connections</span>
                        <strong>${
                            student.journey.partnerEngagements.length +
                            student.journey.opportunityEngagements.length
                        }</strong>
                    </article>
                </section>

                <div class="student-story-grid">
                    <section class="student-story-panel story-tone-meeting">
                        <div class="panel-header">
                            <h3>Mood Journey</h3>
                        </div>
                        ${moodTrend.length ? `
                            <div class="story-mood-trend">
                                ${moodTrend.map((item) => `
                                    <article>
                                        <div class="badges">
                                            ${MoodUtils.renderBadges(item.mood, escapeHtml)}
                                        </div>
                                        <small>${escapeHtml(formatDate(item.date))}</small>
                                    </article>
                                `).join("")}
                            </div>
                        ` : `<p class="empty-copy">No mood history yet.</p>`}
                    </section>

                    <section class="student-story-panel story-tone-success">
                        <div class="panel-header">
                            <h3>Completed Work</h3>
                        </div>
                        <div class="story-completion-grid">
                            <article>
                                <strong>${completedProjects}</strong>
                                <span>Projects</span>
                            </article>
                            <article>
                                <strong>${completedInternships}</strong>
                                <span>Internships</span>
                            </article>
                            <article>
                                <strong>${completedGoals}</strong>
                                <span>Goals</span>
                            </article>
                        </div>
                    </section>
                </div>

                <section class="student-story-panel story-tone-success">
                    <div class="panel-header">
                        <div>
                            <p class="eyebrow">Growth highlights</p>
                            <h3>Achievements</h3>
                        </div>
                    </div>
                    ${achievements.length ? `
                        <div class="story-achievement-grid">
                            ${achievements.map((item) => `
                                <article>
                                    <span class="story-achievement-icon">${item.icon}</span>
                                    <strong>${escapeHtml(item.title)}</strong>
                                    <p>${escapeHtml(item.detail)}</p>
                                </article>
                            `).join("")}
                        </div>
                    ` : `<p class="empty-copy">Achievements will appear as the student builds their journey.</p>`}
                </section>

                <section class="student-story-panel story-tone-opportunity">
                    <div class="panel-header">
                        <div>
                            <p class="eyebrow">Past 30 days</p>
                            <h3>What Changed</h3>
                        </div>
                    </div>
                    ${recentChanges.length ? `
                        <div class="story-change-list">
                            ${recentChanges.map((item) => `
                                <article class="story-change tone-${escapeHtml(item.tone)}">
                                    <div>
                                        <span>${escapeHtml(item.label || item.type || "Update")}</span>
                                        <strong>${escapeHtml(item.title)}</strong>
                                    </div>
                                    <time>${escapeHtml(formatDate(item.date))}</time>
                                </article>
                            `).join("")}
                        </div>
                    ` : `<p class="empty-copy">No major updates were recorded in the past 30 days.</p>`}
                </section>

                <section class="student-story-panel story-tone-student">
                    <div class="panel-header">
                        <h3>Student Voice</h3>
                    </div>
                    <blockquote>
                        ${escapeHtml(
                            student.profile.studentVoice ||
                            "No student voice statement has been recorded yet."
                        )}
                    </blockquote>
                </section>
            </div>
        `;
    }

    function printStudentStory(studentId) {
        const student = StudentManager.getStudent(studentId);
        if (!student) {
            App.showToast("Student record could not be opened.", "error");
            return;
        }

        const activeProjects = storyActiveItems(student.journey.currentProjects);
        const activeInternships = storyActiveItems(student.journey.internships);
        const activeGoals = storyActiveItems(student.journey.goals);
        const achievements = storyAchievements(student);
        const recentChanges = storyRecentChanges(student);
        const narrative = buildStudentStoryNarrative(student);
        const popup = PrintManager.createWindow();

        if (!popup) {
            App.showToast("Allow pop-ups to print Student Story.", "error");
            return;
        }

        popup.document.write(`
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${escapeHtml(displayName(student))} — Student Story</title>
                <style>
                    body{font-family:Arial,sans-serif;margin:34px;color:#172033;line-height:1.5}
                    header{border-bottom:4px solid #4f63d9;padding-bottom:18px;margin-bottom:24px}
                    h1{margin:0 0 6px}h2{margin-top:26px;border-bottom:1px solid #dfe4ee;padding-bottom:6px}
                    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
                    .card{break-inside:avoid;border:1px solid #dfe4ee;border-radius:9px;padding:13px}
                    .card strong{display:block;font-size:18px}.muted{color:#657086}
                    ul{padding-left:20px}.achievement{border-left:5px solid #228a72}
                    blockquote{margin:0;padding:14px;border-left:5px solid #4f63d9;background:#eef0ff}
                    footer{margin-top:30px;color:#657086;font-size:12px}
                </style>

                <style>
                    .legacy-print-toolbar {
                        position: fixed;
                        top: 0;
                        right: 0;
                        left: 0;
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        padding: 10px 16px;
                        border-bottom: 1px solid #ccd3e0;
                        background: #ffffff;
                    }
                    .legacy-print-toolbar div {
                        display: flex;
                        gap: 8px;
                    }
                    .legacy-print-toolbar button {
                        padding: 8px 12px;
                        border: 1px solid #cfd6e3;
                        border-radius: 7px;
                        font: inherit;
                        font-weight: 700;
                        background: #ffffff;
                    }
                    .legacy-print-toolbar button:first-child {
                        color: #ffffff;
                        border-color: #4057b7;
                        background: #4057b7;
                    }
                    body {
                        padding-top: 62px !important;
                    }
                    @media print {
                        .legacy-print-toolbar {
                            display: none !important;
                        }
                        body {
                            padding-top: 0 !important;
                        }
                        * {
                            box-shadow: none !important;
                        }
                    }
                </style>
            </head>
            <body>
                <header>
                    <p class="muted">Momentum Student Story</p>
                    <h1>${escapeHtml(displayName(student))}</h1>
                    <p>${escapeHtml(narrative)}</p>
                    ${student.profile.portfolioUrl
                        ? `<p><strong>Portfolio:</strong> ${escapeHtml(
                            normalizePortfolioUrl(student.profile.portfolioUrl)
                        )}</p>`
                        : ""
                    }
                </header>

                <h2>Growth Snapshot</h2>
                <div class="grid">
                    <div class="card"><span>Dream Job</span><strong>${escapeHtml(student.journey.dreamJobs.join(", ") || "Still exploring")}</strong></div>
                    <div class="card"><span>Current Project</span><strong>${escapeHtml(activeProjects[0]?.title || "No active project")}</strong></div>
                    <div class="card"><span>Current Internship</span><strong>${escapeHtml(activeInternships[0]?.title || activeInternships[0]?.organization || "No active internship")}</strong></div>
                    <div class="card"><span>Active Goals</span><strong>${activeGoals.length}</strong></div>
                    <div class="card"><span>Check-Ins</span><strong>${student.journey.checkIns.length}</strong></div>
                    <div class="card"><span>Community Connections</span><strong>${student.journey.partnerEngagements.length + student.journey.opportunityEngagements.length}</strong></div>
                </div>

                <h2>Achievements</h2>
                ${achievements.length
                    ? achievements.map((item) => `
                        <div class="card achievement">
                            <strong>${item.icon} ${escapeHtml(item.title)}</strong>
                            <p>${escapeHtml(item.detail)}</p>
                        </div>
                    `).join("")
                    : "<p>No achievements generated yet.</p>"
                }

                <h2>Recent Changes</h2>
                ${recentChanges.length
                    ? `<ul>${recentChanges.map((item) => `
                        <li>${escapeHtml(item.label)}: ${escapeHtml(item.title)} — ${escapeHtml(formatDate(item.date))}</li>
                    `).join("")}</ul>`
                    : "<p>No major changes in the past 30 days.</p>"
                }

                <h2>Student Voice</h2>
                <blockquote>${escapeHtml(student.profile.studentVoice || "No student voice statement recorded.")}</blockquote>

                <footer>Generated from detailed Momentum records for sharing and review.</footer>
                <div class="legacy-print-toolbar">
                    <strong>Momentum Print Preview</strong>
                    <div>
                        <button id="legacyPrintButton" type="button">Print / Save as PDF</button>
                        <button id="legacyCloseButton" type="button">Close Preview</button>
                    </div>
                </div>
                <script>
                    (() => {
                        const printButton = document.getElementById("legacyPrintButton");
                        const closeButton = document.getElementById("legacyCloseButton");
                        if (printButton) {
                            printButton.addEventListener("click", () => {
                                printButton.disabled = true;
                                window.setTimeout(() => {
                                    try { window.print(); }
                                    finally { printButton.disabled = false; }
                                }, 50);
                            });
                        }
                        if (closeButton) {
                            closeButton.addEventListener("click", () => window.close());
                        }
                    })();
                <\/script>
            </body>
            </html>
        `);
        popup.document.close();
    }

    function recommendationLevel(score) {
        if (score >= 75) {
            return {
                label: "Excellent Match",
                className: "excellent",
                description: "Closely aligned with this student's current direction."
            };
        }

        if (score >= 50) {
            return {
                label: "Strong Match",
                className: "strong",
                description: "A good fit based on several parts of the student record."
            };
        }

        if (score >= 25) {
            return {
                label: "Worth Exploring",
                className: "explore",
                description: "Related enough to discuss as a possible next step."
            };
        }

        return {
            label: "Stretch Opportunity",
            className: "stretch",
            description: "Could broaden the student's experience or introduce a new pathway."
        };
    }

    function renderSmartOpportunityMatches(student, limit = 6) {
        if (typeof OpportunityManager === "undefined") {
            return `<p class="empty-copy">Opportunity matching is unavailable.</p>`;
        }

        const matches = OpportunityManager.getMatchesForStudent(
            student.id,
            limit
        );

        if (!matches.length) {
            return `
                <div class="empty-state compact-empty-state">
                    <h3>No strong matches yet</h3>
                    <p>
                        Add opportunity interest areas and tags, or add more student
                        interests, dream jobs, project details, and goals.
                    </p>
                </div>
            `;
        }

        return `
            <div class="smart-match-list">
                ${matches.map(({ opportunity, score, reasons, breakdown }, index) => {
                    const level = recommendationLevel(score);
                    const visibleReasons = (
                        reasons.length
                            ? reasons
                            : breakdown
                                .filter((item) => item.points > 0)
                                .map((item) => item.category)
                    ).slice(0, 5);

                    return `
                        <article class="smart-match-card recommendation-${escapeHtml(level.className)}">
                            <div class="smart-match-rank">${index + 1}</div>
                            <div class="smart-match-main">
                                <div class="smart-match-heading">
                                    <div>
                                        <span>${escapeHtml(opportunity.type || "Opportunity")}</span>
                                        <h4>${escapeHtml(opportunity.title)}</h4>
                                        <p>${escapeHtml(
                                            opportunity.organization ||
                                            opportunity.location ||
                                            "Community opportunity"
                                        )}</p>
                                    </div>

                                    <div class="recommendation-level recommendation-${escapeHtml(level.className)}">
                                        <strong>${escapeHtml(level.label)}</strong>
                                        <small>${escapeHtml(level.description)}</small>
                                    </div>
                                </div>

                                <div class="smart-match-reasons">
                                    ${visibleReasons.map((reason) =>
                                        `<span>✓ ${escapeHtml(reason)}</span>`
                                    ).join("")}
                                </div>

                                <div class="smart-match-actions">
                                    ${opportunity.deadline ? `
                                        <span class="smart-match-deadline">
                                            Deadline ${escapeHtml(formatDate(opportunity.deadline))}
                                        </span>
                                    ` : `<span></span>`}

                                    <div class="card-actions">
                                        <button class="button button-secondary button-small"
                                            type="button"
                                            data-action="open-matched-opportunity"
                                            data-opportunity-id="${escapeHtml(opportunity.id)}">
                                            Open in Community
                                        </button>
                                        <button class="button button-primary button-small"
                                            type="button"
                                            data-action="assign-smart-opportunity"
                                            data-student-id="${escapeHtml(student.id)}"
                                            data-opportunity-id="${escapeHtml(opportunity.id)}">
                                            Assign
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    `;
                }).join("")}
            </div>
        `;
    }

    function filterStudentMeetingHistory(query) {
        const normalized = String(query || "").trim().toLowerCase();
        const rows = document.querySelectorAll("[data-meeting-search-text]");
        let visible = 0;

        rows.forEach((row) => {
            const matches = !normalized ||
                row.dataset.meetingSearchText.includes(normalized);
            row.hidden = !matches;
            if (matches) visible += 1;
        });

        const empty = document.getElementById("meetingSearchEmpty");
        if (empty) {
            empty.hidden = visible > 0 || !normalized;
        }

        const count = document.getElementById("meetingSearchCount");
        if (count) {
            count.textContent = normalized
                ? `${visible} matching`
                : `${rows.length} total`;
        }
    }

    function actionCenterDateState(dateValue) {
        if (!dateValue) {
            return { bucket: "coming", label: "No due date", rank: 3 };
        }

        const date = DateUtils.parseLocalDate(dateValue);
        if (!date) {
            return { bucket: "coming", label: "Date needs review", rank: 3 };
        }

        const today = DateUtils.startOfToday();
        const days = Math.ceil((date - today) / 86400000);

        if (days < 0) {
            return {
                bucket: "overdue",
                label: `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`,
                rank: 0
            };
        }

        if (days <= 7) {
            return {
                bucket: "week",
                label: days === 0 ? "Due today" : `Due in ${days} days`,
                rank: 1
            };
        }

        return {
            bucket: "coming",
            label: `Due ${formatDate(dateValue)}`,
            rank: 2
        };
    }

    function collectStudentActions(student) {
        const actions = [];
        const add = (action) => {
            const dateState = actionCenterDateState(action.dueDate);
            actions.push({
                id: action.id || `${action.type}-${actions.length}`,
                title: action.title || "Next step",
                detail: action.detail || "",
                type: action.type || "followup",
                owner: action.owner || "Advisor",
                dueDate: action.dueDate || "",
                sourceLabel: action.sourceLabel || "",
                collection: action.collection || "",
                sourceId: action.sourceId || "",
                completeable: Boolean(action.completeable),
                status: action.status || "open",
                bucket: action.bucket || dateState.bucket,
                dueLabel: action.dueLabel || dateState.label,
                rank: Number.isFinite(action.rank) ? action.rank : dateState.rank
            });
        };

        student.journey.followUps
            .filter((item) => item.status !== "completed" && !item.completedAt)
            .forEach((item) => add({
                id: item.id,
                title: item.title || "Follow-up",
                detail: item.description || item.notes || "",
                type: "followup",
                owner: item.assignedTo || item.owner || "Advisor",
                dueDate: item.dueDate,
                sourceLabel: "Next Step",
                collection: "followUps",
                sourceId: item.id,
                completeable: true
            }));

        [
            ["currentProjects", "project", "Project"],
            ["internships", "internship", "Internship"],
            ["goals", "goal", "Goal"]
        ].forEach(([collection, type, label]) => {
            student.journey[collection]
                .filter((item) =>
                    item.status !== "completed" &&
                    item.status !== "archived" &&
                    !item.archived &&
                    !item.completedAt
                )
                .forEach((item) => {
                    const steps = Array.isArray(item.nextSteps)
                        ? item.nextSteps
                        : [];

                    steps.forEach((step, index) => add({
                        id: `${item.id}-step-${index}`,
                        title: step,
                        detail: item.title || label,
                        type,
                        owner: "Student",
                        dueDate: item.dueDate || item.endDate || "",
                        sourceLabel: label,
                        collection,
                        sourceId: item.id
                    }));
                });
        });

        student.journey.opportunityEngagements
            .filter((item) => !["Completed", "Declined", "Closed"].includes(item.status))
            .forEach((item) => {
                const opportunity = typeof OpportunityManager !== "undefined"
                    ? OpportunityManager.getOpportunity(item.opportunityId)
                    : null;

                if (item.nextStep || item.dueDate) {
                    add({
                        id: item.id,
                        title: item.nextStep || "Review opportunity",
                        detail: opportunity?.title || "Community opportunity",
                        type: "opportunity",
                        owner: "Student",
                        dueDate: item.dueDate || opportunity?.deadline || "",
                        sourceLabel: "Opportunity",
                        sourceId: item.opportunityId
                    });
                }
            });

        student.journey.partnerEngagements
            .filter((item) => item.nextStep && item.status !== "Completed")
            .forEach((item) => {
                const partner = typeof PartnerManager !== "undefined"
                    ? PartnerManager.getPartner(item.partnerId)
                    : null;

                add({
                    id: item.id,
                    title: item.nextStep,
                    detail: partner?.organization || "Community partner",
                    type: "partner",
                    owner: "Community Partner",
                    sourceLabel: "Partner",
                    sourceId: item.partnerId
                });
            });

        const latestPlan = [...student.journey.actionPlans]
            .sort((a, b) =>
                new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            )[0];

        if (latestPlan) {
            latestPlan.studentCommitments.forEach((item, index) => add({
                id: `${latestPlan.id}-student-${index}`,
                title: item,
                detail: `From meeting ${formatDate(latestPlan.meetingDate)}`,
                type: "meeting",
                owner: "Student",
                bucket: "student",
                dueLabel: "Waiting on student",
                rank: 1
            }));

            latestPlan.advisorCommitments.forEach((item, index) => add({
                id: `${latestPlan.id}-advisor-${index}`,
                title: item,
                detail: `From meeting ${formatDate(latestPlan.meetingDate)}`,
                type: "followup",
                owner: "Advisor",
                bucket: "advisor",
                dueLabel: "Waiting on advisor",
                rank: 1
            }));
        }

        return actions.sort((a, b) =>
            a.rank - b.rank ||
            String(a.dueDate || "9999").localeCompare(String(b.dueDate || "9999")) ||
            a.title.localeCompare(b.title)
        );
    }

    function actionToneClass(type) {
        return {
            project: "project",
            internship: "internship",
            goal: "goal",
            meeting: "meeting",
            opportunity: "opportunity",
            partner: "partner",
            followup: "followup"
        }[type] || "student";
    }

    function renderActionCenterItem(student, item) {
        return `
            <article class="action-center-item action-tone-${escapeHtml(actionToneClass(item.type))}">
                <div class="action-center-check">
                    ${item.completeable ? `
                        <button class="action-complete-button" type="button"
                            data-action="complete-action-center-item"
                            data-student-id="${escapeHtml(student.id)}"
                            data-collection="${escapeHtml(item.collection)}"
                            data-item-id="${escapeHtml(item.sourceId)}"
                            aria-label="Mark complete">✓</button>
                    ` : `<span></span>`}
                </div>

                <div class="action-center-main">
                    <div class="action-center-heading">
                        <div>
                            <span>${escapeHtml(item.sourceLabel || item.type)}</span>
                            <h4>${escapeHtml(item.title)}</h4>
                            ${item.detail ? `<p>${escapeHtml(item.detail)}</p>` : ""}
                        </div>
                        <div class="action-center-meta">
                            <span class="action-owner">${escapeHtml(item.owner)}</span>
                            <span>${escapeHtml(item.dueLabel)}</span>
                        </div>
                    </div>

                    <div class="action-center-actions">
                        ${item.dueDate ? `<time>${escapeHtml(formatDate(item.dueDate))}</time>` : `<span></span>`}
                        <div class="card-actions">
                            ${item.collection && item.sourceId ? `
                                <button class="button button-secondary button-small" type="button"
                                    data-action="open-action-source"
                                    data-student-id="${escapeHtml(student.id)}"
                                    data-collection="${escapeHtml(item.collection)}"
                                    data-item-id="${escapeHtml(item.sourceId)}">
                                    Open Source
                                </button>
                            ` : ""}
                            ${item.type === "opportunity" ? `
                                <button class="button button-secondary button-small" type="button"
                                    data-action="open-action-opportunity"
                                    data-opportunity-id="${escapeHtml(item.sourceId)}">
                                    Open Opportunity
                                </button>
                            ` : ""}
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    function renderStudentActionCenter(student) {
        const actions = collectStudentActions(student);
        const buckets = [
            ["overdue", "Overdue", "Needs immediate attention"],
            ["week", "Due This Week", "Deadlines in the next seven days"],
            ["student", "Waiting on Student", "Commitments from the latest meeting"],
            ["advisor", "Waiting on Educator", "Educator next steps and follow-through"],
            ["coming", "Coming Up", "Future and undated next steps"]
        ];

        const latestMeeting = studentViewLatestMeeting(student);
        const latestPlan = [...student.journey.actionPlans]
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];

        return `
            <div class="student-action-center">
                <section class="action-center-hero">
                    <div>
                        <p class="eyebrow">Unfinished work and follow-through</p>
                        <h3>Next Steps</h3>
                        <p>Everything that still needs to happen for this student, gathered from meetings, projects, internships, goals, next steps, and opportunities.</p>
                    </div>
                    <button class="button button-primary" type="button"
                        data-action="start-student-meeting"
                        data-student-id="${escapeHtml(student.id)}">
                        Start Meeting
                    </button>
                </section>

                <section class="next-steps-explainer">
                    <strong>What this page is for</strong>
                    <p>
                        Use Next Steps when you need to answer:
                        “What does this student need to do next, and what do I need to follow up on?”
                        Completing or updating the connected record removes it from this list.
                    </p>
                </section>

                <section class="meeting-prep-panel">
                    <div class="panel-header">
                        <div>
                            <p class="eyebrow">Use this before the next meeting</p>
                            <h3>Meeting Prep</h3>
                        </div>
                    </div>
                    <div class="meeting-prep-grid">
                        <article>
                            <span>Last meeting</span>
                            <strong>${latestMeeting
                                ? escapeHtml(DateUtils.formatDateTime(
                                    latestMeeting.meetingDate,
                                    latestMeeting.meetingTime
                                ))
                                : "No meeting recorded"
                            }</strong>
                            <p>${escapeHtml(latestMeeting?.summary || "No summary available.")}</p>
                        </article>
                        <article>
                            <span>Suggested agenda</span>
                            <ul>
                                ${actions.slice(0, 5).map((item) =>
                                    `<li>${escapeHtml(item.title)}</li>`
                                ).join("") || "<li>Review current goals and next steps</li>"}
                            </ul>
                        </article>
                        <article>
                            <span>Carry forward</span>
                            <strong>${latestPlan
                                ? latestPlan.studentCommitments.length +
                                  latestPlan.advisorCommitments.length
                                : 0
                            } commitments</strong>
                            <p>Review unfinished commitments from the latest meeting plan.</p>
                        </article>
                    </div>
                </section>

                <section class="action-center-summary">
                    <article class="summary-overdue">
                        <strong>${actions.filter((item) => item.bucket === "overdue").length}</strong>
                        <span>Overdue</span>
                    </article>
                    <article class="summary-week">
                        <strong>${actions.filter((item) => item.bucket === "week").length}</strong>
                        <span>Due this week</span>
                    </article>
                    <article class="summary-student">
                        <strong>${actions.filter((item) => item.owner === "Student").length}</strong>
                        <span>Student-owned</span>
                    </article>
                    <article class="summary-advisor">
                        <strong>${actions.filter((item) => item.owner === "Advisor").length}</strong>
                        <span>Educator-owned</span>
                    </article>
                </section>

                ${actions.length ? `
                    <div class="action-center-groups">
                        ${buckets.map(([bucket, title, subtitle]) => {
                            const items = actions.filter((item) => item.bucket === bucket);
                            if (!items.length) return "";

                            return `
                                <section class="action-center-group">
                                    <div class="panel-header">
                                        <div>
                                            <h3>${escapeHtml(title)}</h3>
                                            <p class="panel-subtitle">${escapeHtml(subtitle)}</p>
                                        </div>
                                        <span class="support-count">${items.length}</span>
                                    </div>
                                    <div class="action-center-list">
                                        ${items.map((item) =>
                                            renderActionCenterItem(student, item)
                                        ).join("")}
                                    </div>
                                </section>
                            `;
                        }).join("")}
                    </div>
                ` : `
                    <div class="empty-state">
                        <h3>Nothing needs action</h3>
                        <p>No open next steps, commitments, next steps, or deadlines were found.</p>
                    </div>
                `}
            </div>
        `;
    }

    function latestMeetingCutoff(student) {
        const latest = studentViewLatestMeeting(student);
        if (!latest) {
            return null;
        }

        return DateUtils.combineLocalDateTime(
            latest.meetingDate,
            latest.meetingTime || "12:00"
        ) || new Date(latest.createdAt || 0);
    }

    function itemChangedAfter(item, cutoff) {
        if (!cutoff) {
            return false;
        }

        const candidate =
            item.completedAt ||
            item.updatedAt ||
            item.createdAt ||
            item.startDate ||
            "";

        if (!candidate) {
            return false;
        }

        const parsed = new Date(candidate);
        return !Number.isNaN(parsed.getTime()) && parsed > cutoff;
    }

    function collectChangesSinceLastMeeting(student) {
        const cutoff = latestMeetingCutoff(student);
        const changes = [];

        if (!cutoff) {
            return [{
                tone: "meeting",
                label: "No previous meeting",
                title: "Start with an initial check-in",
                detail: "Momentum will begin tracking changes after the first meeting."
            }];
        }

        const add = (tone, label, title, detail = "") => {
            changes.push({ tone, label, title, detail });
        };

        student.journey.currentProjects.forEach((item) => {
            if (!itemChangedAfter(item, cutoff)) return;

            if (item.status === "completed" || item.completedAt) {
                add("success", "Project completed", item.title || "Project");
            } else {
                add("project", "Project updated", item.title || "Project",
                    item.nextSteps?.[0] || item.description || "");
            }
        });

        student.journey.internships.forEach((item) => {
            if (!itemChangedAfter(item, cutoff)) return;

            if (item.status === "completed" || item.completedAt) {
                add("success", "Internship completed", item.title || item.organization || "Internship");
            } else {
                add("internship", "Internship updated",
                    item.title || item.organization || "Internship",
                    item.nextSteps?.[0] || item.description || "");
            }
        });

        student.journey.goals.forEach((item) => {
            if (!itemChangedAfter(item, cutoff)) return;

            if (item.status === "completed" || item.completedAt) {
                add("success", "Goal completed", item.title || "Goal");
            } else {
                add("goal", "Goal updated", item.title || "Goal",
                    item.nextSteps?.[0] || item.description || "");
            }
        });

        student.journey.followUps.forEach((item) => {
            if (!itemChangedAfter(item, cutoff)) return;

            if (item.status === "completed" || item.completedAt) {
                add("success", "Follow-up completed", item.title || "Follow-up");
            } else {
                add("followup", "Follow-up added", item.title || "Follow-up",
                    item.dueDate ? `Due ${formatDate(item.dueDate)}` : "");
            }
        });

        student.journey.opportunityEngagements.forEach((item) => {
            if (!itemChangedAfter(item, cutoff)) return;

            const opportunity = typeof OpportunityManager !== "undefined"
                ? OpportunityManager.getOpportunity(item.opportunityId)
                : null;

            add("opportunity", "Opportunity updated",
                opportunity?.title || "Community opportunity",
                item.status || item.nextStep || "");
        });

        const newerCheckIns = student.journey.checkIns
            .filter((item) => {
                const date = DateUtils.combineLocalDateTime(
                    item.meetingDate,
                    item.meetingTime || "12:00"
                ) || new Date(item.createdAt || 0);
                return date > cutoff;
            });

        newerCheckIns.forEach((item) => {
            add("meeting", "Check-in recorded",
                item.summary || "Student check-in",
                item.mood || "");
        });

        return changes
            .sort((a, b) => a.label.localeCompare(b.label))
            .slice(0, 10);
    }

    function buildDiscussionPrompts(student, changes) {
        const prompts = [];
        const latest = studentViewLatestMeeting(student);
        const activeProjects = studentViewActiveItems(student.journey.currentProjects);
        const activeInternships = studentViewActiveItems(student.journey.internships);
        const activeGoals = studentViewActiveItems(student.journey.goals);
        const overdueFollowUps = student.journey.followUps.filter((item) =>
            item.status !== "completed" &&
            !item.completedAt &&
            item.dueDate &&
            DateUtils.isOverdue(item.dueDate)
        );

        const add = (tone, prompt, source) => {
            if (!prompts.some((item) => item.prompt === prompt)) {
                prompts.push({ tone, prompt, source });
            }
        };

        changes.forEach((change) => {
            if (change.label === "Project completed") {
                add("project",
                    `What are you most proud of from ${change.title}?`,
                    "Completed project");
            } else if (change.label === "Internship updated") {
                add("internship",
                    `How is ${change.title} going, and what are you learning there?`,
                    "Internship update");
            } else if (change.label === "Goal completed") {
                add("goal",
                    `What helped you complete ${change.title}, and what goal should come next?`,
                    "Completed goal");
            } else if (change.label === "Opportunity updated") {
                add("opportunity",
                    `Do you want to keep moving forward with ${change.title}?`,
                    "Opportunity");
            }
        });

        if (latest?.nextSteps?.length) {
            add("meeting",
                `Last time you planned to ${latest.nextSteps[0]}. What happened?`,
                "Previous meeting");
        }

        if (overdueFollowUps.length) {
            add("followup",
                `What is getting in the way of ${overdueFollowUps[0].title || "the overdue next step"}?`,
                "Overdue next step");
        }

        if (activeProjects.length) {
            add("project",
                `What progress have you made on ${activeProjects[0].title || "your current project"}?`,
                "Current project");
        }

        if (activeInternships.length) {
            add("internship",
                `What support would make ${activeInternships[0].title || activeInternships[0].organization || "your internship"} more successful?`,
                "Current internship");
        }

        if (activeGoals.length) {
            add("goal",
                `What is the next small step toward ${activeGoals[0].title || "your current goal"}?`,
                "Active goal");
        }

        if (latest?.mood) {
            add("meeting",
                `Last time you felt ${latest.mood}. How are you feeling now?`,
                "Mood next step");
        }

        if (!student.profile.portfolioUrl) {
            add("opportunity",
                "Where is your Google Sites portfolio, and is it ready for us to review together?",
                "Portfolio website");
        }

        return prompts.slice(0, 7);
    }

    function renderMeetingIntelligence(student) {
        const latest = studentViewLatestMeeting(student);
        const changes = collectChangesSinceLastMeeting(student);
        const prompts = buildDiscussionPrompts(student, changes);
        const portfolioUrl = normalizePortfolioUrl(student.profile.portfolioUrl);

        return `
            <section class="meeting-intelligence-shell">
                <div class="meeting-intelligence-header">
                    <div>
                        <p class="eyebrow">Meeting intelligence</p>
                        <h3>Prepare for Your Next Meeting</h3>
                        <p>
                            A quick review of what changed, what to ask,
                            and the student’s Google Sites portfolio.
                        </p>
                    </div>
                    <button class="button button-primary" type="button"
                        data-action="start-student-meeting"
                        data-student-id="${escapeHtml(student.id)}">
                        Start Meeting
                    </button>
                </div>

                <div class="meeting-intelligence-grid">
                    <section class="meeting-insight-panel insight-changes">
                        <div class="panel-header">
                            <div>
                                <p class="eyebrow">Since your last meeting</p>
                                <h3>What Changed</h3>
                            </div>
                            <span class="support-count">${changes.length}</span>
                        </div>

                        ${latest ? `
                            <p class="meeting-insight-context">
                                Last meeting: ${escapeHtml(DateUtils.formatDateTime(
                                    latest.meetingDate,
                                    latest.meetingTime
                                ))}
                            </p>
                        ` : ""}

                        <div class="meeting-change-list">
                            ${changes.map((change) => `
                                <article class="meeting-change-item change-tone-${escapeHtml(change.tone)}">
                                    <span>${escapeHtml(change.label)}</span>
                                    <strong>${escapeHtml(change.title)}</strong>
                                    ${change.detail
                                        ? `<p>${escapeHtml(change.detail)}</p>`
                                        : ""
                                    }
                                </article>
                            `).join("")}
                        </div>
                    </section>

                    <section class="meeting-insight-panel insight-prompts">
                        <div class="panel-header">
                            <div>
                                <p class="eyebrow">Conversation support</p>
                                <h3>Things to Ask Today</h3>
                            </div>
                        </div>

                        ${prompts.length ? `
                            <div class="discussion-prompt-list">
                                ${prompts.map((item) => `
                                    <article class="discussion-prompt prompt-tone-${escapeHtml(item.tone)}">
                                        <span>Ask</span>
                                        <p>${escapeHtml(item.prompt)}</p>
                                        <small>${escapeHtml(item.source)}</small>
                                    </article>
                                `).join("")}
                            </div>
                        ` : `
                            <p class="empty-copy">
                                Add a meeting, project, goal, internship, or next step
                                to generate conversation prompts.
                            </p>
                        `}
                    </section>

                    <section class="meeting-insight-panel portfolio-overview-card">
                        <div class="panel-header">
                            <div>
                                <p class="eyebrow">Student-created work</p>
                                <h3>Google Sites Portfolio</h3>
                            </div>
                        </div>

                        ${portfolioUrl ? `
                            <div class="portfolio-site-linked">
                                <span class="portfolio-site-status">Linked</span>
                                <strong>${escapeHtml(portfolioUrl)}</strong>
                                <p>
                                    Open the student’s Google Site during meetings
                                    to review their work together.
                                </p>
                                <div class="card-actions">
                                    <a class="button button-primary" href="${escapeHtml(portfolioUrl)}"
                                        target="_blank" rel="noopener noreferrer">
                                        Open Google Site
                                    </a>
                                    <button class="button button-secondary" type="button"
                                        data-action="edit-student"
                                        data-student-id="${escapeHtml(student.id)}">
                                        Edit Link
                                    </button>
                                </div>
                            </div>
                        ` : `
                            <div class="portfolio-site-empty">
                                <strong>No Google Site linked yet</strong>
                                <p>
                                    Add the student’s published Google Sites address
                                    so it is always available from Overview.
                                </p>
                                <button class="button button-primary" type="button"
                                    data-action="edit-student"
                                    data-student-id="${escapeHtml(student.id)}">
                                    Add Google Site
                                </button>
                            </div>
                        `}
                    </section>
                </div>
            </section>
        `;
    }

    function projectWorkspaceCurrentProject(student) {
        return student.journey.currentProjects.find((item) =>
            item.status !== "completed" &&
            item.status !== "archived" &&
            !item.archived &&
            !item.completedAt
        ) || null;
    }

    function projectWorkspaceLastUpdate(project) {
        if (!project) return "";
        const activity = [...(project.activityLog || [])]
            .sort((a, b) => {
                const bd = DateUtils.combineLocalDateTime(b.date, b.time || "12:00")
                    || new Date(b.createdAt || 0);
                const ad = DateUtils.combineLocalDateTime(a.date, a.time || "12:00")
                    || new Date(a.createdAt || 0);
                return bd - ad;
            })[0];

        return activity
            ? DateUtils.formatDateTime(activity.date, activity.time)
            : formatDate(project.updatedAt || project.createdAt || "");
    }

    function projectWorkspaceFollowThrough(student) {
        const items = [];
        student.journey.currentProjects
            .filter((project) =>
                project.status !== "completed" &&
                project.status !== "archived" &&
                !project.archived &&
                !project.completedAt
            )
            .forEach((project) => {
                if (project.dueDate && DateUtils.isOverdue(project.dueDate)) {
                    items.push({
                        title: project.title || "Project",
                        detail: `Overdue since ${formatDate(project.dueDate)}`,
                        projectId: project.id
                    });
                }

                (project.nextSteps || []).forEach((step) => {
                    if (!step) return;
                    items.push({
                        title: step,
                        detail: project.title || "Project next step",
                        projectId: project.id
                    });
                });
            });

        return items.slice(0, 6);
    }

    function renderProjectWorkspace(student) {
        const project = projectWorkspaceCurrentProject(student);
        const portfolioUrl = normalizePortfolioUrl(student.profile.portfolioUrl);
        const followThrough = projectWorkspaceFollowThrough(student);

        return `
            <section class="project-workspace">
                <div class="project-workspace-header">
                    <div>
                        <p class="eyebrow">Coaching and project review</p>
                        <h3>Project Workspace</h3>
                        <p>
                            Review the current project, open the student’s Google Site,
                            and document the next coaching move.
                        </p>
                    </div>

                    <div class="card-actions">
                        ${portfolioUrl ? `
                            <a class="button button-secondary"
                                href="${escapeHtml(portfolioUrl)}"
                                target="_blank"
                                rel="noopener noreferrer">
                                Open Google Site
                            </a>
                        ` : `
                            <button class="button button-secondary" type="button"
                                data-action="edit-student"
                                data-student-id="${escapeHtml(student.id)}">
                                Add Google Site
                            </button>
                        `}

                        <button class="button button-primary" type="button"
                            data-action="start-project-checkin"
                            data-student-id="${escapeHtml(student.id)}"
                            ${project ? "" : "disabled"}>
                            Start Project Check-In
                        </button>
                    </div>
                </div>

                <div class="project-workspace-grid">
                    <article class="project-workspace-card workspace-tone-student">
                        <span>Google Sites Portfolio</span>
                        <strong>${portfolioUrl ? "Linked" : "Not linked"}</strong>
                        <p>${portfolioUrl
                            ? escapeHtml(portfolioUrl)
                            : "Add the published portfolio address."
                        }</p>
                        ${portfolioUrl ? `
                            <button class="button button-secondary button-small"
                                type="button"
                                data-action="edit-student"
                                data-student-id="${escapeHtml(student.id)}">
                                Edit Link
                            </button>
                        ` : ""}
                    </article>

                    <article class="project-workspace-card workspace-tone-project">
                        <span>Current Project</span>
                        <strong>${escapeHtml(project?.title || "No active project")}</strong>
                        <p>${escapeHtml(
                            project?.projectQuestion ||
                            project?.description ||
                            "Create or activate a project to begin."
                        )}</p>
                    </article>

                    <article class="project-workspace-card workspace-tone-goal">
                        <span>Phase</span>
                        <strong>${escapeHtml(project?.phase || "Not recorded")}</strong>
                        <p>
                            Last update:
                            ${escapeHtml(
                                projectWorkspaceLastUpdate(project) ||
                                "No dated update"
                            )}
                        </p>
                    </article>

                    <article class="project-workspace-card workspace-tone-followup">
                        <span>Next Project Step</span>
                        <strong>${escapeHtml(
                            project?.nextSteps?.[0] || "No next step recorded"
                        )}</strong>
                        <p>${project?.dueDate
                            ? `Due ${escapeHtml(formatDate(project.dueDate))}`
                            : "No project due date recorded."
                        }</p>
                    </article>
                </div>

                <div class="project-workspace-actions">
                    <button class="button button-secondary" type="button"
                        data-action="add-project-note"
                        data-student-id="${escapeHtml(student.id)}"
                        data-project-id="${escapeHtml(project?.id || "")}"
                        ${project ? "" : "disabled"}>
                        Add Project Note
                    </button>

                    ${project ? `
                        <button class="button button-secondary" type="button"
                            data-action="open-action-source"
                            data-student-id="${escapeHtml(student.id)}"
                            data-collection="currentProjects"
                            data-item-id="${escapeHtml(project.id)}">
                            Open Project Details
                        </button>
                    ` : `
                        <button class="button button-secondary" type="button"
                            data-action="add-journey-item"
                            data-student-id="${escapeHtml(student.id)}"
                            data-collection="currentProjects">
                            Add Project
                        </button>
                    `}
                </div>

                <section class="project-followthrough-panel">
                    <div class="panel-header">
                        <div>
                            <p class="eyebrow">Project follow-through</p>
                            <h3>Milestones and Next Moves</h3>
                        </div>
                        <span class="support-count">${followThrough.length}</span>
                    </div>

                    ${followThrough.length ? `
                        <div class="project-followthrough-list">
                            ${followThrough.map((item) => `
                                <article>
                                    <div>
                                        <strong>${escapeHtml(item.title)}</strong>
                                        <p>${escapeHtml(item.detail)}</p>
                                    </div>
                                    <button class="button button-secondary button-small"
                                        type="button"
                                        data-action="open-action-source"
                                        data-student-id="${escapeHtml(student.id)}"
                                        data-collection="currentProjects"
                                        data-item-id="${escapeHtml(item.projectId)}">
                                        Review
                                    </button>
                                </article>
                            `).join("")}
                        </div>
                    ` : `
                        <p class="empty-copy">
                            No project milestones or next steps need attention.
                        </p>
                    `}
                </section>
            </section>
        `;
    }

    function renderInquiryPanel(student, context, title = "Inquiry Coach") {
        const questions = InquiryCoach.contextualQuestions(student, context, 4);
        return `
            <section class="inquiry-coach-panel" data-inquiry-context="${escapeHtml(context)}">
                <div class="panel-header">
                    <div><p class="eyebrow">Open-ended coaching</p><h3>${escapeHtml(title)}</h3></div>
                    <button class="button button-secondary button-small" type="button"
                        data-action="ask-another-question" data-inquiry-context="${escapeHtml(context)}"
                        data-student-id="${escapeHtml(student.id)}">Ask Another</button>
                </div>
                <blockquote data-inquiry-question>${escapeHtml(questions[0])}</blockquote>
                <div class="inquiry-question-list">
                    ${questions.slice(1).map(q => `<button type="button"
                        data-action="choose-inquiry-question" data-question="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join("")}
                </div>
                <details><summary>Gentle next step prompts</summary>
                    <div class="tag-list">${InquiryCoach.getQuestions("followup",5).map(q=>`<span class="tag">${escapeHtml(q)}</span>`).join("")}</div>
                </details>
            </section>`;
    }

    function discoveryTags(items, emptyText = "Not recorded yet.") {
        return items?.length
            ? `<div class="tag-list">${items.map(i=>`<span class="tag">${escapeHtml(i)}</span>`).join("")}</div>`
            : `<p class="empty-copy">${escapeHtml(emptyText)}</p>`;
    }

    function emergingThemes(student) {
        const d = student.profile.discovery;
        const text = [...student.profile.interests, ...d.favoriteYouTube, ...d.favoriteGames,
            ...d.favoriteMedia, ...d.freeTime, ...d.curiosities, ...d.thingsToTry,
            ...d.thingsToLearn, ...d.othersNotice].join(" ").toLowerCase();
        const map = {
            "Building & Design":["build","minecraft","design","drawing","make"],
            "Mechanical Systems":["car","engine","bike","repair","fix"],
            "Technology":["computer","coding","game","technology","app"],
            "Helping Others":["help","care","support","community","people"],
            "Creativity":["art","music","video","fashion","writing","create"],
            "Animals & Nature":["animal","dog","cat","nature","outdoors"],
            "Leadership":["lead","captain","organize","coach","team"],
            "Food & Hospitality":["cook","food","bake","restaurant"]
        };
        return Object.entries(map).filter(([,terms])=>terms.some(t=>text.includes(t))).map(([name])=>name).slice(0,6);
    }

    function renderDiscoveringMe(student) {
        const d = student.profile.discovery;
        const t = student.profile.transportation;
        const themes = emergingThemes(student);

        return `
            <div class="discovering-me-view">
                ${renderInquiryPanel(
                    student,
                    "discovery",
                    d.futureDirection === "not-yet"
                        ? "I Don’t Know Yet — Discovery Questions"
                        : "Discover Together"
                )}

                <form id="inlineDiscoveryForm" class="inline-discovery-form">
                    <input type="hidden" name="studentId"
                        value="${escapeHtml(student.id)}">

                    <section class="inline-discovery-section discovery-direction-editor">
                        <div>
                            <p class="eyebrow">Future direction</p>
                            <h3>Where are they right now?</h3>
                        </div>
                        <div class="discovery-direction-options">
                            ${[
                                ["not-yet", "I don’t know yet"],
                                ["ideas", "I have some ideas"],
                                ["know", "I know"]
                            ].map(([value, label]) => `
                                <label>
                                    <input type="radio" name="futureDirection"
                                        value="${value}"
                                        ${d.futureDirection === value ? "checked" : ""}>
                                    <span>${label}</span>
                                </label>
                            `).join("")}
                        </div>
                    </section>

                    <div class="inline-discovery-grid">
                        ${[
                            ["favoriteYouTube", "Favorite YouTube / Creators", d.favoriteYouTube,
                                "Channels, creators, or kinds of videos"],
                            ["favoriteGames", "Favorite Games", d.favoriteGames,
                                "Games they enjoy and what they like about them"],
                            ["favoriteMedia", "Music, Shows & Media", d.favoriteMedia,
                                "Music, shows, podcasts, streamers, movies"],
                            ["freeTime", "Free Time", d.freeTime,
                                "What they choose to do after school or on weekends"],
                            ["curiosities", "Curiosities", d.curiosities,
                                "Things they wonder about or search for"],
                            ["thingsToTry", "Things to Try", d.thingsToTry,
                                "Experiences, activities, or hobbies they want to try"],
                            ["thingsToLearn", "Things to Learn", d.thingsToLearn,
                                "Skills or topics they would like to learn"],
                            ["othersNotice", "What Others Notice", d.othersNotice,
                                "What friends, family, or adults say they are good at"]
                        ].map(([name, label, values, placeholder]) => `
                            <section class="inline-discovery-card">
                                <label for="inline-${name}">${label}</label>
                                <textarea id="inline-${name}" name="${name}"
                                    placeholder="${placeholder}">${escapeHtml(
                                        (values || []).join("\n")
                                    )}</textarea>
                                <p>Enter one idea per line or separate ideas with commas.</p>
                            </section>
                        `).join("")}
                    </div>

                    <div class="inline-discovery-savebar">
                        <span>
                            Save answers here without leaving Discovering Me.
                        </span>
                        <button class="button button-primary" type="submit">
                            Save Discovery Answers
                        </button>
                    </div>
                </form>

                <section class="emerging-themes-panel">
                    <div class="panel-header">
                        <div>
                            <p class="eyebrow">Patterns, not prescriptions</p>
                            <h3>Emerging Themes</h3>
                        </div>
                    </div>
                    ${themes.length
                        ? discoveryTags(themes)
                        : `<p class="empty-copy">
                            Add more discovery answers to begin noticing patterns.
                          </p>`
                    }
                </section>

                <section class="transportation-panel practical-transportation-panel">
                    <div class="panel-header">
                        <div>
                            <p class="eyebrow">Practical access information</p>
                            <h3>Transportation & Mobility</h3>
                        </div>
                    </div>

                    <form id="inlineTransportationForm">
                        <input type="hidden" name="studentId"
                            value="${escapeHtml(student.id)}">
                        <div class="transportation-edit-grid">
                            <div class="form-field full-width">
                                <label>Transportation options</label>
                                <div class="transportation-checkbox-grid">
                                    ${[
                                        "Drives own vehicle","Family transportation",
                                        "Friend transportation","School transportation",
                                        "Public transit","Bicycle","Walks","Ride share",
                                        "No reliable transportation","Other"
                                    ].map((option) => {
                                        const selected = t.modes?.length
                                            ? t.modes : t.primaryMode ? [t.primaryMode] : [];
                                        return `<label class="transportation-option">
                                            <input type="checkbox" name="transportationModes"
                                                value="${escapeHtml(option)}"
                                                ${selected.includes(option) ? "checked" : ""}>
                                            <span>${escapeHtml(option)}</span>
                                        </label>`;
                                    }).join("")}
                                </div>
                            </div>

                            <div class="form-field">
                                <label for="inlineLicenseStatus">Driver’s license</label>
                                <select id="inlineLicenseStatus" name="licenseStatus">
                                    ${["", "Not started", "Permit", "Licensed"]
                                        .map((option) => `
                                            <option value="${escapeHtml(option)}"
                                                ${t.licenseStatus === option ? "selected" : ""}>
                                                ${escapeHtml(option || "Select")}
                                            </option>
                                        `).join("")}
                                </select>
                            </div>
                        </div>

                        <label class="checkbox-row">
                            <input type="checkbox" name="hasReliableAccess"
                                ${t.hasReliableAccess ? "checked" : ""}>
                            <span>Has reliable transportation access</span>
                        </label>

                        <div class="form-field">
                            <label for="inlineTransportationNotes">
                                Practical transportation notes
                            </label>
                            <textarea id="inlineTransportationNotes"
                                name="transportationNotes"
                                placeholder="Example: Can take the city bus after 3:30; needs rides on Fridays">${escapeHtml(
                                    t.notes || ""
                                )}</textarea>
                        </div>

                        <div class="inline-transportation-actions">
                            <button class="button button-primary" type="submit">
                                Save Transportation
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function observationFormTemplate(studentId) {
        return `<div class="modal-backdrop" data-modal-backdrop><section class="modal modal-small" role="dialog" aria-modal="true">
            <div class="modal-header"><div><p class="eyebrow">Quick educator note</p><h2>Add Observation</h2></div>
                <button class="icon-button" type="button" data-action="close-modal">×</button></div>
            <form id="observationForm"><input type="hidden" name="studentId" value="${escapeHtml(studentId)}">
                <div class="modal-body"><div class="form-grid">
                    <div class="form-field"><label>Date</label><input name="date" type="date" value="${DateUtils.today()}"></div>
                    <div class="form-field"><label>Time</label><input name="time" type="time"></div></div>
                    <div class="form-field"><label>Category</label><select name="category">
                        ${["Engagement","Work Habits","Communication","Collaboration","Independence","Project Progress","Internship Readiness","Attendance","Strength","Barrier","General"].map(x=>`<option>${x}</option>`).join("")}
                    </select></div>
                    <div class="form-field"><label>What did you notice?</label><textarea name="note" required></textarea></div>
                    <div class="form-field"><label>Strength noticed</label><input name="strength"></div>
                    <div class="form-field"><label>Barrier noticed</label><input name="barrier"></div>
                    <div class="form-field"><label>Support provided</label><textarea name="supportProvided"></textarea></div>
                    <div class="form-field"><label>Recommended next move</label><textarea name="nextMove"></textarea></div>
                    <label class="checkbox-row"><input type="checkbox" name="followUpNeeded"><span>Create a next step reminder</span></label>
                </div><div class="modal-footer"><button class="button button-secondary" type="button" data-action="close-modal">Cancel</button>
                    <button class="button button-primary" type="submit">Save Observation</button></div>
            </form></section></div>`;
    }

    function renderObservations(student) {
        const items=[...student.journey.observations].sort((a,b)=>{
            const bd=DateUtils.combineLocalDateTime(b.date,b.time||"12:00")||new Date(b.createdAt||0);
            const ad=DateUtils.combineLocalDateTime(a.date,a.time||"12:00")||new Date(a.createdAt||0);
            return bd-ad;
        });
        return `<div class="observations-view">
            <section class="observations-header"><div><p class="eyebrow">Between formal meetings</p>
                <h3>Observations & Coaching Log</h3><p>Capture strengths, barriers, patterns, and support provided.</p></div>
                <button class="button button-primary" type="button" data-action="add-observation"
                    data-student-id="${escapeHtml(student.id)}">+ Add Observation</button></section>
            ${renderInquiryPanel(student,"observations","Observation Reflection")}
            ${items.length?`<div class="observation-list">${items.map(i=>`<article class="observation-item">
                <div class="observation-time"><strong>${escapeHtml(DateUtils.formatDateTime(i.date,i.time))}</strong><span>${escapeHtml(i.category)}</span></div>
                <div><p>${escapeHtml(i.note)}</p>${i.strength?`<p><strong>Strength:</strong> ${escapeHtml(i.strength)}</p>`:""}
                ${i.barrier?`<p><strong>Barrier:</strong> ${escapeHtml(i.barrier)}</p>`:""}
                ${i.supportProvided?`<p><strong>Support:</strong> ${escapeHtml(i.supportProvided)}</p>`:""}
                ${i.nextMove?`<p><strong>Next move:</strong> ${escapeHtml(i.nextMove)}</p>`:""}</div>
                ${i.followUpNeeded?'<span class="badge badge-warning">Follow-up needed</span>':""}
            </article>`).join("")}</div>`:'<div class="empty-state"><h3>No observations yet</h3><p>Add a quick note when you notice a strength, barrier, or change.</p></div>'}
        </div>`;
    }

    function journeyEventDate(value) {
        if (!value) return new Date(0);
        const local = DateUtils.parseLocalDate(value);
        const parsed = local || new Date(value);
        return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date(0);
    }

    function studentJourneyEvents(student) {
        const events = [];
        const push = (event) => events.push({
            id: event.id || `${event.type}-${events.length}`,
            type: event.type || "update",
            label: event.label || "Update",
            title: event.title || "Student update",
            description: event.description || "",
            date: event.date || "",
            timestamp: event.timestamp || event.date || "",
            tone: event.tone || event.type || "student",
            isWin: Boolean(event.isWin),
            milestone: Boolean(event.milestone),
            thread: event.thread || ""
        });

        student.journey.checkIns.forEach((item) => push({
            id: item.id,
            type: "meetings",
            label: "Meeting",
            title: item.summary || "Student meeting",
            description: [item.mood ? `Mood: ${item.mood}` : "", ...(item.nextSteps || []).slice(0, 2)]
                .filter(Boolean).join(" · "),
            date: item.meetingDate,
            timestamp: DateUtils.combineLocalDateTime(item.meetingDate, item.meetingTime || "12:00") || item.createdAt,
            tone: "meeting",
            thread: (item.newQuestions || [])[0] || (item.nextSteps || [])[0] || ""
        }));

        student.journey.observations.forEach((item) => push({
            id: item.id,
            type: "observations",
            label: "Observation",
            title: item.category || "Observation",
            description: item.note,
            date: item.date,
            timestamp: DateUtils.combineLocalDateTime(item.date, item.time || "12:00") || item.createdAt,
            tone: "observation",
            isWin: item.category === "Strength" || Boolean(item.strength),
            thread: item.nextMove || item.barrier || ""
        }));

        [
            ["currentProjects", "projects", "Project", "project"],
            ["internships", "community", "Internship", "internship"],
            ["goals", "goals", "Goal", "goal"]
        ].forEach(([collection, type, label, tone]) => {
            student.journey[collection].forEach((item) => {
                push({
                    id: item.id,
                    type,
                    label,
                    title: item.title || label,
                    description: item.description || item.nextSteps?.[0] || "",
                    date: item.updatedAt || item.createdAt,
                    timestamp: item.updatedAt || item.createdAt,
                    tone,
                    isWin: item.status === "completed" || Boolean(item.completedAt),
                    milestone: item.status === "completed" || Boolean(item.completedAt),
                    thread: item.projectQuestion || item.nextSteps?.[0] || ""
                });

                (item.activityLog || []).forEach((activity) => push({
                    id: activity.id,
                    type,
                    label: `${label} update`,
                    title: item.title || label,
                    description: activity.note || activity.nextStep || "",
                    date: activity.date || activity.createdAt,
                    timestamp: DateUtils.combineLocalDateTime(activity.date, activity.time || "12:00") || activity.createdAt,
                    tone,
                    thread: activity.nextStep || item.projectQuestion || ""
                }));
            });
        });

        student.journey.followUps.forEach((item) => push({
            id: item.id,
            type: "followups",
            label: item.status === "completed" || item.completedAt ? "Follow-up completed" : "Follow-up",
            title: item.title || "Follow-up",
            description: item.description || item.notes || "",
            date: item.completedAt || item.updatedAt || item.createdAt || item.dueDate,
            timestamp: item.completedAt || item.updatedAt || item.createdAt || item.dueDate,
            tone: "followup",
            isWin: item.status === "completed" || Boolean(item.completedAt),
            thread: item.title || ""
        }));

        student.journey.opportunityEngagements.forEach((item) => {
            const opportunity = typeof OpportunityManager !== "undefined"
                ? OpportunityManager.getOpportunity(item.opportunityId)
                : null;
            push({
                id: item.id,
                type: "community",
                label: "Opportunity",
                title: opportunity?.title || "Community opportunity",
                description: item.nextStep || item.notes || item.status || "",
                date: item.updatedAt || item.createdAt,
                timestamp: item.updatedAt || item.createdAt,
                tone: "opportunity",
                isWin: item.status === "Completed",
                milestone: item.status === "Completed",
                thread: item.nextStep || opportunity?.title || ""
            });
        });

        student.journey.partnerEngagements.forEach((item) => {
            const partner = typeof PartnerManager !== "undefined"
                ? PartnerManager.getPartner(item.partnerId)
                : null;
            push({
                id: item.id,
                type: "community",
                label: "Community connection",
                title: partner?.organization || "Community partner",
                description: item.nextStep || item.notes || item.status || "",
                date: item.updatedAt || item.createdAt || item.startDate,
                timestamp: item.updatedAt || item.createdAt || item.startDate,
                tone: "partner",
                isWin: item.status === "Completed",
                thread: item.nextStep || partner?.organization || ""
            });
        });

        if (student.profile.portfolioUrl) {
            push({
                id: "portfolio-linked",
                type: "wins",
                label: "Portfolio milestone",
                title: "Google Site linked",
                description: student.profile.portfolioUrl,
                date: student.meta.updatedAt,
                timestamp: student.meta.updatedAt,
                tone: "student",
                isWin: true,
                milestone: true
            });
        }

        if (student.profile.transportation.licenseStatus === "Permit" ||
            student.profile.transportation.licenseStatus === "Licensed") {
            push({
                id: "transportation-license",
                type: "wins",
                label: "Transportation milestone",
                title: student.profile.transportation.licenseStatus === "Licensed"
                    ? "Driver’s license earned"
                    : "Driver’s permit earned",
                description: student.profile.transportation.primaryMode || "",
                date: student.meta.updatedAt,
                timestamp: student.meta.updatedAt,
                tone: "success",
                isWin: true,
                milestone: true
            });
        }

        return events.sort((a, b) => journeyEventDate(b.timestamp) - journeyEventDate(a.timestamp));
    }

    function journeyGrowthHighlights(student) {
        const oldestMeeting = [...student.journey.checkIns].sort((a, b) =>
            journeyEventDate(a.meetingDate) - journeyEventDate(b.meetingDate)
        )[0];
        const latestMeeting = studentViewLatestMeeting(student);
        const discovery = student.profile.discovery;
        const themes = emergingThemes(student);
        const highlights = [];

        if (oldestMeeting && latestMeeting && oldestMeeting.id !== latestMeeting.id) {
            highlights.push({
                before: oldestMeeting.mood || "First meeting",
                after: latestMeeting.mood || "Latest meeting",
                label: "Meeting journey"
            });
        }

        if (discovery.futureDirection === "not-yet" && themes.length) {
            highlights.push({
                before: "I don’t know yet",
                after: themes.slice(0, 3).join(" · "),
                label: "Emerging interests"
            });
        }

        if (student.journey.dreamJobs.length) {
            highlights.push({
                before: "Exploring",
                after: student.journey.dreamJobs.slice(0, 2).join(" · "),
                label: "Future direction"
            });
        }

        const completed = [
            ...student.journey.currentProjects,
            ...student.journey.internships,
            ...student.journey.goals
        ].filter((item) => item.status === "completed" || item.completedAt);
        if (completed.length) {
            highlights.push({
                before: "In progress",
                after: `${completed.length} completed milestone${completed.length === 1 ? "" : "s"}`,
                label: "Follow-through"
            });
        }

        return highlights.slice(0, 4);
    }

    function journeyConversationThreads(events) {
        const groups = new Map();
        events.filter((event) => event.thread).forEach((event) => {
            const key = event.thread.toLowerCase().split(/\s+/).slice(0, 4).join(" ");
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(event);
        });
        return [...groups.values()]
            .filter((items) => items.length >= 2)
            .sort((a, b) => b.length - a.length)
            .slice(0, 4);
    }

    function renderJourneyTimeline(student) {
        const events = studentJourneyEvents(student);
        const highlights = journeyGrowthHighlights(student);
        const threads = journeyConversationThreads(events);
        const wins = events.filter((event) => event.isWin).slice(0, 8);
        const filters = [
            ["all", "All"], ["meetings", "Meetings"], ["observations", "Observations"],
            ["projects", "Projects"], ["community", "Community"], ["goals", "Goals"],
            ["followups", "Next Steps"], ["wins", "Wins"]
        ];

        return `
            <div class="journey-view">
                ${highlights.length ? `
                    <section class="growth-highlights">
                        <div class="panel-header"><div><p class="eyebrow">Change over time</p><h3>Growth Highlights</h3></div></div>
                        <div class="growth-highlight-grid">
                            ${highlights.map((item) => `
                                <article><span>${escapeHtml(item.label)}</span>
                                    <div><small>Then</small><strong>${escapeHtml(item.before)}</strong></div>
                                    <b>→</b>
                                    <div><small>Now</small><strong>${escapeHtml(item.after)}</strong></div>
                                </article>
                            `).join("")}
                        </div>
                    </section>
                ` : ""}

                ${wins.length ? `
                    <section class="journey-wins">
                        <div class="panel-header"><div><p class="eyebrow">Progress worth noticing</p><h3>Student Wins</h3></div></div>
                        <div class="journey-win-list">
                            ${wins.map((item) => `<article><span>★</span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.label)} · ${escapeHtml(formatDate(item.date))}</p></div></article>`).join("")}
                        </div>
                    </section>
                ` : ""}

                ${threads.length ? `
                    <section class="journey-threads">
                        <div class="panel-header"><div><p class="eyebrow">Ideas that keep returning</p><h3>Conversation Threads</h3></div></div>
                        <div class="journey-thread-list">
                            ${threads.map((items) => `<article><strong>${escapeHtml(items[0].thread)}</strong><span>${items.length} connected updates</span><p>${items.slice(0,3).map((event)=>escapeHtml(event.title)).join(" → ")}</p></article>`).join("")}
                        </div>
                    </section>
                ` : ""}

                <section class="journey-timeline-panel">
                    <div class="journey-filter-bar">
                        ${filters.map(([value,label]) => `<button class="journey-filter ${value === "all" ? "is-active" : ""}" type="button" data-action="filter-journey" data-journey-filter="${value}">${label}</button>`).join("")}
                    </div>
                    <label class="search-field journey-search"><span aria-hidden="true">⌕</span><span class="visually-hidden">Search journey</span>
                        <input id="journeySearchInput" type="search" placeholder="Search the student journey" autocomplete="off"></label>
                    <div class="journey-timeline" id="studentJourneyTimeline">
                        ${events.length ? events.map((event) => `
                            <article class="journey-event journey-tone-${escapeHtml(event.tone)}" data-journey-type="${escapeHtml(event.isWin ? `${event.type} wins` : event.type)}" data-journey-search="${escapeHtml([event.label,event.title,event.description,event.thread].join(" ").toLowerCase())}">
                                <div class="journey-event-marker"></div>
                                <div class="journey-event-body">
                                    <div class="journey-event-heading"><div><span>${escapeHtml(event.label)}</span><h4>${escapeHtml(event.title)}</h4></div>
                                        <time>${escapeHtml(formatDate(event.date))}</time></div>
                                    ${event.description ? `<p>${escapeHtml(event.description)}</p>` : ""}
                                    ${event.milestone ? `<span class="badge badge-success">Milestone</span>` : ""}
                                </div>
                            </article>
                        `).join("") : `<p class="empty-copy">No journey activity yet.</p>`}
                    </div>
                    <div id="journeyEmptyState" class="empty-state compact-empty-state" hidden><h3>No matching journey events</h3><p>Try another filter or search term.</p></div>
                </section>
            </div>`;
    }

    function renderLastTimeWeMet(student) {
        const latest = studentViewLatestMeeting(student);
        if (!latest) return "";
        const followups = student.journey.followUps.filter((item) => item.status !== "completed" && !item.completedAt).slice(0,3);
        const questions = [...(latest.newQuestions || []), ...(latest.nextSteps || [])].slice(0,4);
        return `<section class="last-time-panel"><div class="panel-header"><div><p class="eyebrow">Continuity</p><h3>Last Time We Met</h3></div><span>${escapeHtml(DateUtils.formatDateTime(latest.meetingDate, latest.meetingTime))}</span></div>
            <p>${escapeHtml(latest.summary || "No meeting summary recorded.")}</p>
            ${latest.mood ? `<div class="badges">${MoodUtils.renderBadges(latest.mood, escapeHtml)}</div>` : ""}
            <div class="last-time-grid"><article><strong>Carry forward</strong>${questions.length ? `<ul>${questions.map((item)=>`<li>${escapeHtml(item)}</li>`).join("")}</ul>` : `<p>No conversation seeds recorded.</p>`}</article>
            <article><strong>Open next steps</strong>${followups.length ? `<ul>${followups.map((item)=>`<li>${escapeHtml(item.title || "Follow-up")}</li>`).join("")}</ul>` : `<p>No open next steps.</p>`}</article></div></section>`;
    }

    function activePromises(student) {
        return (student.journey.promises || []).filter((item) =>
            item.status !== "completed" && !item.completedAt
        );
    }

    function advisorWorkspaceChanges(student) {
        const latest = studentViewLatestMeeting(student);
        const cutoff = latest
            ? DateUtils.combineLocalDateTime(
                latest.meetingDate,
                latest.meetingTime || "12:00"
            ) || new Date(latest.createdAt || 0)
            : null;

        const changes = [];
        const add = (tone, title, detail) => changes.push({ tone, title, detail });

        if (!cutoff) {
            add("meeting", "No previous meeting", "Start with relationship-building and discovery.");
            return changes;
        }

        student.journey.observations
            .filter((item) => new Date(item.createdAt || item.date) > cutoff)
            .slice(-3)
            .forEach((item) => add("observation", item.category || "Observation", item.note));

        ["currentProjects","internships","goals"].forEach((collection) => {
            student.journey[collection]
                .filter((item) => new Date(item.updatedAt || item.createdAt || 0) > cutoff)
                .slice(-2)
                .forEach((item) => add(
                    collection === "goals" ? "goal" :
                    collection === "internships" ? "internship" : "project",
                    item.title || "Updated record",
                    item.nextSteps?.[0] || item.description || "Updated since last meeting."
                ));
        });

        return changes.slice(0, 6);
    }

    function renderAdvisorWorkspace(student) {
        const promises = activePromises(student);
        const followUps = student.journey.followUps.filter((item) =>
            item.status !== "completed" && !item.completedAt
        );
        const project = projectWorkspaceCurrentProject(student);
        const internship = student.journey.internships.find((item) =>
            item.status !== "completed" &&
            item.status !== "archived" &&
            !item.archived &&
            !item.completedAt
        ) || null;
        const latest = studentViewLatestMeeting(student);

        return `
            <div class="today-minimal-view">
                <div class="today-status-line">
                    <span>
                        <strong>${followUps.length}</strong>
                        open next step${followUps.length === 1 ? "" : "s"}
                    </span>
                    <span>
                        <strong>${promises.length}</strong>
                        open promise${promises.length === 1 ? "" : "s"}
                    </span>
                    <span>
                        Last meeting:
                        <strong>${latest
                            ? escapeHtml(DateUtils.formatDateTime(
                                latest.meetingDate,
                                latest.meetingTime
                            ))
                            : "Never"
                        }</strong>
                    </span>
                </div>

                <div class="today-work-cards">
                    <article class="today-work-card today-project-card">
                        <div>
                            <span>Current Project</span>
                            <h3>${escapeHtml(project?.title || "No active project")}</h3>
                            ${project?.projectQuestion
                                ? `<p>${escapeHtml(project.projectQuestion)}</p>`
                                : project?.description
                                    ? `<p>${escapeHtml(project.description)}</p>`
                                    : `<p class="empty-copy">No project details recorded.</p>`
                            }
                        </div>
                        <div class="today-work-card-footer">
                            <span>${escapeHtml(project?.phase || "No phase recorded")}</span>
                            <strong>${escapeHtml(
                                project?.nextSteps?.[0] || "No next step recorded"
                            )}</strong>
                        </div>
                    </article>

                    <article class="today-work-card today-internship-card">
                        <div>
                            <span>Current Internship</span>
                            <h3>${escapeHtml(
                                internship?.title ||
                                internship?.organization ||
                                "No active internship"
                            )}</h3>
                            ${internship?.description
                                ? `<p>${escapeHtml(internship.description)}</p>`
                                : internship?.responsibilities?.length
                                    ? `<p>${escapeHtml(internship.responsibilities[0])}</p>`
                                    : `<p class="empty-copy">No internship details recorded.</p>`
                            }
                        </div>
                        <div class="today-work-card-footer">
                            <span>${escapeHtml(
                                internship?.organization ||
                                internship?.status ||
                                "Not started"
                            )}</span>
                            <strong>${escapeHtml(
                                internship?.nextSteps?.[0] ||
                                internship?.schedule ||
                                "No next step recorded"
                            )}</strong>
                        </div>
                    </article>
                </div>

                ${followUps.length || promises.length ? `
                    <details class="today-open-items">
                        <summary>Open Items</summary>
                        <div class="today-open-items-list">
                            ${followUps.slice(0, 5).map((item) => `
                                <article>
                                    <span>Next Step</span>
                                    <strong>${escapeHtml(item.title || "Follow-up")}</strong>
                                    <p>${item.dueDate
                                        ? `Due ${escapeHtml(formatDate(item.dueDate))}`
                                        : "No due date"
                                    }</p>
                                </article>
                            `).join("")}
                            ${promises.slice(0, 5).map((item) => `
                                <article>
                                    <span>${escapeHtml(item.owner)} Promise</span>
                                    <strong>${escapeHtml(item.title)}</strong>
                                    <p>${item.dueDate
                                        ? `Due ${escapeHtml(formatDate(item.dueDate))}`
                                        : "No due date"
                                    }</p>
                                </article>
                            `).join("")}
                        </div>
                    </details>
                ` : ""}
            </div>
        `;
    }


    function binderOpenItems(student) {
        const followUps = student.journey.followUps
            .filter((item) => item.status !== "completed" && !item.completedAt)
            .map((item) => ({
                type: "Next Step",
                title: item.title || "Follow-up",
                detail: item.dueDate ? `Due ${formatDate(item.dueDate)}` : "No due date"
            }));

        const promises = (student.journey.promises || [])
            .filter((item) => item.status !== "completed" && !item.completedAt)
            .map((item) => ({
                type: `${item.owner || "Student"} Promise`,
                title: item.title || "Promise",
                detail: item.dueDate ? `Due ${formatDate(item.dueDate)}` : "No due date"
            }));

        return [...followUps, ...promises];
    }

    function binderRecentActivity(student, limit = 5) {
        return studentJourneyEvents(student)
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
            .slice(0, limit);
    }

    function binderCurrentInternship(student) {
        return student.journey.internships.find((item) =>
            item.status !== "completed" &&
            item.status !== "archived" &&
            !item.archived &&
            !item.completedAt
        ) || null;
    }

    function binderWorkCard(title, item, tone, emptyText, studentId, collection) {
        const isProject = collection === "currentProjects";
        const isInternship = collection === "internships";
        const addLabel = isProject ? "+ Add Project" :
            isInternship ? "+ Add Internship" :
            "+ Add";

        return `
            <article class="binder-work-card binder-tone-${escapeHtml(tone)}
                ${item ? "" : "binder-work-missing"}">
                <span>${escapeHtml(title)}</span>
                <h3>${escapeHtml(
                    item?.title ||
                    item?.organization ||
                    emptyText
                )}</h3>

                ${item ? `
                    <p>${escapeHtml(
                        item.projectQuestion ||
                        item.description ||
                        item.responsibilities?.[0] ||
                        "No description recorded."
                    )}</p>

                    <div>
                        <small>${escapeHtml(
                            item.phase ||
                            item.organization ||
                            formatJourneyStatus(item)
                        )}</small>
                        <strong>${escapeHtml(
                            item.nextSteps?.[0] ||
                            item.currentObjective ||
                            item.schedule ||
                            "No next step recorded"
                        )}</strong>
                    </div>

                    <div class="binder-work-card-actions">
                        ${isProject ? `
                            <button class="button button-primary button-small"
                                type="button"
                                data-action="add-project-note"
                                data-student-id="${escapeHtml(studentId)}"
                                data-project-id="${escapeHtml(item.id)}">
                                + Quick Update
                            </button>
                        ` : isInternship ? `
                            <button class="button button-primary button-small"
                                type="button"
                                data-action="add-internship-note"
                                data-student-id="${escapeHtml(studentId)}"
                                data-internship-id="${escapeHtml(item.id)}">
                                + Quick Update
                            </button>
                        ` : ""}

                        <button class="button button-secondary button-small"
                            type="button"
                            data-action="view-journey-item"
                            data-student-id="${escapeHtml(studentId)}"
                            data-collection="${escapeHtml(collection)}"
                            data-item-id="${escapeHtml(item.id)}">
                            Open
                        </button>
                    </div>
                ` : `
                    <p class="empty-copy">
                        ${isProject
                            ? "Add the project this student is currently developing."
                            : isInternship
                                ? "Add an internship or work-based learning experience."
                                : "Nothing active right now."
                        }
                    </p>

                    <div class="binder-work-card-actions">
                        <button class="button button-primary button-small"
                            type="button"
                            data-action="add-journey-item"
                            data-student-id="${escapeHtml(studentId)}"
                            data-collection="${escapeHtml(collection)}">
                            ${escapeHtml(addLabel)}
                        </button>

                        ${isProject ? `
                            <button class="button button-secondary button-small"
                                type="button"
                                data-action="switch-profile-tab"
                                data-profile-tab="projects"
                                data-student-id="${escapeHtml(studentId)}">
                                Open Projects
                            </button>
                        ` : isInternship ? `
                            <button class="button button-secondary button-small"
                                type="button"
                                data-action="switch-profile-tab"
                                data-profile-tab="internships"
                                data-student-id="${escapeHtml(studentId)}">
                                Open Internships
                            </button>
                        ` : ""}
                    </div>
                `}
            </article>
        `;
    }

    function activeBinderGoals(student) {
        return student.journey.goals
            .filter((goal) =>
                goal.status !== "completed" &&
                goal.status !== "archived" &&
                !goal.archived &&
                !goal.completedAt
            )
            .sort((a, b) => {
                const aLinked = Boolean(a.linkedProjectId || a.linkedInternshipId);
                const bLinked = Boolean(b.linkedProjectId || b.linkedInternshipId);
                if (aLinked !== bLinked) return Number(aLinked) - Number(bLinked);
                return new Date(b.updatedAt || b.createdAt || 0) -
                    new Date(a.updatedAt || a.createdAt || 0);
            });
    }

    function renderGoalRows(goals, studentId, emptyText) {
        if (!goals.length) {
            return `<p class="empty-copy">${escapeHtml(emptyText)}</p>`;
        }

        return `
            <div class="binder-goal-list">
                ${goals.map((goal) => `
                    <article>
                        <button type="button"
                            data-action="view-journey-item"
                            data-student-id="${escapeHtml(studentId)}"
                            data-collection="goals"
                            data-item-id="${escapeHtml(goal.id)}">
                            <span>${escapeHtml(goal.category || "Goal")}</span>
                            <strong>${escapeHtml(goal.title)}</strong>
                            <small>${escapeHtml(
                                goal.nextSteps?.[0] ||
                                goal.successCriteria ||
                                (goal.dueDate ? `Target ${formatDate(goal.dueDate)}` : "No next step recorded")
                            )}</small>
                        </button>
                    </article>
                `).join("")}
            </div>
        `;
    }

    function goalsForProject(student, project) {
        if (!project) return [];
        return activeBinderGoals(student).filter((goal) =>
            goal.linkedProjectId === project.id ||
            (!goal.linkedProjectId &&
                !goal.linkedInternshipId &&
                goal.category === "Project" &&
                goal.description?.toLowerCase().includes(
                    String(project.title || "").toLowerCase()
                ))
        );
    }

    function goalsForInternship(student, internship) {
        if (!internship) return [];
        return activeBinderGoals(student).filter((goal) =>
            goal.linkedInternshipId === internship.id ||
            (!goal.linkedProjectId &&
                !goal.linkedInternshipId &&
                goal.category === "Internship" &&
                goal.description?.toLowerCase().includes(
                    String(internship.title || internship.organization || "").toLowerCase()
                ))
        );
    }

    function studentCommunityConnections(student) {
        return (student.journey.partnerEngagements || [])
            .map((engagement) => ({
                engagement,
                partner: typeof PartnerManager !== "undefined"
                    ? PartnerManager.getPartner(engagement.partnerId)
                    : null
            }))
            .filter((item) => item.partner)
            .sort((a, b) =>
                a.partner.organization.localeCompare(b.partner.organization)
            );
    }

    function activeStudentNextSteps(student) {
        return (student.journey.followUps || [])
            .filter((item) =>
                !["completed", "done", "closed"].includes(
                    String(item.status || "").toLowerCase()
                )
            )
            .sort((a, b) =>
                String(a.dueDate || "9999").localeCompare(
                    String(b.dueDate || "9999")
                )
            );
    }

    function renderBinderCover(student) {
        const project = projectWorkspaceCurrentProject(student);
        const internship = binderCurrentInternship(student);
        const goals = activeBinderGoals(student);
        const connections = studentCommunityConnections(student);
        const nextSteps = activeStudentNextSteps(student);
        const latest = studentViewLatestMeeting(student);
        const nextMeeting = studentViewNextMeeting(student);
        const recent = binderRecentActivity(student, 3);

        return `
            <div class="minimal-momentum-page">
                <section class="minimal-momentum-grid">
                    ${binderWorkCard(
                        "Current Project",
                        project,
                        "project",
                        "No active project",
                        student.id,
                        "currentProjects"
                    )}

                    ${binderWorkCard(
                        "Current Internship",
                        internship,
                        "internship",
                        "No active internship",
                        student.id,
                        "internships"
                    )}

                    <article class="binder-work-card binder-tone-goal
                        ${goals.length ? "" : "binder-work-missing"}">
                        <span>Current Goals</span>
                        <h3>${goals.length
                            ? `${goals.length} active`
                            : "No active goals"
                        }</h3>
                        ${goals.length ? `
                            <div class="minimal-goal-list">
                                ${goals.slice(0, 4).map((goal) => `
                                    <button type="button"
                                        data-action="view-journey-item"
                                        data-student-id="${escapeHtml(student.id)}"
                                        data-collection="goals"
                                        data-item-id="${escapeHtml(goal.id)}">
                                        <strong>${escapeHtml(goal.title)}</strong>
                                        <small>${escapeHtml(
                                            goal.nextSteps?.[0] ||
                                            (goal.dueDate
                                                ? `Due ${formatDate(goal.dueDate)}`
                                                : "No next step")
                                        )}</small>
                                    </button>
                                `).join("")}
                            </div>
                        ` : `<p class="empty-copy">Add only the goals worth keeping visible.</p>`}
                        <button class="button button-primary button-small" type="button"
                            data-action="add-journey-item"
                            data-student-id="${escapeHtml(student.id)}"
                            data-collection="goals">
                            + Add Goal
                        </button>
                    </article>

                    <article class="binder-work-card binder-tone-community
                        ${connections.length ? "" : "binder-work-missing"}">
                        <span>Community Connections</span>
                        <h3>${connections.length
                            ? `${connections.length} connected`
                            : "No connections yet"
                        }</h3>
                        ${connections.length ? `
                            <div class="minimal-connection-list">
                                ${connections.slice(0, 4).map(({partner, engagement}) => `
                                    <div>
                                        <strong>${escapeHtml(partner.organization)}</strong>
                                        <small>${escapeHtml(
                                            engagement.relationshipType || "Career Interest"
                                        )}</small>
                                    </div>
                                `).join("")}
                            </div>
                        ` : `
                            <p class="empty-copy">
                                Connect this student to a business, nonprofit,
                                college, or community organization.
                            </p>
                        `}
                        <button class="button button-primary button-small" type="button"
                            data-action="open-community-directory">
                            ${connections.length ? "Browse Directory" : "+ Add Connection"}
                        </button>
                    </article>

                    <article class="binder-work-card binder-tone-next-step
                        ${nextSteps.length ? "" : "binder-work-missing"}">
                        <span>Next Steps</span>
                        <h3>${nextSteps.length
                            ? `${nextSteps.length} open`
                            : "No next steps"
                        }</h3>
                        ${nextSteps.length ? `
                            <div class="minimal-next-step-list">
                                ${nextSteps.slice(0, 4).map((item) => `
                                    <div>
                                        <strong>${escapeHtml(
                                            item.title || item.description || "Next step"
                                        )}</strong>
                                        <small>${escapeHtml(
                                            item.dueDate ? `Due ${formatDate(item.dueDate)}` : ""
                                        )}</small>
                                    </div>
                                `).join("")}
                            </div>
                        ` : `
                            <p class="empty-copy">
                                Add a next step from a meeting, project, internship,
                                or student conversation.
                            </p>
                        `}
                    </article>

                    <article class="binder-work-card binder-tone-meeting">
                        <span>Meetings</span>
                        <h3>${latest
                            ? escapeHtml(formatDate(latest.meetingDate))
                            : "No meeting yet"
                        }</h3>
                        <p>${escapeHtml(
                            latest?.summary ||
                            "Record only what matters and the next step."
                        )}</p>
                        <div>
                            <small>Next Meeting</small>
                            <strong>${escapeHtml(
                                nextMeeting ? formatDate(nextMeeting) : "Not scheduled"
                            )}</strong>
                        </div>
                        <button class="button button-primary button-small" type="button"
                            data-action="start-student-meeting"
                            data-student-id="${escapeHtml(student.id)}">
                            + Check In
                        </button>
                    </article>
                </section>

                <section class="minimal-momentum-footer">
<div class="minimal-site-line">
                        <span>Google Site</span>
                        ${student.profile.portfolioUrl
                            ? portfolioLink(student, {
                                label: "Open Portfolio",
                                className: "button button-secondary button-small"
                            })
                            : `<button class="button button-secondary button-small"
                                type="button"
                                data-action="edit-portfolio-link"
                                data-student-id="${escapeHtml(student.id)}">
                                Add Link
                            </button>`
                        }
                    </div>
                </section>

                ${recent.length ? `
                    <section class="minimal-recent">
                        <div class="binder-section-heading"><h3>Recent</h3></div>
                        <div class="binder-row-list">
                            ${recent.map((item) => `
                                <article>
                                    <span>${escapeHtml(item.label)}</span>
                                    <strong>${escapeHtml(item.title || item.detail || "Update")}</strong>
                                    <small>${escapeHtml(item.date ? formatDate(item.date) : "")}</small>
                                </article>
                            `).join("")}
                        </div>
                    </section>
                ` : ""}
            </div>
        `;
    }

    function renderBinderStudent(student) {
        const d = student.profile.discovery;
        const t = student.profile.transportation;
        const direction = {
            "not-yet": "Still exploring",
            "ideas": "Has some ideas",
            "know": "Has a direction"
        }[d.futureDirection] || "Still exploring";

        const simpleSection = (title, content) => `
            <section class="binder-section">
                <div class="binder-section-heading"><h3>${escapeHtml(title)}</h3></div>
                ${content}
            </section>
        `;

        return `
            <div class="binder-reference-page">
                ${simpleSection("About", `
                    <dl class="binder-fact-list">
                        <div><dt>Preferred name</dt><dd>${escapeHtml(
                            student.profile.preferredName || displayName(student)
                        )}</dd></div>
                        <div><dt>Future direction</dt><dd>${escapeHtml(direction)}</dd></div>
                        <div><dt>Current focus</dt><dd>${escapeHtml(
                            student.profile.currentFocus || "Not selected"
                        )}</dd></div>
                        <div><dt>Next action</dt><dd>${escapeHtml(
                            student.profile.focusNextAction || "Not recorded"
                        )}</dd></div>
                        <div><dt>Transportation</dt><dd>${escapeHtml(
                            t.modes?.length ? t.modes.join(", ") :
                                t.primaryMode || "Not recorded"
                        )}</dd></div>
                        <div><dt>License</dt><dd>${escapeHtml(
                            t.licenseStatus || "Not recorded"
                        )}</dd></div>
                        <div><dt>Portfolio</dt><dd>${
                            student.profile.portfolioUrl
                                ? portfolioLink(student, {
                                    label: "Open Google Site",
                                    className: "binder-text-link"
                                })
                                : "Not added"
                        }</dd></div>
                    </dl>
                `)}

                ${simpleSection("Interests", renderTags(
                    student.profile.interests,
                    "Still exploring interests."
                ))}

                ${simpleSection("Strengths", renderTags(
                    student.profile.strengths,
                    "No strengths recorded yet."
                ))}

                ${simpleSection("Getting to Know Me", `
                    <div class="binder-discovery-groups">
                        <article><h4>Things I enjoy</h4>${renderTags([
                            ...d.freeTime,
                            ...d.favoriteYouTube,
                            ...d.favoriteGames,
                            ...d.favoriteMedia
                        ], "Not recorded yet.")}</article>
                        <article><h4>I’m curious about</h4>${renderTags(
                            d.curiosities,
                            "Not recorded yet."
                        )}</article>
                        <article><h4>Things I want to try</h4>${renderTags(
                            d.thingsToTry,
                            "Not recorded yet."
                        )}</article>
                        <article><h4>Things I want to learn</h4>${renderTags(
                            d.thingsToLearn,
                            "Not recorded yet."
                        )}</article>
                        <article><h4>What others notice</h4>${renderTags(
                            d.othersNotice,
                            "Not recorded yet."
                        )}</article>
                    </div>
                    <button class="binder-inline-action" type="button"
                        data-action="edit-student"
                        data-student-id="${escapeHtml(student.id)}">
                        Edit Student Information
                    </button>
                `)}

                ${student.profile.studentVoice ? simpleSection(
                    "Student Voice",
                    `<blockquote class="binder-student-voice">${escapeHtml(
                        student.profile.studentVoice
                    )}</blockquote>`
                ) : ""}
            </div>
        `;
    }

    function renderBinderProjects(student) {
        const projects = student.journey.currentProjects
            .filter((item) => item.status !== "archived" && !item.archived)
            .sort((a, b) =>
                new Date(b.updatedAt || b.createdAt || 0) -
                new Date(a.updatedAt || a.createdAt || 0)
            );
        const active = projects.filter((item) =>
            item.status !== "completed" && !item.completedAt
        );
        const completed = projects.filter((item) =>
            item.status === "completed" || item.completedAt
        );
        const portfolioUrl = normalizePortfolioUrl(student.profile.portfolioUrl);

        return `
            <div class="minimal-project-page">
                <section class="minimal-page-actions">
                    <div>
                        <p class="eyebrow">Track, don’t duplicate</p>
                        <h3>Projects</h3>
                    </div>
                    <div class="card-actions">
                        ${portfolioUrl ? `
                            <a class="button button-secondary button-small"
                                href="${escapeHtml(portfolioUrl)}"
                                target="_blank" rel="noopener noreferrer">
                                Open Google Site
                            </a>
                        ` : `
                            <button class="button button-secondary button-small"
                                type="button"
                                data-action="edit-portfolio-link"
                                data-student-id="${escapeHtml(student.id)}">
                                Add Google Site
                            </button>
                        `}
                        <button class="button button-primary button-small" type="button"
                            data-action="add-journey-item"
                            data-student-id="${escapeHtml(student.id)}"
                            data-collection="currentProjects">
                            + Add Project
                        </button>
                    </div>
                </section>

                <section class="minimal-work-list">
                    ${active.length ? active.map((project) => `
                        <article class="minimal-work-row tone-project">
                            <div>
                                <span>${escapeHtml(
                                    project.phase || formatJourneyStatus(project)
                                )}</span>
                                <h3>${escapeHtml(project.title || "Untitled Project")}</h3>
                                <p>${escapeHtml(
                                    project.nextSteps?.[0] || "No next step recorded"
                                )}</p>
                            </div>
                            <div class="minimal-work-meta">
                                <small>Last update</small>
                                <strong>${escapeHtml(
                                    projectWorkspaceLastUpdate(project) || "None yet"
                                )}</strong>
                            </div>
                            <div class="card-actions">
                                <button class="button button-primary button-small"
                                    type="button"
                                    data-action="add-project-note"
                                    data-student-id="${escapeHtml(student.id)}"
                                    data-project-id="${escapeHtml(project.id)}">
                                    Quick Update
                                </button>
                                <button class="button button-secondary button-small"
                                    type="button"
                                    data-action="view-journey-item"
                                    data-student-id="${escapeHtml(student.id)}"
                                    data-collection="currentProjects"
                                    data-item-id="${escapeHtml(project.id)}">
                                    Open
                                </button>
                                <button class="button button-secondary button-small"
                                    type="button"
                                    data-action="edit-viewed-journey-item"
                                    data-student-id="${escapeHtml(student.id)}"
                                    data-collection="currentProjects"
                                    data-item-id="${escapeHtml(project.id)}">
                                    Edit
                                </button>
                            </div>
                        </article>
                    `).join("") : `
                        <div class="minimal-empty-work">
                            <strong>No active project</strong>
                            <p>Add only the title, status, Google Site, and next step.</p>
                        </div>
                    `}
                </section>

                ${completed.length ? `
                    <details class="minimal-completed-list">
                        <summary>${completed.length} completed project${
                            completed.length === 1 ? "" : "s"
                        }</summary>
                        ${completed.map((project) => `
                            <div>
                                <strong>${escapeHtml(project.title || "Project")}</strong>
                                <span>${escapeHtml(
                                    formatDate(project.completedAt || project.updatedAt)
                                )}</span>
                            </div>
                        `).join("")}
                    </details>
                ` : ""}
            </div>
        `;
    }

    function portfolioLinkFormTemplate(student) {
        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal modal-small" role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Published project work</p>
                            <h2>Google Site Portfolio</h2>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-modal" aria-label="Close">×</button>
                    </div>
                    <form id="portfolioLinkForm">
                        <input type="hidden" name="studentId"
                            value="${escapeHtml(student.id)}">
                        <div class="modal-body">
                            <div class="form-field">
                                <label>Google Site URL</label>
                                <input type="url" name="portfolioUrl"
                                    value="${escapeHtml(student.profile.portfolioUrl)}"
                                    placeholder="https://sites.google.com/...">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="button button-secondary" type="button"
                                data-action="close-modal">Cancel</button>
                            <button class="button button-primary" type="submit">
                                Save Link
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function renderActiveInternshipWorkspace(student, internship) {
        if (!internship) {
            return `
                <div class="minimal-empty-work tone-internship">
                    <strong>No active internship</strong>
                    <p>Add the site, status, last update, and next step.</p>
                    <button class="button button-primary button-small" type="button"
                        data-action="add-journey-item"
                        data-student-id="${escapeHtml(student.id)}"
                        data-collection="internships">
                        + Add Internship
                    </button>
                </div>
            `;
        }

        return `
            <article class="minimal-work-row tone-internship">
                <div>
                    <span>${escapeHtml(formatJourneyStatus(internship))}</span>
                    <h3>${escapeHtml(
                        internship.organization ||
                        internship.title ||
                        "Current Internship"
                    )}</h3>
                    <p>${escapeHtml(
                        internship.currentObjective ||
                        internship.nextSteps?.[0] ||
                        "No next step recorded"
                    )}</p>
                </div>
                <div class="minimal-work-meta">
                    <small>Schedule / last visit</small>
                    <strong>${escapeHtml(
                        internship.nextShift ||
                        internship.schedule ||
                        (internship.updatedAt ? formatDate(internship.updatedAt) : "Not recorded")
                    )}</strong>
                </div>
                <div class="card-actions">
                    <button class="button button-primary button-small" type="button"
                        data-action="add-internship-note"
                        data-student-id="${escapeHtml(student.id)}"
                        data-internship-id="${escapeHtml(internship.id)}">
                        Quick Update
                    </button>
                    <button class="button button-secondary button-small" type="button"
                        data-action="view-journey-item"
                        data-student-id="${escapeHtml(student.id)}"
                        data-collection="internships"
                        data-item-id="${escapeHtml(internship.id)}">
                        Open
                    </button>
                    <button class="button button-secondary button-small" type="button"
                        data-action="edit-viewed-journey-item"
                        data-student-id="${escapeHtml(student.id)}"
                        data-collection="internships"
                        data-item-id="${escapeHtml(internship.id)}">
                        Edit
                    </button>
                </div>
            </article>
        `;
    }

    function renderBinderInternships(student) {
        const active = student.journey.internships.filter((item) =>
            item.status !== "completed" &&
            item.status !== "archived" &&
            !item.archived &&
            !item.completedAt
        );
        const completed = student.journey.internships.filter((item) =>
            item.status === "completed" || item.completedAt
        );

        return `
            <div class="minimal-project-page">
                <section class="minimal-page-actions">
                    <div>
                        <p class="eyebrow">Work-based learning</p>
                        <h3>Internships</h3>
                    </div>
                    <button class="button button-primary button-small" type="button"
                        data-action="add-journey-item"
                        data-student-id="${escapeHtml(student.id)}"
                        data-collection="internships">
                        + Add Internship
                    </button>
                </section>

                <section class="minimal-work-list">
                    ${active.length
                        ? active.map((item) =>
                            renderActiveInternshipWorkspace(student, item)
                        ).join("")
                        : renderActiveInternshipWorkspace(student, null)
                    }
                </section>

                ${completed.length ? `
                    <details class="minimal-completed-list">
                        <summary>${completed.length} completed internship${
                            completed.length === 1 ? "" : "s"
                        }</summary>
                        ${completed.map((item) => `
                            <div>
                                <strong>${escapeHtml(
                                    item.organization || item.title || "Internship"
                                )}</strong>
                                <span>${escapeHtml(
                                    formatDate(item.completedAt || item.endDate || item.updatedAt)
                                )}</span>
                            </div>
                        `).join("")}
                    </details>
                ` : ""}
            </div>
        `;
    }

    function renderBinderHistory(student) {
        return renderJourneyTimeline(student);
    }


    function renderBinderPrint(student) {
        return `
            <div class="binder-print-page">
                <section class="binder-section">
                    <div class="binder-section-heading"><h3>Print & Save PDF</h3></div>
                    <div class="binder-print-list">
                        <button type="button" data-action="print-student-view"
                            data-student-id="${escapeHtml(student.id)}">
                            <strong>Student Snapshot</strong>
                            <span>Interests, current work, goals, and accomplishments</span>
                        </button>
                        <button type="button" data-action="print-progress-review"
                            data-student-id="${escapeHtml(student.id)}">
                            <strong>Progress Review</strong>
                            <span>Current work, moods, goals, and follow-through</span>
                        </button>
                        <button type="button" data-action="print-student-portfolio"
                            data-student-id="${escapeHtml(student.id)}">
                            <strong>Portfolio Summary</strong>
                            <span>Projects, evidence, milestones, and experiences</span>
                        </button>
                        <button type="button" data-action="print-student-story"
                            data-student-id="${escapeHtml(student.id)}">
                            <strong>Student Story</strong>
                            <span>Shareable narrative of growth and direction</span>
                        </button>
                    </div>
                </section>
            </div>
        `;
    }

    function renderDetail(studentId = state.currentStudentId) {
        if (!state.detailContainer || !studentId) {
            return;
        }

        if (
            state.currentStudentId &&
            studentId !== state.currentStudentId
        ) {
            state.activeProfileTab = "myMomentum";
        }

        const student = StudentManager.getStudent(studentId);
        if (!student) {
            state.detailContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Student not found</h3>
                    <button class="button button-primary" type="button" data-view="students">Back to Students</button>
                </div>
            `;
            return;
        }

        state.currentStudentId = studentId;

        const mergedQuestions = [
            ...student.journey.drivingQuestions,
            ...student.journey.newQuestions
        ];

        if (state.activeProfileTab === "review") {
            state.activeProfileTab = "today";
        }
        if (state.activeProfileTab === "portfolio") {
            state.activeProfileTab = "projects";
        }

        let overviewContent = "";
        let portfolioContent = "";

        try {
            overviewContent = renderProgressReview(student);
        } catch (error) {
            console.error("Momentum could not render student Overview.", error);
            overviewContent = `
                <div class="empty-state">
                    <h3>Overview could not load</h3>
                    <p>The student record is available, but one Overview section encountered an error.</p>
                </div>
            `;
        }

        try {
            portfolioContent = renderPortfolio(student);
        } catch (error) {
            console.error("Momentum could not render student Portfolio.", error);
            portfolioContent = `
                <div class="empty-state">
                    <h3>Portfolio could not load</h3>
                    <p>The student profile remains available.</p>
                </div>
            `;
        }

        const tabContent = {
            overview: `
                ${renderAdvisorWorkspace(student)}
                ${overviewContent}
            `,
            discovery: `${renderDiscoveringMe(student)}`,
            observations: `${renderObservations(student)}`,
            signals: `${RelationshipIntelligence.renderStudentSignals(student)}`,
            actions: `
                ${renderStudentActionCenter(student)}
            `,
            studentView: `
                ${renderStudentView(student)}
            `,
            meetings: `
                <div class="detail-grid">
                    <section class="detail-section full-width student-meeting-history">
                        <div class="panel-header">
                            <div>
                                <h3>Meeting History</h3>
                                <p class="panel-subtitle">
                                    The latest meeting is open. Select any earlier meeting to review it.
                                </p>
                            </div>
                            <div class="card-actions">
                                <button class="button button-secondary button-small" type="button"
                                    data-action="start-student-meeting"
                                    data-student-id="${escapeHtml(student.id)}">
                                    Start Full Meeting
                                </button>
                                <button class="button button-primary button-small" type="button"
                                    data-action="new-student-checkin"
                                    data-student-id="${escapeHtml(student.id)}">
                                    + Quick Check-In
                                </button>
                            </div>
                        </div>

                        ${student.journey.checkIns.length ? `
                            <div class="meeting-review-summary">
                                <article>
                                    <strong>${student.journey.checkIns.length}</strong>
                                    <span>Total meetings</span>
                                </article>
                                <article>
                                    <strong>${escapeHtml(formatDate(
                                        [...student.journey.checkIns]
                                            .sort((a, b) => meetingDateTime(b) - meetingDateTime(a))[0]
                                            ?.meetingDate || ""
                                    ))}</strong>
                                    <span>Most recent</span>
                                </article>
                                <article>
                                    <strong>${escapeHtml(
                                        studentViewNextMeeting(student)
                                            ? formatDate(studentViewNextMeeting(student))
                                            : "Not scheduled"
                                    )}</strong>
                                    <span>Next meeting</span>
                                </article>
                                <article>
                                    <strong>${countOpenFollowUps(student)}</strong>
                                    <span>Open next steps</span>
                                </article>
                            </div>

                            <div class="meeting-history-tools">
                                <label class="search-field">
                                    <span aria-hidden="true">⌕</span>
                                    <span class="visually-hidden">Search meeting history</span>
                                    <input id="studentMeetingSearch" type="search"
                                        placeholder="Search summaries, moods, reflections, or next steps"
                                        autocomplete="off">
                                </label>
                                <span id="meetingSearchCount" class="meeting-search-count">
                                    ${student.journey.checkIns.length} total
                                </span>
                            </div>

                            <div class="student-meeting-list">
                                ${[...student.journey.checkIns]
                                    .sort((a, b) => meetingDateTime(b) - meetingDateTime(a))
                                    .map((checkIn, index) => {
                                        const searchText = [
                                            checkIn.summary,
                                            checkIn.mood,
                                            checkIn.reflection,
                                            checkIn.nextSteps,
                                            checkIn.projectUpdates,
                                            checkIn.internshipUpdates,
                                            checkIn.newQuestions,
                                            checkIn.meetingDate,
                                            checkIn.meetingTime
                                        ].flat(Infinity).filter(Boolean).join(" ").toLowerCase();

                                        return `
                                            <details class="student-meeting-row ${
                                                index === 0 ? "is-latest" : ""
                                            }"
                                                data-meeting-search-text="${escapeHtml(searchText)}"
                                                ${index === 0 ? "open" : ""}>
                                                <summary class="student-meeting-summary">
                                                    <div class="student-meeting-marker">
                                                        <span></span>
                                                    </div>
                                                    <div class="student-meeting-summary-main">
                                                        <div>
                                                            <p class="eyebrow">
                                                                ${escapeHtml(DateUtils.formatDateTime(
                                                                    checkIn.meetingDate,
                                                                    checkIn.meetingTime
                                                                ))}
                                                                ${index === 0 ? " · Most Recent" : ""}
                                                            </p>
                                                            <h4>${escapeHtml(
                                                                checkIn.summary || "Student meeting"
                                                            )}</h4>
                                                        </div>
                                                        <div class="badges">
                                                            ${MoodUtils.renderBadges(
                                                                checkIn.mood,
                                                                escapeHtml
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span class="meeting-expand-indicator" aria-hidden="true">⌄</span>
                                                </summary>
                                                <div class="student-meeting-content">
                                                    ${renderStructuredCheckIn(checkIn)}
                                                </div>
                                            </details>
                                        `;
                                    }).join("")}
                            </div>

                            <div id="meetingSearchEmpty" class="empty-state compact-empty-state" hidden>
                                <h3>No matching meetings</h3>
                                <p>Try a different word, mood, date, reflection, or next step.</p>
                            </div>
                        ` : `<p class="empty-copy">No dated meetings or check-ins recorded yet.</p>`}
                    </section>

                    ${detailList("Follow-ups", student.journey.followUps, "followUps", student.id)}
                    ${detailList("Notes", student.journey.notes, "notes", student.id)}
                    ${detailList("Reflections", student.journey.reflections, "reflections", student.id)}
                </div>
            `,
            plans: `
                <section class="detail-section full-width meeting-plans-section">
                    <div class="panel-header">
                        <div>
                            <p class="eyebrow">Shareable follow-through</p>
                            <h3>Meeting Action Plans</h3>
                        </div>
                        <span class="support-count">${student.journey.actionPlans.length}</span>
                    </div>

                    ${student.journey.actionPlans.length ? `
                        <div class="meeting-plan-list">
                            ${[...student.journey.actionPlans]
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
                                })
                                .map((plan) => renderActionPlanCard(student, plan))
                                .join("")}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <h3>No meeting action plans yet</h3>
                            <p>Saving a full student meeting will create the first shareable plan.</p>
                        </div>
                    `}
                </section>
            `,
            projects: `
                ${renderProjectWorkspace(student)}
                ${renderInquiryPanel(student, "projects", "Project Inquiry")}
                <div class="detail-grid">
                    ${detailList("Current projects", student.journey.currentProjects, "currentProjects", student.id)}
                    ${detailList("Milestones", student.journey.milestones, "milestones", student.id)}
                    ${detailList("Goals", student.journey.goals, "goals", student.id)}
                    ${detailList("Questions", mergedQuestions, "drivingQuestions", student.id)}
                </div>
            `,
            career: `
                ${renderInquiryPanel(student, "career", "Exploration Questions")}
                <div class="detail-grid">
                    <section class="detail-section full-width smart-opportunity-section">
                        <div class="panel-header">
                            <div>
                                <p class="eyebrow">Ranked from student data</p>
                                <h3>Recommended Next Steps</h3>
                            </div>
                            <button class="button button-secondary button-small" type="button"
                                data-view="opportunities">
                                Browse All Opportunities
                            </button>
                        </div>
                        ${renderSmartOpportunityMatches(student)}
                    </section>

                    ${detailList("Internships", student.journey.internships, "internships", student.id)}

                    <section class="detail-section full-width">
                        <div class="panel-header">
                            <h3>Opportunity pipeline</h3>
                            <button class="button button-ghost button-small" type="button" data-view="opportunities">
                                Open Opportunity Bank
                            </button>
                        </div>
                        ${student.journey.opportunityEngagements.length ? `
                            <div class="match-list">
                                ${student.journey.opportunityEngagements.map((engagement) => {
                                    const opportunity = typeof OpportunityManager !== "undefined"
                                        ? OpportunityManager.getOpportunity(engagement.opportunityId)
                                        : null;
                                    return `
                                        <div class="match-card">
                                            <div>
                                                <strong>${escapeHtml(opportunity ? opportunity.title : "Deleted opportunity")}</strong>
                                                <p class="match-reasons">
                                                    ${escapeHtml(engagement.status)}
                                                    ${engagement.nextStep ? ` · Next: ${escapeHtml(engagement.nextStep)}` : ""}
                                                    ${engagement.dueDate ? ` · Due ${escapeHtml(formatDate(engagement.dueDate))}` : ""}
                                                </p>
                                            </div>
                                            <div class="card-actions">
                                                <button class="button button-secondary button-small" type="button"
                                                    data-action="edit-opportunity-engagement"
                                                    data-student-id="${escapeHtml(student.id)}"
                                                    data-engagement-id="${escapeHtml(engagement.id)}">
                                                    Update
                                                </button>
                                                <button class="button button-danger button-small" type="button"
                                                    data-action="remove-opportunity-engagement"
                                                    data-student-id="${escapeHtml(student.id)}"
                                                    data-engagement-id="${escapeHtml(engagement.id)}">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    `;
                                }).join("")}
                            </div>
                        ` : `<p class="empty-copy">No opportunities assigned yet.</p>`}
                    </section>
                </div>
            `,
            partners: `
                <div class="detail-grid">
                    <section class="detail-section full-width">
                        <div class="panel-header">
                            <h3>Community partners</h3>
                            <button class="button button-ghost button-small" type="button" data-view="partners">
                                Open Partner Bank
                            </button>
                        </div>
                        ${student.journey.partnerEngagements.length ? `
                            <div class="match-list">
                                ${student.journey.partnerEngagements.map((engagement) => {
                                    const partner = typeof PartnerManager !== "undefined"
                                        ? PartnerManager.getPartner(engagement.partnerId)
                                        : null;
                                    return `
                                        <div class="match-card">
                                            <div>
                                                <strong>${escapeHtml(partner ? partner.organization : "Deleted partner")}</strong>
                                                <p class="match-reasons">
                                                    ${escapeHtml(engagement.relationshipType)} · ${escapeHtml(engagement.status)}
                                                    ${engagement.nextStep ? ` · Next: ${escapeHtml(engagement.nextStep)}` : ""}
                                                </p>
                                            </div>
                                            <button class="button button-danger button-small" type="button"
                                                data-action="remove-partner-engagement"
                                                data-student-id="${escapeHtml(student.id)}"
                                                data-engagement-id="${escapeHtml(engagement.id)}">
                                                Remove
                                            </button>
                                        </div>
                                    `;
                                }).join("")}
                            </div>
                        ` : `<p class="empty-copy">No community partners assigned yet.</p>`}
                    </section>
                </div>
            `,
            portfolio: `
                ${portfolioContent}
            `,
            timeline: `
                ${renderJourneyTimeline(student)}
            `,
            story: `
                ${renderStudentStory(student)}
            `
        };
        tabContent.myMomentum = renderBinderCover(student);
        tabContent.student = renderBinderStudent(student);
        tabContent.projects = renderBinderProjects(student);
        tabContent.portfolio = tabContent.projects;
        tabContent.internships = renderBinderInternships(student, tabContent);
        tabContent.history = renderBinderHistory(student);
        tabContent.print = renderBinderPrint(student);

        state.detailContainer.innerHTML = `
            <div class="binder-header">
                <div>
                    <h2 id="studentDetailHeading">${escapeHtml(displayName(student))}</h2>
                    <div class="binder-header-status">
                        <span>${countOpenFollowUps(student)} open next step${
                            countOpenFollowUps(student) === 1 ? "" : "s"
                        }</span>
                    </div>
                </div>
                <div class="detail-actions minimal-detail-actions">
                    <button class="binder-back-button" type="button" data-view="students">
                        Back
                    </button>
                    <details class="student-action-menu">
                        <summary class="button button-primary">+</summary>
                        <div class="student-action-menu-list">
                            <button type="button" data-action="start-student-meeting"
                                data-student-id="${escapeHtml(student.id)}">Start Meeting</button>
                            <button type="button" data-action="new-student-checkin"
                                data-student-id="${escapeHtml(student.id)}">Quick Check-In</button>
                            <button type="button" data-action="quick-next step"
                                data-student-id="${escapeHtml(student.id)}">Next Step</button>
                            <button type="button" data-action="edit-student"
                                data-student-id="${escapeHtml(student.id)}">Edit Student</button>
                        </div>
                    </details>
                </div>
            </div>

            <nav class="profile-tabs binder-tabs" aria-label="Student binder sections">
                ${profileTabButton("myMomentum", "My Momentum")}
                ${profileTabButton("projects", "Projects")}
                ${profileTabButton("internships", "Internships")}
                ${profileTabButton("student", "Student")}
                ${profileTabButton("history", "History")}
                ${profileTabButton("print", "Print")}
            </nav>

            <div class="profile-tab-content binder-tab-content">
                ${tabContent[state.activeProfileTab] || tabContent.myMomentum}
            </div>
        `;
    }



    function studentFormTemplate(student) {
        const isEditing = Boolean(student);
        const profile = student ? student.profile : {
            preferredName: "",
            firstName: "",
            lastName: "",
            grade: "",
            advisor: "",
            mood: "",
            interests: [],
            postSecondaryGoals: [],
            studentVoice: "",
            portfolioUrl: "",
            currentFocus: "",
            focusWhy: "",
            focusNextAction: "",
            discovery: {
                futureDirection: "not-yet", favoriteYouTube: [], favoriteGames: [],
                favoriteMedia: [], freeTime: [], curiosities: [], thingsToTry: [],
                thingsToLearn: [], othersNotice: []
            },
            transportation: {
                modes: [], primaryMode: "", licenseStatus: "", hasReliableAccess: false, notes: ""
            }
        };
        const dreamJobs = student ? student.journey.dreamJobs : [];

        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal" role="dialog" aria-modal="true" aria-labelledby="studentFormTitle">
                    <div class="modal-header">
                        <div>
                            <h2 id="studentFormTitle">${isEditing ? "Edit Student" : "New Student"}</h2>
                            <p>${isEditing ? "Update this student’s profile." : "Create a student profile and interest snapshot."}</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button>
                    </div>

                    <form id="studentForm" novalidate>
                        <div class="modal-body">
                            <input type="hidden" name="studentId" value="${escapeHtml(student ? student.id : "")}">

                            <section class="form-section">
                                <h3>Identity</h3>
                                <div class="form-grid">
                                    <div class="form-field">
                                        <label for="preferredName">Preferred name</label>
                                        <input id="preferredName" name="preferredName" value="${escapeHtml(profile.preferredName)}" autocomplete="nickname">
                                    </div>
                                    <div class="form-field">
                                        <label for="firstName">First name *</label>
                                        <input id="firstName" name="firstName" value="${escapeHtml(profile.firstName)}" autocomplete="given-name" required>
                                    </div>
                                    <div class="form-field">
                                        <label for="lastName">Last name</label>
                                        <input id="lastName" name="lastName" value="${escapeHtml(profile.lastName)}" autocomplete="family-name">
                                    </div>
                                </div>
                            </section>

                            <section class="form-section">
                                <h3></h3>
                                <div class="form-grid">
                                    <div class="form-field">
                                        <label for="currentFocus">What matters most right now?</label>
                                        <select id="currentFocus" name="currentFocus">
                                            ${[
                                                "",
                                                "Attendance",
                                                "Graduation",
                                                "Career",
                                                "Project",
                                                "Internship",
                                                "Wellness",
                                                "Relationships",
                                                "Family",
                                                "Housing",
                                                "Transportation",
                                                "Executive Function",
                                                "Other"
                                            ].map((value) => `
                                                <option value="${escapeHtml(value)}"
                                                    ${profile.currentFocus === value ? "selected" : ""}>
                                                    ${escapeHtml(value || "No current focus")}
                                                </option>
                                            `).join("")}
                                        </select>
                                    </div>
                                    <div class="form-field">
                                        <label for="focusNextAction">Next action</label>
                                        <input id="focusNextAction" name="focusNextAction"
                                            value="${escapeHtml(profile.focusNextAction || "")}"
                                            placeholder="The next concrete step">
                                    </div>
                                    <div class="form-field full-width">
                                        <label for="focusWhy">Why this matters</label>
                                        <textarea id="focusWhy" name="focusWhy"
                                            placeholder="Why this focus matters to the student">${escapeHtml(
                                                profile.focusWhy || ""
                                            )}</textarea>
                                    </div>
                                </div>
                            </section>

                            <section class="form-section">
                                <h3>Discovering Me & Future Direction</h3>
                                <div class="form-field"><label for="futureDirection">How clear is their future direction?</label>
                                    <select id="futureDirection" name="futureDirection">
                                        <option value="not-yet" ${profile.discovery.futureDirection==="not-yet"?"selected":""}>I don’t know yet</option>
                                        <option value="ideas" ${profile.discovery.futureDirection==="ideas"?"selected":""}>I have some ideas</option>
                                        <option value="know" ${profile.discovery.futureDirection==="know"?"selected":""}>I know</option>
                                    </select></div>
                                <div class="form-grid">
                                    <div class="form-field full-width">
                                        <label for="interests">Interests / Hobbies</label>
                                        <textarea id="interests" name="interests"
                                            placeholder="Examples: music, cars, cooking, basketball, gaming, art, animals">${escapeHtml(profile.interests.join(", "))}</textarea>
                                        <p class="form-help">
                                            Add anything the student enjoys, is curious about, or likes doing.
                                            Separate entries with commas or new lines.
                                        </p>
                                    </div>
                                    <div class="form-field">
                                        <label for="dreamJobs">Dream Job</label>
                                        <textarea id="dreamJobs" name="dreamJobs"
                                            placeholder="Examples: Nurse, Electrician, Game Designer">${escapeHtml(dreamJobs.join(", "))}</textarea>
                                        <p class="form-help">Add one or more dream jobs, separated by commas or new lines.</p>
                                    </div>
                                    <div class="form-field">
                                        <label for="postSecondaryGoals">Post-secondary goals</label>
                                        <textarea id="postSecondaryGoals" name="postSecondaryGoals"
                                            placeholder="College, credential, apprenticeship, career goals...">${escapeHtml(profile.postSecondaryGoals.join(", "))}</textarea>
                                    </div>
                                </div>
                            </section>

                            <section class="form-section"><h3>Discovery Conversation Notes</h3>
                                <div class="form-grid">
                                    <div class="form-field"><label>Favorite YouTube / creators</label><textarea name="favoriteYouTube">${escapeHtml(profile.discovery.favoriteYouTube.join(", "))}</textarea></div>
                                    <div class="form-field"><label>Favorite games</label><textarea name="favoriteGames">${escapeHtml(profile.discovery.favoriteGames.join(", "))}</textarea></div>
                                    <div class="form-field"><label>Music, shows, podcasts, media</label><textarea name="favoriteMedia">${escapeHtml(profile.discovery.favoriteMedia.join(", "))}</textarea></div>
                                    <div class="form-field"><label>What they enjoy in free time</label><textarea name="freeTime">${escapeHtml(profile.discovery.freeTime.join(", "))}</textarea></div>
                                    <div class="form-field"><label>Things they are curious about</label><textarea name="curiosities">${escapeHtml(profile.discovery.curiosities.join(", "))}</textarea></div>
                                    <div class="form-field"><label>Things they want to try</label><textarea name="thingsToTry">${escapeHtml(profile.discovery.thingsToTry.join(", "))}</textarea></div>
                                    <div class="form-field"><label>Things they want to learn</label><textarea name="thingsToLearn">${escapeHtml(profile.discovery.thingsToLearn.join(", "))}</textarea></div>
                                    <div class="form-field"><label>What others say they are good at</label><textarea name="othersNotice">${escapeHtml(profile.discovery.othersNotice.join(", "))}</textarea></div>
                                </div></section>
                            <section class="form-section"><h3>Transportation & Mobility</h3>
                                <div class="form-grid"><div class="form-field"><label>Primary transportation</label>
                                    <select name="transportationMode">${["","Drives own vehicle","Family transportation","School transportation","Public transit","Bicycle","Walks","Ride share","No reliable transportation"].map(x=>`<option value="${escapeHtml(x)}" ${profile.transportation.primaryMode===x?"selected":""}>${escapeHtml(x||"Select")}</option>`).join("")}</select></div>
                                    <div class="form-field"><label>Driver’s license</label><select name="licenseStatus">${["","Not started","Permit","Licensed"].map(x=>`<option value="${escapeHtml(x)}" ${profile.transportation.licenseStatus===x?"selected":""}>${escapeHtml(x||"Select")}</option>`).join("")}</select></div></div>
                                <label class="checkbox-row"><input type="checkbox" name="hasReliableAccess" ${profile.transportation.hasReliableAccess?"checked":""}><span>Has reliable transportation access</span></label>
                                <div class="form-field"><label>Transportation notes</label><textarea name="transportationNotes">${escapeHtml(profile.transportation.notes)}</textarea></div>
                            </section>

                            <section class="form-section">
                                <h3>Student voice</h3>
                                <div class="form-field">
                                    <label for="studentVoice">What should the team know about this student?</label>
                                    <textarea id="studentVoice" name="studentVoice">${escapeHtml(profile.studentVoice)}</textarea>
                                </div>
                            </section>

                            <section class="form-section">
                                <h3>Portfolio website</h3>
                                <div class="form-field">
                                    <label for="portfolioUrl">Google Sites portfolio link</label>
                                    <input id="portfolioUrl" name="portfolioUrl"
                                        type="url"
                                        value="${escapeHtml(profile.portfolioUrl || "")}"
                                        placeholder="https://sites.google.com/...">
                                    <p class="field-help">
                                        Add the student’s published Google Sites portfolio address.
                                    </p>
                                </div>
                            </section>
                        </div>

                        <div class="modal-footer">
                            <button class="button button-secondary" type="button" data-action="close-modal">Cancel</button>
                            <button class="button button-primary" type="submit">${isEditing ? "Save Changes" : "Create Student"}</button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function sortedActivityLog(item) {
        return [...(item.activityLog || [])].sort((a, b) => {
            const bDate = DateUtils.combineLocalDateTime(b.date, b.time || "12:00") ||
                new Date(b.createdAt || 0);
            const aDate = DateUtils.combineLocalDateTime(a.date, a.time || "12:00") ||
                new Date(a.createdAt || 0);
            return bDate - aDate;
        });
    }

    function renderActivityLog(item) {
        const entries = sortedActivityLog(item);
        if (!entries.length) {
            return `<p class="empty-copy">No dated updates recorded yet.</p>`;
        }

        return `
            <div class="record-update-timeline">
                ${entries.map((entry) => `
                    <article class="record-update-entry">
                        <div class="record-update-marker" aria-hidden="true"></div>
                        <div class="record-update-content">
                            <div class="record-update-heading">
                                <div>
                                    <span class="badge">${escapeHtml(entry.type || "Update")}</span>
                                    ${entry.source ? `<span class="record-update-source">${escapeHtml(entry.source)}</span>` : ""}
                                </div>
                                <time>${escapeHtml(DateUtils.formatDateTime(entry.date, entry.time))}</time>
                            </div>
                            ${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ""}
                            ${entry.evidence ? `
                                <div class="record-update-evidence">
                                    <strong>Evidence</strong>
                                    <p>${escapeHtml(entry.evidence)}</p>
                                </div>
                            ` : ""}
                            ${entry.nextStep ? `
                                <div class="record-update-next">
                                    <strong>Next step</strong>
                                    <p>${escapeHtml(entry.nextStep)}</p>
                                </div>
                            ` : ""}
                        </div>
                    </article>
                `).join("")}
            </div>
        `;
    }

    function journeyUpdateFormTemplate(studentId, collection, itemId) {
        const student = StudentManager.getStudent(studentId);
        const item = student && Array.isArray(student.journey[collection])
            ? student.journey[collection].find((entry) => entry.id === itemId)
            : null;
        if (!student || !item) return "";

        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal modal-small" role="dialog" aria-modal="true"
                    aria-labelledby="journeyUpdateTitle">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Dated record update</p>
                            <h2 id="journeyUpdateTitle">${escapeHtml(item.title || "Record")}</h2>
                            <p>Capture what happened and the next step.</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button>
                    </div>
                    <form id="journeyUpdateForm">
                        <div class="modal-body">
                            <input type="hidden" name="studentId" value="${escapeHtml(studentId)}">
                            <input type="hidden" name="collection" value="${escapeHtml(collection)}">
                            <input type="hidden" name="itemId" value="${escapeHtml(itemId)}">
                            <div class="form-grid">
                                <div class="form-field">
                                    <label for="recordUpdateDate">Date *</label>
                                    <input id="recordUpdateDate" name="date" type="date" required value="${escapeHtml(DateUtils.today())}">
                                </div>
                                <div class="form-field">
                                    <label for="recordUpdateTime">Time</label>
                                    <input id="recordUpdateTime" name="time" type="time" value="${escapeHtml(DateUtils.nowTime())}">
                                </div>
                                <div class="form-field">
                                    <label for="recordUpdateType">Update type</label>
                                    <select id="recordUpdateType" name="type">
                                        <option>Progress</option>
                                        <option>Meeting note</option>
                                        <option>Milestone</option>
                                        <option>Challenge</option>
                                        <option>Reflection</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div class="form-field full-width">
                                    <label for="recordUpdateNote">Update *</label>
                                    <textarea id="recordUpdateNote" name="note" required
                                        placeholder="What changed, happened, or was learned?"></textarea>
                                </div>
                                <div class="form-field full-width">
                                    <label for="recordUpdateNextStep">Next step</label>
                                    <textarea id="recordUpdateNextStep" name="nextStep"
                                        placeholder="What should happen next?"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="button button-secondary" type="button"
                                data-action="cancel-record-update"
                                data-student-id="${escapeHtml(studentId)}"
                                data-collection="${escapeHtml(collection)}"
                                data-item-id="${escapeHtml(itemId)}">Cancel</button>
                            <button class="button button-primary" type="submit">Save Update</button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function openJourneyUpdateForm(studentId, collection, itemId) {
        state.modalRoot.innerHTML = journeyUpdateFormTemplate(studentId, collection, itemId);
        document.body.style.overflow = "hidden";
    }

    function journeyViewTemplate(studentId, collection, itemId) {
        const labels = {
            currentProjects: "Project",
            internships: "Internship",
            goals: "Goal"
        };

        const student = StudentManager.getStudent(studentId);
        const item = student && Array.isArray(student.journey[collection])
            ? student.journey[collection].find((entry) => entry.id === itemId)
            : null;

        if (!student || !item || !labels[collection]) {
            return `
                <div class="modal-backdrop" data-modal-backdrop>
                    <section class="modal modal-small" role="dialog" aria-modal="true">
                        <div class="modal-header">
                            <div>
                                <h2>Record not found</h2>
                                <p>This record may no longer be available.</p>
                            </div>
                            <button class="icon-button" type="button"
                                data-action="close-modal" aria-label="Close">×</button>
                        </div>
                        <div class="modal-footer">
                            <button class="button button-secondary" type="button"
                                data-action="close-modal">Close</button>
                        </div>
                    </section>
                </div>
            `;
        }

        const singular = labels[collection];
        const status = lifecycleStatus(item);
        const statusLabel = status === "active"
            ? "Active"
            : status === "completed"
                ? "Completed"
                : "Archived";

        const detailContent = collection === "currentProjects"
            ? renderProjectDetails(item)
            : collection === "internships"
                ? renderInternshipDetails(item)
                : renderGoalDetails(item);

        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal journey-view-modal" role="dialog" aria-modal="true"
                    aria-labelledby="journeyViewTitle">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">${escapeHtml(singular)} details</p>
                            <h2 id="journeyViewTitle">${escapeHtml(item.title || `Untitled ${singular}`)}</h2>
                            <div class="badges">
                                ${lifecycleBadge(item)}
                                ${item.category ? `<span class="badge">${escapeHtml(item.category)}</span>` : ""}
                                ${item.phase ? `<span class="badge">${escapeHtml(item.phase)}</span>` : ""}
                            </div>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-modal" aria-label="Close">×</button>
                    </div>

                    <div class="modal-body">
                        <div class="journey-view-summary">
                            <div>
                                <span>Student</span>
                                <strong>${escapeHtml(displayName(student))}</strong>
                            </div>
                            <div>
                                <span>Status</span>
                                <strong>${escapeHtml(statusLabel)}</strong>
                            </div>
                            ${item.dueDate ? `
                                <div>
                                    <span>Due date</span>
                                    <strong>${escapeHtml(formatDate(item.dueDate))}</strong>
                                </div>
                            ` : ""}
                            ${item.startDate ? `
                                <div>
                                    <span>Start date</span>
                                    <strong>${escapeHtml(formatDate(item.startDate))}</strong>
                                </div>
                            ` : ""}
                            ${item.endDate ? `
                                <div>
                                    <span>End date</span>
                                    <strong>${escapeHtml(formatDate(item.endDate))}</strong>
                                </div>
                            ` : ""}
                        </div>

                        ${item.description ? `
                            <section class="journey-view-section">
                                <h3>Details</h3>
                                <p>${escapeHtml(item.description)}</p>
                            </section>
                        ` : ""}

                        <section class="journey-view-section">
                            <h3>${escapeHtml(singular)} information</h3>
                            ${detailContent || `<p class="empty-copy">No additional details recorded yet.</p>`}
                        </section>

                        <section class="journey-view-section">
                            <div class="panel-header">
                                <div>
                                    <p class="eyebrow">Chronological history</p>
                                    <h3>Updates</h3>
                                </div>
                                <button class="button button-primary button-small" type="button"
                                    data-action="add-journey-update"
                                    data-student-id="${escapeHtml(studentId)}"
                                    data-collection="${escapeHtml(collection)}"
                                    data-item-id="${escapeHtml(itemId)}">+ Add Update</button>
                            </div>
                            ${renderActivityLog(item)}
                        </section>

                        <section class="journey-view-section journey-record-meta">
                            <div>
                                <span>Created</span>
                                <strong>${escapeHtml(formatDate(item.createdAt))}</strong>
                            </div>
                            <div>
                                <span>Last updated</span>
                                <strong>${escapeHtml(formatDate(item.updatedAt || item.createdAt))}</strong>
                            </div>
                            ${item.completedAt ? `
                                <div>
                                    <span>Completed</span>
                                    <strong>${escapeHtml(formatDate(item.completedAt))}</strong>
                                </div>
                            ` : ""}
                        </section>
                    </div>

                    <div class="modal-footer journey-view-actions">
                        <button class="button button-secondary" type="button"
                            data-action="close-modal">Close</button>

                        <button class="button button-primary" type="button"
                            data-action="edit-viewed-journey-item"
                            data-student-id="${escapeHtml(studentId)}"
                            data-collection="${escapeHtml(collection)}"
                            data-item-id="${escapeHtml(itemId)}">
                            Edit ${escapeHtml(singular)}
                        </button>

                        ${status === "active" ? `
                            <button class="button button-secondary" type="button"
                                data-action="complete-viewed-lifecycle-item"
                                data-student-id="${escapeHtml(studentId)}"
                                data-collection="${escapeHtml(collection)}"
                                data-item-id="${escapeHtml(itemId)}">
                                Mark Complete
                            </button>
                            <button class="button button-secondary" type="button"
                                data-action="archive-viewed-lifecycle-item"
                                data-student-id="${escapeHtml(studentId)}"
                                data-collection="${escapeHtml(collection)}"
                                data-item-id="${escapeHtml(itemId)}">
                                Archive
                            </button>
                        ` : `
                            <button class="button button-secondary" type="button"
                                data-action="restore-viewed-lifecycle-item"
                                data-student-id="${escapeHtml(studentId)}"
                                data-collection="${escapeHtml(collection)}"
                                data-item-id="${escapeHtml(itemId)}">
                                Restore Active
                            </button>
                        `}
                    </div>
                </section>
            </div>
        `;
    }

    function openJourneyView(studentId, collection, itemId) {
        state.modalRoot.innerHTML = journeyViewTemplate(studentId, collection, itemId);
        document.body.style.overflow = "hidden";
    }

    function journeyFormTemplate(studentId, collection, itemId = "") {
        const labels = {
            currentProjects: "Project",
            internships: "Internship",
            goals: "Goal",
            evidence: "Evidence",
            followUps: "Follow-up",
            drivingQuestions: "Driving Question",
            milestones: "Milestone",
            reflections: "Reflection",
            notes: "Note",
            newQuestions: "New Question"
        };

        const singular = labels[collection] || "Journey Item";
        const student = StudentManager.getStudent(studentId);
        const item = itemId && student && Array.isArray(student.journey[collection])
            ? student.journey[collection].find((entry) => entry.id === itemId)
            : null;
        const editing = Boolean(item);
        const supportsDueDate = ["currentProjects", "followUps", "milestones"].includes(collection);
        const project = collection === "currentProjects";
        const internship = collection === "internships";
        const goal = collection === "goals";
        const richRecord = project || internship || goal;

        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal ${richRecord ? "" : "modal-small"}" role="dialog" aria-modal="true" aria-labelledby="journeyFormTitle">
                    <div class="modal-header">
                        <div>
                            <h2 id="journeyFormTitle">${editing ? "Edit" : "Add"} ${escapeHtml(singular)}</h2>
                            <p>${project
                                ? "Build and maintain the complete project record."
                                : internship
                                    ? "Maintain the full internship placement record."
                                    : goal
                                        ? "Create a measurable goal and track progress over time."
                                        : "Capture the next part of this student’s journey."
                            }</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button>
                    </div>

                    <form id="journeyItemForm">
                        <div class="modal-body">
                            <input type="hidden" name="studentId" value="${escapeHtml(studentId)}">
                            <input type="hidden" name="collection" value="${escapeHtml(collection)}">
                            <input type="hidden" name="itemId" value="${escapeHtml(itemId)}">

                            <div class="form-grid">
                                <div class="form-field ${richRecord ? "" : "full-width"}">
                                    <label for="journeyTitle">${escapeHtml(singular)} title *</label>
                                    <input id="journeyTitle" name="title" required autofocus
                                        value="${escapeHtml(item ? item.title : "")}">
                                </div>

                                ${project ? `
                                    <div class="form-field">
                                        <label for="journeyPhase">Phase</label>
                                        <input id="journeyPhase" name="phase"
                                            value="${escapeHtml(item ? item.phase : "")}"
                                            placeholder="Exploring, Planning, Creating, Presenting">
                                    </div>

                                    <div class="form-field">
                                        <label for="journeyStatus">Status</label>
                                        <select id="journeyStatus" name="status">
                                            ${[
                                                ["active", "Active"],
                                                ["completed", "Completed"],
                                                ["archived", "Archived"]
                                            ].map(([value, label]) => `
                                                <option value="${value}"
                                                    ${(item ? lifecycleStatus(item) : "active") === value ? "selected" : ""}>
                                                    ${label}
                                                </option>
                                            `).join("")}
                                        </select>
                                    </div>

                                    <div class="form-field full-width">
                                        <label for="projectQuestion">Project question</label>
                                        <input id="projectQuestion" name="projectQuestion"
                                            value="${escapeHtml(item ? item.projectQuestion : "")}"
                                            placeholder="What question is driving this project?">
                                    </div>
                                ` : ""}

                                ${internship ? `
                                    <div class="form-field">
                                        <label for="internshipStatus">Status</label>
                                        <select id="internshipStatus" name="status">
                                            ${[
                                                ["active", "Active"],
                                                ["completed", "Completed"],
                                                ["archived", "Archived"]
                                            ].map(([value, label]) => `
                                                <option value="${value}"
                                                    ${(item ? lifecycleStatus(item) : "active") === value ? "selected" : ""}>
                                                    ${label}
                                                </option>
                                            `).join("")}
                                        </select>
                                    </div>

                                    <div class="form-field">
                                        <label for="internshipOrganization">Organization</label>
                                        <input id="internshipOrganization" name="organization"
                                            value="${escapeHtml(item ? item.organization : "")}">
                                    </div>

                                    <div class="form-field">
                                        <label for="internshipSupervisor">Supervisor</label>
                                        <input id="internshipSupervisor" name="supervisor"
                                            value="${escapeHtml(item ? item.supervisor : "")}">
                                    </div>

                                    <div class="form-field">
                                        <label for="internshipSupervisorEmail">Supervisor email</label>
                                        <input id="internshipSupervisorEmail" name="supervisorEmail" type="email"
                                            value="${escapeHtml(item ? item.supervisorEmail : "")}">
                                    </div>

                                    <div class="form-field">
                                        <label for="internshipSupervisorPhone">Supervisor phone</label>
                                        <input id="internshipSupervisorPhone" name="supervisorPhone"
                                            value="${escapeHtml(item ? item.supervisorPhone : "")}">
                                    </div>

                                    <div class="form-field">
                                        <label for="internshipLocation">Location</label>
                                        <input id="internshipLocation" name="location"
                                            value="${escapeHtml(item ? item.location : "")}">
                                    </div>

                                    <div class="form-field">
                                        <label for="internshipSchedule">Schedule</label>
                                        <input id="internshipSchedule" name="schedule"
                                            value="${escapeHtml(item ? item.schedule : "")}"
                                            placeholder="Example: Tuesdays and Thursdays, 1–4 PM">
                                    </div>

                                    <div class="form-field">
                                        <label for="internshipHours">Hours per week</label>
                                        <input id="internshipHours" name="hoursPerWeek"
                                            value="${escapeHtml(item ? item.hoursPerWeek : "")}">
                                    </div>

                                    <div class="form-field">
                                        <label for="internshipNextShift">Next shift</label>
                                        <input id="internshipNextShift" name="nextShift"
                                            value="${escapeHtml(item ? item.nextShift : "")}"
                                            placeholder="Example: Tuesday, 1–4 PM">
                                    </div>

                                    <div class="form-field full-width">
                                        <label for="internshipCurrentObjective">Current objective</label>
                                        <input id="internshipCurrentObjective" name="currentObjective"
                                            value="${escapeHtml(item ? item.currentObjective : "")}"
                                            placeholder="What is the student working to learn or accomplish next?">
                                    </div>

                                    <div class="form-field">
                                        <label for="internshipStartDate">Start date</label>
                                        <input id="internshipStartDate" name="startDate" type="date"
                                            value="${escapeHtml(item ? item.startDate : "")}">
                                    </div>

                                    <div class="form-field">
                                        <label for="internshipEndDate">End date</label>
                                        <input id="internshipEndDate" name="endDate" type="date"
                                            value="${escapeHtml(item ? item.endDate : "")}">
                                    </div>
                                ` : ""}

                                ${goal ? `
                                    <div class="form-field">
                                        <label for="goalStatus">Status</label>
                                        <select id="goalStatus" name="status">
                                            ${[
                                                ["active", "Active"],
                                                ["completed", "Completed"],
                                                ["archived", "Archived"]
                                            ].map(([value, label]) => `
                                                <option value="${value}"
                                                    ${(item ? lifecycleStatus(item) : "active") === value ? "selected" : ""}>
                                                    ${label}
                                                </option>
                                            `).join("")}
                                        </select>
                                    </div>

                                    <div class="form-field">
                                        <label for="goalCategory">Category</label>
                                        <select id="goalCategory" name="category">
                                            ${[
                                                "Academic",
                                                "Career",
                                                "Project",
                                                "Internship",
                                                "Personal",
                                                "Attendance",
                                                "Life Skills",
                                                "Other"
                                            ].map((category) => `
                                                <option value="${category}"
                                                    ${(item ? item.category : "") === category ? "selected" : ""}>
                                                    ${category}
                                                </option>
                                            `).join("")}
                                        </select>
                                    </div>

                                    <div class="form-field">
                                        <label for="goalDueDate">Target date</label>
                                        <input id="goalDueDate" name="dueDate" type="date"
                                            value="${escapeHtml(item ? item.dueDate : "")}">
                                    </div>

                                    <div class="form-field">
                                        <label for="goalLinkedProject">Link to project</label>
                                        <select id="goalLinkedProject" name="linkedProjectId">
                                            <option value="">Not linked to a project</option>
                                            ${(student?.journey.currentProjects || []).map((projectItem) => `
                                                <option value="${escapeHtml(projectItem.id)}"
                                                    ${(item ? item.linkedProjectId : "") === projectItem.id ? "selected" : ""}>
                                                    ${escapeHtml(projectItem.title || "Untitled Project")}
                                                </option>
                                            `).join("")}
                                        </select>
                                    </div>

                                    <div class="form-field">
                                        <label for="goalLinkedInternship">Link to internship</label>
                                        <select id="goalLinkedInternship" name="linkedInternshipId">
                                            <option value="">Not linked to an internship</option>
                                            ${(student?.journey.internships || []).map((internshipItem) => `
                                                <option value="${escapeHtml(internshipItem.id)}"
                                                    ${(item ? item.linkedInternshipId : "") === internshipItem.id ? "selected" : ""}>
                                                    ${escapeHtml(
                                                        internshipItem.title ||
                                                        internshipItem.organization ||
                                                        "Untitled Internship"
                                                    )}
                                                </option>
                                            `).join("")}
                                        </select>
                                    </div>

                                    <div class="form-field full-width">
                                        <label for="goalSuccessCriteria">Success looks like</label>
                                        <textarea id="goalSuccessCriteria" name="successCriteria"
                                            placeholder="How will the student know this goal is complete?">${escapeHtml(item ? item.successCriteria : "")}</textarea>
                                    </div>

                                    <div class="form-field full-width">
                                        <label for="goalSupportNeeded">Support needed</label>
                                        <textarea id="goalSupportNeeded" name="supportNeeded"
                                            placeholder="People, resources, accommodations, or guidance needed">${escapeHtml(item ? item.supportNeeded : "")}</textarea>
                                    </div>

                                    <div class="form-field">
                                        <label for="goalCheckpoints">Checkpoints</label>
                                        <textarea id="goalCheckpoints" name="checkpoints"
                                            placeholder="One checkpoint per line">${escapeHtml(item && item.checkpoints ? item.checkpoints.join("\n") : "")}</textarea>
                                    </div>

                                    <div class="form-field">
                                        <label for="goalNextSteps">Next steps</label>
                                        <textarea id="goalNextSteps" name="nextSteps"
                                            placeholder="One next step per line">${escapeHtml(item && item.nextSteps ? item.nextSteps.join("\n") : "")}</textarea>
                                    </div>
                                ` : ""}

                                <div class="form-field full-width">
                                    <label for="journeyDescription">Details</label>
                                    <textarea id="journeyDescription" name="description">${escapeHtml(item ? item.description : "")}</textarea>
                                </div>

                                ${supportsDueDate ? `
                                    <div class="form-field">
                                        <label for="journeyDueDate">Due date</label>
                                        <input id="journeyDueDate" name="dueDate" type="date"
                                            value="${escapeHtml(item ? item.dueDate : "")}">
                                    </div>
                                ` : ""}

                                ${project ? `
                                    <div class="form-field">
                                        <label for="projectSkills">Skills</label>
                                        <textarea id="projectSkills" name="skills"
                                            placeholder="One per line">${escapeHtml(item && item.skills ? item.skills.join("\n") : "")}</textarea>
                                    </div>

                                    <div class="form-field">
                                        <label for="projectPartners">Partners</label>
                                        <textarea id="projectPartners" name="partners"
                                            placeholder="One per line">${escapeHtml(item && item.partners ? item.partners.join("\n") : "")}</textarea>
                                    </div>

                                    <div class="form-field">
                                        <label for="projectEvidence">Evidence and artifacts</label>
                                        <textarea id="projectEvidence" name="evidence"
                                            placeholder="Links, files, photos, work samples, notes">${escapeHtml(item && item.evidence ? item.evidence.join("\n") : "")}</textarea>
                                    </div>

                                    <div class="form-field">
                                        <label for="projectReflections">Reflections</label>
                                        <textarea id="projectReflections" name="reflections"
                                            placeholder="One reflection per line">${escapeHtml(item && item.reflections ? item.reflections.join("\n") : "")}</textarea>
                                    </div>

                                    <div class="form-field full-width">
                                        <label for="projectNextSteps">Next steps</label>
                                        <textarea id="projectNextSteps" name="nextSteps"
                                            placeholder="One next step per line">${escapeHtml(item && item.nextSteps ? item.nextSteps.join("\n") : "")}</textarea>
                                    </div>
                                ` : ""}

                                ${internship ? `
                                    <div class="form-field">
                                        <label for="internshipResponsibilities">Responsibilities</label>
                                        <textarea id="internshipResponsibilities" name="responsibilities"
                                            placeholder="One per line">${escapeHtml(item && item.responsibilities ? item.responsibilities.join("\n") : "")}</textarea>
                                    </div>

                                    <div class="form-field">
                                        <label for="internshipSkills">Skills practiced</label>
                                        <textarea id="internshipSkills" name="skills"
                                            placeholder="One per line">${escapeHtml(item && item.skills ? item.skills.join("\n") : "")}</textarea>
                                    </div>

                                    <div class="form-field">
                                        <label for="internshipReflections">Reflections</label>
                                        <textarea id="internshipReflections" name="reflections"
                                            placeholder="One reflection per line">${escapeHtml(item && item.reflections ? item.reflections.join("\n") : "")}</textarea>
                                    </div>

                                    <div class="form-field">
                                        <label for="internshipNextSteps">Next steps</label>
                                        <textarea id="internshipNextSteps" name="nextSteps"
                                            placeholder="One next step per line">${escapeHtml(item && item.nextSteps ? item.nextSteps.join("\n") : "")}</textarea>
                                    </div>
                                ` : ""}
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button class="button button-secondary" type="button" data-action="close-modal">Cancel</button>
                            <button class="button button-primary" type="submit">
                                ${editing ? "Save Changes" : `Add ${escapeHtml(singular)}`}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function engagementFormTemplate(studentId, engagementId) {
        const student = StudentManager.getStudent(studentId);
        const engagement = student
            ? student.journey.opportunityEngagements.find((item) => item.id === engagementId)
            : null;
        const opportunity = engagement && typeof OpportunityManager !== "undefined"
            ? OpportunityManager.getOpportunity(engagement.opportunityId)
            : null;

        if (!engagement) {
            return "";
        }

        return `
            <div class="modal-backdrop">
                <section class="modal modal-small" role="dialog" aria-modal="true" aria-labelledby="engagementTitle">
                    <div class="modal-header">
                        <div>
                            <h2 id="engagementTitle">Update Opportunity</h2>
                            <p>${escapeHtml(opportunity ? opportunity.title : "Assigned opportunity")}</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button>
                    </div>

                    <form id="opportunityEngagementForm">
                        <div class="modal-body">
                            <input type="hidden" name="studentId" value="${escapeHtml(studentId)}">
                            <input type="hidden" name="engagementId" value="${escapeHtml(engagementId)}">

                            <div class="form-field">
                                <label for="engagementStatus">Status</label>
                                <select id="engagementStatus" name="status">
                                    ${["Interested","Planning","Applied","Interviewing","Accepted","Declined"].map((status) => `
                                        <option value="${status}" ${engagement.status === status ? "selected" : ""}>${status}</option>
                                    `).join("")}
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="engagementNextStep">Next step</label>
                                <input id="engagementNextStep" name="nextStep" value="${escapeHtml(engagement.nextStep)}">
                            </div>

                            <div class="form-field">
                                <label for="engagementDueDate">Due date</label>
                                <input id="engagementDueDate" name="dueDate" type="date" value="${escapeHtml(engagement.dueDate)}">
                            </div>

                            <div class="form-field">
                                <label for="engagementNotes">Notes</label>
                                <textarea id="engagementNotes" name="notes">${escapeHtml(engagement.notes)}</textarea>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button class="button button-secondary" type="button" data-action="close-modal">Cancel</button>
                            <button class="button button-primary" type="submit">Save Progress</button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function openStudentForm(studentId = null) {
        const student = studentId ? StudentManager.getStudent(studentId) : null;
        state.modalRoot.innerHTML = studentFormTemplate(student);
        document.body.style.overflow = "hidden";
        window.setTimeout(() => {
            const firstInput = state.modalRoot.querySelector("input:not([type='hidden'])");
            if (firstInput) {
                firstInput.focus();
            }
        }, 0);
    }

    function openJourneyForm(studentId, collection, itemId = "") {
        state.modalRoot.innerHTML = journeyFormTemplate(studentId, collection, itemId);
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        state.modalRoot.innerHTML = "";
        document.body.style.overflow = "";
    }

    function handleStudentForm(form) {
        const formData = new FormData(form);
        const studentId = String(formData.get("studentId") || "");
        const firstName = String(formData.get("firstName") || "").trim();

        if (!firstName) {
            const input = form.querySelector("[name='firstName']");
            input.setAttribute("aria-invalid", "true");
            input.focus();
            return;
        }

        const existingStudent = studentId
            ? StudentManager.getStudent(studentId)
            : null;

        const payload = {
            profile: {
                preferredName: formData.get("preferredName"),
                firstName,
                lastName: formData.get("lastName"),
                grade: existingStudent?.profile?.grade || "",
                advisor: existingStudent?.profile?.advisor || "",
                interests: splitList(formData.get("interests")),
                postSecondaryGoals: splitList(formData.get("postSecondaryGoals")),
                studentVoice: formData.get("studentVoice"),
                portfolioUrl: normalizePortfolioUrl(formData.get("portfolioUrl")),
                currentFocus: formData.get("currentFocus"),
                focusWhy: formData.get("focusWhy"),
                focusNextAction: formData.get("focusNextAction"),
                discovery: {
                    futureDirection: formData.get("futureDirection") || "not-yet",
                    favoriteYouTube: splitList(formData.get("favoriteYouTube")),
                    favoriteGames: splitList(formData.get("favoriteGames")),
                    favoriteMedia: splitList(formData.get("favoriteMedia")),
                    freeTime: splitList(formData.get("freeTime")),
                    curiosities: splitList(formData.get("curiosities")),
                    thingsToTry: splitList(formData.get("thingsToTry")),
                    thingsToLearn: splitList(formData.get("thingsToLearn")),
                    othersNotice: splitList(formData.get("othersNotice"))
                },
                transportation: {
                    primaryMode: formData.get("transportationMode"),
                    licenseStatus: formData.get("licenseStatus"),
                    hasReliableAccess: formData.get("hasReliableAccess") === "on",
                    notes: formData.get("transportationNotes")
                }
            },
            journey: {
                dreamJobs: splitList(formData.get("dreamJobs"))
            }
        };

        let student;
        if (studentId) {
            student = StudentManager.updateStudent(studentId, payload);
            App.showToast("Student updated.");
        } else {
            student = StudentManager.createStudent(payload);
            App.showToast("Student created.");
        }

        closeModal();

        if (student) {
            document.dispatchEvent(new CustomEvent("viewStudent", {
                detail: { studentId: student.id }
            }));
        }
    }

    function handleJourneyForm(form) {
        const formData = new FormData(form);
        const studentId = String(formData.get("studentId") || "");
        const collection = String(formData.get("collection") || "");
        const itemId = String(formData.get("itemId") || "");
        const title = String(formData.get("title") || "").trim();

        if (!title) {
            form.querySelector("[name='title']").focus();
            return;
        }

        const status = String(formData.get("status") || "active");
        const payload = {
            title,
            description: formData.get("description"),
            dueDate: formData.get("dueDate")
        };

        if (collection === "currentProjects") {
            Object.assign(payload, {
                phase: formData.get("phase"),
                projectQuestion: formData.get("projectQuestion"),
                status,
                archived: status === "archived",
                completedAt: status === "completed" ? new Date().toISOString() : "",
                skills: splitList(formData.get("skills")),
                partners: splitList(formData.get("partners")),
                evidence: splitList(formData.get("evidence")),
                reflections: splitList(formData.get("reflections")),
                nextSteps: splitList(formData.get("nextSteps"))
            });
        }

        if (collection === "internships") {
            Object.assign(payload, {
                status,
                archived: status === "archived",
                completedAt: status === "completed" ? new Date().toISOString() : "",
                organization: formData.get("organization"),
                supervisor: formData.get("supervisor"),
                supervisorEmail: formData.get("supervisorEmail"),
                supervisorPhone: formData.get("supervisorPhone"),
                location: formData.get("location"),
                schedule: formData.get("schedule"),
                hoursPerWeek: formData.get("hoursPerWeek"),
                currentObjective: formData.get("currentObjective"),
                nextShift: formData.get("nextShift"),
                startDate: formData.get("startDate"),
                endDate: formData.get("endDate"),
                responsibilities: splitList(formData.get("responsibilities")),
                skills: splitList(formData.get("skills")),
                reflections: splitList(formData.get("reflections")),
                nextSteps: splitList(formData.get("nextSteps"))
            });
        }

        if (collection === "goals") {
            Object.assign(payload, {
                status,
                archived: status === "archived",
                completedAt: status === "completed" ? new Date().toISOString() : "",
                category: formData.get("category"),
                dueDate: formData.get("dueDate"),
                successCriteria: formData.get("successCriteria"),
                supportNeeded: formData.get("supportNeeded"),
                linkedProjectId: formData.get("linkedProjectId"),
                linkedInternshipId: formData.get("linkedInternshipId"),
                checkpoints: splitList(formData.get("checkpoints")),
                nextSteps: splitList(formData.get("nextSteps")),
                progressNotes: itemId
                    ? (
                        StudentManager.getStudent(studentId)
                            ?.journey.goals.find((item) => item.id === itemId)
                            ?.progressNotes || []
                    )
                    : []
            });
        }

        if (itemId) {
            StudentManager.updateJourneyItem(studentId, collection, itemId, payload);
            App.showToast(`${
                collection === "currentProjects"
                    ? "Project"
                    : collection === "internships"
                        ? "Internship"
                        : collection === "goals"
                            ? "Goal"
                            : "Journey item"
            } updated.`);
        } else {
            StudentManager.addJourneyItem(studentId, collection, payload);
            App.showToast(`${
                collection === "currentProjects"
                    ? "Project"
                    : collection === "internships"
                        ? "Internship"
                        : collection === "goals"
                            ? "Goal"
                            : "Journey item"
            } added.`);
        }

        closeModal();
        renderDetail(studentId);
    }

    function handleClick(event) {
        const actionTarget = event.target.closest("[data-action]");
        if (!actionTarget) {
            return;
        }

        const action = actionTarget.dataset.action;
        const studentId = actionTarget.dataset.studentId;

        if (action === "view-journey-item") {
            openJourneyView(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId
            );
        } else if (action === "add-journey-update") {
            openJourneyUpdateForm(studentId, actionTarget.dataset.collection, actionTarget.dataset.itemId);
        } else if (action === "cancel-record-update") {
            openJourneyView(studentId, actionTarget.dataset.collection, actionTarget.dataset.itemId);
        } else if (action === "edit-viewed-journey-item") {
            openJourneyForm(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId
            );
        } else if (action === "complete-viewed-lifecycle-item") {
            StudentManager.updateJourneyItem(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId,
                {
                    status: "completed",
                    archived: false,
                    completedAt: new Date().toISOString()
                }
            );
            App.showToast("Item marked complete.");
            openJourneyView(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId
            );
        } else if (action === "archive-viewed-lifecycle-item") {
            StudentManager.updateJourneyItem(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId,
                {
                    status: "archived",
                    archived: true
                }
            );
            App.showToast("Item archived.");
            openJourneyView(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId
            );
        } else if (action === "restore-viewed-lifecycle-item") {
            StudentManager.updateJourneyItem(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId,
                {
                    status: "active",
                    archived: false,
                    completedAt: ""
                }
            );
            App.showToast("Item restored to active.");
            openJourneyView(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId
            );
        } else if (action === "print-progress-review") {
            printProgressReview(studentId);
        } else if (action === "print-student-portfolio") {
            printStudentPortfolio(studentId);
        } else if (action === "print-student-view") {
            printStudentView(studentId);
        } else if (action === "print-student-story") {
            printStudentStory(studentId);
        } else if (action === "view-meeting-action-plan") {
            const student = StudentManager.getStudent(studentId);
            const plan = student
                ? student.journey.actionPlans.find(
                    (item) => item.id === actionTarget.dataset.planId
                )
                : null;

            if (!student || !plan) {
                App.showToast("Meeting action plan could not be opened.", "error");
                return;
            }

            state.modalRoot.innerHTML = actionPlanModalTemplate(student, plan);
            document.body.style.overflow = "hidden";
        } else if (action === "print-meeting-action-plan") {
            printMeetingActionPlan(studentId, actionTarget.dataset.planId);
        } else if (action === "open-student-view") {
            state.activeProfileTab = "myMomentum";
            renderDetail(studentId);
        } else if (action === "switch-profile-tab") {
            state.activeProfileTab = actionTarget.dataset.profileTab || "myMomentum";
            renderDetail(state.currentStudentId);
        } else if (action === "open-community-directory") {
            document.dispatchEvent(new CustomEvent("momentumNavigate", {
                detail: { view: "community" }
            }));
        } else if (action === "edit-portfolio-link") {
            const student = StudentManager.getStudent(studentId);
            if (!student) return;
            state.modalRoot.innerHTML = portfolioLinkFormTemplate(student);
            document.body.style.overflow = "hidden";
        } else if (action === "edit-student") {
            openStudentForm(studentId);
        } else if (action === "view-student") {
            if (studentId !== state.currentStudentId) {
                state.activeProfileTab = "myMomentum";
            }

            if (!studentId || !StudentManager.getStudent(studentId)) {
                App.showToast("Student record could not be opened.", "error");
            }
            // App owns direct click navigation globally.
        } else if (action === "quick-next step") {
            openJourneyForm(studentId, "followUps");
        } else if (action === "start-student-meeting") {
            if (!studentId || !StudentManager.getStudent(studentId)) {
                App.showToast("Student record could not be opened.", "error");
                return;
            }

            document.dispatchEvent(new CustomEvent("openStudentMeeting", {
                detail: { studentId }
            }));
        } else if (action === "new-student-checkin") {
            CheckInCenter.openForm(studentId);
        } else if (action === "assign-smart-opportunity") {
            const opportunityId = actionTarget.dataset.opportunityId;
            const opportunity = OpportunityManager.getOpportunity(opportunityId);

            if (!opportunity || !studentId) {
                App.showToast("Opportunity could not be assigned.", "error");
                return;
            }

            StudentManager.assignOpportunity(studentId, opportunityId, {
                status: "Interested",
                nextStep: "Review opportunity details with student",
                dueDate: opportunity.deadline || "",
                notes: "Assigned from Smart Opportunity Matching"
            });

            App.showToast(`${opportunity.title} assigned to student.`);
            renderDetail(studentId);
        } else if (action === "open-matched-opportunity") {
            const opportunity = OpportunityManager.getOpportunity(
                actionTarget.dataset.opportunityId
            );

            App.navigate("community", { communityTab: "opportunities" });
            window.setTimeout(() => {
                const input = document.getElementById("opportunitySearchInput");
                if (input && opportunity) {
                    input.value = opportunity.title;
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                    input.focus();
                }
            }, 0);
        } else if (action === "complete-action-center-item") {
            const collection = actionTarget.dataset.collection;
            const itemId = actionTarget.dataset.itemId;

            if (collection === "followUps") {
                StudentManager.updateJourneyItem(studentId, collection, itemId, {
                    status: "completed",
                    completedAt: new Date().toISOString()
                });
                App.showToast("Follow-up marked complete.");
                renderDetail(studentId);
            }
        } else if (action === "open-action-source") {
            openJourneyView(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId
            );
        } else if (action === "open-action-opportunity") {
            const opportunity = OpportunityManager.getOpportunity(
                actionTarget.dataset.opportunityId
            );
            App.navigate("community", { communityTab: "opportunities" });
            window.setTimeout(() => {
                const input = document.getElementById("opportunitySearchInput");
                if (input && opportunity) {
                    input.value = opportunity.title;
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                }
            }, 0);
        } else if (action === "start-project-checkin") {
            const student = StudentManager.getStudent(studentId);
            const project = student
                ? projectWorkspaceCurrentProject(student)
                : null;

            if (!project) {
                App.showToast("Add an active project first.", "error");
                return;
            }

            document.dispatchEvent(new CustomEvent("openStudentMeeting", {
                detail: {
                    studentId,
                    focus: "project",
                    projectId: project.id
                }
            }));
        } else if (action === "add-project-note") {
            const projectId = actionTarget.dataset.projectId;
            if (!projectId) {
                App.showToast("Add an active project first.", "error");
                return;
            }

            state.modalRoot.innerHTML = journeyUpdateFormTemplate(
                studentId,
                "currentProjects",
                projectId
            );
            document.body.style.overflow = "hidden";
        } else if (action === "add-internship-note") {
            const internshipId = actionTarget.dataset.internshipId;
            if (!internshipId) {
                App.showToast("Add an active internship first.", "error");
                return;
            }

            state.modalRoot.innerHTML = journeyUpdateFormTemplate(
                studentId,
                "internships",
                internshipId
            );
            document.body.style.overflow = "hidden";
        } else if (action === "complete-promise") {
            const student = StudentManager.getStudent(studentId);
            const promiseId = actionTarget.dataset.promiseId;
            const promises = (student?.journey.promises || []).map((item) =>
                item.id === promiseId
                    ? {
                        ...item,
                        status: "completed",
                        completedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                    : item
            );

            StudentManager.updateStudent(studentId, {
                journey: { promises }
            });
            App.showToast("Promise completed.");
        } else if (action === "add-observation") {
            state.modalRoot.innerHTML = observationFormTemplate(studentId);
            document.body.style.overflow = "hidden";
        } else if (action === "ask-another-question") {
            const panel = actionTarget.closest(".inquiry-coach-panel");
            const output = panel?.querySelector("[data-inquiry-question]");
            const student = StudentManager.getStudent(studentId);
            const context = actionTarget.dataset.inquiryContext || "discovery";
            if (student && output) {
                const list = InquiryCoach.contextualQuestions(student, context, 12);
                const current = output.textContent.trim();
                output.textContent = list[(Math.max(0,list.indexOf(current))+1)%list.length];
            }
        } else if (action === "choose-inquiry-question") {
            const output = actionTarget.closest(".inquiry-coach-panel")?.querySelector("[data-inquiry-question]");
            if (output) output.textContent = actionTarget.dataset.question || "";
        } else if (action === "filter-journey") {
            const filter = actionTarget.dataset.journeyFilter || "all";
            document.querySelectorAll(".journey-filter").forEach((button) => {
                button.classList.toggle("is-active", button === actionTarget);
            });
            document.querySelectorAll("[data-journey-type]").forEach((entry) => {
                const types = entry.dataset.journeyType.split(" ");
                entry.hidden = filter !== "all" && !types.includes(filter);
            });
            const search = document.getElementById("journeySearchInput");
            if (search) search.dispatchEvent(new Event("input", { bubbles: true }));
        } else if (action === "edit-opportunity-engagement") {
            state.modalRoot.innerHTML = engagementFormTemplate(
                studentId,
                actionTarget.dataset.engagementId
            );
            document.body.style.overflow = "hidden";
        } else if (action === "remove-partner-engagement") {
            if (window.confirm("Remove this partner from the student record?")) {
                StudentManager.removePartnerEngagement(
                    studentId,
                    actionTarget.dataset.engagementId
                );
                App.showToast("Community partner removed from student.");
            }
        } else if (action === "remove-opportunity-engagement") {
            if (window.confirm("Remove this opportunity from the student pipeline?")) {
                StudentManager.removeOpportunityEngagement(
                    studentId,
                    actionTarget.dataset.engagementId
                );
                App.showToast("Opportunity removed from student.");
            }
        } else if (action === "archive-student") {
            if (window.confirm("Archive this student? Their record will remain available.")) {
                StudentManager.archiveStudent(studentId);
                App.showToast("Student archived.");
            }
        } else if (action === "restore-student") {
            StudentManager.restoreStudent(studentId);
            App.showToast("Student restored.");
        } else if (action === "delete-student") {
            if (window.confirm("Permanently delete this student? This cannot be undone.")) {
                StudentManager.deleteStudent(studentId);
                document.dispatchEvent(new CustomEvent("momentumNavigate", {
                    detail: { view: "students" }
                }));
                App.showToast("Student deleted.");
            }
        } else if (action === "add-journey-item") {
            openJourneyForm(studentId, actionTarget.dataset.collection);
        } else if (action === "edit-journey-item") {
            openJourneyForm(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId
            );
        } else if (action === "complete-lifecycle-item") {
            StudentManager.updateJourneyItem(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId,
                {
                    status: "completed",
                    archived: false,
                    completedAt: new Date().toISOString()
                }
            );
            App.showToast("Item marked complete.");
        } else if (action === "archive-lifecycle-item") {
            StudentManager.updateJourneyItem(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId,
                {
                    status: "archived",
                    archived: true
                }
            );
            App.showToast("Item archived.");
        } else if (action === "restore-lifecycle-item") {
            StudentManager.updateJourneyItem(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId,
                {
                    status: "active",
                    archived: false,
                    completedAt: ""
                }
            );
            App.showToast("Item restored to active.");
        } else if (action === "complete-journey-item") {
            StudentManager.updateJourneyItem(
                studentId,
                actionTarget.dataset.collection,
                actionTarget.dataset.itemId,
                {
                    status: "completed",
                    completedAt: new Date().toISOString()
                }
            );
            App.showToast("Follow-up completed.");
        } else if (action === "delete-journey-item") {
            if (window.confirm("Delete this item?")) {
                StudentManager.removeJourneyItem(
                    studentId,
                    actionTarget.dataset.collection,
                    actionTarget.dataset.itemId
                );
                App.showToast("Journey item deleted.");
            }
        } else if (action === "close-modal") {
            closeModal();
        }
    }

    function handleSubmit(event) {
        if (event.target.id === "portfolioLinkForm") {
            event.preventDefault();
            const data = new FormData(event.target);
            const studentId = String(data.get("studentId") || "");
            StudentManager.updateStudent(studentId, {
                profile: {
                    portfolioUrl: data.get("portfolioUrl")
                }
            });
            closeModal();
            state.activeProfileTab = "projects";
            renderDetail(studentId);
            App.showToast("Google Site link saved.");
            return;
        }
        if (event.target.id === "studentForm") {
            event.preventDefault();
            handleStudentForm(event.target);
        }

        if (event.target.id === "journeyItemForm") {
            event.preventDefault();
            handleJourneyForm(event.target);
        }

        if (event.target.id === "journeyUpdateForm") {
            event.preventDefault();
            const formData = new FormData(event.target);
            const studentId = String(formData.get("studentId") || "");
            const collection = String(formData.get("collection") || "");
            const itemId = String(formData.get("itemId") || "");
            const student = StudentManager.getStudent(studentId);
            const item = student && Array.isArray(student.journey[collection])
                ? student.journey[collection].find((entry) => entry.id === itemId)
                : null;
            if (!item) return;

            const update = {
                id: `UPD-${Date.now().toString(36).toUpperCase()}`,
                date: String(formData.get("date") || DateUtils.today()),
                time: String(formData.get("time") || ""),
                type: String(formData.get("type") || "Update"),
                note: String(formData.get("note") || "").trim(),
                nextStep: String(formData.get("nextStep") || "").trim(),
                source: "Manual",
                createdAt: new Date().toISOString()
            };

            StudentManager.updateJourneyItem(studentId, collection, itemId, {
                activityLog: [...(item.activityLog || []), update]
            });
            App.showToast("Dated update added.");
            if (collection === "currentProjects" || collection === "internships") {
                closeModal();
                state.activeProfileTab = collection === "currentProjects"
                    ? "projects"
                    : "internships";
                renderDetail(studentId);
            } else {
                openJourneyView(studentId, collection, itemId);
            }
        }

        if (event.target.id === "inlineDiscoveryForm") {
            event.preventDefault();
            const formData = new FormData(event.target);
            const studentId = String(formData.get("studentId") || "");
            const student = StudentManager.getStudent(studentId);
            if (!student) return;

            StudentManager.updateStudent(studentId, {
                profile: {
                    discovery: {
                        futureDirection: String(
                            formData.get("futureDirection") || "not-yet"
                        ),
                        favoriteYouTube: splitList(formData.get("favoriteYouTube")),
                        favoriteGames: splitList(formData.get("favoriteGames")),
                        favoriteMedia: splitList(formData.get("favoriteMedia")),
                        freeTime: splitList(formData.get("freeTime")),
                        curiosities: splitList(formData.get("curiosities")),
                        thingsToTry: splitList(formData.get("thingsToTry")),
                        thingsToLearn: splitList(formData.get("thingsToLearn")),
                        othersNotice: splitList(formData.get("othersNotice"))
                    }
                }
            });

            state.activeProfileTab = "discovery";
            renderDetail(studentId);
            App.showToast("Discovery answers saved.");
        }

        if (event.target.id === "inlineTransportationForm") {
            event.preventDefault();
            const formData = new FormData(event.target);
            const studentId = String(formData.get("studentId") || "");
            if (!StudentManager.getStudent(studentId)) return;

            StudentManager.updateStudent(studentId, {
                profile: {
                    transportation: {
                        modes: formData.getAll("transportationModes"),
                        primaryMode: formData.getAll("transportationModes")[0] || "",
                        licenseStatus: formData.get("licenseStatus"),
                        hasReliableAccess:
                            formData.get("hasReliableAccess") === "on",
                        notes: formData.get("transportationNotes")
                    }
                }
            });

            state.activeProfileTab = "discovery";
            renderDetail(studentId);
            App.showToast("Transportation information saved.");
        }

        if (event.target.id === "observationForm") {
            event.preventDefault();
            const fd = new FormData(event.target);
            const studentId = String(fd.get("studentId") || "");
            const student = StudentManager.getStudent(studentId);
            const note = String(fd.get("note") || "").trim();
            if (!student || !note) return;
            const item = {
                id: `OBS-${Date.now().toString(36).toUpperCase()}`,
                date: String(fd.get("date") || DateUtils.today()),
                time: String(fd.get("time") || ""),
                category: String(fd.get("category") || "General"),
                note, strength: String(fd.get("strength") || "").trim(),
                barrier: String(fd.get("barrier") || "").trim(),
                supportProvided: String(fd.get("supportProvided") || "").trim(),
                nextMove: String(fd.get("nextMove") || "").trim(),
                followUpNeeded: fd.get("followUpNeeded") === "on",
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            };
            StudentManager.updateStudent(studentId,{journey:{observations:[...student.journey.observations,item]}});
            if (item.followUpNeeded) StudentManager.addJourneyItem(studentId,"followUps",{
                title:item.nextMove || `Follow up: ${item.category}`,description:item.note,status:"open",assignedTo:"Advisor"
            });
            closeModal(); state.activeProfileTab="observations"; renderDetail(studentId);
            App.showToast("Observation saved.");
        }

        if (event.target.id === "opportunityEngagementForm") {
            event.preventDefault();
            const formData = new FormData(event.target);
            const studentId = String(formData.get("studentId") || "");
            const engagementId = String(formData.get("engagementId") || "");

            StudentManager.updateOpportunityEngagement(studentId, engagementId, {
                status: formData.get("status"),
                nextStep: formData.get("nextStep"),
                dueDate: formData.get("dueDate"),
                notes: formData.get("notes")
            });

            closeModal();
            renderDetail(studentId);
            App.showToast("Opportunity progress updated.");
        }
    }

    function initialize() {
        state.browser = document.getElementById("studentBrowser");
        state.count = document.getElementById("studentCountText");
        state.searchInput = document.getElementById("studentSearchInput");
        state.statusFilter = document.getElementById("studentStatusFilter");
        state.advisorFilter = document.getElementById("studentAdvisorFilter");
        state.gradeFilter = document.getElementById("studentGradeFilter");
        state.supportFilter = document.getElementById("studentSupportFilter");
        state.sortSelect = document.getElementById("studentSortSelect");
        state.detailContainer = document.getElementById("studentDetailContent");
        state.modalRoot = document.getElementById("modalRoot");

        if (state.searchInput) state.searchInput.addEventListener("input", renderBrowser);
        if (state.statusFilter) state.statusFilter.addEventListener("change", renderBrowser);
        if (state.advisorFilter) state.advisorFilter.addEventListener("change", renderBrowser);
        if (state.gradeFilter) state.gradeFilter.addEventListener("change", renderBrowser);
        if (state.supportFilter) state.supportFilter.addEventListener("change", renderBrowser);
        if (state.sortSelect) state.sortSelect.addEventListener("change", renderBrowser);
        document.addEventListener("click", handleClick);
        document.addEventListener("submit", handleSubmit);
        document.addEventListener("input", (event) => {
            if (event.target.id === "studentMeetingSearch") {
                filterStudentMeetingHistory(event.target.value);
            } else if (event.target.id === "journeySearchInput") {
                const query = event.target.value.trim().toLowerCase();
                const active = document.querySelector(".journey-filter.is-active")?.dataset.journeyFilter || "all";
                let visible = 0;
                document.querySelectorAll("[data-journey-type]").forEach((entry) => {
                    const filterMatch = active === "all" || entry.dataset.journeyType.split(" ").includes(active);
                    const searchMatch = !query || entry.dataset.journeySearch.includes(query);
                    entry.hidden = !(filterMatch && searchMatch);
                    if (!entry.hidden) visible += 1;
                });
                const empty = document.getElementById("journeyEmptyState");
                if (empty) empty.hidden = visible > 0;
            }
        });
        document.addEventListener(StudentManager.DATA_CHANGED_EVENT, () => {
            populateFilterOptions();
            renderBrowser();
            if (state.currentStudentId) {
                renderDetail();
            }
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && state.modalRoot.innerHTML) {
                closeModal();
            }
        });

        document.addEventListener("openJourneyQuickAdd", (event) => {
            const detail = event.detail || {};
            const studentId = detail.studentId || "";
            const collection = detail.collection || "";

            if (!studentId || !StudentManager.getStudent(studentId) || !collection) {
                App.showToast("This record could not be opened.", "error");
                return;
            }

            openJourneyForm(studentId, collection);
        });

        document.addEventListener("openStudentProfileTab", (event) => {
            const detail = event.detail || {};
            const studentId = detail.studentId || state.currentStudentId;
            const legacyTab = detail.tab || "overview";
            const tabMap = {
                myMomentum: "myMomentum",
                studentView: "myMomentum",
                overview: "myMomentum",
                today: "myMomentum",
                actions: "myMomentum",
                signals: "myMomentum",
                discovery: "student",
                student: "student",
                projects: "myMomentum",
                portfolio: "portfolio",
                work: "myMomentum",
                career: "internships",
                partners: "internships",
                internships: "internships",
                meetings: "history",
                plans: "history",
                observations: "history",
                timeline: "history",
                story: "history",
                history: "history",
                questions: "myMomentum",
                print: "print"
            };
            const tab = tabMap[legacyTab] || legacyTab;

            if (!studentId || !StudentManager.getStudent(studentId)) {
                return;
            }

            state.activeProfileTab = tab;
            renderDetail(studentId);

            if (
                detail.itemId &&
                ["currentProjects", "internships", "goals"].includes(detail.collection)
            ) {
                openJourneyView(
                    studentId,
                    detail.collection,
                    detail.itemId
                );
            }
        });

        populateFilterOptions();
        renderBrowser();
    }

    return Object.freeze({
        initialize,
        renderBrowser,
        renderDetail,
        openStudentForm,
        closeModal
    });
})();
