/*
==========================================================
Momentum
Storage Module
Build v19.0.0
File: js/storage.js
==========================================================
*/

"use strict";

const Storage = (() => {
    const STORAGE_KEY = "momentum.students";
    const LEGACY_KEYS = [
        "momentumStudents",
        "students",
        "momentum_data",
        "studentData"
    ];
    const BACKUP_VERSION = 1;
    let initialized = false;
    let saveTimer = null;

    function safeParse(rawValue) {
        if (!rawValue || typeof rawValue !== "string") {
            return null;
        }

        try {
            return JSON.parse(rawValue);
        } catch (error) {
            console.warn("Momentum could not parse stored data.", error);
            return null;
        }
    }

    function extractStudentArray(value) {
        if (Array.isArray(value)) {
            return value;
        }

        if (value && typeof value === "object") {
            if (Array.isArray(value.students)) {
                return value.students;
            }

            if (value.data && Array.isArray(value.data.students)) {
                return value.data.students;
            }
        }

        return null;
    }

    function load() {
        const primary = extractStudentArray(safeParse(localStorage.getItem(STORAGE_KEY)));
        if (primary) {
            return primary;
        }

        for (const legacyKey of LEGACY_KEYS) {
            const legacy = extractStudentArray(safeParse(localStorage.getItem(legacyKey)));
            if (legacy) {
                return legacy;
            }
        }

        return [];
    }

    function save(students = StudentManager.getStudents()) {
        const payload = {
            app: "Momentum",
            version: BACKUP_VERSION,
            schemaVersion: StudentManager.SCHEMA_VERSION,
            savedAt: new Date().toISOString(),
            students,
            circles: typeof CircleManager !== "undefined"
                ? CircleManager.getCircles()
                : [],
            activities: typeof ActivityManager !== "undefined"
                ? ActivityManager.getActivities()
                : [],
            activityNotepad: typeof ActivityManager !== "undefined"
                ? ActivityManager.getNotepad()
                : "",
            plannerEvents: typeof PlannerManager !== "undefined"
                ? PlannerManager.getEvents()
                : [],
            resources: typeof ResourceManager !== "undefined"
                ? ResourceManager.getResources().filter((item) => item.custom)
                : [],
            resourceFavorites: typeof ResourceManager !== "undefined"
                ? ResourceManager.getFavorites()
                : []
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            updateStatus(`Saved ${new Date().toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
            })}`);
            return true;
        } catch (error) {
            console.error("Momentum could not save student data.", error);
            updateStatus("Storage error");
            document.dispatchEvent(new CustomEvent("momentumStorageError", {
                detail: { error }
            }));
            return false;
        }
    }

    function scheduleSave() {
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(() => save(), 80);
    }

    function initialize() {
        if (initialized) {
            return StudentManager.getStudents();
        }

        const students = load();
        StudentManager.initialize(students);
        document.addEventListener(StudentManager.DATA_CHANGED_EVENT, scheduleSave);
        initialized = true;
        save(StudentManager.getStudents());
        return StudentManager.getStudents();
    }

    function buildBackup() {
        return {
            app: "Momentum",
            version: BACKUP_VERSION,
            schemaVersion: StudentManager.SCHEMA_VERSION,
            exportedAt: new Date().toISOString(),
            students: StudentManager.getStudents(),
            circles: typeof CircleManager !== "undefined"
                ? CircleManager.getCircles()
                : [],
            activities: typeof ActivityManager !== "undefined"
                ? ActivityManager.getActivities()
                : [],
            activityNotepad: typeof ActivityManager !== "undefined"
                ? ActivityManager.getNotepad()
                : "",
            plannerEvents: typeof PlannerManager !== "undefined"
                ? PlannerManager.getEvents()
                : [],
            resources: typeof ResourceManager !== "undefined"
                ? ResourceManager.getResources().filter((item) => item.custom)
                : [],
            resourceFavorites: typeof ResourceManager !== "undefined"
                ? ResourceManager.getFavorites()
                : []
        };
    }

    function exportData() {
        const backup = buildBackup();
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);

        anchor.href = url;
        anchor.download = `momentum-backup-${date}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);

        return backup;
    }

    function importData(file, options = {}) {
        return new Promise((resolve, reject) => {
            if (!(file instanceof File)) {
                reject(new TypeError("A valid JSON file is required."));
                return;
            }

            const reader = new FileReader();

            reader.onerror = () => reject(new Error("The selected file could not be read."));

            reader.onload = () => {
                try {
                    const parsed = JSON.parse(String(reader.result || ""));
                    const imported = extractStudentArray(parsed);

                    if (!imported) {
                        throw new Error("This file does not contain a valid Momentum student list.");
                    }

                    const mode = options.mode === "merge" ? "merge" : "replace";
                    let nextStudents = imported;

                    if (mode === "merge") {
                        const current = StudentManager.getStudents();
                        const byId = new Map(current.map((student) => [student.id, student]));
                        imported.forEach((student) => {
                            const key = student && student.id
                                ? student.id
                                : `import-${Math.random()}`;
                            byId.set(key, student);
                        });
                        nextStudents = [...byId.values()];
                    }

                    StudentManager.replaceAll(nextStudents);

                    if (
                        typeof CircleManager !== "undefined" &&
                        Array.isArray(parsed.circles)
                    ) {
                        CircleManager.replaceAll(parsed.circles);
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

                    if (
                        typeof ResourceManager !== "undefined" &&
                        Array.isArray(parsed.resources)
                    ) {
                        ResourceManager.replaceCustom(
                            parsed.resources,
                            parsed.resourceFavorites || []
                        );
                    }

                    save();
                    resolve({
                        count: imported.length,
                        mode
                    });
                } catch (error) {
                    reject(error);
                }
            };

            reader.readAsText(file);
        });
    }

    function clear() {
        localStorage.removeItem(STORAGE_KEY);
        StudentManager.replaceAll([]);
        save([]);
    }

    function updateStatus(message) {
        const status = document.getElementById("storageStatus");
        if (status) {
            status.textContent = message;
        }
    }

    return Object.freeze({
        STORAGE_KEY,
        initialize,
        load,
        save,
        exportData,
        importData,
        clear,
        buildBackup
    });
})();
