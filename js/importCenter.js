/*
==========================================================
Momentum
Opportunity and Partner Import Center
Build v21.0.0
File: js/importCenter.js
==========================================================
*/

"use strict";

const ImportCenter = (() => {
    const state = {
        modalRoot: null,
        fileInput: null,
        parsedRows: [],
        sourceName: "",
        detectedTarget: "opportunities"
    };

    const OPPORTUNITY_TEMPLATE = [
        "Title",
        "Type",
        "Organization",
        "Location",
        "Format",
        "Deadline",
        "Website",
        "Description",
        "Eligibility",
        "Tags",
        "Interest Areas",
        "Grade Levels",
        "Skills",
        "Status",
        "Notes"
    ];

    const PARTNER_TEMPLATE = [
        "Organization",
        "Type",
        "Industry",
        "Contact Name",
        "Contact Title",
        "Email",
        "Phone",
        "Website",
        "Location",
        "Services",
        "Opportunities",
        "Status",
        "Notes"
    ];

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function normalizeHeader(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "");
    }

    function cell(row, ...names) {
        const normalized = {};
        Object.entries(row || {}).forEach(([key, value]) => {
            normalized[normalizeHeader(key)] = String(value ?? "").trim();
        });

        for (const name of names) {
            const value = normalized[normalizeHeader(name)];
            if (value !== undefined) {
                return value;
            }
        }

        return "";
    }

    function splitList(value) {
        return [...new Set(
            String(value || "")
                .split(/[|;\n,]+/)
                .map((item) => item.trim())
                .filter(Boolean)
        )];
    }

    function parseCsv(text) {
        const rows = [];
        let row = [];
        let field = "";
        let quoted = false;

        for (let index = 0; index < text.length; index += 1) {
            const character = text[index];
            const next = text[index + 1];

            if (quoted) {
                if (character === '"' && next === '"') {
                    field += '"';
                    index += 1;
                } else if (character === '"') {
                    quoted = false;
                } else {
                    field += character;
                }
            } else if (character === '"') {
                quoted = true;
            } else if (character === ",") {
                row.push(field);
                field = "";
            } else if (character === "\n") {
                row.push(field);
                rows.push(row);
                row = [];
                field = "";
            } else if (character !== "\r") {
                field += character;
            }
        }

        row.push(field);
        if (row.some((value) => String(value).trim())) {
            rows.push(row);
        }

        if (rows.length < 2) {
            return [];
        }

        const headers = rows[0].map((header, index) =>
            String(header || `Column ${index + 1}`).trim()
        );

        return rows.slice(1)
            .filter((values) => values.some((value) => String(value).trim()))
            .map((values) => {
                const result = {};
                headers.forEach((header, index) => {
                    result[header] = values[index] ?? "";
                });
                return result;
            });
    }

    function parseJson(text) {
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
            return parsed;
        }

        for (const key of ["opportunities", "partners", "organizations", "records", "data"]) {
            if (Array.isArray(parsed && parsed[key])) {
                return parsed[key];
            }
        }

        throw new Error("The JSON file does not contain a supported record list.");
    }

    function detectTarget(rows) {
        const headers = Object.keys(rows[0] || {}).map(normalizeHeader);

        if (
            headers.includes("contactname") ||
            headers.includes("industry") ||
            headers.includes("services")
        ) {
            return "partners";
        }

        return "opportunities";
    }

    function normalizeStatus(value) {
        const status = String(value || "").trim().toLowerCase();
        return {
            archived: ["closed", "archived", "inactive", "completed"].includes(status),
            needsVerification: !status ||
                ["potential", "unverified", "needsverification", "needs verification"].includes(status)
        };
    }

    function opportunityFromRow(row, batchTag) {
        const status = normalizeStatus(cell(row, "Status"));
        const notes = cell(row, "Notes");
        const tags = splitList(cell(row, "Tags"));

        if (batchTag) {
            tags.push(batchTag);
        }
        if (status.needsVerification) {
            tags.push("Needs Verification");
        }

        return {
            title: cell(row, "Title", "Opportunity", "Name"),
            organization: cell(row, "Organization", "Business", "Company"),
            type: cell(row, "Type", "Category") || "Other",
            location: cell(row, "Location", "Address", "City"),
            format: cell(row, "Format") || "In person",
            deadline: cell(row, "Deadline", "Due Date"),
            url: cell(row, "Website", "URL", "Link", "Google Maps URL"),
            description: cell(row, "Description", "Summary"),
            eligibility: cell(row, "Eligibility", "Requirements"),
            tags: [...new Set(tags)],
            interestAreas: splitList(cell(row, "Interest Areas", "Interests")),
            gradeLevels: splitList(cell(row, "Grade Levels", "Grades")),
            skills: splitList(cell(row, "Skills")),
            importNotes: notes,
            archived: status.archived
        };
    }

    function partnerFromRow(row, batchTag) {
        const status = normalizeStatus(cell(row, "Status"));
        const notes = [
            cell(row, "Notes"),
            batchTag ? `Import batch: ${batchTag}` : "",
            status.needsVerification ? "Needs Verification" : ""
        ].filter(Boolean).join("\n");

        return {
            organization: cell(row, "Organization", "Business", "Company", "Name"),
            contactName: cell(row, "Contact Name", "Contact"),
            contactTitle: cell(row, "Contact Title", "Role"),
            email: cell(row, "Email"),
            phone: cell(row, "Phone", "Telephone"),
            website: cell(row, "Website", "URL", "Link", "Google Maps URL"),
            type: cell(row, "Type", "Category") || "Potential Partner",
            industry: cell(row, "Industry"),
            location: cell(row, "Location", "Address", "City"),
            services: splitList(cell(row, "Services", "Tags")),
            opportunities: splitList(cell(row, "Opportunities", "Programs")),
            notes,
            archived: status.archived
        };
    }

    function cleanKey(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "")
            .replace(/[^a-z0-9@.]+/g, "");
    }

    function opportunityDuplicate(record, existing) {
        const title = cleanKey(record.title);
        const org = cleanKey(record.organization);
        const url = cleanKey(record.url);

        return existing.find((item) => {
            const sameTitleOrg = title && org &&
                cleanKey(item.title) === title &&
                cleanKey(item.organization) === org;
            const sameUrl = url && cleanKey(item.url) === url;
            return sameTitleOrg || sameUrl;
        }) || null;
    }

    function partnerDuplicate(record, existing) {
        const org = cleanKey(record.organization);
        const email = cleanKey(record.email);
        const phone = cleanKey(record.phone);
        const website = cleanKey(record.website);

        return existing.find((item) => {
            return (org && cleanKey(item.organization) === org) ||
                (email && cleanKey(item.email) === email) ||
                (phone && cleanKey(item.phone) === phone) ||
                (website && cleanKey(item.website) === website);
        }) || null;
    }

    function analyzeRows(target, batchTag = "") {
        const existing = target === "partners"
            ? PartnerManager.getPartners()
            : OpportunityManager.getOpportunities();

        return state.parsedRows.map((row, index) => {
            const record = target === "partners"
                ? partnerFromRow(row, batchTag)
                : opportunityFromRow(row, batchTag);
            const duplicate = target === "partners"
                ? partnerDuplicate(record, existing)
                : opportunityDuplicate(record, existing);
            const requiredValue = target === "partners"
                ? record.organization
                : record.title;
            const errors = [];

            if (!requiredValue) {
                errors.push(target === "partners"
                    ? "Missing organization"
                    : "Missing opportunity title"
                );
            }

            return {
                index,
                row,
                record,
                duplicate,
                errors,
                status: errors.length
                    ? "error"
                    : duplicate
                        ? "duplicate"
                        : "new"
            };
        });
    }

    function importDialog() {
        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal import-center-modal" role="dialog" aria-modal="true"
                    aria-labelledby="importCenterTitle">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Offline bulk import</p>
                            <h2 id="importCenterTitle">Opportunity & Partner Import Center</h2>
                            <p>Import a prepared CSV or JSON file. Nothing changes until you approve the preview.</p>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-import-center" aria-label="Close">×</button>
                    </div>

                    <div class="modal-body">
                        <section class="import-intro-grid">
                            <article>
                                <strong>1. Download a template</strong>
                                <p>Fill it in with Google Sheets, Excel, or another spreadsheet editor.</p>
                                <div class="card-actions">
                                    <button class="button button-secondary button-small" type="button"
                                        data-action="download-opportunity-template">
                                        Opportunity CSV
                                    </button>
                                    <button class="button button-secondary button-small" type="button"
                                        data-action="download-partner-template">
                                        Partner CSV
                                    </button>
                                </div>
                            </article>
                            <article>
                                <strong>2. Choose your completed file</strong>
                                <p>CSV and JSON files are processed locally in the browser.</p>
                                <button class="button button-primary button-small" type="button"
                                    data-action="choose-import-file">
                                    Choose Import File
                                </button>
                            </article>
                        </section>

                        <section class="import-safety-note">
                            <strong>Recommended workflow</strong>
                            <p>
                                Import businesses from a research list as Potential Partners with
                                Needs Verification. Convert verified organizations into active partners
                                and create specific opportunities only after confirming details.
                            </p>
                        </section>
                    </div>

                    <div class="modal-footer">
                        <button class="button button-secondary" type="button"
                            data-action="close-import-center">Close</button>
                    </div>
                </section>
            </div>
        `;
    }

    function previewDialog(target, batchTag = "", duplicateMode = "skip") {
        const analysis = analyzeRows(target, batchTag);
        const newCount = analysis.filter((item) => item.status === "new").length;
        const duplicateCount = analysis.filter((item) => item.status === "duplicate").length;
        const errorCount = analysis.filter((item) => item.status === "error").length;

        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal import-center-modal import-preview-modal"
                    role="dialog" aria-modal="true" aria-labelledby="importPreviewTitle">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Import preview</p>
                            <h2 id="importPreviewTitle">${escapeHtml(state.sourceName)}</h2>
                            <p>Review detected records and choose how duplicates should be handled.</p>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-import-center" aria-label="Close">×</button>
                    </div>

                    <form id="importPreviewForm">
                        <div class="modal-body">
                            <div class="form-grid">
                                <div class="form-field">
                                    <label for="importTarget">Import as</label>
                                    <select id="importTarget" name="target">
                                        <option value="opportunities" ${target === "opportunities" ? "selected" : ""}>
                                            Opportunities
                                        </option>
                                        <option value="partners" ${target === "partners" ? "selected" : ""}>
                                            Potential Partners
                                        </option>
                                    </select>
                                </div>
                                <div class="form-field">
                                    <label for="importDuplicateMode">Duplicates</label>
                                    <select id="importDuplicateMode" name="duplicateMode">
                                        <option value="skip" ${duplicateMode === "skip" ? "selected" : ""}>
                                            Skip existing records
                                        </option>
                                        <option value="update" ${duplicateMode === "update" ? "selected" : ""}>
                                            Update existing records
                                        </option>
                                    </select>
                                </div>
                                <div class="form-field full-width">
                                    <label for="importBatchTag">Batch tag</label>
                                    <input id="importBatchTag" name="batchTag"
                                        value="${escapeHtml(batchTag)}"
                                        placeholder="Example: Local business research — August 2026">
                                </div>
                            </div>

                            <div class="import-summary-grid">
                                <article><strong>${analysis.length}</strong><span>Rows read</span></article>
                                <article><strong>${newCount}</strong><span>New records</span></article>
                                <article><strong>${duplicateCount}</strong><span>Possible duplicates</span></article>
                                <article class="${errorCount ? "has-errors" : ""}">
                                    <strong>${errorCount}</strong><span>Rows with errors</span>
                                </article>
                            </div>

                            <div class="import-preview-table-wrap">
                                <table class="import-preview-table">
                                    <thead>
                                        <tr>
                                            <th>Status</th>
                                            <th>${target === "partners" ? "Organization" : "Opportunity"}</th>
                                            <th>Organization / Type</th>
                                            <th>Location</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${analysis.slice(0, 100).map((item) => `
                                            <tr>
                                                <td>
                                                    <span class="badge ${
                                                        item.status === "new"
                                                            ? "badge-success"
                                                            : item.status === "duplicate"
                                                                ? "badge-warning"
                                                                : "badge-danger"
                                                    }">${escapeHtml(item.status)}</span>
                                                </td>
                                                <td>${escapeHtml(
                                                    target === "partners"
                                                        ? item.record.organization
                                                        : item.record.title
                                                )}</td>
                                                <td>${escapeHtml(
                                                    target === "partners"
                                                        ? item.record.type
                                                        : item.record.organization || item.record.type
                                                )}</td>
                                                <td>${escapeHtml(item.record.location || "—")}</td>
                                                <td>${escapeHtml(
                                                    item.errors.join("; ") ||
                                                    (item.duplicate ? "Matches an existing record" : "")
                                                )}</td>
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                </table>
                                ${analysis.length > 100
                                    ? `<p class="form-help">Showing the first 100 of ${analysis.length} rows.</p>`
                                    : ""
                                }
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button class="button button-secondary" type="button"
                                data-action="back-to-import-center">Back</button>
                            <button class="button button-primary" type="submit"
                                ${newCount + duplicateCount === 0 ? "disabled" : ""}>
                                Import Records
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function resultDialog(result) {
        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal modal-small" role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Import complete</p>
                            <h2>${result.target === "partners" ? "Partners imported" : "Opportunities imported"}</h2>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-import-center" aria-label="Close">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="import-summary-grid">
                            <article><strong>${result.created}</strong><span>Created</span></article>
                            <article><strong>${result.updated}</strong><span>Updated</span></article>
                            <article><strong>${result.skipped}</strong><span>Skipped</span></article>
                            <article><strong>${result.errors}</strong><span>Errors</span></article>
                        </div>
                        <p>
                            The imported information is stored locally with the rest of Momentum's data.
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button class="button button-primary" type="button"
                            data-action="close-import-center">Done</button>
                    </div>
                </section>
            </div>
        `;
    }

    function downloadCsv(headers, filename) {
        const sample = headers.map((header) => {
            if (header === "Status") return "Needs Verification";
            if (header === "Type") return "Potential Partner";
            return "";
        });
        const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
        const content = `${headers.map(quote).join(",")}\n${sample.map(quote).join(",")}\n`;
        const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    function close() {
        state.modalRoot.innerHTML = "";
        document.body.style.overflow = "";
        state.parsedRows = [];
        state.sourceName = "";
    }

    function open() {
        state.modalRoot.innerHTML = importDialog();
        document.body.style.overflow = "hidden";
    }

    async function readFile(file) {
        const text = await file.text();
        const extension = file.name.split(".").pop().toLowerCase();
        const rows = extension === "json"
            ? parseJson(text)
            : parseCsv(text);

        if (!rows.length) {
            throw new Error("No importable rows were found in this file.");
        }

        state.parsedRows = rows;
        state.sourceName = file.name;
        state.detectedTarget = detectTarget(rows);
        state.modalRoot.innerHTML = previewDialog(state.detectedTarget);
    }

    function performImport(target, batchTag, duplicateMode) {
        const analysis = analyzeRows(target, batchTag);

        if (typeof DataSafety !== "undefined") {
            DataSafety.createSnapshot(
                `Before bulk importing ${state.sourceName || target}`
            );
        }

        const result = {
            target,
            created: 0,
            updated: 0,
            skipped: 0,
            errors: 0
        };

        analysis.forEach((item) => {
            if (item.errors.length) {
                result.errors += 1;
                return;
            }

            const record = { ...item.record };
            const archived = Boolean(record.archived);
            delete record.archived;

            if (target === "opportunities") {
                if (record.importNotes) {
                    record.description = [
                        record.description,
                        record.importNotes
                    ].filter(Boolean).join("\n\n");
                }
                delete record.importNotes;
            }

            if (item.duplicate) {
                if (duplicateMode === "update") {
                    if (target === "partners") {
                        PartnerManager.updatePartner(item.duplicate.id, {
                            ...record,
                            meta: { archived }
                        });
                    } else {
                        OpportunityManager.updateOpportunity(item.duplicate.id, {
                            ...record,
                            meta: { archived }
                        });
                    }
                    result.updated += 1;
                } else {
                    result.skipped += 1;
                }
                return;
            }

            if (target === "partners") {
                const created = PartnerManager.createPartner(record);
                if (archived && created) {
                    PartnerManager.archivePartner(created.id);
                }
            } else {
                const created = OpportunityManager.createOpportunity(record);
                if (archived && created) {
                    OpportunityManager.archiveOpportunity(created.id);
                }
            }
            result.created += 1;
        });

        return result;
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;

        const action = target.dataset.action;

        if (action === "open-import-center") {
            open();
        } else if (action === "close-import-center") {
            close();
        } else if (action === "back-to-import-center") {
            state.modalRoot.innerHTML = importDialog();
        } else if (action === "choose-import-file") {
            state.fileInput.click();
        } else if (action === "download-opportunity-template") {
            downloadCsv(OPPORTUNITY_TEMPLATE, "Momentum-Opportunity-Import-Template.csv");
        } else if (action === "download-partner-template") {
            downloadCsv(PARTNER_TEMPLATE, "Momentum-Partner-Import-Template.csv");
        }
    }

    function handleChange(event) {
        if (event.target === state.fileInput) {
            const [file] = event.target.files;
            event.target.value = "";
            if (!file) return;

            readFile(file).catch((error) => {
                console.error(error);
                App.showToast(error.message || "Import file could not be read.", "error");
            });
            return;
        }

        if (
            event.target.id === "importTarget" ||
            event.target.id === "importDuplicateMode" ||
            event.target.id === "importBatchTag"
        ) {
            const form = event.target.closest("form");
            if (!form) return;
            const data = new FormData(form);
            state.modalRoot.innerHTML = previewDialog(
                String(data.get("target") || state.detectedTarget),
                String(data.get("batchTag") || ""),
                String(data.get("duplicateMode") || "skip")
            );
        }
    }

    function handleSubmit(event) {
        if (event.target.id !== "importPreviewForm") return;

        event.preventDefault();
        const formData = new FormData(event.target);
        const target = String(formData.get("target") || state.detectedTarget);
        const batchTag = String(formData.get("batchTag") || "").trim();
        const duplicateMode = String(formData.get("duplicateMode") || "skip");
        const result = performImport(target, batchTag, duplicateMode);

        if (typeof DataSafety !== "undefined") {
            DataSafety.addHistory(
                "Community import completed",
                `${result.created} created, ${result.updated} updated, ${result.skipped} skipped`
            );
        }

        state.modalRoot.innerHTML = resultDialog(result);
        CommunityUI.showTab(
            result.target === "partners" ? "partners" : "opportunities"
        );
        App.showToast(
            `Imported ${result.created + result.updated} record${
                result.created + result.updated === 1 ? "" : "s"
            }.`
        );
    }

    function initialize() {
        state.modalRoot = document.getElementById("modalRoot");
        state.fileInput = document.getElementById("opportunityImportFileInput");

        document.addEventListener("click", handleClick);
        document.addEventListener("change", handleChange);
        document.addEventListener("submit", handleSubmit);
    }

    return Object.freeze({
        initialize,
        open
    });
})();
