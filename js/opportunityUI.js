/*
==========================================================
Momentum
Opportunity UI Module
Build v21.0.0
File: js/opportunityUI.js
==========================================================
*/

"use strict";

const OpportunityUI = (() => {
    const state = {
        browser: null,
        count: null,
        search: null,
        typeFilter: null,
        statusFilter: null,
        sortSelect: null,
        quickFilters: null,
        activeTopic: "",
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

    function formatDate(value) {
        return DateUtils.formatDate(value, { fallback: "No deadline" });
    }

    function splitList(value) {
        return String(value || "")
            .split(/[\n,;]+/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function renderCard(item) {
        const isPast = item.deadline && DateUtils.isOverdue(item.deadline);
        const fit = [
            ...(item.interestAreas || []),
            ...(item.skills || []),
            ...(item.tags || [])
        ].filter(Boolean).slice(0, 5);

        return `
            <article class="opportunity-card opportunity-directory-card
                ${item.meta.archived ? "is-archived" : ""}">
                <div class="opportunity-card-header">
                    <div>
                        <span class="opportunity-type-label">
                            ${escapeHtml(item.type || "Opportunity")}
                        </span>
                        <h3>${escapeHtml(item.type === "Local Career Area"
                            ? (item.organization || item.title)
                            : (item.title || "Untitled Opportunity"))}</h3>
                        <p class="opportunity-org">${escapeHtml(item.type === "Local Career Area"
                            ? item.title : (item.organization || ""))}</p>
                    </div>
                    ${item.deadline ? `
                        <span class="opportunity-deadline ${isPast ? "is-past" : ""}">
                            ${isPast ? "Past deadline" : formatDate(item.deadline)}
                        </span>
                    ` : ""}
                </div>

                ${item.description ? `
                    <p class="opportunity-description">
                        ${escapeHtml(item.description)}
                    </p>
                ` : ""}

                ${fit.length ? `
                    <div class="opportunity-fit">
                        <span>Good fit for</span>
                        <div class="tag-list">
                            ${fit.map((tag) =>
                                `<span class="tag">${escapeHtml(tag)}</span>`
                            ).join("")}
                        </div>
                    </div>
                ` : ""}

                <div class="opportunity-directory-meta">
                    ${item.location ? `<span>${escapeHtml(item.location)}</span>` : ""}
                    ${item.format ? `<span>${escapeHtml(item.format)}</span>` : ""}
                </div>

                <div class="card-actions">
                    ${item.url ? `
                        <a class="button button-primary button-small"
                            href="${escapeHtml(item.url)}"
                            target="_blank" rel="noopener noreferrer">
                            Learn More
                        </a>
                    ` : ""}
                    <button class="button button-secondary button-small" type="button"
                        data-action="assign-opportunity"
                        data-opportunity-id="${escapeHtml(item.id)}">
                        Assign
                    </button>
                    <button class="button button-secondary button-small" type="button"
                        data-action="view-opportunity-matches"
                        data-opportunity-id="${escapeHtml(item.id)}">
                        Student Matches
                    </button>                    <button class="button button-secondary button-small" type="button"
                        data-action="edit-opportunity" data-opportunity-id="${escapeHtml(item.id)}">Edit</button>
                    ${item.meta.archived ? `
                        <button class="button button-secondary button-small" type="button"
                            data-action="restore-opportunity" data-opportunity-id="${escapeHtml(item.id)}">Restore</button>
                    ` : `
                        <button class="button button-secondary button-small" type="button"
                            data-action="archive-opportunity" data-opportunity-id="${escapeHtml(item.id)}">Archive</button>
                    `}
                </div>
            </article>
        `;
    }

    function populateTypeFilter() {
        const current = state.typeFilter.value;
        const types = [...new Set(
            OpportunityManager.getOpportunities().map((item) => item.type).filter(Boolean)
        )].sort();

        state.typeFilter.innerHTML = `
            <option value="">All opportunity types</option>
            ${types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}
        `;
        state.typeFilter.value = types.includes(current) ? current : "";
    }

    function opportunityTopics() {
        const preferred = [
            "Business", "Creative Arts", "Healthcare", "Trades",
            "Technology", "Public Service", "Food", "Animals",
            "Education", "Outdoors"
        ];

        const allText = OpportunityManager.getOpportunities({ includeArchived: false })
            .flatMap((item) => [
                item.type,
                ...(item.interestAreas || []),
                ...(item.tags || []),
                ...(item.skills || [])
            ])
            .map((value) => String(value || "").trim())
            .filter(Boolean);

        return preferred.filter((topic) =>
            allText.some((value) =>
                value.toLowerCase().includes(topic.toLowerCase()) ||
                topic.toLowerCase().includes(value.toLowerCase())
            )
        );
    }

    function renderQuickFilters() {
        if (!state.quickFilters) return;
        state.quickFilters.innerHTML = opportunityTopics().map((topic) => `
            <button type="button"
                class="opportunity-quick-filter
                    ${state.activeTopic === topic ? "is-active" : ""}"
                data-action="filter-opportunities-by-topic"
                data-topic="${escapeHtml(topic)}">
                ${escapeHtml(topic)}
            </button>
        `).join("");
    }

    function sortItems(items) {
        const sort = state.sortSelect?.value || "relevance";
        const copy = [...items];

        if (sort === "name") {
            return copy.sort((a, b) => a.title.localeCompare(b.title));
        }
        if (sort === "organization") {
            return copy.sort((a, b) =>
                (a.organization || "").localeCompare(b.organization || "")
            );
        }
        if (sort === "type") {
            return copy.sort((a, b) =>
                (a.type || "").localeCompare(b.type || "") ||
                (a.title || "").localeCompare(b.title || "")
            );
        }
        if (sort === "deadline") {
            return copy.sort((a, b) => {
                const ad = a.deadline ? new Date(a.deadline).getTime() : Infinity;
                const bd = b.deadline ? new Date(b.deadline).getTime() : Infinity;
                return ad - bd;
            });
        }
        return copy;
    }

    function render() {
        const combinedQuery = [
            state.search.value.trim(),
            state.activeTopic
        ].filter(Boolean).join(" ");

        let items = OpportunityManager.search(
            combinedQuery,
            {
                type: state.typeFilter.value,
                status: state.statusFilter.value
            }
        );

        items = sortItems(items);
        renderQuickFilters();

        state.count.textContent = `${items.length} ${
            items.length === 1 ? "result" : "results"
        }`;

        if (!items.length) {
            state.browser.innerHTML = `
                <div class="empty-state">
                    <h3>No matching opportunities</h3>
                    <p>
                        Try a broader word such as art, business, healthcare,
                        welding, animals, technology, or college.
                    </p>
                    <button class="button button-secondary" type="button"
                        data-action="clear-opportunity-filters">
                        Clear Filters
                    </button>
                </div>
            `;
            return;
        }

        const groups = items.reduce((result, item) => {
            const key = item.type || "Other";
            (result[key] ||= []).push(item);
            return result;
        }, {});

        state.browser.innerHTML = `
            <div class="experience-directory-groups">
                ${Object.entries(groups).map(([type, groupItems]) => `
                    <section class="experience-directory-group">
                        <div class="experience-group-heading">
                            <h3>${escapeHtml(type)}</h3>
                            <span>${groupItems.length}</span>
                        </div>
                        <div class="opportunity-directory-grid">
                            ${groupItems.map(renderCard).join("")}
                        </div>
                    </section>
                `).join("")}
            </div>
        `;
    }

    function formTemplate(item = null) {
        const editing = Boolean(item);
        const value = item || {
            title: "",
            organization: "",
            type: "",
            location: "",
            format: "",
            deadline: "",
            url: "",
            description: "",
            eligibility: "",
            tags: [],
            interestAreas: [],
            gradeLevels: [],
            skills: []
        };

        return `
            <div class="modal-backdrop">
                <section class="modal" role="dialog" aria-modal="true" aria-labelledby="opportunityFormTitle">
                    <div class="modal-header">
                        <div>
                            <h2 id="opportunityFormTitle">${editing ? "Edit Opportunity" : "New Opportunity"}</h2>
                            <p>Add an opportunity that can be matched with students.</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-opportunity-modal" aria-label="Close">×</button>
                    </div>

                    <form id="opportunityForm">
                        <div class="modal-body">
                            <input type="hidden" name="opportunityId" value="${escapeHtml(item ? item.id : "")}">

                            <div class="form-grid">
                                <div class="form-field full-width">
                                    <label for="opportunityTitle">Opportunity title *</label>
                                    <input id="opportunityTitle" name="title" required value="${escapeHtml(value.title)}">
                                </div>

                                <div class="form-field">
                                    <label for="opportunityOrganization">Organization</label>
                                    <input id="opportunityOrganization" name="organization" value="${escapeHtml(value.organization)}">
                                </div>

                                <div class="form-field">
                                    <label for="opportunityType">Type</label>
                                    <select id="opportunityType" name="type">
                                        ${["Scholarship","Internship","Job","Summer Program","Certification","Dual Enrollment","Competition","Volunteer","Event","Other"].map((type) => `
                                            <option value="${type}" ${value.type === type ? "selected" : ""}>${type}</option>
                                        `).join("")}
                                    </select>
                                </div>

                                <div class="form-field">
                                    <label for="opportunityLocation">Location</label>
                                    <input id="opportunityLocation" name="location" value="${escapeHtml(value.location)}">
                                </div>

                                <div class="form-field">
                                    <label for="opportunityFormat">Format</label>
                                    <select id="opportunityFormat" name="format">
                                        ${["In person","Online","Hybrid"].map((format) => `
                                            <option value="${format}" ${value.format === format ? "selected" : ""}>${format}</option>
                                        `).join("")}
                                    </select>
                                </div>

                                <div class="form-field">
                                    <label for="opportunityDeadline">Deadline</label>
                                    <input id="opportunityDeadline" name="deadline" type="date" value="${escapeHtml(value.deadline)}">
                                </div>

                                <div class="form-field">
                                    <label for="opportunityUrl">Website</label>
                                    <input id="opportunityUrl" name="url" type="url" value="${escapeHtml(value.url)}">
                                </div>

                                <div class="form-field full-width">
                                    <label for="opportunityDescription">Description</label>
                                    <textarea id="opportunityDescription" name="description">${escapeHtml(value.description)}</textarea>
                                </div>

                                <div class="form-field full-width">
                                    <label for="opportunityEligibility">Eligibility</label>
                                    <textarea id="opportunityEligibility" name="eligibility">${escapeHtml(value.eligibility)}</textarea>
                                </div>

                                <div class="form-field">
                                    <label for="opportunityTags">Tags</label>
                                    <textarea id="opportunityTags" name="tags" placeholder="STEM, paid, local...">${escapeHtml(value.tags.join(", "))}</textarea>
                                </div>

                                <div class="form-field">
                                    <label for="opportunityInterestAreas">Interest areas</label>
                                    <textarea id="opportunityInterestAreas" name="interestAreas" placeholder="Engineering, art, healthcare...">${escapeHtml(value.interestAreas.join(", "))}</textarea>
                                </div>

                                <div class="form-field">
                                    <label for="opportunityGrades">Grade levels</label>
                                    <textarea id="opportunityGrades" name="gradeLevels" placeholder="9, 10, 11, 12">${escapeHtml(value.gradeLevels.join(", "))}</textarea>
                                </div>

                                <div class="form-field">
                                    <label for="opportunitySkills">Skills</label>
                                    <textarea id="opportunitySkills" name="skills" placeholder="Leadership, coding, writing...">${escapeHtml(value.skills.join(", "))}</textarea>
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button class="button button-secondary" type="button" data-action="close-opportunity-modal">Cancel</button>
                            <button class="button button-primary" type="submit">${editing ? "Save Changes" : "Create Opportunity"}</button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function assignTemplate(opportunityId) {
        const opportunity = OpportunityManager.getOpportunity(opportunityId);
        const students = StudentManager.getStudents({ includeArchived: false })
            .sort((a, b) => {
                const an = a.profile.preferredName ||
                    `${a.profile.firstName} ${a.profile.lastName}`;
                const bn = b.profile.preferredName ||
                    `${b.profile.firstName} ${b.profile.lastName}`;
                return an.localeCompare(bn);
            });

        return `
            <div class="modal-backdrop">
                <section class="modal modal-small" role="dialog" aria-modal="true" aria-labelledby="assignOpportunityTitle">
                    <div class="modal-header">
                        <div>
                            <h2 id="assignOpportunityTitle">Assign Opportunity</h2>
                            <p>${escapeHtml(opportunity ? opportunity.title : "Opportunity")}</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-opportunity-modal" aria-label="Close">×</button>
                    </div>

                    <form id="assignOpportunityForm">
                        <div class="modal-body">
                            <input type="hidden" name="opportunityId" value="${escapeHtml(opportunityId)}">

                            <div class="form-field">
                                <label for="assignStudentId">Student *</label>
                                <select id="assignStudentId" name="studentId" required>
                                    <option value="">Select a student</option>
                                    ${students.map((student) => `
                                        <option value="${escapeHtml(student.id)}">
                                            ${escapeHtml(student.profile.preferredName || `${student.profile.firstName} ${student.profile.lastName}`)}
                                        </option>
                                    `).join("")}
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="assignStatus">Status</label>
                                <select id="assignStatus" name="status">
                                    ${["Interested","Planning","Applied","Interviewing","Accepted","Declined"].map((status) => `
                                        <option value="${status}">${status}</option>
                                    `).join("")}
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="assignNextStep">Next step</label>
                                <input id="assignNextStep" name="nextStep" placeholder="Example: Complete application">
                            </div>

                            <div class="form-field">
                                <label for="assignDueDate">Due date</label>
                                <input id="assignDueDate" name="dueDate" type="date">
                            </div>

                            <div class="form-field">
                                <label for="assignNotes">Notes</label>
                                <textarea id="assignNotes" name="notes"></textarea>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button class="button button-secondary" type="button" data-action="close-opportunity-modal">Cancel</button>
                            <button class="button button-primary" type="submit">Assign Opportunity</button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function recommendationLabel(score) {
        if (score >= 75) return "Excellent Match";
        if (score >= 50) return "Strong Match";
        if (score >= 25) return "Worth Exploring";
        return "Stretch Opportunity";
    }

    function matchesTemplate(opportunityId) {
        const opportunity = OpportunityManager.getOpportunity(opportunityId);
        const students = StudentManager.getStudents({ includeArchived: false });
        const matches = students
            .map((student) => {
                const match = OpportunityManager.getMatchesForStudent(student.id, 100)
                    .find((item) => item.opportunity.id === opportunityId);
                return match ? { student, ...match } : null;
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score);

        return `
            <div class="modal-backdrop">
                <section class="modal modal-small" role="dialog" aria-modal="true" aria-labelledby="matchTitle">
                    <div class="modal-header">
                        <div>
                            <h2 id="matchTitle">Student Matches</h2>
                            <p>${escapeHtml(opportunity ? opportunity.title : "Opportunity")}</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-opportunity-modal" aria-label="Close">×</button>
                    </div>

                    <div class="modal-body">
                        ${matches.length ? `
                            <div class="match-list">
                                ${matches.map(({ student, score, reasons, breakdown }) => `
                                    <div class="match-card enhanced-match-card">
                                        <div>
                                            <strong>${escapeHtml(
                                                student.profile.preferredName ||
                                                `${student.profile.firstName} ${student.profile.lastName}`
                                            )}</strong>
                                            <p class="match-reasons">
                                                ${escapeHtml(
                                                    reasons.join(" · ") ||
                                                    breakdown
                                                        .filter((item) => item.points > 0)
                                                        .map((item) => item.category)
                                                        .join(" · ") ||
                                                    "General eligibility match"
                                                )}
                                            </p>
                                        </div>
                                        <span class="match-score">${escapeHtml(recommendationLabel(score))}</span>
                                    </div>
                                `).join("")}
                            </div>
                        ` : `
                            <p class="empty-copy">No student matches yet. Add student interests, dream jobs, project details, goals, and opportunity tags to improve matching.</p>
                        `}
                    </div>

                    <div class="modal-footer">
                        <button class="button button-primary" type="button" data-action="close-opportunity-modal">Done</button>
                    </div>
                </section>
            </div>
        `;
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
        const id = target.dataset.opportunityId;

        if (action === "filter-opportunities-by-topic") {
            const topic = target.dataset.topic || "";
            state.activeTopic = state.activeTopic === topic ? "" : topic;
            render();
        } else if (action === "clear-opportunity-filters") {
            state.search.value = "";
            state.typeFilter.value = "";
            state.statusFilter.value = "active";
            state.sortSelect.value = "relevance";
            state.activeTopic = "";
            render();
        } else if (action === "load-local-opportunity-library") {
            const count = OpportunityManager.loadLocalStarterLibrary();
            App.showToast(count
                ? `${count} Lompoc and Allan Hancock research leads added.`
                : "The local starter library is already loaded."
            );
        } else if (action === "new-opportunity") {
            state.modalRoot.innerHTML = formTemplate();
            document.body.style.overflow = "hidden";
        } else if (action === "assign-opportunity") {
            state.modalRoot.innerHTML = assignTemplate(id);
            document.body.style.overflow = "hidden";
        } else if (action === "edit-opportunity") {
            state.modalRoot.innerHTML = formTemplate(OpportunityManager.getOpportunity(id));
            document.body.style.overflow = "hidden";
        } else if (action === "archive-opportunity") {
            OpportunityManager.archiveOpportunity(id);
            App.showToast("Opportunity archived.");
        } else if (action === "restore-opportunity") {
            OpportunityManager.restoreOpportunity(id);
            App.showToast("Opportunity restored.");
        } else if (action === "view-opportunity-matches") {
            state.modalRoot.innerHTML = matchesTemplate(id);
            document.body.style.overflow = "hidden";
        } else if (action === "close-opportunity-modal") {
            closeModal();
        }
    }

    function handleSubmit(event) {
        if (event.target.id === "assignOpportunityForm") {
            event.preventDefault();
            const formData = new FormData(event.target);
            const studentId = String(formData.get("studentId") || "");
            const opportunityId = String(formData.get("opportunityId") || "");

            if (!studentId || !opportunityId) {
                return;
            }

            StudentManager.assignOpportunity(studentId, opportunityId, {
                status: formData.get("status"),
                nextStep: formData.get("nextStep"),
                dueDate: formData.get("dueDate"),
                notes: formData.get("notes")
            });

            closeModal();
            App.showToast("Opportunity assigned to student.");
            return;
        }

        if (event.target.id !== "opportunityForm") {
            return;
        }

        event.preventDefault();
        const formData = new FormData(event.target);
        const id = String(formData.get("opportunityId") || "");
        const payload = {
            title: formData.get("title"),
            organization: formData.get("organization"),
            type: formData.get("type"),
            location: formData.get("location"),
            format: formData.get("format"),
            deadline: formData.get("deadline"),
            url: formData.get("url"),
            description: formData.get("description"),
            eligibility: formData.get("eligibility"),
            tags: splitList(formData.get("tags")),
            interestAreas: splitList(formData.get("interestAreas")),
            gradeLevels: splitList(formData.get("gradeLevels")),
            skills: splitList(formData.get("skills"))
        };

        if (id) {
            OpportunityManager.updateOpportunity(id, payload);
            App.showToast("Opportunity updated.");
        } else {
            OpportunityManager.createOpportunity(payload);
            App.showToast("Opportunity created.");
        }

        closeModal();
    }

    function initialize() {
        state.browser = document.getElementById("opportunityBrowser");
        state.count = document.getElementById("opportunityCountText");
        state.search = document.getElementById("opportunitySearchInput");
        state.typeFilter = document.getElementById("opportunityTypeFilter");
        state.statusFilter = document.getElementById("opportunityStatusFilter");
        state.sortSelect = document.getElementById("opportunitySortSelect");
        state.quickFilters = document.getElementById("opportunityQuickFilters");
        state.modalRoot = document.getElementById("modalRoot");

        state.search.addEventListener("input", render);
        state.typeFilter.addEventListener("change", render);
        state.statusFilter.addEventListener("change", render);
        state.sortSelect.addEventListener("change", render);
        document.addEventListener("click", handleClick);
        document.addEventListener("submit", handleSubmit);
        document.addEventListener(OpportunityManager.DATA_CHANGED_EVENT, () => {
            populateTypeFilter();
            render();
        });

        populateTypeFilter();
        render();
    }

    return Object.freeze({
        initialize,
        render
    });
})();
