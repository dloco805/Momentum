/*
==========================================================
Momentum
Circles Manager
Build v19.0.0
==========================================================
*/
"use strict";

const CircleManager = (() => {
    const STORAGE_KEY = "momentum.circles";
    const DATA_CHANGED_EVENT = "circleDataChanged";
    let circles = [];

    function clean(value) {
        return typeof value === "string" ? value.trim() : "";
    }

    function list(value) {
        if (Array.isArray(value)) {
            return value.map(clean).filter(Boolean);
        }
        return clean(value)
            .split(/\n|,/)
            .map(clean)
            .filter(Boolean);
    }

    function id() {
        return `CIR-${Date.now().toString(36).toUpperCase()}-${Math.random()
            .toString(36).slice(2, 7).toUpperCase()}`;
    }

    function normalize(item = {}) {
        return {
            id: clean(item.id) || id(),
            date: clean(item.date) || DateUtils.today(),
            time: clean(item.time),
            title: clean(item.title) || "Class Circle",
            topic: clean(item.topic),
            guidingQuestion: clean(item.guidingQuestion),
            summary: clean(item.summary),
            studentThemes: list(item.studentThemes),
            questionsRaised: list(item.questionsRaised),
            followUpIdeas: list(item.followUpIdeas),
            participationNotes: clean(item.participationNotes),
            absentStudentIds: list(item.absentStudentIds),
            outcomes: list(item.outcomes),
            classGroup: clean(item.classGroup),
            createdAt: clean(item.createdAt) || new Date().toISOString(),
            updatedAt: clean(item.updatedAt) || clean(item.createdAt) ||
                new Date().toISOString()
        };
    }

    function emit() {
        document.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, {
            detail: { circles: getCircles() }
        }));
    }

    function load() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            circles = Array.isArray(parsed) ? parsed.map(normalize) : [];
        } catch (error) {
            console.warn("Momentum could not load circle records.", error);
            circles = [];
        }
        return getCircles();
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(circles));
    }

    function initialize() {
        load();
    }

    function getCircles() {
        return circles.map((item) => structuredClone(item));
    }

    function getCircle(circleId) {
        const found = circles.find((item) => item.id === circleId);
        return found ? structuredClone(found) : null;
    }

    function addCircle(payload) {
        const item = normalize(payload);
        circles.push(item);
        save();
        emit();
        return structuredClone(item);
    }

    function updateCircle(circleId, payload) {
        const index = circles.findIndex((item) => item.id === circleId);
        if (index < 0) return null;
        circles[index] = normalize({
            ...circles[index],
            ...payload,
            id: circleId,
            createdAt: circles[index].createdAt,
            updatedAt: new Date().toISOString()
        });
        save();
        emit();
        return structuredClone(circles[index]);
    }

    function removeCircle(circleId) {
        const before = circles.length;
        circles = circles.filter((item) => item.id !== circleId);
        if (circles.length === before) return false;
        save();
        emit();
        return true;
    }

    function replaceAll(items) {
        circles = Array.isArray(items) ? items.map(normalize) : [];
        save();
        emit();
        return getCircles();
    }

    return Object.freeze({
        STORAGE_KEY,
        DATA_CHANGED_EVENT,
        initialize,
        getCircles,
        getCircle,
        addCircle,
        updateCircle,
        removeCircle,
        replaceAll
    });
})();
