
/*
==========================================================
Momentum
Build v0.1.0
Alternative Education Student Growth Platform
==========================================================
*/

"use strict";

/* ==========================================================
   Storage Keys
========================================================== */

const STORAGE_KEY = "momentum-data";

/* ==========================================================
   Application State
========================================================== */

const appState = {
    students: [],
    settings: {},
    reports: [],
    followUps: [],
    learningJourney: [],
    lastSaved: null
};

/* ==========================================================
   Initialize
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeStorage();
    cacheElements();
    initializeNavigation();
    loadData();
    updateDashboard();
});

/* ==========================================================
   Cached Elements
========================================================== */

let navButtons = [];
let pages = [];
let pageTitle = null;

function cacheElements() {
    navButtons = document.querySelectorAll("[data-page]");
    pages = document.querySelectorAll(".page");
    pageTitle = document.getElementById("page-title");
}

/* ==========================================================
   Navigation
========================================================== */

function initializeNavigation() {

    navButtons.forEach(button => {

        button.addEventListener("click", () => {

            const page = button.dataset.page;

            showPage(page);

        });

    });

}

function showPage(pageId) {

    pages.forEach(page => {

        page.classList.remove("active");
        page.hidden = true;

    });

    navButtons.forEach(button => {

        button.classList.remove("active");

    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {

        selectedPage.hidden = false;
        selectedPage.classList.add("active");

    }

    const activeButton = document.querySelector(`[data-page="${pageId}"]`);

    if (activeButton) {

        activeButton.classList.add("active");

        if (pageTitle) {
            pageTitle.textContent = activeButton.textContent.trim();
        }

    }

}

/* ==========================================================
   Local Storage
========================================================== */

function initializeStorage() {

    if (!localStorage.getItem(STORAGE_KEY)) {

        saveData();

    }

}

function loadData() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {

        const parsed = JSON.parse(saved);

        Object.assign(appState, parsed);

    }

    catch (error) {

        console.error("Momentum: Unable to load saved data.", error);

    }

}

function saveData() {

    appState.lastSaved = new Date().toISOString();

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appState)
    );

}

/* ==========================================================
   Auto Save
========================================================== */

setInterval(() => {

    saveData();

}, 5000);

/* ==========================================================
   Student Management
========================================================== */

function getStudents() {

    return appState.students;

}

function addStudent(student) {

    appState.students.push(student);

    saveData();
    updateDashboard();

}

function updateStudent(index, updatedStudent) {

    if (!appState.students[index]) return;

    appState.students[index] = updatedStudent;

    saveData();
    updateDashboard();

}

function deleteStudent(index) {

    appState.students.splice(index, 1);

    saveData();
    updateDashboard();

}

/* ==========================================================
   Dashboard
========================================================== */

function updateDashboard() {

    renderDashboardStats();

}

function renderDashboardStats() {

    const container = document.getElementById("dashboard-container");

    if (!container) return;

    const totalStudents = appState.students.length;

    const totalFollowUps = appState.followUps.length;

    const totalJourneys = appState.learningJourney.length;

    const totalReports = appState.reports.length;

    container.innerHTML = `
        <div class="stats-grid">

            <div class="stat-card">
                <div class="stat-label">Students</div>
                <div class="stat-value">${totalStudents}</div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Learning Journeys</div>
                <div class="stat-value">${totalJourneys}</div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Follow-Ups</div>
                <div class="stat-value">${totalFollowUps}</div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Reports</div>
                <div class="stat-value">${totalReports}</div>
            </div>

        </div>
    `;

}

/* ==========================================================
   Future Module Hooks
========================================================== */

const Momentum = {

    state: appState,

    save: saveData,

    load: loadData,

    getStudents,

    addStudent,

    updateStudent,

    deleteStudent,

    refreshDashboard: updateDashboard

};

window.Momentum = Momentum;
