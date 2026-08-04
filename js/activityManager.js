/*
==========================================================
Momentum
Activity Bank Manager
Build v22.0.1
File: js/activityManager.js
==========================================================
*/
"use strict";

const ActivityManager = (() => {
    const STORAGE_KEY = "momentum.activities";
    const NOTEPAD_KEY = "momentum.activityNotepad";
    const DATA_CHANGED_EVENT = "activityDataChanged";
    let activities = [];

    const clean = (value) => typeof value === "string" ? value.trim() : "";

    function cleanList(value) {
        if (Array.isArray(value)) return value.map(clean).filter(Boolean);
        return clean(value).split(/\n|,/).map(clean).filter(Boolean);
    }

    function createId(prefix = "ACT") {
        return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
            .toString(36).slice(2, 7).toUpperCase()}`;
    }

    function normalizeUse(use = {}) {
        return {
            id: clean(use.id) || createId("USE"),
            date: clean(use.date || use.usedDate),
            time: clean(use.time || use.usedTime),
            howItWent: clean(use.howItWent || use.notes),
            nextTime: clean(use.nextTime),
            createdAt: clean(use.createdAt) || new Date().toISOString()
        };
    }

    function normalize(item = {}) {
        let uses = Array.isArray(item.uses)
            ? item.uses.map(normalizeUse).filter((use) => use.date)
            : [];

        if (!uses.length && item.usedDate) {
            uses = [normalizeUse({
                date: item.usedDate,
                time: item.usedTime,
                howItWent: item.howItWent,
                nextTime: item.nextTime,
                createdAt: item.updatedAt
            })];
        }

        const latestUse = [...uses].sort((a,b) =>
            `${b.date}T${b.time || "23:59"}`.localeCompare(`${a.date}T${a.time || "23:59"}`)
        )[0] || null;

        const createdAt = clean(item.createdAt) || new Date().toISOString();

        return {
            id: clean(item.id) || createId(),
            title: clean(item.title) || "Untitled Activity",
            category: clean(item.category) || "Activity",
            notes: clean(item.notes),
            tags: cleanList(item.tags),
            status: ["idea","ready","used"].includes(item.status)
                ? item.status
                : uses.length ? "used" : "idea",
            uses,
            usedDate: latestUse?.date || clean(item.usedDate),
            usedTime: latestUse?.time || clean(item.usedTime),
            howItWent: latestUse?.howItWent || clean(item.howItWent),
            nextTime: latestUse?.nextTime || clean(item.nextTime),
            createdAt,
            updatedAt: clean(item.updatedAt) || createdAt
        };
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    }

    function emit() {
        document.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, {
            detail: { activities: getActivities() }
        }));
    }

    function initialize(items = null) {
        if (Array.isArray(items)) {
            activities = items.map(normalize);
            save();
            return getActivities();
        }

        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            activities = Array.isArray(parsed) ? parsed.map(normalize) : [];
        } catch (error) {
            console.warn("Momentum could not load Activity Bank records.", error);
            activities = [];
        }

        return getActivities();
    }

    function getActivities() {
        return activities.map((item) => structuredClone(item));
    }

    function getActivity(activityId) {
        const found = activities.find((item) => item.id === activityId);
        return found ? structuredClone(found) : null;
    }

    function addActivity(payload) {
        const item = normalize(payload);
        activities.unshift(item);
        save();
        emit();
        return structuredClone(item);
    }

    function updateActivity(activityId, payload) {
        const index = activities.findIndex((item) => item.id === activityId);
        if (index < 0) return null;

        activities[index] = normalize({
            ...activities[index],
            ...payload,
            id: activityId,
            createdAt: activities[index].createdAt,
            updatedAt: new Date().toISOString()
        });

        save();
        emit();
        return structuredClone(activities[index]);
    }

    function markUsed(activityId, payload = {}) {
        const current = getActivity(activityId);
        if (!current) return null;

        const use = normalizeUse({
            date: clean(payload.usedDate) || DateUtils.today(),
            time: payload.usedTime,
            howItWent: payload.howItWent,
            nextTime: payload.nextTime
        });

        return updateActivity(activityId, {
            status: "used",
            uses: [...current.uses, use]
        });
    }

    function duplicateActivity(activityId) {
        const source = getActivity(activityId);
        if (!source) return null;

        return addActivity({
            title: `${source.title} — Copy`,
            category: source.category,
            notes: source.notes,
            tags: source.tags,
            status: "idea",
            uses: []
        });
    }

    function removeActivity(activityId) {
        const before = activities.length;
        activities = activities.filter((item) => item.id !== activityId);
        if (activities.length === before) return false;
        save();
        emit();
        return true;
    }

    function getNotepad() {
        return localStorage.getItem(NOTEPAD_KEY) || "";
    }

    function saveNotepad(value) {
        localStorage.setItem(NOTEPAD_KEY, String(value || ""));
        return getNotepad();
    }

    function replaceAll(items) {
        activities = Array.isArray(items) ? items.map(normalize) : [];
        save();
        emit();
        return getActivities();
    }

    return Object.freeze({
        STORAGE_KEY,
        NOTEPAD_KEY,
        DATA_CHANGED_EVENT,
        initialize,
        getActivities,
        getActivity,
        addActivity,
        updateActivity,
        markUsed,
        duplicateActivity,
        removeActivity,
        getNotepad,
        saveNotepad,
        replaceAll
    });
})();
