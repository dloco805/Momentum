/*
==========================================================
Momentum
Date Utilities
Build v19.0.0
File: js/dateUtils.js
==========================================================
*/

"use strict";

const DateUtils = (() => {
    function isDateOnly(value) {
        return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
    }

    function parseLocalDate(value) {
        if (!value) {
            return null;
        }

        if (value instanceof Date) {
            return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
        }

        if (isDateOnly(value)) {
            const [year, month, day] = value.split("-").map(Number);
            const date = new Date(year, month - 1, day, 12, 0, 0, 0);
            return Number.isNaN(date.getTime()) ? null : date;
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function toDateInputValue(value = new Date()) {
        const date = parseLocalDate(value) || new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function today() {
        return toDateInputValue(new Date());
    }

    function toTimeInputValue(value = new Date()) {
        const date = parseLocalDate(value) || new Date();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    function nowTime() {
        return toTimeInputValue(new Date());
    }

    function combineLocalDateTime(dateValue, timeValue = "12:00") {
        if (!dateValue) {
            return null;
        }

        const safeTime = /^\d{2}:\d{2}$/.test(String(timeValue || ""))
            ? String(timeValue)
            : "12:00";

        const [year, month, day] = String(dateValue).split("-").map(Number);
        const [hours, minutes] = safeTime.split(":").map(Number);
        const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    function formatTime(value, options = {}) {
        if (!value) {
            return options.fallback || "Time not set";
        }

        if (typeof value === "string" && /^\d{2}:\d{2}$/.test(value)) {
            const [hours, minutes] = value.split(":").map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
            });
        }

        const date = parseLocalDate(value);
        if (!date) {
            return options.fallback || "Time not set";
        }

        return date.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function formatDateTime(dateValue, timeValue, options = {}) {
        const date = combineLocalDateTime(dateValue, timeValue);
        if (!date) {
            return options.fallback || "Not set";
        }

        return date.toLocaleString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }


    function formatDate(value, options = {}) {
        const date = parseLocalDate(value);
        if (!date) {
            return options.fallback || "Not set";
        }

        return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
            ...options
        });
    }

    function formatLongDate(value) {
        return formatDate(value, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function startOfToday() {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }

    function compareDateOnly(value, reference = new Date()) {
        const date = parseLocalDate(value);
        if (!date) {
            return null;
        }

        const left = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const ref = parseLocalDate(reference) || new Date();
        const right = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());

        if (left.getTime() < right.getTime()) {
            return -1;
        }
        if (left.getTime() > right.getTime()) {
            return 1;
        }
        return 0;
    }

    function isOverdue(value) {
        return compareDateOnly(value) === -1;
    }

    function isToday(value) {
        return compareDateOnly(value) === 0;
    }

    function daysBetween(fromValue, toValue = new Date()) {
        const from = parseLocalDate(fromValue);
        const to = parseLocalDate(toValue);

        if (!from || !to) {
            return null;
        }

        const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate());
        const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate());

        return Math.floor((toDay.getTime() - fromDay.getTime()) / 86400000);
    }

    function addDays(value, amount) {
        const date = parseLocalDate(value) || new Date();
        const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        result.setDate(result.getDate() + Number(amount || 0));
        return toDateInputValue(result);
    }

    return Object.freeze({
        parseLocalDate,
        toDateInputValue,
        today,
        toTimeInputValue,
        nowTime,
        combineLocalDateTime,
        formatTime,
        formatDateTime,
        formatDate,
        formatLongDate,
        startOfToday,
        compareDateOnly,
        isOverdue,
        isToday,
        daysBetween,
        addDays
    });
})();
