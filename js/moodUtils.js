/*
==========================================================
Momentum
Mood Utilities
Build v22.0.1
File: js/moodUtils.js
==========================================================
*/

"use strict";

const MoodUtils = (() => {
    const OPTIONS = Object.freeze([
        { value: "Happy", category: "positive" },
        { value: "Excited", category: "positive" },
        { value: "Proud", category: "positive" },
        { value: "Calm", category: "positive" },
        { value: "Focused", category: "positive" },
        { value: "Hopeful", category: "positive" },
        { value: "Sad", category: "sad" },
        { value: "Tired", category: "sad" },
        { value: "Lonely", category: "sad" },
        { value: "Angry", category: "angry" },
        { value: "Frustrated", category: "angry" },
        { value: "Overwhelmed", category: "angry" },
        { value: "Anxious", category: "anxious" },
        { value: "Nervous", category: "anxious" },
        { value: "Uncertain", category: "neutral" }
    ]);

    function parse(value) {
        if (Array.isArray(value)) {
            return [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))];
        }

        if (typeof value !== "string") {
            return [];
        }

        return [...new Set(
            value
                .split(/[\n,;]+/)
                .map((item) => item.trim())
                .filter(Boolean)
        )];
    }

    function serialize(values) {
        return parse(values).join(", ");
    }

    function categoryFor(value) {
        const normalized = String(value || "").trim().toLowerCase();
        const option = OPTIONS.find((item) => item.value.toLowerCase() === normalized);
        return option ? option.category : "custom";
    }

    function badgeClass(value) {
        const category = categoryFor(value);
        const classes = {
            positive: "mood-positive",
            calm: "mood-calm",
            sad: "mood-sad",
            angry: "mood-angry",
            anxious: "mood-anxious",
            neutral: "mood-neutral",
            custom: "mood-custom"
        };

        return classes[category] || classes.custom;
    }

    function renderBadges(value, escapeHtml) {
        const moods = parse(value);

        if (!moods.length) {
            return `<span class="badge mood-neutral">Mood not recorded</span>`;
        }

        return moods.map((mood) => `
            <span class="badge ${badgeClass(mood)}">${escapeHtml(mood)}</span>
        `).join("");
    }

    function renderCheckboxes(selectedValue, name = "moods") {
        const selected = new Set(parse(selectedValue).map((item) => item.toLowerCase()));

        return OPTIONS.map((option) => `
            <label class="mood-option ${badgeClass(option.value)}">
                <input type="checkbox" name="${name}" value="${option.value}"
                    ${selected.has(option.value.toLowerCase()) ? "checked" : ""}>
                <span>${option.value}</span>
            </label>
        `).join("");
    }

    function collectFromForm(formData, checkboxName, customName) {
        const selected = formData.getAll(checkboxName);
        const custom = String(formData.get(customName) || "").trim();

        if (custom) {
            selected.push(...parse(custom));
        }

        return serialize(selected);
    }

    return Object.freeze({
        OPTIONS,
        parse,
        serialize,
        categoryFor,
        badgeClass,
        renderBadges,
        renderCheckboxes,
        collectFromForm
    });
})();
