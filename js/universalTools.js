/*
==========================================================
Momentum
Universal Search and Quick Add
Build v22.0.1
File: js/universalTools.js
==========================================================
*/

"use strict";

const UniversalTools = (() => {
    const state = {
        searchInput: null,
        searchPanel: null,
        modalRoot: null,
        quickAddOpen: false
    };

    const TYPE_META = {
        student: { label: "Student", icon: "S", tone: "student" },
        project: { label: "Project", icon: "P", tone: "project" },
        internship: { label: "Internship", icon: "I", tone: "internship" },
        goal: { label: "Goal", icon: "G", tone: "goal" },
        meeting: { label: "Check-In", icon: "C", tone: "meeting" },
        followup: { label: "Follow-Up", icon: "F", tone: "followup" },
        opportunity: { label: "Opportunity", icon: "O", tone: "opportunity" },
        partner: { label: "Partner", icon: "P", tone: "partner" }
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
        return (
            student.profile.preferredName ||
            [student.profile.firstName, student.profile.lastName]
                .filter(Boolean)
                .join(" ") ||
            "Unnamed Student"
        );
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function includesQuery(values, query) {
        return values
            .flat(Infinity)
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);
    }

    function collectStudentResults(query) {
        const results = [];

        StudentManager.getStudents({ includeArchived: true }).forEach((student) => {
            const studentName = displayName(student);
            const studentSearch = [
                studentName,
                student.profile.firstName,
                student.profile.lastName,
                student.profile.interests,
                student.profile.postSecondaryGoals,
                student.journey.dreamJobs
            ];

            if (includesQuery(studentSearch, query)) {
                results.push({
                    type: "student",
                    title: studentName,
                    subtitle: "Student Profile",
                    studentId: student.id,
                    tab: "overview"
                });
            }

            const collections = [
                ["currentProjects", "project", "projects"],
                ["internships", "internship", "career"],
                ["goals", "goal", "projects"],
                ["followUps", "followup", "meetings"]
            ];

            collections.forEach(([collection, type, tab]) => {
                (student.journey[collection] || []).forEach((item) => {
                    if (includesQuery([
                        item.title,
                        item.description,
                        item.organization,
                        item.projectQuestion,
                        item.nextSteps,
                        item.skills,
                        studentName
                    ], query)) {
                        results.push({
                            type,
                            title: item.title || TYPE_META[type].label,
                            subtitle: studentName,
                            studentId: student.id,
                            itemId: item.id,
                            collection,
                            tab
                        });
                    }
                });
            });

            (student.journey.checkIns || []).forEach((item) => {
                if (includesQuery([
                    item.summary,
                    item.mood,
                    item.nextSteps,
                    item.projectUpdates,
                    item.internshipUpdates,
                    studentName
                ], query)) {
                    results.push({
                        type: "meeting",
                        title: item.summary || "Student Check-In",
                        subtitle: `${studentName} · ${DateUtils.formatDateTime(
                            item.meetingDate,
                            item.meetingTime
                        )}`,
                        studentId: student.id,
                        tab: "meetings"
                    });
                }
            });
        });

        return results;
    }

    function collectCommunityResults(query) {
        const results = [];

        OpportunityManager.getOpportunities().forEach((item) => {
            if (includesQuery([
                item.title,
                item.organization,
                item.type,
                item.location,
                item.tags,
                item.interestAreas,
                item.skills,
                item.description
            ], query)) {
                results.push({
                    type: "opportunity",
                    title: item.title || "Opportunity",
                    subtitle: item.organization || item.type,
                    recordId: item.id
                });
            }
        });

        PartnerManager.getPartners().forEach((item) => {
            if (includesQuery([
                item.organization,
                item.contactName,
                item.type,
                item.industry,
                item.location,
                item.services,
                item.opportunities,
                item.notes
            ], query)) {
                results.push({
                    type: "partner",
                    title: item.organization || "Community Partner",
                    subtitle: item.industry || item.type,
                    recordId: item.id
                });
            }
        });

        return results;
    }

    function search(query) {
        const normalized = normalize(query);
        if (normalized.length < 2) {
            return [];
        }

        return [
            ...collectStudentResults(normalized),
            ...collectCommunityResults(normalized)
        ].slice(0, 40);
    }

    function renderSearchResults(query) {
        const results = search(query);

        if (normalize(query).length < 2) {
            state.searchPanel.innerHTML = "";
            state.searchPanel.hidden = true;
            return;
        }

        state.searchPanel.hidden = false;

        if (!results.length) {
            state.searchPanel.innerHTML = `
                <div class="universal-search-empty">
                    <strong>No results</strong>
                    <p>Try a student name, project, internship, goal, meeting, opportunity, or partner.</p>
                </div>
            `;
            return;
        }

        const grouped = results.reduce((groups, result) => {
            const label = TYPE_META[result.type].label;
            groups[label] ||= [];
            groups[label].push(result);
            return groups;
        }, {});

        state.searchPanel.innerHTML = Object.entries(grouped).map(([label, items]) => `
            <section class="universal-search-group">
                <h3>${escapeHtml(label)}</h3>
                ${items.map((item) => {
                    const meta = TYPE_META[item.type];
                    return `
                        <button class="universal-search-result type-${escapeHtml(meta.tone)}"
                            type="button"
                            data-action="open-universal-result"
                            data-result-type="${escapeHtml(item.type)}"
                            data-student-id="${escapeHtml(item.studentId || "")}"
                            data-profile-tab="${escapeHtml(item.tab || "")}"
                            data-collection="${escapeHtml(item.collection || "")}"
                            data-item-id="${escapeHtml(item.itemId || "")}"
                            data-record-id="${escapeHtml(item.recordId || "")}">
                            <span class="universal-result-icon">${escapeHtml(meta.icon)}</span>
                            <span>
                                <strong>${escapeHtml(item.title)}</strong>
                                <small>${escapeHtml(item.subtitle || meta.label)}</small>
                            </span>
                            <span class="universal-result-type">${escapeHtml(meta.label)}</span>
                        </button>
                    `;
                }).join("")}
            </section>
        `).join("");
    }

    function quickAddTemplate() {
        const actions = [
            ["student", "New Student", "Create a student profile"],
            ["meeting", "New Meeting", "Start a full student meeting"],
            ["checkin", "Quick Check-In", "Record a shorter check-in"],
            ["project", "New Project", "Add a project to a student"],
            ["internship", "New Internship", "Add an internship to a student"],
            ["goal", "New Goal", "Add a goal to a student"],
            ["followup", "New Follow-Up", "Create an action item"],
            ["opportunity", "New Opportunity", "Add to Community"],
            ["partner", "New Partner", "Add an organization or contact"]
        ];

        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal quick-add-modal" role="dialog" aria-modal="true"
                    aria-labelledby="quickAddTitle">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Universal quick add</p>
                            <h2 id="quickAddTitle">What would you like to add?</h2>
                            <p>Create common records without navigating to another page first.</p>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-universal-tools" aria-label="Close">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="quick-add-grid">
                            ${actions.map(([type, title, description]) => `
                                <button class="quick-add-card type-${escapeHtml(type)}"
                                    type="button"
                                    data-action="choose-quick-add"
                                    data-quick-add-type="${escapeHtml(type)}">
                                    <span class="quick-add-icon">${escapeHtml(
                                        TYPE_META[type]?.icon || "+"
                                    )}</span>
                                    <span>
                                        <strong>${escapeHtml(title)}</strong>
                                        <small>${escapeHtml(description)}</small>
                                    </span>
                                </button>
                            `).join("")}
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    function studentPickerTemplate(type) {
        const labels = {
            meeting: "Start Meeting",
            checkin: "Quick Check-In",
            project: "Add Project",
            internship: "Add Internship",
            goal: "Add Goal",
            followup: "Add Follow-Up"
        };

        const students = StudentManager.getStudents({
            includeArchived: false
        });

        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal modal-small" role="dialog" aria-modal="true"
                    aria-labelledby="quickStudentTitle">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Choose a student</p>
                            <h2 id="quickStudentTitle">${escapeHtml(labels[type])}</h2>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-universal-tools" aria-label="Close">×</button>
                    </div>
                    <div class="modal-body">
                        <label class="search-field quick-student-search">
                            <span aria-hidden="true">⌕</span>
                            <input id="quickStudentSearch" type="search"
                                placeholder="Search students" autocomplete="off">
                        </label>
                        <div class="quick-student-list" data-quick-add-type="${escapeHtml(type)}">
                            ${students.map((student) => `
                                <button type="button" class="quick-student-option"
                                    data-action="complete-quick-add"
                                    data-quick-add-type="${escapeHtml(type)}"
                                    data-student-id="${escapeHtml(student.id)}"
                                    data-search-name="${escapeHtml(displayName(student).toLowerCase())}">
                                    <span class="type-student quick-student-initial">
                                        ${escapeHtml(displayName(student).slice(0, 1).toUpperCase())}
                                    </span>
                                    <span>
                                        <strong>${escapeHtml(displayName(student))}</strong>
                                        <small>${escapeHtml(
                                            student.journey.dreamJobs[0] ||
                                            student.profile.interests.slice(0, 2).join(", ") ||
                                            "Student"
                                        )}</small>
                                    </span>
                                </button>
                            `).join("")}
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    function closeTools() {
        state.modalRoot.innerHTML = "";
        document.body.style.overflow = "";
        state.quickAddOpen = false;
    }

    function triggerDocumentAction(action) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.action = action;
        button.hidden = true;
        document.body.appendChild(button);
        button.click();
        button.remove();
    }

    function completeQuickAdd(type, studentId) {
        closeTools();

        if (type === "meeting") {
            document.dispatchEvent(new CustomEvent("openStudentMeeting", {
                detail: { studentId }
            }));
        } else if (type === "checkin") {
            CheckInCenter.openForm(studentId);
        } else {
            const collections = {
                project: "currentProjects",
                internship: "internships",
                goal: "goals",
                followup: "followUps"
            };

            document.dispatchEvent(new CustomEvent("openJourneyQuickAdd", {
                detail: {
                    studentId,
                    collection: collections[type]
                }
            }));
        }
    }

    function openResult(button) {
        const type = button.dataset.resultType;
        const studentId = button.dataset.studentId;

        state.searchInput.value = "";
        state.searchPanel.hidden = true;
        state.searchPanel.innerHTML = "";

        if (["student", "project", "internship", "goal", "meeting", "followup"].includes(type)) {
            document.dispatchEvent(new CustomEvent("viewStudent", {
                detail: { studentId }
            }));

            window.setTimeout(() => {
                document.dispatchEvent(new CustomEvent("openStudentProfileTab", {
                    detail: {
                        studentId,
                        tab: button.dataset.profileTab || "overview",
                        collection: button.dataset.collection || "",
                        itemId: button.dataset.itemId || ""
                    }
                }));
            }, 0);
            return;
        }

        const tab = type === "partner" ? "partners" : "opportunities";
        App.navigate("community", { communityTab: tab });

        window.setTimeout(() => {
            const input = document.getElementById(
                type === "partner"
                    ? "partnerSearchInput"
                    : "opportunitySearchInput"
            );

            if (input) {
                input.value = button.querySelector("strong")?.textContent || "";
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.focus();
            }
        }, 0);
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;

        const action = target.dataset.action;

        if (action === "toggle-universal-search") {
            state.searchInput.focus();
        } else if (action === "open-quick-add") {
            state.modalRoot.innerHTML = quickAddTemplate();
            document.body.style.overflow = "hidden";
            state.quickAddOpen = true;
        } else if (action === "close-universal-tools") {
            closeTools();
        } else if (action === "choose-quick-add") {
            const type = target.dataset.quickAddType;

            if (type === "student") {
                closeTools();
                StudentUI.openStudentForm();
            } else if (type === "opportunity") {
                closeTools();
                App.navigate("community", { communityTab: "opportunities" });
                window.setTimeout(() => triggerDocumentAction("new-opportunity"), 0);
            } else if (type === "partner") {
                closeTools();
                App.navigate("community", { communityTab: "partners" });
                window.setTimeout(() => triggerDocumentAction("new-partner"), 0);
            } else {
                state.modalRoot.innerHTML = studentPickerTemplate(type);
            }
        } else if (action === "complete-quick-add") {
            completeQuickAdd(
                target.dataset.quickAddType,
                target.dataset.studentId
            );
        } else if (action === "open-universal-result") {
            openResult(target);
        }
    }

    function handleInput(event) {
        if (event.target === state.searchInput) {
            renderSearchResults(event.target.value);
            return;
        }

        if (event.target.id === "quickStudentSearch") {
            const query = normalize(event.target.value);
            document.querySelectorAll(".quick-student-option").forEach((button) => {
                button.hidden = Boolean(query) &&
                    !button.dataset.searchName.includes(query);
            });
        }
    }

    function handleKeydown(event) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            state.searchInput.focus();
            state.searchInput.select();
        }

        if (event.key === "Escape") {
            state.searchPanel.hidden = true;
            if (state.quickAddOpen) {
                closeTools();
            }
        }
    }

    function handleOutsideClick(event) {
        if (
            state.searchPanel.hidden ||
            event.target.closest(".universal-search-shell")
        ) {
            return;
        }

        state.searchPanel.hidden = true;
    }

    function initialize() {
        state.searchInput = document.getElementById("universalSearchInput");
        state.searchPanel = document.getElementById("universalSearchResults");
        state.modalRoot = document.getElementById("modalRoot");

        state.searchInput.addEventListener("input", handleInput);
        state.searchInput.addEventListener("focus", () => {
            if (normalize(state.searchInput.value).length >= 2) {
                renderSearchResults(state.searchInput.value);
            }
        });

        document.addEventListener("input", handleInput);
        document.addEventListener("click", handleClick);
        document.addEventListener("click", handleOutsideClick);
        document.addEventListener("keydown", handleKeydown);
    }

    return Object.freeze({
        initialize
    });
})();
