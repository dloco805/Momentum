/*
==========================================================
Momentum
Data Safety, Recovery, and Health
Build v19.0.0
File: js/dataSafety.js
==========================================================
*/

"use strict";

const DataSafety = (() => {
    const META_KEY = "momentum.dataSafety.meta";
    const SNAPSHOT_KEY = "momentum.dataSafety.snapshots";
    const HISTORY_KEY = "momentum.dataSafety.history";
    const MAX_SNAPSHOTS = 5;
    const MAX_HISTORY = 40;

    const defaults = Object.freeze({
        lastBackupAt: "",
        backupReminderDays: 7,
        lastHealthCheckAt: "",
        resetPinHash: "",
        resetPinUpdatedAt: ""
    });

    let meta = { ...defaults };
    let modalRoot = null;
    let pendingImport = null;

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function readJson(key, fallback) {
        try {
            const parsed = JSON.parse(localStorage.getItem(key) || "null");
            return parsed ?? fallback;
        } catch (error) {
            console.warn(`Momentum could not read ${key}.`, error);
            return fallback;
        }
    }

    function writeJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function load() {
        meta = {
            ...defaults,
            ...(readJson(META_KEY, {}) || {})
        };
        return getMeta();
    }

    function getMeta() {
        return { ...meta };
    }

    function saveMeta(next = {}) {
        meta = { ...meta, ...next };
        writeJson(META_KEY, meta);
        document.dispatchEvent(new CustomEvent("momentumDataSafetyChanged", {
            detail: getMeta()
        }));
        return getMeta();
    }

    function getSnapshots() {
        const snapshots = readJson(SNAPSHOT_KEY, []);
        return Array.isArray(snapshots) ? snapshots : [];
    }

    function getHistory() {
        const history = readJson(HISTORY_KEY, []);
        return Array.isArray(history) ? history : [];
    }

    function addHistory(type, detail = "") {
        const history = [{
            id: `HIST-${Date.now().toString(36).toUpperCase()}`,
            type,
            detail,
            timestamp: new Date().toISOString()
        }, ...getHistory()].slice(0, MAX_HISTORY);

        writeJson(HISTORY_KEY, history);
        document.dispatchEvent(new CustomEvent("momentumDataSafetyChanged", {
            detail: getMeta()
        }));
        return history[0];
    }

    function buildSnapshot(reason = "Manual recovery point") {
        return {
            id: `SNAP-${Date.now().toString(36).toUpperCase()}`,
            reason,
            createdAt: new Date().toISOString(),
            version: "4.8.0",
            data: Settings.buildFullBackup()
        };
    }

    function createSnapshot(reason = "Manual recovery point") {
        const snapshot = buildSnapshot(reason);
        const snapshots = [snapshot, ...getSnapshots()].slice(0, MAX_SNAPSHOTS);
        writeJson(SNAPSHOT_KEY, snapshots);
        addHistory("Previous version created", reason);
        return snapshot;
    }

    function restoreSnapshot(snapshotId) {
        const snapshot = getSnapshots().find((item) => item.id === snapshotId);
        if (!snapshot || !snapshot.data) {
            throw new Error("Previous version could not be found.");
        }

        createSnapshot("Before restoring an earlier recovery point");
        applyBackup(snapshot.data);
        addHistory("Previous version restored", snapshot.reason || snapshot.id);
        return snapshot;
    }

    function deleteSnapshot(snapshotId) {
        writeJson(
            SNAPSHOT_KEY,
            getSnapshots().filter((item) => item.id !== snapshotId)
        );
        addHistory("Previous version removed", snapshotId);
    }

    function applyBackup(parsed) {
        if (!parsed || parsed.app !== "Momentum") {
            throw new Error("This is not a valid Momentum backup.");
        }

        if (!Array.isArray(parsed.students)) {
            throw new Error("The backup does not contain student data.");
        }

        StudentManager.replaceAll(parsed.students);

        if (Array.isArray(parsed.opportunities)) {
            OpportunityManager.replaceAll(parsed.opportunities);
        }

        if (Array.isArray(parsed.partners)) {
            PartnerManager.replaceAll(parsed.partners);
        }

        if (
            typeof ActivityManager !== "undefined" &&
            Array.isArray(parsed.activities)
        ) {
            ActivityManager.replaceAll(parsed.activities);
        }

        if (
            typeof ActivityManager !== "undefined" &&
            typeof parsed.activityNotepad === "string"
        ) {
            ActivityManager.saveNotepad(parsed.activityNotepad);
        }

        if (
            typeof PlannerManager !== "undefined" &&
            Array.isArray(parsed.plannerEvents)
        ) {
            PlannerManager.replaceAll(parsed.plannerEvents);
        }

        if (parsed.settings && typeof parsed.settings === "object") {
            Settings.save(parsed.settings);
        }

        return {
            students: parsed.students.length,
            opportunities: Array.isArray(parsed.opportunities)
                ? parsed.opportunities.length
                : 0,
            partners: Array.isArray(parsed.partners)
                ? parsed.partners.length
                : 0,
            activities: Array.isArray(parsed.activities)
                ? parsed.activities.length
                : 0
        };
    }

    function inspectBackup(parsed) {
        if (!parsed || parsed.app !== "Momentum") {
            throw new Error("This is not a valid Momentum backup.");
        }

        if (!Array.isArray(parsed.students)) {
            throw new Error("The backup does not contain student data.");
        }

        const currentStudents = StudentManager.getStudents();
        const currentStudentIds = new Set(currentStudents.map((item) => item.id));
        const duplicateStudents = parsed.students.filter((item) =>
            item && item.id && currentStudentIds.has(item.id)
        ).length;

        return {
            app: parsed.app,
            version: parsed.version || parsed.backupVersion || "Unknown",
            exportedAt: parsed.exportedAt || parsed.savedAt || "",
            students: parsed.students.length,
            opportunities: Array.isArray(parsed.opportunities)
                ? parsed.opportunities.length
                : 0,
            partners: Array.isArray(parsed.partners)
                ? parsed.partners.length
                : 0,
            duplicateStudents,
            hasSettings: Boolean(parsed.settings && typeof parsed.settings === "object")
        };
    }

    function readBackupFile(file) {
        return new Promise((resolve, reject) => {
            if (!(file instanceof File)) {
                reject(new TypeError("Choose a valid Momentum backup file."));
                return;
            }

            const reader = new FileReader();
            reader.onerror = () => reject(new Error("The backup file could not be read."));
            reader.onload = () => {
                try {
                    const parsed = JSON.parse(String(reader.result || ""));
                    resolve({
                        file,
                        parsed,
                        summary: inspectBackup(parsed)
                    });
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    function backupAgeDays() {
        if (!meta.lastBackupAt) return null;
        return Math.max(0, DateUtils.daysBetween(meta.lastBackupAt) || 0);
    }

    function backupStatus() {
        const age = backupAgeDays();
        const reminder = Number(meta.backupReminderDays) || 7;

        if (age === null) {
            return {
                tone: "danger",
                label: "No full backup recorded",
                detail: "Create a full backup before entering more data."
            };
        }

        if (age >= reminder) {
            return {
                tone: "warning",
                label: `Backup is ${age} days old`,
                detail: `Your reminder is set to ${reminder} days.`
            };
        }

        return {
            tone: "success",
            label: age === 0 ? "Backed up today" : `Backed up ${age} day${age === 1 ? "" : "s"} ago`,
            detail: `Next reminder after ${reminder} days.`
        };
    }

    function markBackupExported(kind = "Full backup") {
        saveMeta({ lastBackupAt: new Date().toISOString() });
        addHistory(`${kind} exported`, "Saved to the Downloads folder");
    }

    function portablePackage() {
        const backup = Settings.buildFullBackup();
        const health = runHealthCheck(false);

        return {
            ...backup,
            packageType: "Momentum Export My Data",
            momentumVersion: "4.8.0",
            portableCreatedAt: new Date().toISOString(),
            backupMetadata: getMeta(),
            recoveryHistory: getHistory().slice(0, 20),
            readableSummary: {
                students: backup.students.length,
                opportunities: backup.opportunities.length,
                partners: backup.partners.length,
                totalCheckIns: backup.students.reduce(
                    (sum, student) => sum + student.journey.checkIns.length,
                    0
                ),
                totalProjects: backup.students.reduce(
                    (sum, student) => sum + student.journey.currentProjects.length,
                    0
                ),
                totalInternships: backup.students.reduce(
                    (sum, student) => sum + student.journey.internships.length,
                    0
                ),
                totalGoals: backup.students.reduce(
                    (sum, student) => sum + student.journey.goals.length,
                    0
                )
            },
            healthReport: health
        };
    }

    function downloadJson(data, filename) {
        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    function exportPortableCopy() {
        const date = new Date().toISOString().slice(0, 10);
        downloadJson(
            portablePackage(),
            `momentum-portable-copy-${date}.json`
        );
        markBackupExported("Portable copy");
    }

    function runHealthCheck(recordHistory = true) {
        const students = StudentManager.getStudents({ includeArchived: true });
        const opportunities = OpportunityManager.getOpportunities();
        const partners = PartnerManager.getPartners();
        const opportunityIds = new Set(opportunities.map((item) => item.id));
        const partnerIds = new Set(partners.map((item) => item.id));
        const issues = [];
        const seenStudentNames = new Map();

        students.forEach((student) => {
            const nameKey = [
                student.profile.firstName,
                student.profile.lastName,
                student.profile.preferredName
            ].join("|").trim().toLowerCase();

            if (nameKey.replaceAll("|", "")) {
                if (seenStudentNames.has(nameKey)) {
                    issues.push({
                        severity: "warning",
                        type: "Possible duplicate student",
                        studentId: student.id,
                        detail: `${student.profile.preferredName || student.profile.firstName || "Student"} may duplicate ${seenStudentNames.get(nameKey)}.`
                    });
                } else {
                    seenStudentNames.set(nameKey, student.id);
                }
            }

            student.journey.opportunityEngagements.forEach((engagement) => {
                if (!opportunityIds.has(engagement.opportunityId)) {
                    issues.push({
                        severity: "error",
                        type: "Broken opportunity assignment",
                        studentId: student.id,
                        detail: `Missing opportunity reference ${engagement.opportunityId || "unknown"}.`
                    });
                }
            });

            student.journey.partnerEngagements.forEach((engagement) => {
                if (!partnerIds.has(engagement.partnerId)) {
                    issues.push({
                        severity: "error",
                        type: "Broken partner assignment",
                        studentId: student.id,
                        detail: `Missing partner reference ${engagement.partnerId || "unknown"}.`
                    });
                }
            });

            student.journey.checkIns.forEach((checkIn) => {
                if (!checkIn.meetingDate || !DateUtils.parseLocalDate(checkIn.meetingDate)) {
                    issues.push({
                        severity: "warning",
                        type: "Check-in date needs review",
                        studentId: student.id,
                        detail: checkIn.summary || "A check-in has no valid meeting date."
                    });
                }
                if (!checkIn.meetingTime) {
                    issues.push({
                        severity: "info",
                        type: "Check-in missing time",
                        studentId: student.id,
                        detail: checkIn.meetingDate || "Undated check-in"
                    });
                }
            });

            [
                ["currentProjects", "Project"],
                ["internships", "Internship"],
                ["goals", "Goal"]
            ].forEach(([collection, label]) => {
                student.journey[collection].forEach((item) => {
                    if (
                        (item.archived || item.status === "archived") &&
                        item.status === "active"
                    ) {
                        issues.push({
                            severity: "warning",
                            type: `${label} status conflict`,
                            studentId: student.id,
                            detail: item.title || label
                        });
                    }
                });
            });
        });

        const report = {
            checkedAt: new Date().toISOString(),
            studentCount: students.length,
            opportunityCount: opportunities.length,
            partnerCount: partners.length,
            issueCount: issues.length,
            errors: issues.filter((item) => item.severity === "error").length,
            warnings: issues.filter((item) => item.severity === "warning").length,
            information: issues.filter((item) => item.severity === "info").length,
            issues
        };

        if (recordHistory) {
            saveMeta({ lastHealthCheckAt: report.checkedAt });
            addHistory(
                "Data health check completed",
                `${report.issueCount} issue${report.issueCount === 1 ? "" : "s"} found`
            );
        }

        return report;
    }

    async function hashPin(pin) {
        const bytes = new TextEncoder().encode(String(pin || ""));
        const digest = await crypto.subtle.digest("SHA-256", bytes);
        return Array.from(new Uint8Array(digest))
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    function hasResetPin() {
        return Boolean(meta.resetPinHash);
    }

    async function setResetPin(pin) {
        const normalized = String(pin || "").trim();

        if (!/^\d{4,8}$/.test(normalized)) {
            throw new Error("Use a 4–8 digit PIN.");
        }

        saveMeta({
            resetPinHash: await hashPin(normalized),
            resetPinUpdatedAt: new Date().toISOString()
        });
        addHistory("Reset PIN changed", "Protected reset access updated");
    }

    async function verifyResetPin(pin) {
        return hasResetPin() &&
            (await hashPin(String(pin || "").trim())) === meta.resetPinHash;
    }

    function clearResetPin() {
        saveMeta({
            resetPinHash: "",
            resetPinUpdatedAt: ""
        });
        addHistory("Reset PIN removed", "Reset protection disabled");
    }

    function resetProtectionTemplate(mode = "unlock") {
        const settingPin = mode === "set";

        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal modal-small reset-protection-modal"
                    role="dialog" aria-modal="true"
                    aria-labelledby="resetProtectionTitle">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Protected action</p>
                            <h2 id="resetProtectionTitle">
                                ${settingPin ? "Set Reset PIN" : "Unlock Reset"}
                            </h2>
                            <p>
                                ${settingPin
                                    ? "Choose a 4–8 digit PIN required before Momentum can be reset."
                                    : "Enter your reset PIN, then type RESET to confirm."
                                }
                            </p>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-data-safety-modal"
                            aria-label="Close">×</button>
                    </div>

                    <form id="${settingPin ? "setResetPinForm" : "confirmResetForm"}">
                        <div class="modal-body">
                            <div class="form-field">
                                <label for="resetPinInput">
                                    ${settingPin ? "New reset PIN" : "Reset PIN"}
                                </label>
                                <input id="resetPinInput" name="pin"
                                    type="password" inputmode="numeric"
                                    pattern="[0-9]{4,8}" minlength="4" maxlength="8"
                                    autocomplete="off" required>
                            </div>

                            ${settingPin ? `
                                <div class="form-field">
                                    <label for="resetPinConfirmInput">Confirm PIN</label>
                                    <input id="resetPinConfirmInput" name="confirmPin"
                                        type="password" inputmode="numeric"
                                        pattern="[0-9]{4,8}" minlength="4" maxlength="8"
                                        autocomplete="off" required>
                                </div>
                            ` : `
                                <div class="form-field">
                                    <label for="resetPhraseInput">Type RESET</label>
                                    <input id="resetPhraseInput" name="phrase"
                                        type="text" autocomplete="off"
                                        placeholder="RESET" required>
                                </div>
                            `}

                            <div class="reset-protection-note">
                                <strong>Important</strong>
                                <p>
                                    The PIN is stored only in this browser as a one-way hash.
                                    Momentum cannot recover a forgotten PIN.
                                </p>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button class="button button-secondary" type="button"
                                data-action="close-data-safety-modal">Cancel</button>
                            <button class="button ${settingPin ? "button-primary" : "button-danger"}"
                                type="submit">
                                ${settingPin ? "Save PIN" : "Create Snapshot & Reset"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function performProtectedReset() {
        createSnapshot("Before resetting all Momentum data");
        addHistory("Momentum reset completed", "Core local records cleared");

        const protectedMeta = {
            ...getMeta(),
            resetPinHash: meta.resetPinHash,
            resetPinUpdatedAt: meta.resetPinUpdatedAt
        };

        localStorage.removeItem(Storage.STORAGE_KEY);
        localStorage.removeItem("momentum.opportunities");
        localStorage.removeItem("momentum.partners");
        localStorage.removeItem("momentum.settings");
        writeJson(META_KEY, protectedMeta);

        window.location.reload();
    }

    function importPreviewTemplate(summary) {
        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal import-preview-modal" role="dialog" aria-modal="true"
                    aria-labelledby="backupPreviewTitle">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Safe import preview</p>
                            <h2 id="backupPreviewTitle">${escapeHtml(pendingImport.file.name)}</h2>
                            <p>Review this backup before replacing current Momentum data.</p>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-data-safety-modal" aria-label="Close">×</button>
                    </div>

                    <div class="modal-body">
                        <div class="backup-preview-grid">
                            <article><strong>${summary.students}</strong><span>Students</span></article>
                            <article><strong>${summary.opportunities}</strong><span>Opportunities</span></article>
                            <article><strong>${summary.partners}</strong><span>Partners</span></article>
                            <article><strong>${summary.duplicateStudents}</strong><span>Matching student IDs</span></article>
                        </div>

                        <dl class="backup-preview-details">
                            <div>
                                <dt>Backup created</dt>
                                <dd>${escapeHtml(
                                    summary.exportedAt
                                        ? new Date(summary.exportedAt).toLocaleString()
                                        : "Not recorded"
                                )}</dd>
                            </div>
                            <div>
                                <dt>Backup version</dt>
                                <dd>${escapeHtml(summary.version)}</dd>
                            </div>
                            <div>
                                <dt>Settings included</dt>
                                <dd>${summary.hasSettings ? "Yes" : "No"}</dd>
                            </div>
                            <div>
                                <dt>Import behavior</dt>
                                <dd>Replace current students, opportunities, partners, and included settings</dd>
                            </div>
                        </dl>

                        <div class="import-safety-note">
                            <strong>Automatic recovery protection</strong>
                            <p>
                                Momentum will create a previous version of the current database
                                immediately before this import is applied.
                            </p>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="button button-secondary" type="button"
                            data-action="close-data-safety-modal">Cancel</button>
                        <button class="button button-primary" type="button"
                            data-action="confirm-safe-import">Create Snapshot & Import</button>
                    </div>
                </section>
            </div>
        `;
    }

    function healthReportTemplate(report) {
        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal health-report-modal" role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Data health check</p>
                            <h2>${report.issueCount
                                ? `${report.issueCount} item${report.issueCount === 1 ? "" : "s"} to review`
                                : "No data problems found"
                            }</h2>
                            <p>Momentum checked references, dates, duplicate names, and lifecycle status.</p>
                        </div>
                        <button class="icon-button" type="button"
                            data-action="close-data-safety-modal" aria-label="Close">×</button>
                    </div>

                    <div class="modal-body">
                        <div class="backup-preview-grid">
                            <article class="health-error"><strong>${report.errors}</strong><span>Errors</span></article>
                            <article class="health-warning"><strong>${report.warnings}</strong><span>Warnings</span></article>
                            <article><strong>${report.information}</strong><span>Information</span></article>
                            <article><strong>${report.studentCount}</strong><span>Students checked</span></article>
                        </div>

                        ${report.issues.length ? `
                            <div class="health-issue-list">
                                ${report.issues.map((issue) => `
                                    <article class="health-issue health-${escapeHtml(issue.severity)}">
                                        <div>
                                            <span>${escapeHtml(issue.severity)}</span>
                                            <strong>${escapeHtml(issue.type)}</strong>
                                            <p>${escapeHtml(issue.detail)}</p>
                                        </div>
                                        ${issue.studentId ? `
                                            <button class="button button-secondary button-small" type="button"
                                                data-action="open-health-student"
                                                data-student-id="${escapeHtml(issue.studentId)}">
                                                Open Student
                                            </button>
                                        ` : ""}
                                    </article>
                                `).join("")}
                            </div>
                        ` : `
                            <div class="health-all-clear">
                                <strong>Data looks healthy</strong>
                                <p>No broken assignments, invalid meeting dates, or likely duplicates were detected.</p>
                            </div>
                        `}
                    </div>

                    <div class="modal-footer">
                        <button class="button button-primary" type="button"
                            data-action="close-data-safety-modal">Done</button>
                    </div>
                </section>
            </div>
        `;
    }

    function renderSettingsPanels() {
        const statusTarget = document.getElementById("backupStatusPanel");
        const recoveryTarget = document.getElementById("recoverySnapshotList");
        const historyTarget = document.getElementById("backupHistoryList");

        if (statusTarget) {
            const status = backupStatus();
            statusTarget.innerHTML = `
                <article class="backup-status-card backup-${escapeHtml(status.tone)}">
                    <span>${status.tone === "success" ? "Protected" : "Attention"}</span>
                    <strong>${escapeHtml(status.label)}</strong>
                    <p>${escapeHtml(status.detail)}</p>
                </article>
            `;
        }

        if (recoveryTarget) {
            const snapshots = getSnapshots();
            recoveryTarget.innerHTML = snapshots.length ? snapshots.map((item) => `
                <article class="recovery-item">
                    <div>
                        <strong>${escapeHtml(item.reason)}</strong>
                        <p>${escapeHtml(new Date(item.createdAt).toLocaleString())}</p>
                    </div>
                    <div class="card-actions">
                        <button class="button button-secondary button-small" type="button"
                            data-action="restore-recovery-snapshot"
                            data-snapshot-id="${escapeHtml(item.id)}">Restore</button>
                        <button class="button button-danger button-small" type="button"
                            data-action="delete-recovery-snapshot"
                            data-snapshot-id="${escapeHtml(item.id)}">Remove</button>
                    </div>
                </article>
            `).join("") : `<p class="empty-copy">No previous versions yet.</p>`;
        }

        if (historyTarget) {
            const history = getHistory().slice(0, 12);
            historyTarget.innerHTML = history.length ? history.map((item) => `
                <article class="backup-history-item">
                    <div>
                        <strong>${escapeHtml(item.type)}</strong>
                        <p>${escapeHtml(item.detail || "")}</p>
                    </div>
                    <time>${escapeHtml(new Date(item.timestamp).toLocaleString())}</time>
                </article>
            `).join("") : `<p class="empty-copy">No backup activity recorded yet.</p>`;
        }

        const reminderInput = document.getElementById("backupReminderDays");
        if (reminderInput) {
            reminderInput.value = String(meta.backupReminderDays || 7);
        }

        const resetStatus = document.getElementById("resetProtectionStatus");
        if (resetStatus) {
            resetStatus.innerHTML = hasResetPin()
                ? `
                    <span class="badge badge-success">PIN Protected</span>
                    <p>Reset requires the saved PIN and the word RESET.</p>
                  `
                : `
                    <span class="badge badge-warning">Not Protected</span>
                    <p>Set a PIN to prevent accidental or unauthorized resets.</p>
                  `;
        }
    }

    function openSafeImport(file) {
        return readBackupFile(file).then((result) => {
            pendingImport = result;
            modalRoot.innerHTML = importPreviewTemplate(result.summary);
            document.body.style.overflow = "hidden";
            return result.summary;
        });
    }

    function closeModal() {
        modalRoot.innerHTML = "";
        document.body.style.overflow = "";
        pendingImport = null;
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;

        const action = target.dataset.action;

        if (action === "close-data-safety-modal") {
            closeModal();
        } else if (action === "confirm-safe-import") {
            if (!pendingImport) return;

            createSnapshot(`Before importing ${pendingImport.file.name}`);
            const result = applyBackup(pendingImport.parsed);
            addHistory(
                "Full backup imported",
                `${result.students} students, ${result.opportunities} opportunities, ${result.partners} partners`
            );
            closeModal();
            App.showToast("Backup imported. A previous version was created first.");
            Settings.renderSummary();
            renderSettingsPanels();
        } else if (action === "create-recovery-snapshot") {
            createSnapshot("Manual recovery point");
            App.showToast("Previous version created.");
            renderSettingsPanels();
        } else if (action === "restore-recovery-snapshot") {
            const confirmed = window.confirm(
                "Restore this previous version? Momentum will save the current state first."
            );
            if (!confirmed) return;

            restoreSnapshot(target.dataset.snapshotId);
            App.showToast("Previous version restored.");
            renderSettingsPanels();
        } else if (action === "delete-recovery-snapshot") {
            if (!window.confirm("Remove this previous version?")) return;
            deleteSnapshot(target.dataset.snapshotId);
            renderSettingsPanels();
        } else if (action === "export-portable-copy") {
            exportPortableCopy();
            App.showToast("Portable Momentum copy exported.");
            renderSettingsPanels();
        } else if (action === "run-data-health-check") {
            modalRoot.innerHTML = healthReportTemplate(runHealthCheck());
            document.body.style.overflow = "hidden";
            renderSettingsPanels();
        } else if (action === "open-health-student") {
            const studentId = target.dataset.studentId;
            closeModal();
            document.dispatchEvent(new CustomEvent("viewStudent", {
                detail: { studentId }
            }));
        } else if (action === "save-backup-reminder") {
            const input = document.getElementById("backupReminderDays");
            const days = Math.max(1, Math.min(90, Number(input.value) || 7));
            saveMeta({ backupReminderDays: days });
            input.value = String(days);
            addHistory("Backup reminder changed", `${days} days`);
            App.showToast("Backup reminder saved.");
            renderSettingsPanels();
                } else if (action === "set-reset-pin") {
            modalRoot.innerHTML = resetProtectionTemplate("set");
            document.body.style.overflow = "hidden";
        } else if (action === "remove-reset-pin") {
            if (!window.confirm("Remove reset PIN protection from this browser?")) {
                return;
            }
            clearResetPin();
            App.showToast("Reset PIN protection removed.");
            renderSettingsPanels();
        } else if (action === "request-protected-reset") {
            if (!hasResetPin()) {
                modalRoot.innerHTML = resetProtectionTemplate("set");
                document.body.style.overflow = "hidden";
                App.showToast("Set a PIN before resetting Momentum.", "error");
                return;
            }

            modalRoot.innerHTML = resetProtectionTemplate("unlock");
            document.body.style.overflow = "hidden";
        }
    }

    async function handleSubmit(event) {
        if (event.target.id === "setResetPinForm") {
            event.preventDefault();
            const data = new FormData(event.target);
            const pin = String(data.get("pin") || "");
            const confirmPin = String(data.get("confirmPin") || "");

            if (pin !== confirmPin) {
                App.showToast("The PIN entries do not match.", "error");
                return;
            }

            try {
                await setResetPin(pin);
                closeModal();
                App.showToast("Reset PIN protection enabled.");
                renderSettingsPanels();
            } catch (error) {
                App.showToast(error.message || "PIN could not be saved.", "error");
            }
        } else if (event.target.id === "confirmResetForm") {
            event.preventDefault();
            const data = new FormData(event.target);
            const pin = String(data.get("pin") || "");
            const phrase = String(data.get("phrase") || "").trim();

            if (phrase !== "RESET") {
                App.showToast("Type RESET exactly to continue.", "error");
                return;
            }

            if (!(await verifyResetPin(pin))) {
                App.showToast("Reset PIN is incorrect.", "error");
                return;
            }

            performProtectedReset();
        }
    }

    function initialize() {
        modalRoot = document.getElementById("modalRoot");
        load();
        renderSettingsPanels();

        document.addEventListener("click", handleClick);
        document.addEventListener("submit", handleSubmit);
        document.addEventListener("momentumDataSafetyChanged", renderSettingsPanels);
    }

    return Object.freeze({
        initialize,
        getMeta,
        getSnapshots,
        getHistory,
        createSnapshot,
        restoreSnapshot,
        applyBackup,
        inspectBackup,
        readBackupFile,
        openSafeImport,
        markBackupExported,
        backupStatus,
        exportPortableCopy,
        runHealthCheck,
        renderSettingsPanels,
        addHistory,
        hasResetPin,
        setResetPin,
        verifyResetPin
    });
})();
