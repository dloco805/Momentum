/*
==========================================================
Momentum
Application Controller
Build v19.0.0
File: js/app.js
==========================================================
*/

"use strict";

const App = (() => {
    const NAV_GROUP_STORAGE_KEY = "momentum.navGroups";
    const views = {};
    let currentView = "dashboard";

    function setActiveNavigation(viewName) {
        document.querySelectorAll("[data-view]").forEach((element) => {
            if (!element.classList.contains("nav-item")) {
                return;
            }
            element.classList.toggle("is-active", element.dataset.view === viewName);
        });
    }

    function navigate(viewName, options = {}) {
        const requestedView = viewName;
        const legacyCommunityTab = requestedView === "partners"
            ? "partners"
            : requestedView === "opportunities"
                ? "opportunities"
                : "";

        if (legacyCommunityTab) {
            viewName = "community";
        }

        const resolvedView = views[viewName] ? viewName : "dashboard";
        currentView = resolvedView;

        Object.entries(views).forEach(([name, element]) => {
            element.hidden = name !== resolvedView;
        });

        const titles = {
            dashboard: "Dashboard",
            students: "Students",
            insights: "Insights",
            circles: "Circles",
            calendar: "Calendar",
            activities: "Activity Notepad",
            questionlab: "Question Lab",
            community: "Community",
            checkins: "Check-Ins",
            reports: "Reports",
            settings: "Settings",
            studentDetail: "Student Profile"
        };

        const subtitles = {
            dashboard: "Overview of student activity and next steps.",
            students: "Search, sort, and manage student records.",
            insights: "Review relationship gaps, repeated barriers, and caseload priorities.",
            circles: "Record class-circle topics, themes, questions, and follow-up ideas.",
            questionlab: "Choose the right question for a student, circle, project, or reflection.",
            community: "Manage opportunities, organizations, partners, and student connections.",
            checkins: "Record dated meetings and update only what changed.",
            reports: "Review trends, export data, and prepare advisor reports.",
            settings: "Manage backups, meeting cadence, and local data.",
            studentDetail: "Review the student profile, journey, and next steps."
        };

        const pageTitle = document.getElementById("pageTitle");
        const pageSubtitle = document.getElementById("pageSubtitle");

        if (pageTitle) {
            pageTitle.textContent = titles[resolvedView];
        }

        if (pageSubtitle) {
            pageSubtitle.textContent = subtitles[resolvedView];
        }

        setActiveNavigation(resolvedView === "studentDetail" ? "students" : resolvedView);
        document.body.classList.remove("nav-open");

        if (resolvedView === "students") {
            CaseloadReview.render();
        }

        if (resolvedView === "community") {
            CommunityUI.showTab(
                options.communityTab ||
                legacyCommunityTab ||
                CommunityUI.getActiveTab()
            );
        }

        if (resolvedView === "studentDetail" && options.studentId) {
            StudentUI.renderDetail(options.studentId);
        }

        if (resolvedView === "reports") {
            Reports.render();
        }

        if (resolvedView === "followups") {
            FollowUpCenter.render();
        }

        if (resolvedView === "checkins") {
            CheckInCenter.render();
        }


        if (resolvedView === "insights") {
            RelationshipIntelligence.render();
        }

        if (resolvedView === "calendar") {
            CalendarUI.render();
        }
        if (resolvedView === "activities") {
            ActivityUI.render();
        }


        if (resolvedView === "circles") {
            CircleUI.render();
        }

        if (resolvedView === "questionlab") {
            QuestionLabUI.render();
        }

        if (resolvedView === "followups" && typeof FollowUpCenter !== "undefined") {
            FollowUpCenter.focusStudent(options.studentId || "");
        }



        const main = document.getElementById("mainContent");
        if (main) {
            main.focus({ preventScroll: true });
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showToast(message, type = "success") {
        const region = document.getElementById("toastRegion");
        if (!region) {
            return;
        }

        const toast = document.createElement("div");
        toast.className = `toast ${type === "error" ? "is-error" : ""}`;
        toast.setAttribute("role", "status");
        toast.textContent = message;
        region.appendChild(toast);

        window.setTimeout(() => {
            toast.remove();
        }, 3200);
    }

    function handleGlobalClick(event) {
        const viewTarget = event.target.closest("[data-view]");
        if (viewTarget) {
            navigate(viewTarget.dataset.view);
            return;
        }

        const actionTarget = event.target.closest("[data-action]");
        if (!actionTarget) {
            return;
        }

        const action = actionTarget.dataset.action;

        if (action === "toggle-nav-group") {
            toggleNavGroup(actionTarget);
        } else if (action === "new-student") {
            StudentUI.openStudentForm();
        } else if (action === "export-data") {
            Storage.exportData();
            showToast("Backup exported.");
        } else if (action === "import-data") {
            document.getElementById("importFileInput").click();
        } else if (action === "view-student") {
            const studentId = actionTarget.dataset.studentId;

            if (!studentId || !StudentManager.getStudent(studentId)) {
                showToast("Student record could not be opened.", "error");
                return;
            }

            navigate("studentDetail", { studentId });
            window.setTimeout(() => {
                document.dispatchEvent(new CustomEvent("openStudentProfileTab", {
                    detail: { studentId, tab: "myMomentum" }
                }));
            }, 0);
        } else if (action === "start-dashboard-meeting") {
            const studentId = actionTarget.dataset.studentId;

            if (!studentId || !StudentManager.getStudent(studentId)) {
                showToast("Student record could not be opened.", "error");
                return;
            }

            document.dispatchEvent(new CustomEvent("openStudentMeeting", {
                detail: { studentId }
            }));
        }
    }

    function handleImport(event) {
        const [file] = event.target.files;
        event.target.value = "";

        if (!file) {
            return;
        }

        const shouldMerge = window.confirm(
            "Choose OK to merge this backup with current students.\nChoose Cancel to replace all current students."
        );

        if (!shouldMerge) {
            const confirmedReplace = window.confirm(
                "Replace all current Momentum data with this backup?"
            );
            if (!confirmedReplace) {
                return;
            }
        }

        Storage.importData(file, { mode: shouldMerge ? "merge" : "replace" })
            .then((result) => {
                showToast(`Imported ${result.count} student record${result.count === 1 ? "" : "s"}.`);
                navigate("students");
            })
            .catch((error) => {
                console.error(error);
                showToast(error.message || "Import failed.", "error");
            });
    }


    function loadNavGroupState() {
        try {
            const parsed = JSON.parse(localStorage.getItem(NAV_GROUP_STORAGE_KEY) || "{}");
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch (error) {
            console.warn("Momentum could not load navigation state.", error);
            return {};
        }
    }

    function saveNavGroupState() {
        const next = {};

        document.querySelectorAll("[data-nav-group]").forEach((group, index) => {
            const title = group.querySelector(".nav-group-toggle > span")?.textContent || `group-${index}`;
            next[title] = group.classList.contains("is-collapsed");
        });

        localStorage.setItem(NAV_GROUP_STORAGE_KEY, JSON.stringify(next));
    }

    function initializeNavGroups() {
        const saved = loadNavGroupState();

        document.querySelectorAll("[data-nav-group]").forEach((group) => {
            const toggle = group.querySelector(".nav-group-toggle");
            const title = toggle?.querySelector("span")?.textContent || "";

            if (saved[title]) {
                group.classList.add("is-collapsed");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    function toggleNavGroup(button) {
        const group = button.closest("[data-nav-group]");
        if (!group) {
            return;
        }

        const collapsed = group.classList.toggle("is-collapsed");
        button.setAttribute("aria-expanded", String(!collapsed));
        saveNavGroupState();
    }

    function initialize() {
        initializeNavGroups();

        views.dashboard = document.getElementById("dashboardView");
        views.students = document.getElementById("studentsView");
        views.insights = document.getElementById("insightsView");
        views.circles = document.getElementById("circlesView");
        views.calendar = document.getElementById("calendarView");
        views.activities = document.getElementById("activitiesView");
        views.questionlab = document.getElementById("questionLabView");
        views.community = document.getElementById("communityView");
        views.checkins = document.getElementById("checkinsView");
        views.reports = document.getElementById("reportsView");
        views.settings = document.getElementById("settingsView");
        views.studentDetail = document.getElementById("studentDetailView");

        ActivityManager.initialize();
        PlannerManager.initialize();
        Storage.initialize();
        OpportunityManager.initialize();
        PartnerManager.initialize();
        Settings.initialize();
        Dashboard.initialize(document.getElementById("dashboardContent"));
        StudentUI.initialize();
        CaseloadReview.initialize();
        RelationshipIntelligence.initialize();
        CircleUI.initialize();
        CalendarUI.initialize();
        ActivityUI.initialize();
        QuestionLabUI.initialize();
        OpportunityUI.initialize();
        PartnerUI.initialize();
        CommunityCollegeUI.initialize();
        CommunityUI.initialize();
        ImportCenter.initialize();
        Reports.initialize();
        CheckInCenter.initialize();
        MeetingWorkspace.initialize();
        DataSafety.initialize();
        UniversalTools.initialize();

        document.addEventListener("click", handleGlobalClick);
        document.getElementById("importFileInput").addEventListener("change", handleImport);

        document.addEventListener("viewStudent", (event) => {
            const detail = event.detail || {};
            const studentId = detail.studentId || detail.id || "";

            if (!studentId || !StudentManager.getStudent(studentId)) {
                showToast("Student record could not be opened.", "error");
                navigate("students");
                return;
            }

            navigate("studentDetail", { studentId });
        });

        document.addEventListener("openAddStudent", () => {
            StudentUI.openStudentForm();
        });

        document.addEventListener("momentumNavigate", (event) => {
            navigate(
                event.detail && event.detail.view,
                {
                    studentId: event.detail && event.detail.studentId
                }
            );
        });

        document.addEventListener("momentumStorageError", () => {
            showToast("Momentum could not save to local storage.", "error");
        });

        const menuButton = document.getElementById("mobileMenuButton");
        menuButton.addEventListener("click", () => {
            const isOpen = document.body.classList.toggle("nav-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });

        navigate(currentView);
    }

    return Object.freeze({
        initialize,
        navigate,
        showToast
    });
})();

document.addEventListener("DOMContentLoaded", App.initialize);
