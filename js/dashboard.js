/*
==========================================================
Momentum
Simple Dashboard
Build v21.0.0
File: js/dashboard.js
==========================================================
*/
"use strict";

const Dashboard = (() => {
    let root = null;

    const esc = (value) => String(value ?? "")
        .replaceAll("&","&amp;").replaceAll("<","&lt;")
        .replaceAll(">","&gt;").replaceAll('"',"&quot;");

    function name(student) {
        return student.profile.preferredName ||
            [student.profile.firstName, student.profile.lastName].filter(Boolean).join(" ") ||
            "Student";
    }

    function active(items = []) {
        return items.filter((item) =>
            item.status !== "completed" &&
            item.status !== "archived" &&
            !item.completedAt &&
            !item.archived
        );
    }

    function dateKey(value) {
        if (!value) return "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toISOString().slice(0,10);
    }

    function plannerEvents() {
        return typeof PlannerManager !== "undefined"
            ? PlannerManager.getEvents()
            : [];
    }

    function todayItems(students) {
        const today = DateUtils.today();
        const items = [];

        students.forEach((student) => {
            (student.journey.checkIns || []).forEach((checkIn) => {
                if (dateKey(checkIn.meetingDate || checkIn.createdAt) === today) {
                    items.push({
                        tone: "meeting",
                        title: name(student),
                        detail: "Meeting / Check-In",
                        studentId: student.id
                    });
                }
            });
        });

        if (typeof CircleManager !== "undefined") {
            CircleManager.getCircles()
                .filter((circle) => dateKey(circle.date) === today)
                .forEach((circle) => items.push({
                    tone: "circle",
                    title: circle.topic || circle.title || "Circle",
                    detail: "Circle"
                }));
        }

        if (typeof ActivityManager !== "undefined") {
            ActivityManager.getActivities().forEach((activity) => {
                (activity.uses || [])
                    .filter((use) => dateKey(use.date) === today)
                    .forEach(() => items.push({
                        tone: "activity",
                        title: activity.title,
                        detail: "Activity"
                    }));
            });
        }

        plannerEvents()
            .filter((item) => item.date === today && item.status !== "cancelled")
            .forEach((item) => items.push({
                tone: item.category || "other",
                title: item.title,
                detail: item.status === "postponed" ? "Postponed" : "Planned"
            }));

        return items;
    }

    function needsAttention(students) {
        return students.map((student) => {
            const reasons = [];
            const openActions = (student.journey.followUps || []).filter((item) =>
                active([item]).length
            );
            const manualAttention = openActions.some((item) =>
                item.title === "Dashboard attention"
            );
            const overdue = openActions.filter((item) =>
                item.dueDate && DateUtils.isOverdue(item.dueDate)
            ).length;
            if (manualAttention) reasons.push("Manually added for attention");
            if (overdue) reasons.push(`${overdue} overdue action item${overdue===1?"":"s"}`);
            if (!active(student.journey.currentProjects).length) reasons.push("No active project");
            if (!active(student.journey.internships).length) reasons.push("No active internship");
            if (!active(student.journey.goals).length) reasons.push("No active goal");
            return { student, reasons };
        }).filter((item) => item.reasons.length)
          .sort((a,b) => b.reasons.length-a.reasons.length)
          .slice(0,6);
    }

    function thisWeek() {
        const today = new Date();
        const end = new Date(today);
        end.setDate(today.getDate()+7);
        return plannerEvents()
            .filter((item) => {
                const date = new Date(`${item.date}T12:00:00`);
                return date >= today && date <= end && item.status !== "cancelled";
            })
            .sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
            .slice(0,8);
    }

    function recent(students) {
        const rows=[];
        students.forEach((student) => {
            (student.journey.checkIns || []).forEach((item) => rows.push({
                date: item.meetingDate || item.createdAt,
                tone: "meeting",
                title: name(student),
                detail: item.summary || "Student meeting",
                studentId: student.id
            }));
        });
        if (typeof CircleManager !== "undefined") {
            CircleManager.getCircles().forEach((item) => rows.push({
                date: item.date,
                tone: "circle",
                title: item.topic || item.title || "Circle",
                detail: "Circle"
            }));
        }
        if (typeof ActivityManager !== "undefined") {
            ActivityManager.getActivities().forEach((activity) =>
                (activity.uses || []).forEach((use) => rows.push({
                    date: use.date,
                    tone: "activity",
                    title: activity.title,
                    detail: use.howItWent || "Activity"
                }))
            );
        }
        return rows.filter((item) => item.date)
            .sort((a,b)=>String(b.date).localeCompare(String(a.date)))
            .slice(0,7);
    }

    function itemRow(item) {
        return `<button class="simple-dashboard-row tone-${esc(item.tone)}" type="button"
            ${item.studentId ? `data-action="view-student" data-student-id="${esc(item.studentId)}"` : ""}>
            <span></span>
            <div><strong>${esc(item.title)}</strong><small>${esc(item.detail || "")}</small></div>
        </button>`;
    }

    function render() {
        if (!root) return;
        const students = StudentManager.getStudents({includeArchived:false});
        const today = todayItems(students);
        const attention = needsAttention(students);
        const week = thisWeek();
        const recentRows = recent(students);

        root.innerHTML = `
            <div class="simple-dashboard">
                <section class="simple-dashboard-panel dashboard-today">
                    <div class="panel-header"><h3>Today</h3><strong>${today.length}</strong></div>
                    ${today.length ? today.map(itemRow).join("") :
                        `<p class="empty-copy">Nothing recorded or planned today.</p>`}
                </section>

                <section class="simple-dashboard-panel dashboard-attention">
                    <div class="panel-header"><h3>Needs Attention</h3><strong>${attention.length}</strong></div>
                    ${attention.length ? attention.map(({student,reasons}) => itemRow({
                        tone:"danger", title:name(student), detail:reasons.join(" · "), studentId:student.id
                    })).join("") : `<p class="empty-copy">No urgent student items.</p>`}
                </section>

                <section class="simple-dashboard-panel dashboard-week">
                    <div class="panel-header"><h3>This Week</h3><strong>${week.length}</strong></div>
                    ${week.length ? week.map((item)=>itemRow({
                        tone:item.category || "planning",
                        title:item.title,
                        detail:`${DateUtils.formatLongDate(item.date)}${item.status==="postponed"?" · Postponed":""}`
                    })).join("") : `<p class="empty-copy">No upcoming plans.</p>`}
                </section>

                <section class="simple-dashboard-panel dashboard-recent">
                    <div class="panel-header"><h3>Recent Activity</h3></div>
                    ${recentRows.length ? recentRows.map(itemRow).join("") :
                        `<p class="empty-copy">No recent activity.</p>`}
                </section>
            </div>`;
    }

    function initialize(container) {
        root = container;
        [
            StudentManager.DATA_CHANGED_EVENT,
            "circleDataChanged",
            "activityDataChanged",
            "plannerDataChanged"
        ].forEach((eventName) => document.addEventListener(eventName, render));
        render();
    }

    return Object.freeze({ initialize, render });
})();
