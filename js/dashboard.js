
/*
==========================================================
Momentum
Dashboard Module
Build v0.2.0
==========================================================
*/

"use strict";

const Dashboard = (() => {

    let container = null;

    const CARD_CONFIG = [
        { key: "students", title: "Total Students" },
        { key: "projects", title: "Active Projects" },
        { key: "careerInterests", title: "Career Interests" },
        { key: "communityPartners", title: "Community Partners" },
        { key: "internships", title: "Internships" },
        { key: "followUps", title: "Upcoming Follow-Ups" },
        { key: "reflections", title: "Reflections" },
        { key: "drivingQuestions", title: "Driving Questions" }
    ];

    /* ======================================================
       Initialization
    ====================================================== */

    function initialize() {

        container = document.getElementById("dashboard-container");

        if (!container) {
            console.warn("Dashboard container not found.");
            return;
        }

        render();

        window.addEventListener("studentDataChanged", render);

    }

    /* ======================================================
       Student Data
    ====================================================== */

    function getStudents() {

        if (
            window.StudentManager &&
            typeof StudentManager.getStudents === "function"
        ) {
            return StudentManager.getStudents();
        }

        return [];

    }

    /* ======================================================
       Statistics
    ====================================================== */

    function calculateStatistics() {

        const students = getStudents();

        return {

            students: students.length,

            projects: countArrayItems(students, "projects"),

            careerInterests: countUniqueItems(
                students,
                "careerInterests"
            ),

            communityPartners: countUniqueItems(
                students,
                "communityPartners"
            ),

            internships: countArrayItems(
                students,
                "internships"
            ),

            followUps: countArrayItems(
                students,
                "followUps"
            ),

            reflections: countArrayItems(
                students,
                "reflections"
            ),

            drivingQuestions: countArrayItems(
                students,
                "drivingQuestions"
            )

        };

    }

    function countArrayItems(students, property) {

        return students.reduce((total, student) => {

            const list = student[property];

            if (!Array.isArray(list)) {
                return total;
            }

            return total + list.length;

        }, 0);

    }

    function countUniqueItems(students, property) {

        const values = new Set();

        students.forEach(student => {

            const list = student[property];

            if (!Array.isArray(list)) {
                return;
            }

            list.forEach(item => {

                if (String(item).trim()) {
                    values.add(String(item).trim());
                }

            });

        });

        return values.size;

    }

    /* ======================================================
       Rendering
    ====================================================== */

    function render() {

        if (!container) return;

        const stats = calculateStatistics();

        container.innerHTML = "";

        const grid = document.createElement("div");
        grid.className = "stats-grid";

        CARD_CONFIG.forEach(card => {

            grid.appendChild(
                createCard(
                    card.title,
                    stats[card.key]
                )
            );

        });

        container.appendChild(grid);

    }

    function createCard(title, value) {

        const card = document.createElement("div");
        card.className = "stat-card";

        const label = document.createElement("div");
        label.className = "stat-label";
        label.textContent = title;

        const number = document.createElement("div");
        number.className = "stat-value";
        number.textContent = value;

        card.appendChild(label);
        card.appendChild(number);

        return card;

    }

    /* ======================================================
       Notifications
    ====================================================== */

    function refresh() {

        render();

    }

    function notifyDataChanged() {

        window.dispatchEvent(
            new Event("studentDataChanged")
        );

    }

    /* ======================================================
       Public API
    ====================================================== */

    return {

        initialize,

        refresh,

        notifyDataChanged,

        calculateStatistics

    };

})();

/* ==========================================================
   Auto Initialize
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    Dashboard.initialize();

});
