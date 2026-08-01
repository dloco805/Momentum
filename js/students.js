/*
==========================================================
Momentum
Student UI Module
Build v0.3.0
File: js/studentUI.js

Responsibilities
----------------------------------------------------------
- Student browser UI
- Live search
- Student count
- Student cards
- Empty state
- UI events

Dependencies
----------------------------------------------------------
StudentManager
Dashboard (optional refresh)
Storage (handled elsewhere)

This module intentionally does NOT manage student data.
==========================================================
*/

const StudentUI = (() => {

    "use strict";

    //======================================================
    // Private State
    //======================================================

    let root = null;
    let searchInput = null;
    let countLabel = null;
    let cardContainer = null;
    let addButton = null;

    let currentSearch = "";

    //======================================================
    // Initialization
    //======================================================

    function initialize(containerId = "studentBrowser") {

        root = document.getElementById(containerId);

        if (!root) {
            console.warn("StudentUI: Container not found:", containerId);
            return;
        }

        buildLayout();

        bindEvents();

        refresh();
    }

    //======================================================
    // Layout
    //======================================================

    function buildLayout() {

        root.innerHTML = "";

        //--------------------------------------------------
        // Wrapper
        //--------------------------------------------------

        const wrapper = document.createElement("div");
        wrapper.className = "student-ui";

        //--------------------------------------------------
        // Header
        //--------------------------------------------------

        const title = document.createElement("h2");
        title.textContent = "Students";

        countLabel = document.createElement("div");
        countLabel.className = "student-count";

        wrapper.appendChild(title);
        wrapper.appendChild(countLabel);

        //--------------------------------------------------
        // Toolbar
        //--------------------------------------------------

        const toolbar = document.createElement("div");
        toolbar.className = "student-toolbar";

        searchInput = document.createElement("input");
        searchInput.type = "search";
        searchInput.placeholder = "🔍 Search Students...";
        searchInput.autocomplete = "off";

        addButton = document.createElement("button");
        addButton.type = "button";
        addButton.textContent = "+ New Student";

        toolbar.appendChild(searchInput);
        toolbar.appendChild(addButton);

        wrapper.appendChild(toolbar);

        //--------------------------------------------------
        // Cards
        //--------------------------------------------------

        cardContainer = document.createElement("div");
        cardContainer.className = "student-card-container";

        wrapper.appendChild(cardContainer);

        root.appendChild(wrapper);
    }

    //======================================================
    // Events
    //======================================================

    function bindEvents() {

        //--------------------------------------------------
        // Live Search
        //--------------------------------------------------

        searchInput.addEventListener("input", () => {

            currentSearch = searchInput.value.trim();

            render();

        });

        //--------------------------------------------------
        // New Student
        //--------------------------------------------------

        addButton.addEventListener("click", () => {

            document.dispatchEvent(
                new CustomEvent("openAddStudent")
            );

        });

        //--------------------------------------------------
        // Automatic Refresh
        //--------------------------------------------------

        document.addEventListener("studentDataChanged", () => {

            refresh();

        });

    }

    //======================================================
    // Refresh
    //======================================================

    function refresh() {

        updateCount();

        render();

        if (typeof Dashboard !== "undefined" &&
            typeof Dashboard.refresh === "function") {

            Dashboard.refresh();

        }

    }

    //======================================================
    // Render
    //======================================================

    function render() {

        cardContainer.innerHTML = "";

        let students = [];

        if (currentSearch.length > 0 &&
            typeof StudentManager.searchStudents === "function") {

            students = StudentManager.searchStudents(currentSearch);

        } else {

            students = StudentManager.getStudents();

        }

        updateCount();

        if (!students || students.length === 0) {

            renderEmptyState();

            return;

        }

        students.forEach(student => {

            cardContainer.appendChild(
                renderStudentCard(student)
            );

        });

    }

    //======================================================
    // Student Count
    //======================================================

    function updateCount() {

        const total = StudentManager.getStudents().length;

        countLabel.textContent =
            `${total} Student${total === 1 ? "" : "s"}`;

    }

    //======================================================
    // Student Card
    //======================================================

    function renderStudentCard(student) {

        const card = document.createElement("div");
        card.className = "student-card";

        //--------------------------------------------------
        // Name
        //--------------------------------------------------

        const preferred = document.createElement("h3");
        preferred.textContent =
            student.preferredName ||
            student.firstName ||
            "Unnamed Student";

        card.appendChild(preferred);

        //--------------------------------------------------
        // Full Name
        //--------------------------------------------------

        const fullName = document.createElement("div");
        fullName.className = "student-field";

        fullName.textContent =
            `${student.firstName || ""} ${student.lastName || ""}`.trim();

        card.appendChild(fullName);

        //--------------------------------------------------
        // Helper
        //--------------------------------------------------

        function addField(label, value) {

            const div = document.createElement("div");
            div.className = "student-field";

            div.textContent = `${label}: ${value}`;

            card.appendChild(div);

        }

        //--------------------------------------------------
        // Standard Fields
        //--------------------------------------------------

        addField("Grade", student.grade || "-");
        addField("Advisor", student.advisor || "-");
        addField("Mood", student.mood || "-");

        //--------------------------------------------------
        // Interests
        //--------------------------------------------------

        let interests = [];

        if (Array.isArray(student.interests)) {

            interests = student.interests
                .slice(0, 3);

        }

        addField(
            "Interests",
            interests.length > 0
                ? interests.join(", ")
                : "-"
        );

        //--------------------------------------------------
        // Projects
        //--------------------------------------------------

        const projects =
            Array.isArray(student.projects)
                ? student.projects.length
                : 0;

        addField(
            "Current Projects",
            projects
        );

        //--------------------------------------------------
        // Follow Ups
        //--------------------------------------------------

        const followUps =
            Array.isArray(student.followUps)
                ? student.followUps.length
                : 0;

        addField(
            "Follow-Ups",
            followUps
        );

        //--------------------------------------------------
        // Updated
        //--------------------------------------------------

        addField(
            "Last Updated",
            student.updatedAt ||
            student.lastUpdated ||
            "-"
        );

        //--------------------------------------------------
        // Buttons
        //--------------------------------------------------

        const buttonBar = document.createElement("div");
        buttonBar.className = "student-card-buttons";

        buttonBar.appendChild(createViewButton(student.id));
        buttonBar.appendChild(createEditButton(student.id));
        buttonBar.appendChild(createDeleteButton(student.id));
        buttonBar.appendChild(createSearchButton(student));

        card.appendChild(buttonBar);

        return card;

    }

    //======================================================
    // Buttons
    //======================================================

    function createButton(text, handler) {

        const button = document.createElement("button");

        button.type = "button";
        button.textContent = text;

        button.addEventListener("click", handler);

        return button;

    }

    function createViewButton(id) {

        return createButton("View", () => {

            document.dispatchEvent(
                new CustomEvent("viewStudent", {
                    detail: { id }
                })
            );

        });

    }

    function createEditButton(id) {

        return createButton("Edit", () => {

            document.dispatchEvent(
                new CustomEvent("editStudent", {
                    detail: { id }
                })
            );

        });

    }

    function createDeleteButton(id) {

        return createButton("Delete", () => {

            const confirmed = window.confirm(
                "Delete this student?"
            );

            if (!confirmed) return;

            StudentManager.deleteStudent(id);

        });

    }

    function createSearchButton(student) {

        return createButton("Search", () => {

            const query =
                student.preferredName ||
                student.firstName ||
                "";

            searchInput.value = query;

            currentSearch = query;

            render();

        });

    }

    //======================================================
    // Empty State
    //======================================================

    function renderEmptyState() {

        const empty = document.createElement("div");

        empty.className = "student-empty-state";

        const title = document.createElement("h3");
        title.textContent = "No students yet.";

        const message = document.createElement("p");
        message.textContent =
            'Click "New Student" to add your first student.';

        empty.appendChild(title);
        empty.appendChild(message);

        cardContainer.appendChild(empty);

    }

    //======================================================
    // Public API
    //======================================================

    return {

        initialize,
        render,
        refresh,
        renderStudentCard,
        renderEmptyState

    };

})();
