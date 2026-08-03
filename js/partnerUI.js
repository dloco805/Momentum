/*
==========================================================
Momentum
Partner UI Module
Build v21.0.0
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
        industryFilter: null,
        locationFilter: null,
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

    const MAPLE_ADDRESS = "4010 Jupiter Ave, Lompoc, CA 93436";

    function mapSearchUrl(partner) {
        const destination = [
            partner.organization,
            partner.location
        ].filter(Boolean).join(", ");
        return `https://www.google.com/maps/dir/?api=1&origin=${
            encodeURIComponent(MAPLE_ADDRESS)
        }&destination=${encodeURIComponent(destination || "Lompoc CA")}`;
    }

    function mapEmbedUrl(partner) {
        const destination = [
            partner.organization,
            partner.location
        ].filter(Boolean).join(", ");
        return `https://www.google.com/maps?saddr=${
            encodeURIComponent(MAPLE_ADDRESS)
        }&daddr=${encodeURIComponent(destination || "Lompoc CA")}&output=embed`;
    }

    function mapModal(partner) {
        return `
            <div class="modal-backdrop">
                <section class="modal business-map-modal" role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">From Maple High School</p>
                            <h2>${escapeHtml(partner.organization)}</h2>
                            <p>${escapeHtml(partner.location || "Lompoc, CA")}</p>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-partner-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="maple-map-key">
                            <strong>★ Maple High School</strong>
                            <span>${escapeHtml(MAPLE_ADDRESS)}</span>
                        </div>
                        <iframe title="Directions from Maple High School"
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"
                            src="${escapeHtml(mapEmbedUrl(partner))}">
                        </iframe>
                    </div>
                    <div class="modal-footer">
                        <button class="button button-secondary" type="button"
                            data-action="close-partner-modal">Close</button>
                        <a class="button button-primary"
                            href="${escapeHtml(mapSearchUrl(partner))}"
                            target="_blank" rel="noopener noreferrer">
                            Open Directions
                        </a>
                    </div>
                </section>
            </div>
        `;
    }

    function industryClass(industry) {
        const value = String(industry || "other").toLowerCase();
        if (value.includes("food")) return "business-tone-food";
        if (value.includes("retail")) return "business-tone-retail";
        if (value.includes("auto") || value.includes("transport"))
            return "business-tone-auto";
        if (value.includes("health")) return "business-tone-health";
        if (value.includes("government") || value.includes("public"))
            return "business-tone-government";
        if (value.includes("education")) return "business-tone-education";
        if (value.includes("trade") || value.includes("manufact") ||
            value.includes("energy")) return "business-tone-trades";
        if (value.includes("animal")) return "business-tone-animals";
        if (value.includes("art") || value.includes("culture"))
            return "business-tone-creative";
        if (value.includes("fitness") || value.includes("wellness"))
            return "business-tone-wellness";
        if (value.includes("aerospace")) return "business-tone-aerospace";
        if (value.includes("finance")) return "business-tone-finance";
        if (value.includes("hospitality")) return "business-tone-hospitality";
        if (value.includes("youth") || value.includes("community") ||
            value.includes("family") || value.includes("senior"))
            return "business-tone-nonprofit";
        return "business-tone-other";
    }

    function renderCompactPartner(partner) {
        return `
            <details class="business-directory-row ${industryClass(partner.industry)}">
                <summary>
                    <div>
                        <strong>${escapeHtml(partner.organization)}</strong>
                        <span>${escapeHtml(partner.location || "Lompoc, CA")}</span>
                    </div>
                    <span class="business-row-arrow">›</span>
                </summary>
                <div class="business-row-details">
                    ${partner.notes ? `<p>${escapeHtml(partner.notes)}</p>` : ""}
                    ${partner.services.length ? `
                        <div class="tag-list">
                            ${partner.services.slice(0, 6).map((service) =>
                                `<span class="tag">${escapeHtml(service)}</span>`
                            ).join("")}
                        </div>
                    ` : ""}
                    <div class="card-actions">
                        <button class="button button-primary button-small" type="button"
                            data-action="show-business-on-map"
                            data-partner-id="${escapeHtml(partner.id)}">
                            Show on Map
                        </button>
                        ${partner.website ? `
                            <a class="button button-secondary button-small"
                                href="${escapeHtml(partner.website)}"
                                target="_blank" rel="noopener noreferrer">Website</a>
                        ` : ""}
                        <button class="button button-secondary button-small" type="button"
                            data-action="assign-partner"
                            data-partner-id="${escapeHtml(partner.id)}">
                            Connect Student
                        </button>
                        <button class="button button-secondary button-small" type="button"
                            data-action="edit-partner"
                            data-partner-id="${escapeHtml(partner.id)}">Edit</button>
                    </div>
                </div>
            </details>
        `;
    }

    function populateIndustryFilter() {
        if (!state.industryFilter) return;
        const current = state.industryFilter.value;
        const industries = [...new Set(
            PartnerManager.getPartners()
                .map((item) => item.industry)
                .filter(Boolean)
        )].sort();

        state.industryFilter.innerHTML = `
            <option value="">All types</option>
            ${industries.map((industry) => `
                <option value="${escapeHtml(industry)}">${escapeHtml(industry)}</option>
            `).join("")}
        `;
        state.industryFilter.value = industries.includes(current) ? current : "";
    }

    function render() {
        const partners = PartnerManager.search(
            state.search.value,
            {
                type: state.typeFilter.value,
                industry: state.industryFilter?.value || "",
                location: state.locationFilter?.value || "",
                status: state.statusFilter.value
            }
        ).sort((a, b) =>
            (a.industry || "Other").localeCompare(b.industry || "Other") ||
            a.organization.localeCompare(b.organization)
        );

        state.count.textContent = `${partners.length} ${
            partners.length === 1 ? "place" : "places"
        }`;

        if (!partners.length) {
            state.browser.innerHTML = `
                <div class="empty-state">
                    <h3>No matching places</h3>
                    <p>Try food, retail, healthcare, nonprofit, aerospace, or government.</p>
                    <button class="button button-secondary" type="button"
                        data-action="clear-business-directory-filters">
                        Clear Filters
                    </button>
                </div>
            `;
            return;
        }

        const groups = partners.reduce((result, partner) => {
            const key = partner.industry || partner.type || "Other";
            (result[key] ||= []).push(partner);
            return result;
        }, {});

        state.browser.innerHTML = `
            <div class="business-directory-groups">
                ${Object.entries(groups).map(([industry, items]) => `
                    <section class="business-directory-group
                        ${industryClass(industry)}">
                        <div class="business-group-heading">
                            <h3>${escapeHtml(industry)}</h3>
                            <span>${items.length}</span>
                        </div>
                        <div class="business-directory-rows">
                            ${items.map(renderCompactPartner).join("")}
                        </div>
                    </section>
                `).join("")}
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
                                    ${["Career Interest","Current Internship","Project Connection","Visit / L2L","Potential Partner"].map((type) => `
                                        <option value="${type}">${type}</option>
                                    `).join("")}
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="partnerStatus">Status</label>
                                <select id="partnerStatus" name="status">
                                    ${["Interested","Planning","Active","Completed"].map((status) => `
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

        if (action === "load-lompoc-business-directory") {
            const count = PartnerManager.loadLompocBusinessDirectory();
            App.showToast(count
                ? `${count} Lompoc businesses added.`
                : "The Lompoc starter directory is already loaded."
            );
        } else if (action === "clear-business-directory-filters") {
            state.search.value = "";
            state.typeFilter.value = "";
            state.industryFilter.value = "";
            state.locationFilter.value = "";
            state.statusFilter.value = "active";
            render();
        } else if (action === "show-business-on-map") {
            const partner = PartnerManager.getPartner(partnerId);
            if (!partner) return;
            state.modalRoot.innerHTML = mapModal(partner);
            document.body.style.overflow = "hidden";
        } else if (action === "new-partner") {
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
        state.industryFilter = document.getElementById("partnerIndustryFilter");
        state.locationFilter = document.getElementById("partnerLocationFilter");
        state.statusFilter = document.getElementById("partnerStatusFilter");
        state.modalRoot = document.getElementById("modalRoot");

        state.search.addEventListener("input", render);
        state.typeFilter.addEventListener("change", render);
        state.industryFilter.addEventListener("change", render);
        state.locationFilter.addEventListener("change", render);
        state.statusFilter.addEventListener("change", render);
        document.addEventListener("click", handleClick);
        document.addEventListener("submit", handleSubmit);
        document.addEventListener(PartnerManager.DATA_CHANGED_EVENT, () => {
            populateTypeFilter();
            populateIndustryFilter();
            render();
        });

        populateTypeFilter();
        populateIndustryFilter();
        render();
    }

    return Object.freeze({
        initialize,
        render
    });
})();
