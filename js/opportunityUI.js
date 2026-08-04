/*
==========================================================
Momentum
Volunteer & Internship Opportunity UI
Build v23.1.0
File: js/opportunityUI.js
==========================================================
*/

"use strict";

const OpportunityUI = (() => {
    const TYPES = [
        { key: "Volunteer", icon: "♥", tone: "volunteer", description: "Community service and organization support" },
        { key: "Internship", icon: "▣", tone: "internship", description: "Structured, work-based learning" },
        { key: "Job Shadow", icon: "◉", tone: "shadow", description: "Observe a professional or workplace" },
        { key: "Mentorship", icon: "✦", tone: "mentorship", description: "Ongoing guidance from a community member" },
        { key: "Career Visit", icon: "➜", tone: "visit", description: "Tour, informational interview, or career conversation" },
        { key: "Workshop / Program", icon: "◆", tone: "program", description: "Training, events, camps, and short programs" },
        { key: "Employment", icon: "$", tone: "employment", description: "Paid jobs and hiring leads" },
        { key: "Career Exploration", icon: "⌕", tone: "exploration", description: "A research lead that still needs verification" },
        { key: "Other", icon: "○", tone: "other", description: "Other student-facing opportunities" }
    ];

    const state = {
        browser: null,
        count: null,
        summary: null,
        search: null,
        typeFilter: null,
        statusFilter: null,
        sortSelect: null,
        quickFilters: null,
        activeType: "",
        modalRoot: null,
        focusId: ""
    };

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function splitList(value) {
        return String(value || "")
            .split(/[\n,;]+/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function formatDate(value) {
        return DateUtils.formatDate(value, { fallback: "" });
    }

    function studentName(student) {
        return student.profile.preferredName ||
            `${student.profile.firstName} ${student.profile.lastName}`.trim() ||
            "Unnamed Student";
    }

    function typeInfo(itemOrType) {
        const raw = typeof itemOrType === "string"
            ? itemOrType
            : [itemOrType?.type, itemOrType?.title, itemOrType?.description, ...(itemOrType?.tags || [])].join(" ");
        const value = String(raw || "").toLowerCase();

        if (value.includes("volunteer") || value.includes("community service")) return TYPES[0];
        if (value.includes("intern")) return TYPES[1];
        if (value.includes("job shadow") || value.includes("observation")) return TYPES[2];
        if (value.includes("mentor")) return TYPES[3];
        if (value.includes("career visit") || value.includes("site visit") || value.includes("tour") || value.includes("informational")) return TYPES[4];
        if (value.includes("workshop") || value.includes("program") || value.includes("camp") || value.includes("event") || value.includes("certification") || value.includes("dual enrollment") || value.includes("competition")) return TYPES[5];
        if (value === "job" || value.includes("employment") || value.includes("hiring")) return TYPES[6];
        if (value.includes("local career") || value.includes("research") || value.includes("exploration")) return TYPES[7];
        return TYPES[8];
    }

    function partnerFor(item) {
        if (item.partnerId) {
            const direct = PartnerManager.getPartner(item.partnerId);
            if (direct) return direct;
        }
        const organization = String(item.organization || "").trim().toLowerCase();
        if (!organization) return null;
        return PartnerManager.getPartners().find((partner) =>
            partner.organization.toLowerCase() === organization
        ) || null;
    }

    function assignedStudentCount(opportunityId) {
        return StudentManager.getStudents({ includeArchived: false }).reduce((count, student) =>
            count + (student.journey.opportunityEngagements || [])
                .filter((item) => item.opportunityId === opportunityId).length,
        0);
    }

    function renderTypeSummary(items) {
        if (!state.summary) return;
        const active = items.filter((item) => !item.meta.archived);
        const counts = TYPES.slice(0, 8).map((type) => ({
            ...type,
            count: active.filter((item) => typeInfo(item).key === type.key).length
        })).filter((type) => type.count > 0);
        const assigned = active.reduce((count, item) => count + assignedStudentCount(item.id), 0);

        state.summary.innerHTML = `
            <article class="community-metric opportunity-metric-total"><span>Active Leads</span><strong>${active.length}</strong></article>
            <article class="community-metric opportunity-metric-volunteer"><span>Volunteer</span><strong>${active.filter((item) => typeInfo(item).key === "Volunteer").length}</strong></article>
            <article class="community-metric opportunity-metric-internship"><span>Internships</span><strong>${active.filter((item) => typeInfo(item).key === "Internship").length}</strong></article>
            <article class="community-metric opportunity-metric-assigned"><span>Student Assignments</span><strong>${assigned}</strong></article>
            ${counts.length > 4 ? `<p class="community-metric-note">Also tracking ${counts.slice(2).map((item) => `${item.count} ${escapeHtml(item.key.toLowerCase())}`).join(" · ")}</p>` : ""}
        `;
    }

    function populateTypeFilter() {
        if (!state.typeFilter) return;
        const current = state.typeFilter.value;
        state.typeFilter.innerHTML = `
            <option value="">All types</option>
            ${TYPES.map((type) => `<option value="${escapeHtml(type.key)}">${type.icon} ${escapeHtml(type.key)}</option>`).join("")}
        `;
        state.typeFilter.value = TYPES.some((type) => type.key === current) ? current : "";
    }

    function renderQuickFilters() {
        if (!state.quickFilters) return;
        const counts = new Map(TYPES.map((type) => [type.key, 0]));
        OpportunityManager.getOpportunities({ includeArchived: false }).forEach((item) => {
            const key = typeInfo(item).key;
            counts.set(key, (counts.get(key) || 0) + 1);
        });

        state.quickFilters.innerHTML = TYPES.slice(0, 8)
            .filter((type) => counts.get(type.key) > 0)
            .map((type) => `
                <button type="button" class="opportunity-quick-filter opportunity-tone-${type.tone} ${state.activeType === type.key ? "is-active" : ""}"
                    data-action="filter-opportunities-by-type" data-type="${escapeHtml(type.key)}">
                    <span aria-hidden="true">${type.icon}</span>${escapeHtml(type.key)} <b>${counts.get(type.key)}</b>
                </button>
            `).join("");
    }

    function sortItems(items) {
        const sort = state.sortSelect?.value || "type";
        const copy = [...items];
        if (sort === "name") return copy.sort((a, b) => a.title.localeCompare(b.title));
        if (sort === "organization") return copy.sort((a, b) => (a.organization || "").localeCompare(b.organization || "") || a.title.localeCompare(b.title));
        if (sort === "deadline") return copy.sort((a, b) => {
            const ad = a.deadline ? new Date(a.deadline).getTime() : Infinity;
            const bd = b.deadline ? new Date(b.deadline).getTime() : Infinity;
            return ad - bd;
        });
        if (sort === "relevance") return copy.sort((a, b) => String(b.meta.updatedAt || "").localeCompare(String(a.meta.updatedAt || "")));
        return copy.sort((a, b) => typeInfo(a).key.localeCompare(typeInfo(b).key) || (a.organization || "").localeCompare(b.organization || "") || a.title.localeCompare(b.title));
    }

    function renderOpportunityRow(item) {
        const info = typeInfo(item);
        const partner = partnerFor(item);
        const assignedCount = assignedStudentCount(item.id);
        const isPast = item.deadline && DateUtils.isOverdue(item.deadline);
        const isFocused = state.focusId === item.id;
        const details = [
            ["Schedule", item.schedule],
            ["Commitment", item.commitment],
            ["Age / eligibility", item.ageRequirements || item.eligibility],
            ["Transportation", item.transportation],
            ["Compensation", item.compensation],
            ["Available spaces", item.capacity],
            ["Contact", [item.contactName, item.contactEmail].filter(Boolean).join(" · ")]
        ].filter(([, value]) => value);

        return `
            <details class="community-opportunity-row opportunity-tone-${info.tone} ${item.meta.archived ? "is-archived" : ""} ${isFocused ? "is-focused" : ""}"
                data-opportunity-row="${escapeHtml(item.id)}" ${isFocused ? "open" : ""}>
                <summary>
                    <span class="opportunity-type-icon" aria-hidden="true">${info.icon}</span>
                    <div class="opportunity-row-copy">
                        <span class="opportunity-type-label">${escapeHtml(info.key)}</span>
                        <strong>${escapeHtml(item.title || "Untitled Opportunity")}</strong>
                        <small>${escapeHtml(item.organization || "Unlinked organization")}</small>
                    </div>
                    <div class="opportunity-row-badges">
                        ${item.verificationStatus ? `<span class="opportunity-verification-badge">${escapeHtml(item.verificationStatus)}</span>` : ""}
                        ${item.deadline ? `<span class="opportunity-deadline ${isPast ? "is-past" : ""}">${isPast ? "Past deadline" : formatDate(item.deadline)}</span>` : ""}
                        ${assignedCount ? `<span class="community-count-badge connection-badge">${assignedCount} ${assignedCount === 1 ? "student" : "students"}</span>` : ""}
                        <span class="community-row-arrow" aria-hidden="true">›</span>
                    </div>
                </summary>

                <div class="community-opportunity-details">
                    <div class="community-opportunity-main">
                        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}

                        ${details.length ? `
                            <div class="opportunity-practical-grid">
                                ${details.map(([label, value]) => `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join("")}
                            </div>
                        ` : ""}

                        ${item.applicationSteps?.length ? `
                            <div class="opportunity-application-steps">
                                <span class="community-detail-label">Application / outreach steps</span>
                                <ol>${item.applicationSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
                            </div>
                        ` : ""}

                        ${[...(item.interestAreas || []), ...(item.skills || []), ...(item.tags || [])].length ? `
                            <div class="community-detail-block">
                                <span class="community-detail-label">Student fit</span>
                                <div class="tag-list">
                                    ${[...new Set([...(item.interestAreas || []), ...(item.skills || []), ...(item.tags || [])])].slice(0, 12).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
                                </div>
                            </div>
                        ` : ""}
                    </div>

                    <aside class="community-opportunity-side">
                        <span class="community-category-badge opportunity-tone-${info.tone}">${info.icon} ${escapeHtml(info.key)}</span>
                        <p><strong>${escapeHtml(info.description)}</strong></p>
                        ${item.location ? `<p><span>Location</span><br>${escapeHtml(item.location)}</p>` : ""}
                        ${item.format ? `<p><span>Format</span><br>${escapeHtml(item.format)}</p>` : ""}
                    </aside>

                    <div class="card-actions community-opportunity-actions">
                        <button class="button button-primary button-small" type="button" data-action="assign-opportunity" data-opportunity-id="${escapeHtml(item.id)}">Assign Student</button>
                        ${partner ? `<button class="button button-secondary button-small" type="button" data-action="open-community-partner" data-partner-id="${escapeHtml(partner.id)}" data-organization="${escapeHtml(partner.organization)}">Open Organization</button>` : ""}
                        ${item.url ? `<a class="button button-secondary button-small" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Website</a>` : ""}
                        <button class="button button-secondary button-small" type="button" data-action="view-opportunity-matches" data-opportunity-id="${escapeHtml(item.id)}">Student Matches</button>
                        <button class="button button-secondary button-small" type="button" data-action="edit-opportunity" data-opportunity-id="${escapeHtml(item.id)}">Edit</button>
                        ${item.meta.archived ? `<button class="button button-secondary button-small" type="button" data-action="restore-opportunity" data-opportunity-id="${escapeHtml(item.id)}">Restore</button>` : `<button class="button button-secondary button-small" type="button" data-action="archive-opportunity" data-opportunity-id="${escapeHtml(item.id)}">Archive</button>`}
                    </div>
                </div>
            </details>
        `;
    }

    function render() {
        if (!state.browser || !state.search) return;

        const allItems = OpportunityManager.getOpportunities();
        renderTypeSummary(allItems);
        renderQuickFilters();

        let items = OpportunityManager.search(state.search.value.trim(), {
            status: state.statusFilter.value
        });

        const selectedType = state.activeType || state.typeFilter.value;
        if (selectedType) {
            items = items.filter((item) => typeInfo(item).key === selectedType);
        }

        items = sortItems(items);
        state.count.textContent = `${items.length} ${items.length === 1 ? "opportunity" : "opportunities"}`;

        if (!items.length) {
            state.browser.innerHTML = `
                <div class="empty-state community-empty-state">
                    <h3>No matching volunteer or internship leads</h3>
                    <p>Add a real opportunity or broaden the search. Curated local volunteer and internship leads are already included.</p>
                    <div class="card-actions">
                        <button class="button button-primary" type="button" data-action="new-opportunity">+ Opportunity</button>
                        <button class="button button-secondary" type="button" data-action="clear-opportunity-filters">Clear Filters</button>
                    </div>
                </div>
            `;
            return;
        }

        const grouped = new Map();
        items.forEach((item) => {
            const info = typeInfo(item);
            if (!grouped.has(info.key)) grouped.set(info.key, []);
            grouped.get(info.key).push(item);
        });

        const queryActive = Boolean(state.search.value.trim() || selectedType || state.focusId);
        state.browser.innerHTML = `
            <div class="community-opportunity-groups">
                ${TYPES.filter((type) => grouped.has(type.key)).map((type, index) => {
                    const groupItems = grouped.get(type.key);
                    return `
                        <details class="community-opportunity-group opportunity-tone-${type.tone}" ${queryActive || index < 2 ? "open" : ""}>
                            <summary>
                                <span class="opportunity-type-icon" aria-hidden="true">${type.icon}</span>
                                <div><strong>${escapeHtml(type.key)}</strong><small>${escapeHtml(type.description)}</small></div>
                                <span class="community-category-count">${groupItems.length}</span>
                                <span class="community-row-arrow" aria-hidden="true">›</span>
                            </summary>
                            <div class="community-opportunity-list">
                                ${groupItems.map(renderOpportunityRow).join("")}
                            </div>
                        </details>
                    `;
                }).join("")}
            </div>
        `;

        if (state.focusId) {
            requestAnimationFrame(() => {
                const row = state.browser.querySelector(`[data-opportunity-row="${CSS.escape(state.focusId)}"]`);
                row?.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => {
                    row?.classList.remove("is-focused");
                    state.focusId = "";
                }, 2400);
            });
        }
    }

    function formTemplate(item = null) {
        const editing = Boolean(item?.id);
        const value = item || {
            title: "", organization: "", partnerId: "", type: "Volunteer",
            location: "", format: "In person", deadline: "", url: "",
            description: "", eligibility: "", ageRequirements: "", schedule: "",
            commitment: "", transportation: "", compensation: "", capacity: "",
            contactName: "", contactEmail: "", verificationStatus: "Needs verification",
            applicationSteps: [], tags: [], interestAreas: [], gradeLevels: [], skills: []
        };
        const selectedType = typeInfo(value).key === "Other" && value.type
            ? value.type
            : typeInfo(value).key;
        const partners = PartnerManager.getPartners({ includeArchived: false });

        return `
            <div class="modal-backdrop">
                <section class="modal community-opportunity-modal" role="dialog" aria-modal="true" aria-labelledby="opportunityFormTitle">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">What a student can do</p>
                            <h2 id="opportunityFormTitle">${editing ? "Edit Opportunity" : "New Volunteer or Internship Opportunity"}</h2>
                            <p>Link the opportunity to an organization whenever possible so the directory stays clean.</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-opportunity-modal" aria-label="Close">×</button>
                    </div>

                    <form id="opportunityForm">
                        <div class="modal-body">
                            <input type="hidden" name="opportunityId" value="${escapeHtml(item?.id || "")}">
                            <div class="form-grid">
                                <div class="form-field full-width">
                                    <label for="opportunityTitle">Opportunity title *</label>
                                    <input id="opportunityTitle" name="title" required value="${escapeHtml(value.title)}" placeholder="Example: Weekend animal care volunteer">
                                </div>
                                <div class="form-field">
                                    <label for="opportunityPartnerId">Linked organization</label>
                                    <select id="opportunityPartnerId" name="partnerId">
                                        <option value="">Not linked yet</option>
                                        ${partners.map((partner) => `<option value="${escapeHtml(partner.id)}" data-name="${escapeHtml(partner.organization)}" data-location="${escapeHtml(partner.location)}" ${value.partnerId === partner.id ? "selected" : ""}>${escapeHtml(partner.organization)}</option>`).join("")}
                                    </select>
                                </div>
                                <div class="form-field">
                                    <label for="opportunityOrganization">Organization name</label>
                                    <input id="opportunityOrganization" name="organization" value="${escapeHtml(value.organization)}" list="communityOrganizationNames">
                                    <datalist id="communityOrganizationNames">${partners.map((partner) => `<option value="${escapeHtml(partner.organization)}"></option>`).join("")}</datalist>
                                </div>
                                <div class="form-field">
                                    <label for="opportunityType">Type</label>
                                    <select id="opportunityType" name="type">
                                        ${TYPES.slice(0, 8).map((type) => `<option value="${escapeHtml(type.key)}" ${selectedType === type.key ? "selected" : ""}>${type.icon} ${escapeHtml(type.key)}</option>`).join("")}
                                    </select>
                                </div>
                                <div class="form-field">
                                    <label for="opportunityVerificationStatus">Verification</label>
                                    <select id="opportunityVerificationStatus" name="verificationStatus">
                                        ${["Needs verification", "Verify availability", "Contacted", "Confirmed open", "Currently unavailable"].map((status) => `<option value="${status}" ${value.verificationStatus === status ? "selected" : ""}>${status}</option>`).join("")}
                                    </select>
                                </div>
                                <div class="form-field">
                                    <label for="opportunityLocation">Location</label>
                                    <input id="opportunityLocation" name="location" value="${escapeHtml(value.location)}">
                                </div>
                                <div class="form-field">
                                    <label for="opportunityFormat">Format</label>
                                    <select id="opportunityFormat" name="format">${["In person", "Online", "Hybrid"].map((format) => `<option value="${format}" ${value.format === format ? "selected" : ""}>${format}</option>`).join("")}</select>
                                </div>
                                <div class="form-field">
                                    <label for="opportunityDeadline">Deadline</label>
                                    <input id="opportunityDeadline" name="deadline" type="date" value="${escapeHtml(value.deadline)}">
                                </div>
                                <div class="form-field">
                                    <label for="opportunityUrl">Website / application</label>
                                    <input id="opportunityUrl" name="url" type="url" value="${escapeHtml(value.url)}">
                                </div>
                                <div class="form-field full-width">
                                    <label for="opportunityDescription">What would the student do?</label>
                                    <textarea id="opportunityDescription" name="description">${escapeHtml(value.description)}</textarea>
                                </div>
                                <div class="form-field">
                                    <label for="opportunityAgeRequirements">Age requirements</label>
                                    <input id="opportunityAgeRequirements" name="ageRequirements" value="${escapeHtml(value.ageRequirements)}">
                                </div>
                                <div class="form-field">
                                    <label for="opportunitySchedule">Schedule</label>
                                    <input id="opportunitySchedule" name="schedule" value="${escapeHtml(value.schedule)}" placeholder="After school, weekends, summer...">
                                </div>
                                <div class="form-field">
                                    <label for="opportunityCommitment">Time commitment</label>
                                    <input id="opportunityCommitment" name="commitment" value="${escapeHtml(value.commitment)}">
                                </div>
                                <div class="form-field">
                                    <label for="opportunityTransportation">Transportation</label>
                                    <input id="opportunityTransportation" name="transportation" value="${escapeHtml(value.transportation)}">
                                </div>
                                <div class="form-field">
                                    <label for="opportunityCompensation">Paid / unpaid</label>
                                    <input id="opportunityCompensation" name="compensation" value="${escapeHtml(value.compensation)}">
                                </div>
                                <div class="form-field">
                                    <label for="opportunityCapacity">Available spaces</label>
                                    <input id="opportunityCapacity" name="capacity" value="${escapeHtml(value.capacity)}">
                                </div>
                                <div class="form-field">
                                    <label for="opportunityContactName">Contact name</label>
                                    <input id="opportunityContactName" name="contactName" value="${escapeHtml(value.contactName)}">
                                </div>
                                <div class="form-field">
                                    <label for="opportunityContactEmail">Contact email</label>
                                    <input id="opportunityContactEmail" name="contactEmail" type="email" value="${escapeHtml(value.contactEmail)}">
                                </div>
                                <div class="form-field full-width">
                                    <label for="opportunityEligibility">Eligibility / important restrictions</label>
                                    <textarea id="opportunityEligibility" name="eligibility">${escapeHtml(value.eligibility)}</textarea>
                                </div>
                                <div class="form-field full-width">
                                    <label for="opportunityApplicationSteps">Application or outreach steps</label>
                                    <textarea id="opportunityApplicationSteps" name="applicationSteps" placeholder="One step per line">${escapeHtml((value.applicationSteps || []).join("\n"))}</textarea>
                                </div>
                                <div class="form-field">
                                    <label for="opportunityInterestAreas">Interest areas</label>
                                    <textarea id="opportunityInterestAreas" name="interestAreas">${escapeHtml((value.interestAreas || []).join(", "))}</textarea>
                                </div>
                                <div class="form-field">
                                    <label for="opportunitySkills">Skills</label>
                                    <textarea id="opportunitySkills" name="skills">${escapeHtml((value.skills || []).join(", "))}</textarea>
                                </div>
                                <div class="form-field">
                                    <label for="opportunityGrades">Grade levels</label>
                                    <textarea id="opportunityGrades" name="gradeLevels">${escapeHtml((value.gradeLevels || []).join(", "))}</textarea>
                                </div>
                                <div class="form-field">
                                    <label for="opportunityTags">Tags</label>
                                    <textarea id="opportunityTags" name="tags">${escapeHtml((value.tags || []).join(", "))}</textarea>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="button button-secondary" type="button" data-action="close-opportunity-modal">Cancel</button>
                            <button class="button button-primary" type="submit">${editing ? "Save Opportunity" : "Create Opportunity"}</button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function assignTemplate(opportunityId) {
        const opportunity = OpportunityManager.getOpportunity(opportunityId);
        const students = StudentManager.getStudents({ includeArchived: false })
            .sort((a, b) => studentName(a).localeCompare(studentName(b)));

        return `
            <div class="modal-backdrop">
                <section class="modal community-connect-modal" role="dialog" aria-modal="true" aria-labelledby="assignOpportunityTitle">
                    <div class="modal-header">
                        <div><p class="eyebrow">Assign opportunity</p><h2 id="assignOpportunityTitle">${escapeHtml(opportunity?.title || "Opportunity")}</h2><p>${escapeHtml(opportunity?.organization || "")}</p></div>
                        <button class="icon-button" type="button" data-action="close-opportunity-modal" aria-label="Close">×</button>
                    </div>
                    <form id="assignOpportunityForm">
                        <div class="modal-body">
                            <input type="hidden" name="opportunityId" value="${escapeHtml(opportunityId)}">
                            <fieldset class="community-student-picker">
                                <legend>Student *</legend>
                                ${students.length ? students.map((student) => {
                                    const assignments = (student.journey.opportunityEngagements || []).length;
                                    const interests = (student.profile.interests || []).slice(0, 3);
                                    return `<label class="community-student-choice"><input type="radio" name="studentId" value="${escapeHtml(student.id)}" required><span class="community-student-choice-main"><strong>${escapeHtml(studentName(student))}</strong><small>${escapeHtml(interests.join(" · ") || "No interests added")}</small></span><span class="community-student-context compact"><span><b>Opportunities</b>${assignments}</span><span><b>Next Steps</b>${(student.journey.followUps || []).filter((item) => String(item.status || "").toLowerCase() !== "completed").length}</span></span></label>`;
                                }).join("") : `<p class="empty-copy">Add a student before assigning an opportunity.</p>`}
                            </fieldset>
                            <div class="form-grid">
                                <div class="form-field"><label for="assignStatus">Status</label><select id="assignStatus" name="status">${["Interested", "Contacting", "Applied", "Scheduled", "Active", "Completed", "Not Available"].map((status) => `<option value="${status}">${status}</option>`).join("")}</select></div>
                                <div class="form-field"><label for="assignDueDate">Due date</label><input id="assignDueDate" name="dueDate" type="date"></div>
                                <div class="form-field full-width"><label for="assignNextStep">Next step</label><input id="assignNextStep" name="nextStep" placeholder="Example: Email the volunteer coordinator"></div>
                                <div class="form-field full-width"><label for="assignNotes">Notes</label><textarea id="assignNotes" name="notes"></textarea></div>
                            </div>
                        </div>
                        <div class="modal-footer"><button class="button button-secondary" type="button" data-action="close-opportunity-modal">Cancel</button><button class="button button-primary" type="submit" ${students.length ? "" : "disabled"}>Assign Opportunity</button></div>
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
        const matches = StudentManager.getStudents({ includeArchived: false })
            .map((student) => {
                const match = OpportunityManager.getMatchesForStudent(student.id, 100)
                    .find((item) => item.opportunity.id === opportunityId);
                return match ? { student, ...match } : null;
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score);

        return `
            <div class="modal-backdrop"><section class="modal modal-small" role="dialog" aria-modal="true" aria-labelledby="matchTitle">
                <div class="modal-header"><div><p class="eyebrow">Student fit</p><h2 id="matchTitle">Student Matches</h2><p>${escapeHtml(opportunity?.title || "Opportunity")}</p></div><button class="icon-button" type="button" data-action="close-opportunity-modal" aria-label="Close">×</button></div>
                <div class="modal-body">${matches.length ? `<div class="match-list">${matches.map(({ student, score, reasons, breakdown }) => `<div class="match-card enhanced-match-card"><div><strong>${escapeHtml(studentName(student))}</strong><p class="match-reasons">${escapeHtml(reasons.join(" · ") || breakdown.filter((item) => item.points > 0).map((item) => item.category).join(" · ") || "General eligibility match")}</p></div><span class="match-score">${escapeHtml(recommendationLabel(score))}</span></div>`).join("")}</div>` : `<p class="empty-copy">No student matches yet. Add student interests, projects, goals, and skills to improve matching.</p>`}</div>
                <div class="modal-footer"><button class="button button-primary" type="button" data-action="close-opportunity-modal">Done</button></div>
            </section></div>
        `;
    }

    function closeModal() {
        state.modalRoot.innerHTML = "";
        document.body.style.overflow = "";
    }

    function openModal(html) {
        state.modalRoot.innerHTML = html;
        document.body.style.overflow = "hidden";
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;
        const action = target.dataset.action;
        const id = target.dataset.opportunityId;

        if (action === "filter-opportunities-by-type") {
            const type = target.dataset.type || "";
            state.activeType = state.activeType === type ? "" : type;
            state.typeFilter.value = "";
            render();
        } else if (action === "clear-opportunity-filters") {
            state.search.value = "";
            state.typeFilter.value = "";
            state.statusFilter.value = "active";
            state.sortSelect.value = "type";
            state.activeType = "";
            state.focusId = "";
            render();
        } else if (action === "load-local-opportunity-library") {
            const count = OpportunityManager.loadLocalStarterLibrary();
            App.showToast(count ? `${count} starter opportunity leads added.` : "The starter opportunity leads are already loaded.");
        } else if (action === "new-opportunity") {
            openModal(formTemplate());
        } else if (action === "assign-opportunity") {
            openModal(assignTemplate(id));
        } else if (action === "edit-opportunity") {
            const item = OpportunityManager.getOpportunity(id);
            if (item) openModal(formTemplate(item));
        } else if (action === "archive-opportunity") {
            OpportunityManager.archiveOpportunity(id);
            App.showToast("Opportunity archived.");
        } else if (action === "restore-opportunity") {
            OpportunityManager.restoreOpportunity(id);
            App.showToast("Opportunity restored.");
        } else if (action === "view-opportunity-matches") {
            openModal(matchesTemplate(id));
        } else if (action === "close-opportunity-modal") {
            closeModal();
        }
    }

    function handleChange(event) {
        if (event.target.id !== "opportunityPartnerId") return;
        const option = event.target.selectedOptions[0];
        if (!option?.value) return;
        const organizationInput = document.getElementById("opportunityOrganization");
        const locationInput = document.getElementById("opportunityLocation");
        if (organizationInput) organizationInput.value = option.dataset.name || option.textContent.trim();
        if (locationInput && !locationInput.value) locationInput.value = option.dataset.location || "";
    }

    function handleSubmit(event) {
        if (event.target.id === "assignOpportunityForm") {
            event.preventDefault();
            const form = event.target;
            const formData = new FormData(form);
            const studentId = String(formData.get("studentId") || "").trim();
            const opportunityId = String(formData.get("opportunityId") || "").trim();
            const submitButton = form.querySelector('button[type="submit"]');

            if (!studentId) {
                App.showToast("Choose a student before assigning the opportunity.", "error");
                return;
            }

            const student = StudentManager.getStudent(studentId);
            const opportunity = OpportunityManager.getOpportunity(opportunityId);

            if (!student || !opportunity) {
                App.showToast("The student or opportunity could not be found.", "error");
                return;
            }

            const originalButtonText = submitButton?.textContent || "Assign Opportunity";
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Saving Assignment…";
            }

            try {
                const engagement = StudentManager.assignOpportunity(studentId, opportunityId, {
                    status: formData.get("status"),
                    nextStep: formData.get("nextStep"),
                    dueDate: formData.get("dueDate"),
                    notes: formData.get("notes")
                });

                const updatedStudent = StudentManager.getStudent(studentId);
                const wasSaved = Boolean(
                    engagement?.id &&
                    updatedStudent?.journey?.opportunityEngagements?.some((item) =>
                        item.id === engagement.id && item.opportunityId === opportunityId
                    )
                );

                if (!wasSaved) {
                    throw new Error("Momentum could not verify the opportunity assignment.");
                }

                if (typeof Storage !== "undefined" && typeof Storage.save === "function") {
                    Storage.save();
                }

                document.dispatchEvent(new CustomEvent("communityAssignmentChanged", {
                    detail: {
                        kind: "opportunity",
                        studentId,
                        opportunityId,
                        engagementId: engagement.id
                    }
                }));

                closeModal();
                App.showToast(`${opportunity.title} assigned to ${studentName(updatedStudent)}.`);
            } catch (error) {
                console.error("Momentum could not assign the opportunity to the student.", error);
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
                App.showToast(error.message || "Opportunity assignment could not be saved.", "error");
            }
            return;
        }

        if (event.target.id !== "opportunityForm") return;
        event.preventDefault();
        const formData = new FormData(event.target);
        const id = String(formData.get("opportunityId") || "");
        const payload = {
            title: formData.get("title"),
            organization: formData.get("organization"),
            partnerId: formData.get("partnerId"),
            type: formData.get("type"),
            location: formData.get("location"),
            format: formData.get("format"),
            deadline: formData.get("deadline"),
            url: formData.get("url"),
            description: formData.get("description"),
            eligibility: formData.get("eligibility"),
            ageRequirements: formData.get("ageRequirements"),
            schedule: formData.get("schedule"),
            commitment: formData.get("commitment"),
            transportation: formData.get("transportation"),
            compensation: formData.get("compensation"),
            capacity: formData.get("capacity"),
            contactName: formData.get("contactName"),
            contactEmail: formData.get("contactEmail"),
            verificationStatus: formData.get("verificationStatus"),
            applicationSteps: splitList(formData.get("applicationSteps")),
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

    function openForPartner(partnerId) {
        const partner = PartnerManager.getPartner(partnerId);
        if (!partner) return;
        openModal(formTemplate({
            partnerId: partner.id,
            organization: partner.organization,
            location: partner.location,
            title: "",
            type: "Volunteer",
            format: "In person",
            verificationStatus: "Needs verification",
            deadline: "", url: "", description: "", eligibility: "",
            ageRequirements: "", schedule: "", commitment: "", transportation: "",
            compensation: "", capacity: "", contactName: partner.contactName || "",
            contactEmail: partner.email || "", applicationSteps: [], tags: [],
            interestAreas: [], gradeLevels: [], skills: []
        }));
    }

    function focusOpportunity(id) {
        const item = OpportunityManager.getOpportunity(id);
        if (!item) return;
        state.search.value = item.title;
        state.typeFilter.value = "";
        state.activeType = "";
        state.statusFilter.value = "all";
        state.focusId = item.id;
        render();
    }

    function initialize() {
        state.browser = document.getElementById("opportunityBrowser");
        state.count = document.getElementById("opportunityCountText");
        state.summary = document.getElementById("opportunityTypeSummary");
        state.search = document.getElementById("opportunitySearchInput");
        state.typeFilter = document.getElementById("opportunityTypeFilter");
        state.statusFilter = document.getElementById("opportunityStatusFilter");
        state.sortSelect = document.getElementById("opportunitySortSelect");
        state.quickFilters = document.getElementById("opportunityQuickFilters");
        state.modalRoot = document.getElementById("modalRoot");
        if (!state.browser) return;

        state.search.addEventListener("input", render);
        state.typeFilter.addEventListener("change", () => { state.activeType = ""; render(); });
        state.statusFilter.addEventListener("change", render);
        state.sortSelect.addEventListener("change", render);
        document.addEventListener("click", handleClick);
        document.addEventListener("change", handleChange);
        document.addEventListener("submit", handleSubmit);
        document.addEventListener(OpportunityManager.DATA_CHANGED_EVENT, render);
        document.addEventListener(PartnerManager.DATA_CHANGED_EVENT, render);
        document.addEventListener("studentDataChanged", render);

        populateTypeFilter();
        render();
    }

    return Object.freeze({
        initialize,
        render,
        openForPartner,
        focusOpportunity
    });
})();
