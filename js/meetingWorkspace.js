/*
==========================================================
Momentum
Meeting Workspace Module
Build v21.0.0
File: js/meetingWorkspace.js
==========================================================
*/

"use strict";

const MeetingWorkspace = (() => {
    const state = {
        content: null,
        activeStudentId: null,
        focus: "",
        projectId: ""
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

    function splitList(value) {
        return String(value || "")
            .split(/[\n,;]+/)
            .map((item) => item.trim())
            .filter(Boolean);
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

    function latestItems(items, limit = 3) {
        return [...items]
            .sort((a, b) =>
                new Date(b.updatedAt || b.createdAt || b.dueDate || 0) -
                new Date(a.updatedAt || a.createdAt || a.dueDate || 0)
            )
            .slice(0, limit);
    }

    function buildMeetingAgenda(student) {
        const agenda = [];
        const latest = latestCheckIn(student);

        const overdueFollowUps = student.journey.followUps.filter((item) =>
            item.status !== "completed" && item.status !== "archived" && !item.archived &&
            !item.completedAt &&
            item.dueDate &&
            DateUtils.isOverdue(item.dueDate)
        );

        if (overdueFollowUps.length) {
            agenda.push({
                tone: "danger",
                label: "Overdue next steps",
                detail: overdueFollowUps.slice(0, 3).map((item) => item.title || "Follow-up").join(", ")
            });
        }

        const activeProjects = student.journey.currentProjects.filter((item) =>
            item.status !== "completed" && item.status !== "archived" && !item.archived
        );

        if (!activeProjects.length) {
            agenda.push({
                tone: "warning",
                label: "Project support",
                detail: "Student does not currently have an active project."
            });
        } else {
            agenda.push({
                tone: "success",
                label: "Project check",
                detail: activeProjects.slice(0, 2).map((item) => item.title || "Project").join(", ")
            });
        }

        const activeInternships = student.journey.internships.filter((item) =>
            item.status === "active"
        );

        if (!activeInternships.length) {
            agenda.push({
                tone: "warning",
                label: "Internship exploration",
                detail: "Discuss internship interests, readiness, or next outreach."
            });
        } else {
            agenda.push({
                tone: "success",
                label: "Internship update",
                detail: activeInternships.slice(0, 2).map((item) => item.title || "Internship").join(", ")
            });
        }

        const matches = typeof OpportunityManager !== "undefined"
            ? OpportunityManager.getMatchesForStudent(student.id, 3)
            : [];

        if (matches.length) {
            agenda.push({
                tone: "info",
                label: "Matched opportunities",
                detail: matches.map((match) => match.opportunity.title).join(", ")
            });
        }

        if (latest && latest.nextSteps.length) {
            agenda.push({
                tone: "info",
                label: "Previous next steps",
                detail: latest.nextSteps.slice(0, 3).join(", ")
            });
        }

        if (student.profile.interests.length) {
            agenda.push({
                tone: "info",
                label: "Interests / Hobbies connection",
                detail: `Connect today's conversation to: ${student.profile.interests.slice(0, 4).join(", ")}`
            });
        } else {
            agenda.push({
                tone: "warning",
                label: "Interests / Hobbies discovery",
                detail: "Ask what the student enjoys, does for fun, is curious about, or wants to explore."
            });
        }

        if (latest && latest.mood) {
            agenda.push({
                tone: "info",
                label: "Recent mood",
                detail: MoodUtils.parse(latest.mood).join(", ")
            });
        }

        return agenda;
    }

    function renderMeetingAgenda(student) {
        const agenda = buildMeetingAgenda(student);

        if (!agenda.length) {
            return `<p class="empty-copy">No automatic agenda items yet.</p>`;
        }

        return `
            <div class="meeting-agenda-list">
                ${agenda.map((item) => `
                    <article class="meeting-agenda-item agenda-${escapeHtml(item.tone)}">
                        <strong>${escapeHtml(item.label)}</strong>
                        <p>${escapeHtml(item.detail)}</p>
                    </article>
                `).join("")}
            </div>
        `;
    }

    function priorSummary(student) {
        const checkIn = latestCheckIn(student);

        if (!checkIn) {
            return `
                <div class="meeting-empty-context">
                    <strong>No previous meeting recorded</strong>
                    <p>This will become the student's first dated meeting in Momentum.</p>
                </div>
            `;
        }

        return `
            <div class="previous-meeting-card">
                <div>
                    <p class="eyebrow">Previous meeting</p>
                    <h4>${escapeHtml(DateUtils.formatDateTime(
                        checkIn.meetingDate,
                        checkIn.meetingTime
                    ))}</h4>
                </div>
                <p>${escapeHtml(checkIn.summary || "No summary recorded.")}</p>
                ${checkIn.nextSteps.length ? `
                    <div class="tag-list">
                        ${checkIn.nextSteps.map((step) => `<span class="tag">${escapeHtml(step)}</span>`).join("")}
                    </div>
                ` : ""}
            </div>
        `;
    }

    function contextList(title, items) {
        return `
            <section class="meeting-context-card">
                <h4>${escapeHtml(title)}</h4>
                ${items.length ? `
                    <ul class="meeting-context-list">
                        ${items.map((item) => `
                            <li>
                                <strong>${escapeHtml(item.title || "Untitled")}</strong>
                                ${item.status ? `<span class="badge">${escapeHtml(item.status)}</span>` : ""}
                                ${item.dueDate ? `<p>Due ${escapeHtml(formatDate(item.dueDate))}</p>` : ""}
                            </li>
                        `).join("")}
                    </ul>
                ` : `<p class="empty-copy">Nothing added yet.</p>`}
            </section>
        `;
    }

    function renderWorkspace(studentId) {
        const student = StudentManager.getStudent(studentId);
        if (!student) {
            state.content.innerHTML = "";
            return;
        }

        state.activeStudentId = studentId;
        const today = DateUtils.today();
        const currentTime = DateUtils.nowTime();
        const activeProjects = student.journey.currentProjects.filter((item) =>
            item.status !== "completed" && item.status !== "archived" && !item.archived
        );
        const activeInternships = student.journey.internships.filter((item) =>
            item.status !== "completed" && item.status !== "archived" && !item.archived
        );
        const activeGoals = student.journey.goals.filter((item) =>
            item.status !== "completed" && item.status !== "archived" && !item.archived
        );

        state.content.innerHTML = `
            <div class="modal-backdrop meeting-modal-backdrop" data-modal-backdrop>
                <section class="modal meeting-profile-modal" role="dialog" aria-modal="true"
                    aria-labelledby="embeddedMeetingTitle">
                    <div class="modal-header minimal-meeting-header">
                        <div>
                            <h2 id="embeddedMeetingTitle">${escapeHtml(displayName(student))}</h2>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-embedded-meeting" aria-label="Close">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="meeting-workspace">
                <form id="meetingWorkspaceForm">
                    <input type="hidden" name="studentId" value="${escapeHtml(student.id)}">
                    <section class="meeting-v2-command">
                        <nav class="meeting-step-nav" aria-label="Meeting sections">
                            <button type="button" data-action="meeting-jump" data-target="meetingStepDetails">1 Details</button>
                            <button type="button" data-action="meeting-jump" data-target="meetingStepUpdates">2 Updates</button>
                            <button type="button" data-action="meeting-jump" data-target="meetingStepFollowthrough">3 Follow-Through</button>
                        </nav>
                        <div class="meeting-draft-status" data-meeting-draft-status>
                            Draft saves automatically
                        </div>
                    </section>

                    <section id="meetingStepDetails" class="meeting-form-section minimalist-meeting-form">
                        <div class="meeting-form-heading">
                            <div>
                                <p class="eyebrow">Student meeting</p>
                                <h3>One note. A few tags. Clear next steps.</h3>
                            </div>
                        </div>

                        <div class="form-grid">
                            <div class="form-field">
                                <label for="meetingDate">Date *</label>
                                <input id="meetingDate" name="meetingDate"
                                    type="date" required value="${today}">
                            </div>

                            <div class="form-field">
                                <label for="meetingTime">Time *</label>
                                <input id="meetingTime" name="meetingTime"
                                    type="time" required value="${currentTime}">
                            </div>

                            <div class="form-field full-width">
                                <label for="meetingSummary">Meeting note</label>
                                <textarea id="meetingSummary" name="summary"
                                    placeholder="What mattered in this conversation?"></textarea>
                            </div>

                            <div class="form-field full-width">
                                <label>Tag this note</label>
                                <div class="minimal-meeting-tags">
                                    ${[
                                        ["Project", "project"],
                                        ["Internship", "internship"],
                                        ["Goal", "goal"],
                                        ["Question", "question"],
                                        ["Other", "other"]
                                    ].map(([label, value]) => `
                                        <label>
                                            <input type="checkbox"
                                                name="meetingTopics"
                                                value="${value}">
                                            <span>${label}</span>
                                        </label>
                                    `).join("")}
                                </div>
                            </div>

                            <div class="form-field full-width">
                                <label>Student mood during this meeting (optional)</label>
                                <div class="mood-options">
                                    ${MoodUtils.renderCheckboxes("", "meetingMoods")}
                                </div>
                            </div>

                            <div class="form-field full-width">
                                <label for="meetingFollowUps">Next steps</label>
                                <textarea id="meetingFollowUps" name="followUps"
                                    placeholder="One next step per line"></textarea>
                            </div>

                            <div class="form-field">
                                <label for="meetingFollowUpOwner">Who?</label>
                                <select id="meetingFollowUpOwner" name="followUpAssignedTo">
                                    <option value="Student">Student</option>
                                    <option value="Advisor">Educator</option>
                                    <option value="Both">Both</option>
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="meetingFollowUpDate">Due date (optional)</label>
                                <input id="meetingFollowUpDate"
                                    name="followUpDueDate" type="date">
                            </div>

                            <div class="form-field">
                                <label for="nextMeetingDate">Next meeting (optional)</label>
                                <input id="nextMeetingDate"
                                    name="nextMeetingDate" type="date">
                            </div>

                            <input type="hidden" name="followUpPriority" value="Normal">
                            <input type="hidden" name="studentPromises" value="">
                            <input type="hidden" name="advisorPromises" value="">
                            <input type="hidden" name="promiseDueDate" value="">
                            <input type="hidden" name="projectUpdates" value="">
                            <input type="hidden" name="internshipUpdates" value="">
                            <input type="hidden" name="goalUpdates" value="">
                            <input type="hidden" name="newQuestions" value="">
                            <input type="hidden" name="otherNotes" value="">
                            <input type="hidden" name="conversationSeeds" value="">
                        </div>
                    </section>

                    <div class="meeting-submit-bar">
                        <div>
                            <strong>Finish meeting</strong>
                            <p>Saves the dated check-in and selected updates across Momentum.</p>
                        </div>
                        <button class="button button-primary" type="submit">Save Meeting</button>
                    </div>
                </form>
                        </div>
                    </div>
                </section>
            </div>
        `;
        document.body.style.overflow = "hidden";
        const meetingForm = document.getElementById("meetingWorkspaceForm");
        if (meetingForm) restoreMeetingDraft(meetingForm, studentId);
    }

    function printActionPlan(studentId, planId) {
        const student = StudentManager.getStudent(studentId);
        const plan = student
            ? student.journey.actionPlans.find((item) => item.id === planId)
            : null;

        if (!student || !plan) {
            App.showToast("Meeting action plan could not be opened.", "error");
            return;
        }

        const list = (items, emptyText) => items?.length
            ? `<ul>${items.map((item) =>
                `<li>${escapeHtml(item)}</li>`
            ).join("")}</ul>`
            : `<p class="muted">${escapeHtml(emptyText)}</p>`;

        const nextSteps = plan.followUps?.length
            ? plan.followUps.map((item) => `
                <div class="record">
                    <strong>${escapeHtml(item.title)}</strong>
                    <p class="muted">
                        ${escapeHtml(
                            item.assignedTo === "Advisor"
                                ? "Educator"
                                : (item.assignedTo || "Educator")
                        )}
                        ${item.dueDate
                            ? ` · Due ${escapeHtml(formatDate(item.dueDate))}`
                            : ""
                        }
                    </p>
                </div>
            `).join("")
            : `<p class="muted">No next steps recorded.</p>`;

        PrintManager.printHtml(
            `${displayName(student)} — Meeting Action Plan`,
            `
                <header>
                    <p>Momentum Meeting Action Plan</p>
                    <h1>${escapeHtml(displayName(student))}</h1>
                    <div class="meta">
                        <span>${escapeHtml(DateUtils.formatDateTime(
                            plan.meetingDate,
                            plan.meetingTime
                        ))}</span>
                        ${plan.nextMeetingDate
                            ? `<span>Next meeting: ${escapeHtml(
                                formatDate(plan.nextMeetingDate)
                            )}</span>`
                            : ""
                        }
                    </div>
                </header>

                <h2>Meeting Note</h2>
                <div class="record">
                    <p>${escapeHtml(plan.summary || "No note recorded.")}</p>
                </div>

                <div class="grid">
                    <div class="record">
                        <h2>Current Project</h2>
                        ${list(plan.currentProjects, "No active project.")}
                    </div>
                    <div class="record">
                        <h2>Current Internship</h2>
                        ${list(plan.currentInternships, "No active internship.")}
                    </div>
                </div>

                <h2>Goals</h2>
                <div class="record">
                    ${list(plan.goalsReviewed, "No goals reviewed.")}
                </div>

                <h2>Next Steps</h2>
                ${nextSteps}
            `,
            {
                orientation: "portrait",
                css: `
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 12px;
                    }
                    .record {
                        margin-bottom: 10px;
                        padding: 13px;
                        border: 1px solid var(--line);
                        border-left: 5px solid var(--purple);
                        border-radius: 9px;
                    }
                    .meta {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 14px;
                        color: var(--muted);
                    }
                `
            }
        );
    }

    function renderMeetingConfirmation(studentId, summary) {
        const student = StudentManager.getStudent(studentId);
        if (!student) {
            closeMeeting();
            return;
        }

        state.content.innerHTML = `
            <div class="modal-backdrop meeting-modal-backdrop">
                <section class="modal meeting-confirmation-modal" role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Meeting complete</p>
                            <h2>${escapeHtml(displayName(student))}</h2>
                            <p>The meeting and selected student updates were saved.</p>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div class="meeting-confirmation-grid">
                            <article><strong>1</strong><span>Meeting saved</span></article>
                            <article><strong>${summary.followUps}</strong><span>Next Steps created</span></article>
                            <article><strong>${summary.projectUpdates}</strong><span>Project updates</span></article>
                            <article><strong>${summary.internshipUpdates}</strong><span>Internship updates</span></article>
                            <article><strong>${summary.goalUpdates}</strong><span>Goal updates</span></article>
                            <article><strong>${summary.nextMeeting ? "Yes" : "No"}</strong><span>Next meeting scheduled</span></article>
                            <article><strong>1</strong><span>Action plan created</span></article>
                        </div>
                    </div>
                    <div class="meeting-action-plan-callout">
                        <div>
                            <p class="eyebrow">Ready to share</p>
                            <strong>Meeting Action Plan</strong>
                            <p>A one-page plan was saved to this student profile.</p>
                        </div>
                        <button class="button button-secondary" type="button"
                            data-action="print-confirmed-action-plan"
                            data-student-id="${escapeHtml(studentId)}"
                            data-plan-id="${escapeHtml(summary.planId)}">
                            Print / Save as PDF
                        </button>
                    </div>
                    <div class="modal-footer">
                        <button class="button button-secondary" type="button"
                            data-action="close-meeting-confirmation">Close</button>
                        <button class="button button-primary" type="button"
                            data-action="open-confirmed-student"
                            data-student-id="${escapeHtml(studentId)}"
                            data-plan-id="${escapeHtml(summary.planId)}">
                            Open Meeting Plans
                        </button>
                    </div>
                </section>
            </div>
        `;
    }

    function meetingDraftKey(studentId) {
        return `momentum.meetingDraft.${studentId}`;
    }

    function saveMeetingDraft(form) {
        const studentId = String(new FormData(form).get("studentId") || "");
        if (!studentId) return;
        const data = {};
        [...form.elements].forEach((field) => {
            if (!field.name || field.type === "file") return;
            if (field.type === "checkbox") {
                if (!Array.isArray(data[field.name])) data[field.name] = [];
                if (field.checked) data[field.name].push(field.value || "on");
            } else if (field.type !== "radio" || field.checked) {
                data[field.name] = field.value;
            }
        });
        localStorage.setItem(meetingDraftKey(studentId), JSON.stringify(data));
        const status = form.querySelector("[data-meeting-draft-status]");
        if (status) status.textContent = "Draft saved";
    }

    function restoreMeetingDraft(form, studentId) {
        let data;
        try { data = JSON.parse(localStorage.getItem(meetingDraftKey(studentId)) || "null"); }
        catch { data = null; }
        if (!data) return;
        Object.entries(data).forEach(([name, value]) => {
            [...form.querySelectorAll(`[name="${CSS.escape(name)}"]`)].forEach((field) => {
                if (field.type === "checkbox") {
                    field.checked = Array.isArray(value) && value.includes(field.value || "on");
                } else if (field.type === "radio") {
                    field.checked = field.value === value;
                } else {
                    field.value = value;
                }
            });
        });
        const status = form.querySelector("[data-meeting-draft-status]");
        if (status) status.textContent = "Draft restored";
    }

    function closeMeeting() {
        clearTimeout(state.draftTimer);
        state.activeStudentId = null;
        if (state.content) {
            state.content.innerHTML = "";
        }
        document.body.style.overflow = "";
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;

        if (target.dataset.action === "close-embedded-meeting" ||
            target.dataset.action === "close-meeting-confirmation") {
            closeMeeting();
        } else if (target.dataset.action === "print-confirmed-action-plan") {
            printActionPlan(
                target.dataset.studentId,
                target.dataset.planId
            );
        } else if (target.dataset.action === "meeting-jump") {
            document.getElementById(target.dataset.target || "")?.scrollIntoView({
                behavior: "smooth", block: "start"
            });
        } else if (target.dataset.action === "use-meeting-inquiry") {
            const textarea = document.getElementById("meetingQuestions");
            const question = target.dataset.question || "";
            if (textarea && question) {
                textarea.value = textarea.value.trim() ? `${textarea.value.trim()}\n${question}` : question;
                textarea.focus();
            }
        } else if (target.dataset.action === "open-confirmed-student") {
            const studentId = target.dataset.studentId;
            closeMeeting();
            document.dispatchEvent(new CustomEvent("viewStudent", {
                detail: { studentId }
            }));
            window.setTimeout(() => {
                document.dispatchEvent(new CustomEvent("openStudentProfileTab", {
                    detail: {
                        studentId,
                        tab: "plans",
                        itemId: target.dataset.planId
                    }
                }));
            }, 0);
        }
    }

    function handleSubmit(event) {
        if (event.target.id !== "meetingWorkspaceForm") return;

        event.preventDefault();
        const formData = new FormData(event.target);
        const studentId = String(formData.get("studentId") || "");
        const student = StudentManager.getStudent(studentId);

        if (!student) return;

        const projectUpdates = splitList(formData.get("projectUpdates"));
        const internshipUpdates = splitList(formData.get("internshipUpdates"));
        const existingProjectId = String(formData.get("existingProjectId") || "");
        const existingInternshipId = String(formData.get("existingInternshipId") || "");
        const partnerUpdates = splitList(formData.get("partnerUpdates"));
        const opportunityUpdates = splitList(formData.get("opportunityUpdates"));
        const interestUpdates = splitList(formData.get("interestUpdates"));
        const dreamJobUpdates = splitList(formData.get("dreamJobs"));
        const goalUpdates = splitList(formData.get("goalUpdates"));
        const existingGoalId = String(formData.get("existingGoalId") || "");
        const existingGoalProgressNote = String(
            formData.get("existingGoalProgressNote") || ""
        ).trim();
        const evidenceUpdates = splitList(formData.get("evidenceUpdates"));
        const conversationSeeds = splitList(formData.get("conversationSeeds"));
        const newQuestions = [
            ...splitList(formData.get("newQuestions")),
            ...conversationSeeds
        ];
        const meetingTopics = formData.getAll("meetingTopics").map(String);
        const meetingNote = String(formData.get("summary") || "").trim();

        if (meetingNote) {
            if (meetingTopics.includes("project")) projectUpdates.push(meetingNote);
            if (meetingTopics.includes("internship")) internshipUpdates.push(meetingNote);
            if (meetingTopics.includes("goal")) goalUpdates.push(meetingNote);
            if (meetingTopics.includes("question")) newQuestions.push(meetingNote);
        }
        const studentPromises = splitList(formData.get("studentPromises"));
        const advisorPromises = splitList(formData.get("advisorPromises"));
        const promiseDueDate = String(formData.get("promiseDueDate") || "");
        const nextSteps = splitList(formData.get("nextSteps"));
        const followUps = splitList(formData.get("followUps"));
        const nextMeetingDate = String(formData.get("nextMeetingDate") || "");

        if (interestUpdates.length) {
            const nextInterests = formData.get("replaceInterests")
                ? interestUpdates
                : [...new Set([...student.profile.interests, ...interestUpdates])];

            StudentManager.updateStudent(studentId, {
                profile: {
                    interests: nextInterests
                }
            });
        }

        if (dreamJobUpdates.length) {
            const nextDreamJobs = formData.get("replaceDreamJobs")
                ? dreamJobUpdates
                : [...new Set([...student.journey.dreamJobs, ...dreamJobUpdates])];

            StudentManager.updateStudent(studentId, {
                journey: {
                    dreamJobs: nextDreamJobs
                }
            });
        }

        const savedCheckIn = StudentManager.addCheckIn(studentId, {
            meetingDate: formData.get("meetingDate"),
            meetingTime: formData.get("meetingTime"),
            summary: formData.get("summary"),
            mood: MoodUtils.collectFromForm(
                formData,
                "meetingMoods",
                "meetingMoodCustom"
            ),
            projectUpdates,
            opportunityUpdates: [...opportunityUpdates, ...internshipUpdates, ...partnerUpdates],
            followUpUpdates: followUps,
            reflection: formData.get("otherNotes") || formData.get("reflection"),
            newQuestions,
            nextSteps,
            nextMeetingDate,
            meetingTopics
        });

        const meetingDate = String(formData.get("meetingDate") || DateUtils.today());
        const meetingTime = String(formData.get("meetingTime") || "");

        if (studentPromises.length || advisorPromises.length) {
            const refreshedStudent = StudentManager.getStudent(studentId);
            const existingPromises = refreshedStudent?.journey.promises || [];
            const createdAt = new Date().toISOString();
            const nextPromises = [
                ...existingPromises,
                ...studentPromises.map((title, index) => ({
                    id: `PRO-${Date.now().toString(36).toUpperCase()}-S${index}`,
                    title,
                    owner: "Student",
                    dueDate: promiseDueDate,
                    status: "open",
                    sourceMeetingId: savedCheckIn?.id || "",
                    notes: "",
                    createdAt,
                    updatedAt: createdAt
                })),
                ...advisorPromises.map((title, index) => ({
                    id: `PRO-${Date.now().toString(36).toUpperCase()}-A${index}`,
                    title,
                    owner: "Advisor",
                    dueDate: promiseDueDate,
                    status: "open",
                    sourceMeetingId: savedCheckIn?.id || "",
                    notes: "",
                    createdAt,
                    updatedAt: createdAt
                }))
            ];

            StudentManager.updateStudent(studentId, {
                journey: { promises: nextPromises }
            });
        }

        if (existingProjectId && projectUpdates.length) {
            const project = student.journey.currentProjects.find((item) => item.id === existingProjectId);
            if (project) {
                StudentManager.updateJourneyItem(studentId, "currentProjects", existingProjectId, {
                    activityLog: [
                        ...(project.activityLog || []),
                        ...projectUpdates.map((note, index) => ({
                            id: `UPD-${Date.now().toString(36).toUpperCase()}-P${index}`,
                            date: meetingDate,
                            time: meetingTime,
                            type: "Meeting note",
                            note,
                            nextStep: nextSteps[index] || "",
                            source: "Student meeting",
                            meetingId: savedCheckIn ? savedCheckIn.id : "",
                            createdAt: new Date().toISOString()
                        }))
                    ]
                });
            }
        }

        if (existingInternshipId && internshipUpdates.length) {
            const internship = student.journey.internships.find((item) => item.id === existingInternshipId);
            if (internship) {
                StudentManager.updateJourneyItem(studentId, "internships", existingInternshipId, {
                    activityLog: [
                        ...(internship.activityLog || []),
                        ...internshipUpdates.map((note, index) => ({
                            id: `UPD-${Date.now().toString(36).toUpperCase()}-I${index}`,
                            date: meetingDate,
                            time: meetingTime,
                            type: "Meeting note",
                            note,
                            nextStep: nextSteps[index] || "",
                            source: "Student meeting",
                            meetingId: savedCheckIn ? savedCheckIn.id : "",
                            createdAt: new Date().toISOString()
                        }))
                    ]
                });
            }
        }

        if (formData.get("createProjectItems")) {
            projectUpdates.forEach((title) => {
                StudentManager.addJourneyItem(studentId, "currentProjects", {
                    title,
                    status: "active",
                    description: "Added from meeting workspace"
                });
            });
        }

        if (formData.get("createInternshipItems")) {
            internshipUpdates.forEach((title) => {
                StudentManager.addJourneyItem(studentId, "internships", {
                    title,
                    status: "active",
                    description: "Added from meeting workspace"
                });
            });
        }

        if (existingGoalId) {
            const goal = student.journey.goals.find((item) => item.id === existingGoalId);

            if (goal && existingGoalProgressNote) {
                StudentManager.updateJourneyItem(
                    studentId,
                    "goals",
                    existingGoalId,
                    {
                        progressNotes: [
                            ...(goal.progressNotes || []),
                            `${DateUtils.formatDate(formData.get("meetingDate"))}: ${existingGoalProgressNote}`
                        ],
                        activityLog: [
                            ...(goal.activityLog || []),
                            {
                                id: `UPD-${Date.now().toString(36).toUpperCase()}-G`,
                                date: meetingDate,
                                time: meetingTime,
                                type: "Meeting note",
                                note: existingGoalProgressNote,
                                nextStep: nextSteps[0] || "",
                                source: "Student meeting",
                                meetingId: savedCheckIn ? savedCheckIn.id : "",
                                createdAt: new Date().toISOString()
                            }
                        ]
                    }
                );
            }
        }

        if (formData.get("createGoalItems")) {
            goalUpdates.forEach((title) => {
                StudentManager.addJourneyItem(studentId, "goals", {
                    title,
                    status: "active",
                    category: "Other",
                    description: "Added during student meeting"
                });
            });
        }

        if (formData.get("createEvidenceItems")) {
            evidenceUpdates.forEach((title) => {
                StudentManager.addJourneyItem(studentId, "evidence", {
                    title,
                    status: "active",
                    description: "Added from meeting workspace"
                });
            });
        }

        followUps.forEach((title) => {
            StudentManager.addJourneyItem(studentId, "followUps", {
                title,
                dueDate: formData.get("followUpDueDate"),
                status: "open",
                assignedTo: formData.get("followUpAssignedTo"),
                priority: formData.get("followUpPriority"),
                description: "Created during student meeting"
            });
        });

        if (formData.get("reflection")) {
            StudentManager.addJourneyItem(studentId, "reflections", {
                title: `Meeting reflection — ${formatDate(formData.get("meetingDate"))}`,
                description: formData.get("reflection"),
                status: "active"
            });
        }

        newQuestions.forEach((title) => {
            StudentManager.addJourneyItem(studentId, "newQuestions", {
                title,
                status: "active",
                description: "Added during student meeting"
            });
        });

        const refreshedStudent = StudentManager.getStudent(studentId);
        const activeTitles = (items) => items
            .filter((item) =>
                item.status !== "completed" &&
                item.status !== "archived" &&
                !item.archived &&
                !item.completedAt
            )
            .map((item) => item.title || "Untitled");

        const selectedGoalTitles = existingGoalId && refreshedStudent
            ? refreshedStudent.journey.goals
                .filter((item) => item.id === existingGoalId)
                .map((item) => item.title || "Goal")
            : [];

        const followUpRecords = followUps.map((title) => ({
            title,
            assignedTo: "Advisor",
            priority: "Normal",
            dueDate: ""
        }));

        const actionPlan = StudentManager.addActionPlan(studentId, {
            checkInId: savedCheckIn ? savedCheckIn.id : "",
            meetingDate,
            meetingTime,
            mood: savedCheckIn ? savedCheckIn.mood : "",
            summary: String(formData.get("summary") || ""),
            currentProjects: activeTitles(
                refreshedStudent ? refreshedStudent.journey.currentProjects : []
            ),
            currentInternships: activeTitles(
                refreshedStudent ? refreshedStudent.journey.internships : []
            ),
            goalsReviewed: [...new Set([
                ...selectedGoalTitles,
                ...goalUpdates
            ])],
            studentCommitments: nextSteps,
            advisorCommitments: followUps,
            followUps: followUpRecords,
            reflection: String(formData.get("reflection") || ""),
            nextMeetingDate
        });

        localStorage.removeItem(meetingDraftKey(studentId));
        closeMeeting();
        App.showToast(
            "Meeting saved. The printable action plan is in the student Print tab."
        );
    }

    function initialize() {
        state.content = document.getElementById("modalRoot");

        document.addEventListener("click", handleClick);
        document.addEventListener("input", (event) => {
            const form = event.target.closest("#meetingWorkspaceForm");
            if (!form) return;
            clearTimeout(state.draftTimer);
            state.draftTimer = setTimeout(() => saveMeetingDraft(form), 350);
        });
        document.addEventListener("change", (event) => {
            const form = event.target.closest("#meetingWorkspaceForm");
            if (form) saveMeetingDraft(form);
        });
        document.addEventListener("submit", handleSubmit);
        document.addEventListener("openStudentMeeting", (event) => {
            const studentId = event.detail && event.detail.studentId;
            if (studentId) {
                state.focus = String(event.detail.focus || "");
                state.projectId = String(event.detail.projectId || "");
                renderWorkspace(studentId);
            }
        });
    }

    return Object.freeze({
        initialize,
        openMeeting: renderWorkspace,
        renderWorkspace
    });
})();
