/*
==========================================================
Momentum
Settings Module
Build v21.0.0
File: js/settings.js
==========================================================
*/

"use strict";

const Settings = (() => {
    const SETTINGS_KEY = "momentum.settings";
    const BACKUP_VERSION = 1;

    const defaults = Object.freeze({
        checkInIntervalDays: 14
    });

    let values = { ...defaults };

    function load() {
        try {
            const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
            values = {
                ...defaults,
                ...(parsed && typeof parsed === "object" ? parsed : {})
            };
        } catch (error) {
            console.warn("Momentum could not load settings.", error);
            values = { ...defaults };
        }

        return getAll();
    }

    function save(nextValues = {}) {
        values = {
            ...values,
            ...nextValues
        };

        localStorage.setItem(SETTINGS_KEY, JSON.stringify(values));
        document.dispatchEvent(new CustomEvent("momentumSettingsChanged", {
            detail: getAll()
        }));

        return getAll();
    }

    function get(name) {
        return values[name];
    }

    function getAll() {
        return { ...values };
    }

    function buildFullBackup() {
        return {
            app: "Momentum",
            backupVersion: BACKUP_VERSION,
            exportedAt: new Date().toISOString(),
            students: StudentManager.getStudents(),
            opportunities: OpportunityManager.getOpportunities(),
            partners: PartnerManager.getPartners(),
            activities: typeof ActivityManager !== "undefined"
                ? ActivityManager.getActivities()
                : [],
            activityNotepad: typeof ActivityManager !== "undefined"
                ? ActivityManager.getNotepad()
                : "",
            plannerEvents: typeof PlannerManager !== "undefined"
                ? PlannerManager.getEvents()
                : [],
            settings: getAll()
        };
    }

    function exportFullBackup() {
        const backup = buildFullBackup();
        const blob = new Blob(
            [JSON.stringify(backup, null, 2)],
            { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `momentum-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);

        if (typeof DataSafety !== "undefined") {
            DataSafety.markBackupExported("Full backup");
        }

        return backup;
    }

    function importFullBackup(file) {
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
                        save(parsed.settings);
                    }

                    resolve({
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
                    });
                } catch (error) {
                    reject(error);
                }
            };

            reader.readAsText(file);
        });
    }

    function renderSummary() {
        const target = document.getElementById("settingsDataSummary");
        if (!target) {
            return;
        }

        const studentStats = StudentManager.getStatistics();
        const opportunityCount = OpportunityManager.getOpportunities().length;
        const partnerCount = PartnerManager.getPartners().length;
        const activityCount = typeof ActivityManager !== "undefined"
            ? ActivityManager.getActivities().length
            : 0;
        const plannerCount = typeof PlannerManager !== "undefined"
            ? PlannerManager.getEvents().length
            : 0;
        const checkInCount = StudentManager.getStudents().reduce(
            (sum, student) => sum + student.journey.checkIns.length,
            0
        );

        target.innerHTML = `
            <div class="settings-summary-row">
                <span>Students</span>
                <strong>${studentStats.total}</strong>
            </div>
            <div class="settings-summary-row">
                <span>Opportunities</span>
                <strong>${opportunityCount}</strong>
            </div>
            <div class="settings-summary-row">
                <span>Community partners</span>
                <strong>${partnerCount}</strong>
            </div>
            <div class="settings-summary-row">
                <span>Activity Bank</span>
                <strong>${activityCount}</strong>
            </div>
            <div class="settings-summary-row">
                <span>Planner events</span>
                <strong>${plannerCount}</strong>
            </div>
            <div class="settings-summary-row">
                <span>Recorded check-ins</span>
                <strong>${checkInCount}</strong>
            </div>
            <div class="settings-summary-row">
                <span>Storage</span>
                <strong>Local browser</strong>
            </div>
        `;
    }

    function updateDemoStatus() {
        const target = document.getElementById("demoClassStatus");
        if (!target || typeof DemoClass === "undefined") return;

        const installed = DemoClass.hasDemo();
        target.textContent = installed ? "Installed" : "Not installed";
        target.className = `badge ${installed ? "badge-success" : ""}`;
    }

    function syncForm() {
        const intervalInput = document.getElementById("checkInIntervalDays");
        if (intervalInput) {
            intervalInput.value = String(values.checkInIntervalDays);
        }

        renderSummary();
        updateDemoStatus();
        if (typeof DataSafety !== "undefined") {
            DataSafety.renderSettingsPanels();
        }
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) {
            return;
        }

        const action = target.dataset.action;

        if (action === "export-full-backup") {
            exportFullBackup();
            App.showToast("Full Momentum backup exported.");
        } else if (action === "import-full-backup") {
            document.getElementById("fullBackupInput").click();
        } else if (action === "save-settings") {
            const input = document.getElementById("checkInIntervalDays");
            const value = Math.max(1, Math.min(60, Number(input.value) || 14));
            save({ checkInIntervalDays: value });
            input.value = String(value);
            App.showToast("Settings saved.");
        } else if (action === "create-demo-class") {
            if (DemoClass.hasDemo()) {
                App.showToast("Demo Class is already installed.");
                return;
            }

            const existingStudents = StudentManager.getStudents({
                includeArchived: true
            }).length;

            if (
                existingStudents &&
                !window.confirm(
                    "Demo students will be added alongside your current students. Continue?"
                )
            ) {
                return;
            }

            const count = DemoClass.create();
            renderSummary();
            updateDemoStatus();
            App.showToast(`${count} demo students created.`);
        } else if (action === "clear-demo-class") {
            if (!DemoClass.hasDemo()) {
                App.showToast("There are no demo students to clear.");
                return;
            }

            if (!window.confirm(
                "Remove all 15 fictional demo students? Real student records will stay."
            )) {
                return;
            }

            const count = DemoClass.clear();
            renderSummary();
            updateDemoStatus();
            App.showToast(`${count} demo students removed.`);
        } else if (action === "reset-momentum") {
            const button = document.createElement("button");
            button.type = "button";
            button.dataset.action = "request-protected-reset";
            button.hidden = true;
            document.body.appendChild(button);
            button.click();
            button.remove();
        }
    }

    function handleImport(event) {
        const [file] = event.target.files;
        event.target.value = "";

        if (!file) {
            return;
        }

        DataSafety.openSafeImport(file)
            .catch((error) => {
                console.error(error);
                App.showToast(error.message || "Import failed.", "error");
            });
    }

    function initialize() {
        load();
        syncForm();

        document.addEventListener("click", handleClick);
        document.getElementById("fullBackupInput").addEventListener("change", handleImport);
        document.addEventListener(StudentManager.DATA_CHANGED_EVENT, () => {
            renderSummary();
            updateDemoStatus();
        });
        document.addEventListener(OpportunityManager.DATA_CHANGED_EVENT, renderSummary);
        document.addEventListener(PartnerManager.DATA_CHANGED_EVENT, renderSummary);
    }

    return Object.freeze({
        initialize,
        load,
        save,
        get,
        getAll,
        buildFullBackup,
        exportFullBackup,
        importFullBackup,
        renderSummary
    });
})();
