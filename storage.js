/*
==========================================================
Momentum
Storage Module
Build v0.2.0
==========================================================
*/

"use strict";

const Storage = (() => {

    const STORAGE_KEY = "momentum.students";
    const BACKUP_KEY = "momentum.backup";
    const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

    /* ======================================================
       Helpers
    ====================================================== */

    function getStudentData() {

        if (
            window.StudentManager &&
            typeof StudentManager.getStudents === "function"
        ) {
            return StudentManager.getStudents();
        }

        return [];

    }

    function setStudentData(data) {

        if (
            window.StudentManager &&
            typeof StudentManager.replaceAll === "function"
        ) {
            StudentManager.replaceAll(data);
        }

    }

    function download(filename, text) {

        const blob = new Blob(
            [text],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    }

    /* ======================================================
       Save
    ====================================================== */

    function saveStudents() {

        try {

            const students = getStudentData();

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(students)
            );

            return true;

        }

        catch (error) {

            console.error("Save failed:", error);

            return false;

        }

    }

    /* ======================================================
       Load
    ====================================================== */

    function loadStudents() {

        try {

            const data = localStorage.getItem(STORAGE_KEY);

            if (!data) {

                setStudentData([]);

                return [];

            }

            const students = JSON.parse(data);

            setStudentData(students);

            return students;

        }

        catch (error) {

            console.error("Load failed:", error);

            return [];

        }

    }

    /* ======================================================
       Backup
    ====================================================== */

    function backupData() {

        try {

            const backup = {

                version: "0.2.0",

                timestamp: new Date().toISOString(),

                students: getStudentData()

            };

            const json = JSON.stringify(
                backup,
                null,
                2
            );

            localStorage.setItem(
                BACKUP_KEY,
                json
            );

            download(
                `Momentum_Backup_${Date.now()}.json`,
                json
            );

            return backup;

        }

        catch (error) {

            console.error("Backup failed:", error);

            return null;

        }

    }

    /* ======================================================
       Restore
    ====================================================== */

    function restoreData(jsonData) {

        try {

            const backup = typeof jsonData === "string"
                ? JSON.parse(jsonData)
                : jsonData;

            if (!backup.students) {
                throw new Error("Invalid backup file.");
            }

            setStudentData(backup.students);

            saveStudents();

            return true;

        }

        catch (error) {

            console.error("Restore failed:", error);

            return false;

        }

    }

    /* ======================================================
       Import JSON
    ====================================================== */

    function importJSON(file) {

        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = event => {

                const success = restoreData(
                    event.target.result
                );

                if (success) {

                    resolve(true);

                } else {

                    reject(
                        new Error("Import failed.")
                    );

                }

            };

            reader.onerror = () => {

                reject(
                    new Error("Unable to read file.")
                );

            };

            reader.readAsText(file);

        });

    }

    /* ======================================================
       Export JSON
    ====================================================== */

    function exportJSON() {

        return backupData();

    }

    /* ======================================================
       Clear Database
    ====================================================== */

    function clearDatabase() {

        try {

            localStorage.removeItem(STORAGE_KEY);

            if (
                window.StudentManager &&
                typeof StudentManager.clearAll === "function"
            ) {
                StudentManager.clearAll();
            }

            return true;

        }

        catch (error) {

            console.error(
                "Unable to clear database:",
                error
            );

            return false;

        }

    }

    /* ======================================================
       Auto Save
    ====================================================== */

    function startAutoSave() {

        saveStudents();

        return setInterval(() => {

            saveStudents();

        }, AUTO_SAVE_INTERVAL);

    }

    /* ======================================================
       Initialize
    ====================================================== */

    function initialize() {

        loadStudents();

        startAutoSave();

        window.addEventListener("beforeunload", () => {

            saveStudents();

        });

    }

    /* ======================================================
       Public API
    ====================================================== */

    return {

        initialize,

        saveStudents,

        loadStudents,

        backupData,

        restoreData,

        clearDatabase,

        exportJSON,

        importJSON

    };

})();

document.addEventListener("DOMContentLoaded", () => {

    Storage.initialize();

});
