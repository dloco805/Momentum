/*
==========================================================
Momentum
Community Directory UI
Build v23.6.0
File: js/partnerUI.js
==========================================================
*/

"use strict";

const PartnerUI = (() => {
    const CATEGORIES = [
        { key: "food", label: "Food & Drink", icon: "☕", description: "Restaurants, cafés, coffee shops, bakeries, catering, and food service" },
        { key: "markets", label: "Markets", icon: "▤", description: "Grocery stores, carnicerias, markets, and food retail" },
        { key: "retail", label: "Retail & Customer Service", icon: "▦", description: "Stores, sales, inventory, and customer experience" },
        { key: "health", label: "Healthcare", icon: "✚", description: "Medical, dental, public health, and patient support" },
        { key: "education", label: "Education & Training", icon: "▰", description: "Schools, colleges, libraries, and training providers" },
        { key: "government", label: "Government & Public Service", icon: "◆", description: "City, county, safety, transit, and public agencies" },
        { key: "nonprofit", label: "Nonprofits & Youth", icon: "♥", description: "Volunteer, family, youth, and community organizations" },
        { key: "creative", label: "Arts, Culture & Media", icon: "✦", description: "Museums, design, media, music, and creative work" },
        { key: "animals", label: "Animals & Veterinary", icon: "●", description: "Animal care, shelters, grooming, and veterinary work" },
        { key: "agriculture", label: "Agriculture & Environment", icon: "♧", description: "Farming, food production, land stewardship, and agricultural careers" },
        { key: "trades", label: "Trades, Manufacturing & Energy", icon: "⚙", description: "Skilled trades, production, utilities, and industry" },
        { key: "auto", label: "Automotive & Transportation", icon: "➜", description: "Vehicles, parts, transit, logistics, and mobility" },
        { key: "aerospace", label: "Aerospace & Technology", icon: "▲", description: "Space, engineering, computing, and mission support" },
        { key: "finance", label: "Business & Finance", icon: "$", description: "Banking, entrepreneurship, administration, and professional services" },
        { key: "hospitality", label: "Hospitality & Tourism", icon: "⌂", description: "Hotels, events, tourism, and visitor service" },
        { key: "wellness", label: "Wellness & Personal Care", icon: "◇", description: "Fitness, beauty, recreation, and personal services" },
        { key: "other", label: "Other Community Connections", icon: "○", description: "Organizations that cross several career areas" }
    ];

    const RELATIONSHIPS = [
        { value: "Internship", icon: "▣" },
        { value: "Volunteer", icon: "♥" },
        { value: "Job Shadow", icon: "◉" },
        { value: "Mentorship", icon: "✦" },
        { value: "Career Exploration", icon: "⌕" },
        { value: "Employment", icon: "$" },
        { value: "College", icon: "▰" },
        { value: "Project Partner", icon: "◆" }
    ];

    const state = {
        browser: null,
        count: null,
        summary: null,
        search: null,
        typeFilter: null,
        categoryFilter: null,
        locationFilter: null,
        statusFilter: null,
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

    function slug(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function categoryDefinition(key) {
        return CATEGORIES.find((category) => category.key === key) || CATEGORIES.at(-1);
    }

    function categoryFor(partner) {
        const explicit = String(partner.category || "").trim().toLowerCase();
        const explicitMatch = CATEGORIES.find((item) =>
            item.key === explicit || item.label.toLowerCase() === explicit
        );
        if (explicitMatch) return explicitMatch;

        const text = [
            partner.organization,
            partner.type,
            partner.industry,
            partner.subcategory,
            partner.notes,
            ...(partner.services || []),
            ...(partner.careerFields || []),
            ...(partner.studentSupport || [])
        ].join(" ").toLowerCase();

        const includesAny = (...terms) => terms.some((term) => text.includes(term));
        const industry = String(partner.industry || "").trim().toLowerCase();
        const industryCategories = {
            "food & drink": "food",
            "markets": "markets",
            "retail": "retail",
            "healthcare": "health",
            "community health": "health",
            "education": "education",
            "education & training": "education",
            "government": "government",
            "public safety": "government",
            "government & public service": "government",
            "public service": "government",
            "community services": "nonprofit",
            "food & community": "nonprofit",
            "youth & community": "nonprofit",
            "senior & community services": "nonprofit",
            "family & community services": "nonprofit",
            "human services": "nonprofit",
            "philanthropy": "nonprofit",
            "youth development": "nonprofit",
            "arts & culture": "creative",
            "arts & community": "creative",
            "media": "creative",
            "history & research": "creative",
            "animals": "animals",
            "animals & environment": "animals",
            "veterinary": "animals",
            "agriculture": "agriculture",
            "agriculture & production": "agriculture",
            "environmental & community": "agriculture",
            "manufacturing": "trades",
            "construction trades": "trades",
            "construction & landscaping": "trades",
            "skilled trades": "trades",
            "trades & home services": "trades",
            "energy & environment": "trades",
            "automotive": "auto",
            "transportation": "auto",
            "aerospace": "aerospace",
            "aviation & aerospace": "aerospace",
            "finance": "finance",
            "business services": "finance",
            "employment services": "finance",
            "real estate": "finance",
            "hospitality": "hospitality",
            "hospitality & tourism": "hospitality",
            "wine & hospitality": "hospitality",
            "events & community": "hospitality",
            "beauty & wellness": "wellness",
            "recreation": "wellness",
            "fitness & youth": "wellness"
        };

        if (industry === "technology") {
            return categoryDefinition(
                includesAny("retail", "sales", "customer service", "mobile devices", "wireless")
                    ? "retail"
                    : "aerospace"
            );
        }
        if (industryCategories[industry]) return categoryDefinition(industryCategories[industry]);

        if (includesAny("grocery", "supermarket", "carniceria", "carnicería", "meat market", "food market", "market & gas")) return categoryDefinition("markets");
        if (includesAny("restaurant", "café", "cafe", "coffee", "food", "boba", "tea", "pizza", "bakery", "baking", "sushi", "culinary", "catering")) return categoryDefinition("food");
        if (includesAny("hospital", "medical", "health", "dental", "pharmacy", "nursing", "public health")) return categoryDefinition("health");
        if (includesAny("school", "college", "education", "library", "training", "academy", "district")) return categoryDefinition("education");
        if (includesAny("city of", "county", "government", "police", "fire", "court", "postal", "public service", "transit")) return categoryDefinition("government");
        if (includesAny("nonprofit", "youth", "family service", "boys & girls", "community partners", "ymca", "pride", "empty bowls", "goodwill")) return categoryDefinition("nonprofit");
        if (includesAny("museum", "art", "culture", "media", "photography", "design", "music", "bookstore", "creative")) return categoryDefinition("creative");
        if (includesAny("animal", "veterinary", "dog", "pet")) return categoryDefinition("animals");
        if (includesAny("agriculture", "agricultural", "farm", "farming", "vineyard", "crop", "produce growing", "land stewardship")) return categoryDefinition("agriculture");
        if (includesAny("aerospace", "space", "engineering", "technology", "cyber", "vandenberg", "rgnext", "spacex")) return categoryDefinition("aerospace");
        if (includesAny("manufactur", "energy", "welding", "construction", "industrial", "mineral", "utilities", "tools", "hardware")) return categoryDefinition("trades");
        if (includesAny("auto", "vehicle", "transport", "taxi", "logistics", "truck")) return categoryDefinition("auto");
        if (includesAny("bank", "credit union", "finance", "financial", "business", "chamber", "accounting")) return categoryDefinition("finance");
        if (includesAny("hotel", "hospitality", "tourism", "inn", "events")) return categoryDefinition("hospitality");
        if (includesAny("salon", "spa", "fitness", "wellness", "recreation", "beauty")) return categoryDefinition("wellness");
        if (includesAny("retail", "store", "sales", "inventory", "customer service", "clothing", "grocery", "wireless")) return categoryDefinition("retail");
        return categoryDefinition("other");
    }

    function subcategoryFor(partner, category) {
        const explicit = String(partner.subcategory || "").trim();
        if (explicit) return explicit;

        const industry = String(partner.industry || "").trim();
        if (industry && industry.toLowerCase() !== category.label.toLowerCase()) {
            return industry;
        }

        const type = String(partner.type || "").trim();
        if (type && !["Business", "Community Organization", "Other"].includes(type)) {
            return type;
        }

        return category.label;
    }

    function organizedSubcategoryGroups(subcategories, category) {
        const entries = [...subcategories.entries()]
            .sort(([a], [b]) => a.localeCompare(b));
        const totalItems = entries.reduce((count, [, items]) => count + items.length, 0);

        // Food businesses and markets intentionally stay as two simple, flat
        // sections instead of being split into restaurant/café/store subgroups.
        if (["food", "markets"].includes(category.key)) return null;

        // Small categories are easier to scan as one list. Nested separators are
        // reserved for larger categories with multiple substantial groups.
        if (totalItems < 12) return null;

        const substantial = entries.filter(([, items]) => items.length >= 3);
        const substantialCount = substantial.reduce((count, [, items]) => count + items.length, 0);
        if (substantial.length < 2 || substantialCount / totalItems < 0.55) return null;

        const minorItems = entries
            .filter(([, items]) => items.length < 3)
            .flatMap(([, items]) => items);

        return minorItems.length
            ? [...substantial, [`More ${category.label}`, minorItems]]
            : substantial;
    }

    function partnerOpportunities(partner) {
        const name = String(partner.organization || "").trim().toLowerCase();
        return OpportunityManager.getOpportunities({ includeArchived: false })
            .filter((item) =>
                PartnerManager.resolvePartnerId(item.partnerId) === partner.id ||
                (name && String(item.organization || "").trim().toLowerCase() === name)
            );
    }

    function partnerConnections(partnerId) {
        return StudentManager.getStudents({ includeArchived: false }).reduce((count, student) =>
            count + (student.journey.partnerEngagements || [])
                .filter((item) => PartnerManager.resolvePartnerId(item.partnerId) === PartnerManager.resolvePartnerId(partnerId)).length,
        0);
    }

    function studentName(student) {
        return student.profile.preferredName ||
            `${student.profile.firstName} ${student.profile.lastName}`.trim() ||
            "Unnamed Student";
    }

    function currentProject(student) {
        const projects = student.journey.currentProjects || [];
        return projects.find((item) =>
            !["completed", "archived"].includes(String(item.status || "").toLowerCase())
        ) || projects[0] || null;
    }

    function currentInternship(student) {
        const internships = student.journey.internships || [];
        return internships.find((item) =>
            !["completed", "archived"].includes(String(item.status || "").toLowerCase())
        ) || internships[0] || null;
    }

    function openNextStepCount(student) {
        return (student.journey.followUps || []).filter((item) =>
            !["completed", "done", "closed"].includes(String(item.status || "").toLowerCase())
        ).length;
    }

    function mapSearchUrl(query) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }

    function populateTypeFilter() {
        if (!state.typeFilter) return;
        const current = state.typeFilter.value;
        const types = [...new Set(
            PartnerManager.getPartners().map((partner) => partner.type).filter(Boolean)
        )].sort();

        state.typeFilter.innerHTML = `
            <option value="">All organization types</option>
            ${types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}
        `;
        state.typeFilter.value = types.includes(current) ? current : "";
    }

    function populateCategoryFilter() {
        if (!state.categoryFilter) return;
        const current = state.categoryFilter.value;
        state.categoryFilter.innerHTML = `
            <option value="">All categories</option>
            ${CATEGORIES.map((category) => `
                <option value="${category.key}">${category.icon} ${escapeHtml(category.label)}</option>
            `).join("")}
        `;
        state.categoryFilter.value = CATEGORIES.some((item) => item.key === current)
            ? current
            : "";
    }

    function renderSummary(allPartners) {
        if (!state.summary) return;
        const activePartners = allPartners.filter((partner) => !partner.meta.archived);
        const categoryCount = new Set(activePartners.map((partner) => categoryFor(partner).key)).size;
        const opportunityCount = activePartners.reduce((count, partner) =>
            count + partnerOpportunities(partner).length,
        0);
        const connectionCount = activePartners.reduce((count, partner) =>
            count + partnerConnections(partner.id),
        0);

        state.summary.innerHTML = `
            <article class="community-metric community-metric-directory">
                <span>Organizations</span><strong>${activePartners.length}</strong>
            </article>
            <article class="community-metric community-metric-categories">
                <span>Categories</span><strong>${categoryCount}</strong>
            </article>
            <article class="community-metric community-metric-opportunities">
                <span>Linked Opportunities</span><strong>${opportunityCount}</strong>
            </article>
            <article class="community-metric community-metric-connections">
                <span>Student Connections</span><strong>${connectionCount}</strong>
            </article>
        `;
    }

    function renderOrganizationRow(partner, category) {
        const opportunities = partnerOpportunities(partner);
        const connections = partnerConnections(partner.id);
        const careerFields = (partner.careerFields?.length
            ? partner.careerFields
            : partner.services || []).slice(0, 8);
        const support = partner.studentSupport || [];
        const isFocused = state.focusId === partner.id;

        return `
            <details class="community-organization-row tone-${category.key} ${isFocused ? "is-focused" : ""}"
                data-organization-id="${escapeHtml(partner.id)}" ${isFocused ? "open" : ""}>
                <summary>
                    <span class="community-org-marker" aria-hidden="true">${category.icon}</span>
                    <div class="community-org-summary-copy">
                        <strong>${escapeHtml(partner.organization)}</strong>
                        <span>${escapeHtml(partner.location || "Lompoc, CA")}</span>
                    </div>
                    <div class="community-org-summary-badges">
                        ${opportunities.length ? `<span class="community-count-badge opportunity-badge">${opportunities.length} ${opportunities.length === 1 ? "opportunity" : "opportunities"}</span>` : ""}
                        ${connections ? `<span class="community-count-badge connection-badge">${connections} ${connections === 1 ? "student" : "students"}</span>` : ""}
                        <span class="community-row-arrow" aria-hidden="true">›</span>
                    </div>
                </summary>

                <div class="community-organization-details">
                    <div class="community-organization-main">
                        ${partner.notes ? `<p>${escapeHtml(partner.notes)}</p>` : `<p class="empty-copy">Add notes about the organization, contact, or student fit.</p>`}

                        ${careerFields.length ? `
                            <div class="community-detail-block">
                                <span class="community-detail-label">Career fields & services</span>
                                <div class="tag-list">
                                    ${careerFields.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}
                                </div>
                            </div>
                        ` : ""}

                        ${support.length ? `
                            <div class="community-detail-block">
                                <span class="community-detail-label">Student support</span>
                                <div class="tag-list">
                                    ${support.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}
                                </div>
                            </div>
                        ` : ""}

                        ${opportunities.length ? `
                            <div class="community-linked-opportunities">
                                <span class="community-detail-label">Linked opportunities</span>
                                ${opportunities.slice(0, 4).map((item) => `
                                    <button type="button" data-action="open-opportunity-from-directory"
                                        data-opportunity-id="${escapeHtml(item.id)}">
                                        <span class="opportunity-type-dot type-${slug(item.type)}"></span>
                                        <strong>${escapeHtml(item.title)}</strong>
                                        <small>${escapeHtml(item.type)}</small>
                                    </button>
                                `).join("")}
                            </div>
                        ` : ""}
                    </div>

                    <aside class="community-organization-contact">
                        <span class="community-category-badge tone-${category.key}">${category.icon} ${escapeHtml(category.label)}</span>
                        ${partner.contactName ? `<p><strong>${escapeHtml(partner.contactName)}</strong>${partner.contactTitle ? `<br><span>${escapeHtml(partner.contactTitle)}</span>` : ""}</p>` : ""}
                        ${partner.email ? `<a href="mailto:${escapeHtml(partner.email)}">${escapeHtml(partner.email)}</a>` : ""}
                        ${partner.phone ? `<a href="tel:${escapeHtml(partner.phone)}">${escapeHtml(partner.phone)}</a>` : ""}
                    </aside>

                    <div class="card-actions community-organization-actions">
                        <button class="button button-primary button-small" type="button"
                            data-action="assign-partner" data-partner-id="${escapeHtml(partner.id)}">
                            Connect Student
                        </button>
                        <a class="button button-secondary button-small"
                            href="${escapeHtml(mapSearchUrl([partner.organization, partner.location].filter(Boolean).join(", ") || "Lompoc CA"))}"
                            target="_blank" rel="noopener noreferrer">
                            Google Maps
                        </a>
                        ${partner.website ? `
                            <a class="button button-secondary button-small" href="${escapeHtml(partner.website)}"
                                target="_blank" rel="noopener noreferrer">Website</a>
                        ` : ""}
                        <button class="button button-secondary button-small" type="button"
                            data-action="new-opportunity-for-partner" data-partner-id="${escapeHtml(partner.id)}">
                            + Opportunity
                        </button>
                        <button class="button button-secondary button-small" type="button"
                            data-action="edit-partner" data-partner-id="${escapeHtml(partner.id)}">Edit</button>
                        ${partner.meta.archived ? `
                            <button class="button button-secondary button-small" type="button"
                                data-action="restore-partner" data-partner-id="${escapeHtml(partner.id)}">Restore</button>
                        ` : `
                            <button class="button button-secondary button-small" type="button"
                                data-action="archive-partner" data-partner-id="${escapeHtml(partner.id)}">Archive</button>
                        `}
                    </div>
                </div>
            </details>
        `;
    }

    function render() {
        if (!state.browser || !state.search) return;

        const allPartners = PartnerManager.getPartners();
        renderSummary(allPartners);

        let partners = PartnerManager.search(state.search.value, {
            type: state.typeFilter?.value || "",
            location: state.locationFilter?.value || "",
            status: state.statusFilter?.value || "active"
        });

        if (state.categoryFilter?.value) {
            partners = partners.filter((partner) =>
                categoryFor(partner).key === state.categoryFilter.value
            );
        }

        partners.sort((a, b) =>
            categoryFor(a).label.localeCompare(categoryFor(b).label) ||
            subcategoryFor(a, categoryFor(a)).localeCompare(subcategoryFor(b, categoryFor(b))) ||
            a.organization.localeCompare(b.organization)
        );

        state.count.textContent = `${partners.length} ${partners.length === 1 ? "organization" : "organizations"}`;

        if (!partners.length) {
            state.browser.innerHTML = `
                <div class="empty-state community-empty-state">
                    <h3>No matching organizations</h3>
                    <p>Search by organization, career field, service, or location. Local starter organizations are already included.</p>
                    <div class="card-actions">
                        <button class="button button-secondary" type="button" data-action="clear-business-directory-filters">Clear Filters</button>
                        <button class="button button-primary" type="button" data-action="new-partner">+ Organization</button>
                    </div>
                </div>
            `;
            return;
        }

        const grouped = new Map();
        partners.forEach((partner) => {
            const category = categoryFor(partner);
            const subcategory = subcategoryFor(partner, category);
            if (!grouped.has(category.key)) grouped.set(category.key, new Map());
            const subcategories = grouped.get(category.key);
            if (!subcategories.has(subcategory)) subcategories.set(subcategory, []);
            subcategories.get(subcategory).push(partner);
        });

        const queryActive = Boolean(state.search.value.trim() || state.categoryFilter?.value || state.focusId);

        state.browser.innerHTML = `
            <div class="community-directory-groups">
                ${CATEGORIES.filter((category) => grouped.has(category.key)).map((category, categoryIndex) => {
                    const subcategories = grouped.get(category.key);
                    const categoryItems = [...subcategories.values()].flat();
                    const organizedGroups = organizedSubcategoryGroups(subcategories, category);
                    const previewLabels = organizedGroups
                        ? organizedGroups.slice(0, 4).map(([label]) => label)
                        : [];
                    const openCategory = queryActive || categoryIndex === 0;
                    return `
                        <details class="community-category-section tone-${category.key}" ${openCategory ? "open" : ""}>
                            <summary>
                                <span class="community-category-icon" aria-hidden="true">${category.icon}</span>
                                <div>
                                    <strong>${escapeHtml(category.label)}</strong>
                                    <small>${escapeHtml(category.description)}</small>
                                </div>
                                <div class="community-category-summary-meta">
                                    ${previewLabels.length ? `<span class="community-subcategory-preview">${previewLabels.map(escapeHtml).join(" · ")}</span>` : ""}
                                    <span class="community-category-count">${categoryItems.length}</span>
                                    <span class="community-row-arrow" aria-hidden="true">›</span>
                                </div>
                            </summary>
                            <div class="community-subcategory-list">
                                ${organizedGroups ? organizedGroups.map(([subcategory, items]) => `
                                    <details class="community-subcategory-section" ${queryActive ? "open" : ""}>
                                        <summary>
                                            <strong>${escapeHtml(subcategory)}</strong>
                                            <span>${items.length}</span>
                                        </summary>
                                        <div class="community-organization-list">
                                            ${items.map((partner) => renderOrganizationRow(partner, category)).join("")}
                                        </div>
                                    </details>
                                `).join("") : `
                                    <div class="community-organization-list community-organization-list-direct">
                                        ${categoryItems
                                            .sort((a, b) => a.organization.localeCompare(b.organization))
                                            .map((partner) => renderOrganizationRow(partner, category)).join("")}
                                    </div>
                                `}
                            </div>
                        </details>
                    `;
                }).join("")}
            </div>
        `;

        if (state.focusId) {
            requestAnimationFrame(() => {
                const focused = state.browser.querySelector(`[data-organization-id="${CSS.escape(state.focusId)}"]`);
                focused?.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => {
                    focused?.classList.remove("is-focused");
                    state.focusId = "";
                }, 2400);
            });
        }
    }

    function formTemplate(partner = null) {
        const editing = Boolean(partner);
        const value = partner || {
            organization: "", contactName: "", contactTitle: "", email: "",
            phone: "", website: "", type: "Community Organization", category: "",
            subcategory: "", industry: "", location: "", services: [], careerFields: [],
            studentSupport: [], opportunities: [], notes: ""
        };
        const currentCategory = value.category || categoryFor(value).key;

        return `
            <div class="modal-backdrop">
                <section class="modal" role="dialog" aria-modal="true" aria-labelledby="partnerFormTitle">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Community directory</p>
                            <h2 id="partnerFormTitle">${editing ? "Edit Organization" : "New Organization"}</h2>
                            <p>Store the organization once, then link specific opportunities and student connections to it.</p>
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
                                    <label for="partnerCategory">Category</label>
                                    <select id="partnerCategory" name="category">
                                        ${CATEGORIES.map((category) => `<option value="${category.key}" ${currentCategory === category.key ? "selected" : ""}>${category.icon} ${escapeHtml(category.label)}</option>`).join("")}
                                    </select>
                                </div>
                                <div class="form-field">
                                    <label for="partnerSubcategory">Subcategory</label>
                                    <input id="partnerSubcategory" name="subcategory" value="${escapeHtml(value.subcategory || value.industry)}" placeholder="Example: Veterinary clinic">
                                </div>
                                <div class="form-field">
                                    <label for="partnerType">Organization type</label>
                                    <select id="partnerType" name="type">
                                        ${["Business", "Employer", "Internship Site", "Mentor", "College", "Training Provider", "Community Organization", "Government Agency", "Nonprofit", "Other"].map((type) => `<option value="${type}" ${value.type === type ? "selected" : ""}>${type}</option>`).join("")}
                                    </select>
                                </div>
                                <div class="form-field">
                                    <label for="partnerIndustry">Industry / department</label>
                                    <input id="partnerIndustry" name="industry" value="${escapeHtml(value.industry)}">
                                </div>
                                <div class="form-field full-width">
                                    <label for="partnerLocation">Location</label>
                                    <input id="partnerLocation" name="location" value="${escapeHtml(value.location)}">
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
                                <div class="form-field full-width">
                                    <label for="partnerWebsite">Website</label>
                                    <input id="partnerWebsite" name="website" type="url" value="${escapeHtml(value.website)}">
                                </div>
                                <div class="form-field">
                                    <label for="partnerCareerFields">Career fields</label>
                                    <textarea id="partnerCareerFields" name="careerFields" placeholder="Engineering, customer service, healthcare...">${escapeHtml((value.careerFields || []).join(", "))}</textarea>
                                </div>
                                <div class="form-field">
                                    <label for="partnerStudentSupport">Student support</label>
                                    <textarea id="partnerStudentSupport" name="studentSupport" placeholder="Internships, mentors, job shadows, volunteering...">${escapeHtml((value.studentSupport || []).join(", "))}</textarea>
                                </div>
                                <div class="form-field">
                                    <label for="partnerServices">Services / departments</label>
                                    <textarea id="partnerServices" name="services">${escapeHtml((value.services || []).join(", "))}</textarea>
                                </div>
                                <div class="form-field">
                                    <label for="partnerOpportunities">Legacy opportunity notes</label>
                                    <textarea id="partnerOpportunities" name="opportunities" placeholder="Use + Opportunity for structured entries">${escapeHtml((value.opportunities || []).join("\n"))}</textarea>
                                </div>
                                <div class="form-field full-width">
                                    <label for="partnerNotes">Notes</label>
                                    <textarea id="partnerNotes" name="notes">${escapeHtml(value.notes)}</textarea>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="button button-secondary" type="button" data-action="close-partner-modal">Cancel</button>
                            <button class="button button-primary" type="submit">${editing ? "Save Organization" : "Create Organization"}</button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function assignTemplate(partnerId) {
        const partner = PartnerManager.getPartner(partnerId);
        const students = StudentManager.getStudents({ includeArchived: false })
            .sort((a, b) => studentName(a).localeCompare(studentName(b)));

        return `
            <div class="modal-backdrop">
                <section class="modal community-connect-modal" role="dialog" aria-modal="true" aria-labelledby="assignPartnerTitle">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Connect a student</p>
                            <h2 id="assignPartnerTitle">${escapeHtml(partner?.organization || "Community Organization")}</h2>
                            <p>Choose a student with enough context to avoid duplicate or disconnected assignments.</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-partner-modal" aria-label="Close">×</button>
                    </div>
                    <form id="assignPartnerForm">
                        <div class="modal-body">
                            <input type="hidden" name="partnerId" value="${escapeHtml(partnerId)}">
                            <fieldset class="community-student-picker">
                                <legend>Student *</legend>
                                ${students.length ? students.map((student) => {
                                    const project = currentProject(student);
                                    const internship = currentInternship(student);
                                    const connections = (student.journey.partnerEngagements || []).length;
                                    const nextSteps = openNextStepCount(student);
                                    return `
                                        <label class="community-student-choice">
                                            <input type="radio" name="studentId" value="${escapeHtml(student.id)}" required>
                                            <span class="community-student-choice-main">
                                                <strong>${escapeHtml(studentName(student))}</strong>
                                                <small>${escapeHtml(student.profile.grade ? `Grade ${student.profile.grade}` : "Student")}</small>
                                            </span>
                                            <span class="community-student-context">
                                                <span><b>Project</b>${escapeHtml(project?.title || "—")}</span>
                                                <span><b>Internship</b>${escapeHtml(internship?.organization || internship?.title || "—")}</span>
                                                <span><b>Community</b>${connections}</span>
                                                <span><b>Next Steps</b>${nextSteps}</span>
                                            </span>
                                        </label>
                                    `;
                                }).join("") : `<p class="empty-copy">Add a student before creating a connection.</p>`}
                            </fieldset>

                            <div class="form-grid">
                                <div class="form-field">
                                    <label for="relationshipType">Connection type</label>
                                    <select id="relationshipType" name="relationshipType">
                                        ${RELATIONSHIPS.map((item) => `<option value="${item.value}">${item.icon} ${item.value}</option>`).join("")}
                                    </select>
                                </div>
                                <div class="form-field">
                                    <label for="partnerStatus">Status</label>
                                    <select id="partnerStatus" name="status">
                                        ${["Interested", "Contacting", "Planning", "Active", "Completed"].map((status) => `<option value="${status}">${status}</option>`).join("")}
                                    </select>
                                </div>
                                <div class="form-field">
                                    <label for="partnerStartDate">Start date</label>
                                    <input id="partnerStartDate" name="startDate" type="date">
                                </div>
                                <div class="form-field">
                                    <label for="partnerNextStep">Next step</label>
                                    <input id="partnerNextStep" name="nextStep" placeholder="Example: Email volunteer coordinator">
                                </div>
                                <div class="form-field full-width">
                                    <label for="partnerAssignmentNotes">Notes</label>
                                    <textarea id="partnerAssignmentNotes" name="notes"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="button button-secondary" type="button" data-action="close-partner-modal">Cancel</button>
                            <button class="button button-primary" type="submit" ${students.length ? "" : "disabled"}>Connect Student</button>
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

    function openModal(html) {
        state.modalRoot.innerHTML = html;
        document.body.style.overflow = "hidden";
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;

        const action = target.dataset.action;
        const partnerId = target.dataset.partnerId;

        if (action === "load-lompoc-business-directory") {
            const count = PartnerManager.loadLompocBusinessDirectory();
            App.showToast(count ? `${count} Lompoc organizations added.` : "The Lompoc directory is already loaded.");
        } else if (action === "clear-business-directory-filters") {
            state.search.value = "";
            if (state.typeFilter) state.typeFilter.value = "";
            state.categoryFilter.value = "";
            state.locationFilter.value = "";
            state.statusFilter.value = "active";
            state.focusId = "";
            render();
        } else if (action === "new-partner") {
            openModal(formTemplate());
        } else if (action === "edit-partner") {
            const partner = PartnerManager.getPartner(partnerId);
            if (partner) openModal(formTemplate(partner));
        } else if (action === "assign-partner") {
            openModal(assignTemplate(partnerId));
        } else if (action === "new-opportunity-for-partner") {
            OpportunityUI.openForPartner(partnerId);
        } else if (action === "open-opportunity-from-directory") {
            CommunityUI.showTab("opportunities");
            OpportunityUI.focusOpportunity(target.dataset.opportunityId || "");
        } else if (action === "archive-partner") {
            PartnerManager.archivePartner(partnerId);
            App.showToast("Organization archived.");
        } else if (action === "restore-partner") {
            PartnerManager.restorePartner(partnerId);
            App.showToast("Organization restored.");
        } else if (action === "close-partner-modal") {
            closeModal();
        }
    }

    function handleSubmit(event) {
        if (event.target.id === "assignPartnerForm") {
            event.preventDefault();
            const form = event.target;
            const formData = new FormData(form);
            const studentId = String(formData.get("studentId") || "").trim();
            const partnerId = String(formData.get("partnerId") || "").trim();
            const submitButton = form.querySelector('button[type="submit"]');

            if (!studentId) {
                App.showToast("Choose a student before connecting the organization.", "error");
                return;
            }

            const student = StudentManager.getStudent(studentId);
            const partner = PartnerManager.getPartner(partnerId);

            if (!student || !partner) {
                App.showToast("The student or organization could not be found.", "error");
                return;
            }

            const originalButtonText = submitButton?.textContent || "Connect Student";
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Saving Connection…";
            }

            try {
                const engagement = StudentManager.assignPartner(studentId, partnerId, {
                    relationshipType: formData.get("relationshipType"),
                    status: formData.get("status"),
                    startDate: formData.get("startDate"),
                    nextStep: formData.get("nextStep"),
                    notes: formData.get("notes")
                });

                const updatedStudent = StudentManager.getStudent(studentId);
                const wasSaved = Boolean(
                    engagement?.id &&
                    updatedStudent?.journey?.partnerEngagements?.some((item) =>
                        item.id === engagement.id && item.partnerId === partnerId
                    )
                );

                if (!wasSaved) {
                    throw new Error("Momentum could not verify the community connection.");
                }

                if (typeof Storage !== "undefined" && typeof Storage.save === "function") {
                    Storage.save();
                }

                document.dispatchEvent(new CustomEvent("communityAssignmentChanged", {
                    detail: {
                        kind: "partner",
                        studentId,
                        partnerId,
                        engagementId: engagement.id
                    }
                }));

                closeModal();
                App.showToast(`${partner.organization} connected to ${studentName(updatedStudent)}.`);
            } catch (error) {
                console.error("Momentum could not connect the organization to the student.", error);
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
                App.showToast(error.message || "Community connection could not be saved.", "error");
            }
            return;
        }

        if (event.target.id !== "partnerForm") return;
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
            category: formData.get("category"),
            subcategory: formData.get("subcategory"),
            industry: formData.get("industry"),
            location: formData.get("location"),
            services: splitList(formData.get("services")),
            careerFields: splitList(formData.get("careerFields")),
            studentSupport: splitList(formData.get("studentSupport")),
            opportunities: splitList(formData.get("opportunities")),
            notes: formData.get("notes")
        };

        if (id) {
            PartnerManager.updatePartner(id, payload);
            App.showToast("Organization updated.");
        } else {
            PartnerManager.createPartner(payload);
            App.showToast("Organization created.");
        }
        closeModal();
    }

    function focusOrganization(partnerId = "", organization = "") {
        let partner = partnerId ? PartnerManager.getPartner(partnerId) : null;
        if (!partner && organization) {
            partner = PartnerManager.getPartners().find((item) =>
                item.organization.toLowerCase() === String(organization).toLowerCase()
            );
        }
        if (!partner) return;

        state.search.value = partner.organization;
        state.categoryFilter.value = "";
        state.locationFilter.value = "";
        state.statusFilter.value = "all";
        state.focusId = partner.id;
        render();
    }

    function initialize() {
        state.browser = document.getElementById("partnerBrowser");
        state.count = document.getElementById("partnerCountText");
        state.summary = document.getElementById("partnerDirectorySummary");
        state.search = document.getElementById("partnerSearchInput");
        state.typeFilter = document.getElementById("partnerTypeFilter");
        state.categoryFilter = document.getElementById("partnerIndustryFilter");
        state.locationFilter = document.getElementById("partnerLocationFilter");
        state.statusFilter = document.getElementById("partnerStatusFilter");
        state.modalRoot = document.getElementById("modalRoot");

        if (!state.browser) return;

        state.search.addEventListener("input", render);
        state.typeFilter?.addEventListener("change", render);
        state.categoryFilter.addEventListener("change", render);
        state.locationFilter.addEventListener("change", render);
        state.statusFilter.addEventListener("change", render);
        document.addEventListener("click", handleClick);
        document.addEventListener("submit", handleSubmit);
        document.addEventListener(PartnerManager.DATA_CHANGED_EVENT, () => {
            populateTypeFilter();
            populateCategoryFilter();
            render();
        });
        document.addEventListener(OpportunityManager.DATA_CHANGED_EVENT, render);
        document.addEventListener("studentDataChanged", render);

        populateTypeFilter();
        populateCategoryFilter();
        render();
    }

    return Object.freeze({
        initialize,
        render,
        focusOrganization
    });
})();
