/*
==========================================================
Momentum
Partner UI Module
Build v19.0.0
File: js/partnerUI.js
==========================================================
*/

"use strict";

const PartnerUI = (() => {
    const state = {
        browser: null,
        count: null,
        search: null,
        typeFilter: null,
        statusFilter: null,
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

    function splitList(value) {
        return String(value || "")
            .split(/[\n,;]+/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function populateTypeFilter() {
        const current = state.typeFilter.value;
        const types = [...new Set(
            PartnerManager.getPartners().map((partner) => partner.type).filter(Boolean)
        )].sort();

        state.typeFilter.innerHTML = `
            <option value="">All partner types</option>
            ${types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}
        `;
        state.typeFilter.value = types.includes(current) ? current : "";
    }

    function renderCard(partner) {
        return `
            <article class="partner-card record-tone-partner ${partner.meta.archived ? "is-archived" : ""}">
                <div class="partner-card-header">
                    <div>
                        <h3>${escapeHtml(partner.organization || "Unnamed Partner")}</h3>
                        <p>${escapeHtml(partner.type)}${partner.industry ? ` · ${escapeHtml(partner.industry)}` : ""}</p>
                    </div>
                    ${partner.meta.archived ? `<span class="badge badge-warning">Archived</span>` : ""}
                </div>

                <div class="partner-contact-block">
                    <strong>${escapeHtml(partner.contactName || "No contact added")}</strong>
                    <p>${escapeHtml(partner.contactTitle || "")}</p>
                    <p>${escapeHtml(partner.email || "")}</p>
                    <p>${escapeHtml(partner.phone || "")}</p>
                </div>

                <div class="tag-list">
                    ${partner.services.slice(0, 4).map((service) => `
                        <span class="tag">${escapeHtml(service)}</span>
                    `).join("")}
                </div>

                <p class="opportunity-description">${escapeHtml(partner.notes || "No notes added.")}</p>

                <div class="card-actions">
                    <button class="button button-primary button-small" type="button"
                        data-action="assign-partner" data-partner-id="${escapeHtml(partner.id)}">
                        Assign
                    </button>
                    <button class="button button-secondary button-small" type="button"
                        data-action="edit-partner" data-partner-id="${escapeHtml(partner.id)}">
                        Edit
                    </button>
                    ${partner.meta.archived ? `
                        <button class="button button-secondary button-small" type="button"
                            data-action="restore-partner" data-partner-id="${escapeHtml(partner.id)}">
                            Restore
                        </button>
                    ` : `
                        <button class="button button-secondary button-small" type="button"
                            data-action="archive-partner" data-partner-id="${escapeHtml(partner.id)}">
                            Archive
                        </button>
                    `}
                </div>
            </article>
        `;
    }

    function render() {
        const partners = PartnerManager.search(
            state.search.value,
            {
                type: state.typeFilter.value,
                status: state.statusFilter.value
            }
        );

        state.count.textContent = `${partners.length} ${partners.length === 1 ? "Partner" : "Partners"}`;

        if (!partners.length) {
            state.browser.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon" aria-hidden="true">◎</div>
                    <h3>No community partners found</h3>
                    <p>Add employers, mentors, colleges, agencies, and internship sites.</p>
                    <button class="button button-primary" type="button" data-action="new-partner">
                        + New Partner
                    </button>
                </div>
            `;
            return;
        }

        state.browser.innerHTML = `
            <div class="partner-grid">
                ${partners.map(renderCard).join("")}
            </div>
        `;
    }

    function formTemplate(partner = null) {
        const editing = Boolean(partner);
        const value = partner || {
            organization: "",
            contactName: "",
            contactTitle: "",
            email: "",
            phone: "",
            website: "",
            type: "Community Organization",
            industry: "",
            location: "",
            services: [],
            opportunities: [],
            notes: ""
        };

        return `
            <div class="modal-backdrop">
                <section class="modal" role="dialog" aria-modal="true" aria-labelledby="partnerFormTitle">
                    <div class="modal-header">
                        <div>
                            <h2 id="partnerFormTitle">${editing ? "Edit Partner" : "New Community Partner"}</h2>
                            <p>Store contact information and the ways this partner can support students.</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-partner-modal" aria-label="Close">×</button>
                    </div>

                    <form id="partnerForm">
                        <div class="modal-body">
                            <input type="hidden" name="partnerId" value="${escapeHtml(partner ? partner.id : "")}">

                            <div class="form-grid">
                                <div class="form-field full-width">
                                    <label for="partnerOrganization">Organization *</label>
                                    <input id="partnerOrganization" name="organization" required value="${escapeHtml(value.organization)}">
                                </div>

                                <div class="form-field">
                                    <label for="partnerContactName">Contact name</label>
                                    <input id="partnerContactName" name="contactName" value="${escapeHtml(value.contactName)}">
                                </div>

                                <div class="form-field">
                                    <label for="partnerContactTitle">Contact title</label>
                                    <input id="partnerContactTitle" name="contactTitle" value="${escapeHtml(value.contactTitle)}">
                                </div>

                                <div class="form-field">
                                    <label for="partnerEmail">Email</label>
                                    <input id="partnerEmail" name="email" type="email" value="${escapeHtml(value.email)}">
                                </div>

                                <div class="form-field">
                                    <label for="partnerPhone">Phone</label>
                                    <input id="partnerPhone" name="phone" value="${escapeHtml(value.phone)}">
                                </div>

                                <div class="form-field">
                                    <label for="partnerWebsite">Website</label>
                                    <input id="partnerWebsite" name="website" type="url" value="${escapeHtml(value.website)}">
                                </div>

                                <div class="form-field">
                                    <label for="partnerType">Partner type</label>
                                    <select id="partnerType" name="type">
                                        ${["Employer","Internship Site","Mentor","College","Training Provider","Community Organization","Government Agency","Nonprofit","Other"].map((type) => `
                                            <option value="${type}" ${value.type === type ? "selected" : ""}>${type}</option>
                                        `).join("")}
                                    </select>
                                </div>

                                <div class="form-field">
                                    <label for="partnerIndustry">Industry</label>
                                    <input id="partnerIndustry" name="industry" value="${escapeHtml(value.industry)}">
                                </div>

                                <div class="form-field">
                                    <label for="partnerLocation">Location</label>
                                    <input id="partnerLocation" name="location" value="${escapeHtml(value.location)}">
                                </div>

                                <div class="form-field">
                                    <label for="partnerServices">Services</label>
                                    <textarea id="partnerServices" name="services" placeholder="Mentoring, internships, job shadows...">${escapeHtml(value.services.join(", "))}</textarea>
                                </div>

                                <div class="form-field">
                                    <label for="partnerOpportunities">Available opportunities</label>
                                    <textarea id="partnerOpportunities" name="opportunities" placeholder="One item per line">${escapeHtml(value.opportunities.join("\n"))}</textarea>
                                </div>

                                <div class="form-field full-width">
                                    <label for="partnerNotes">Notes</label>
                                    <textarea id="partnerNotes" name="notes">${escapeHtml(value.notes)}</textarea>
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button class="button button-secondary" type="button" data-action="close-partner-modal">Cancel</button>
                            <button class="button button-primary" type="submit">${editing ? "Save Changes" : "Create Partner"}</button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function assignTemplate(partnerId) {
        const partner = PartnerManager.getPartner(partnerId);
        const students = StudentManager.getStudents({ includeArchived: false });

        return `
            <div class="modal-backdrop">
                <section class="modal modal-small" role="dialog" aria-modal="true" aria-labelledby="assignPartnerTitle">
                    <div class="modal-header">
                        <div>
                            <h2 id="assignPartnerTitle">Assign Community Partner</h2>
                            <p>${escapeHtml(partner ? partner.organization : "Partner")}</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-partner-modal" aria-label="Close">×</button>
                    </div>

                    <form id="assignPartnerForm">
                        <div class="modal-body">
                            <input type="hidden" name="partnerId" value="${escapeHtml(partnerId)}">

                            <div class="form-field">
                                <label for="partnerStudentId">Student *</label>
                                <select id="partnerStudentId" name="studentId" required>
                                    <option value="">Select a student</option>
                                    ${students.map((student) => `
                                        <option value="${escapeHtml(student.id)}">
                                            ${escapeHtml(student.profile.preferredName || `${student.profile.firstName} ${student.profile.lastName}`)}
                                        </option>
                                    `).join("")}
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="relationshipType">Relationship type</label>
                                <select id="relationshipType" name="relationshipType">
                                    ${["Connection","Mentor","Internship","Job Shadow","Employer","College Contact","Training Provider","Support Agency"].map((type) => `
                                        <option value="${type}">${type}</option>
                                    `).join("")}
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="partnerStatus">Status</label>
                                <select id="partnerStatus" name="status">
                                    ${["Exploring","Contacted","Active","Completed","Paused"].map((status) => `
                                        <option value="${status}">${status}</option>
                                    `).join("")}
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="partnerStartDate">Start date</label>
                                <input id="partnerStartDate" name="startDate" type="date">
                            </div>

                            <div class="form-field">
                                <label for="partnerNextStep">Next step</label>
                                <input id="partnerNextStep" name="nextStep">
                            </div>

                            <div class="form-field">
                                <label for="partnerAssignmentNotes">Notes</label>
                                <textarea id="partnerAssignmentNotes" name="notes"></textarea>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button class="button button-secondary" type="button" data-action="close-partner-modal">Cancel</button>
                            <button class="button button-primary" type="submit">Assign Partner</button>
                        </div>
                    </form>
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
        const partnerId = target.dataset.partnerId;

        if (action === "new-partner") {
            state.modalRoot.innerHTML = formTemplate();
            document.body.style.overflow = "hidden";
        } else if (action === "edit-partner") {
            state.modalRoot.innerHTML = formTemplate(PartnerManager.getPartner(partnerId));
            document.body.style.overflow = "hidden";
        } else if (action === "assign-partner") {
            state.modalRoot.innerHTML = assignTemplate(partnerId);
            document.body.style.overflow = "hidden";
        } else if (action === "archive-partner") {
            PartnerManager.archivePartner(partnerId);
            App.showToast("Partner archived.");
        } else if (action === "restore-partner") {
            PartnerManager.restorePartner(partnerId);
            App.showToast("Partner restored.");
        } else if (action === "close-partner-modal") {
            closeModal();
        }
    }

    function handleSubmit(event) {
        if (event.target.id === "assignPartnerForm") {
            event.preventDefault();
            const formData = new FormData(event.target);

            StudentManager.assignPartner(
                String(formData.get("studentId") || ""),
                String(formData.get("partnerId") || ""),
                {
                    relationshipType: formData.get("relationshipType"),
                    status: formData.get("status"),
                    startDate: formData.get("startDate"),
                    nextStep: formData.get("nextStep"),
                    notes: formData.get("notes")
                }
            );

            closeModal();
            App.showToast("Community partner assigned to student.");
            return;
        }

        if (event.target.id !== "partnerForm") {
            return;
        }

        event.preventDefault();
        const formData = new FormData(event.target);
        const id = String(formData.get("partnerId") || "");
        const payload = {
            organization: formData.get("organization"),
            contactName: formData.get("contactName"),
            contactTitle: formData.get("contactTitle"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            website: formData.get("website"),
            type: formData.get("type"),
            industry: formData.get("industry"),
            location: formData.get("location"),
            services: splitList(formData.get("services")),
            opportunities: splitList(formData.get("opportunities")),
            notes: formData.get("notes")
        };

        if (id) {
            PartnerManager.updatePartner(id, payload);
            App.showToast("Partner updated.");
        } else {
            PartnerManager.createPartner(payload);
            App.showToast("Partner created.");
        }

        closeModal();
    }

    function initialize() {
        state.browser = document.getElementById("partnerBrowser");
        state.count = document.getElementById("partnerCountText");
        state.search = document.getElementById("partnerSearchInput");
        state.typeFilter = document.getElementById("partnerTypeFilter");
        state.statusFilter = document.getElementById("partnerStatusFilter");
        state.modalRoot = document.getElementById("modalRoot");

        state.search.addEventListener("input", render);
        state.typeFilter.addEventListener("change", render);
        state.statusFilter.addEventListener("change", render);
        document.addEventListener("click", handleClick);
        document.addEventListener("submit", handleSubmit);
        document.addEventListener(PartnerManager.DATA_CHANGED_EVENT, () => {
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
