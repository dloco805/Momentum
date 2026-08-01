/*
==========================================================
Momentum
Student Manager Module
Build v0.2.0
File: js/students.js
==========================================================
*/

"use strict";

const StudentManager = (() => {

    let students = [];

    /* ======================================================
       Utilities
    ====================================================== */

    function generateId() {
        return (
            "STU-" +
            Date.now().toString(36).toUpperCase() +
            "-" +
            Math.random().toString(36).substring(2, 8).toUpperCase()
        );
    }

    function timestamp() {
        return new Date().toISOString();
    }

    function clean(value) {
        return typeof value === "string"
            ? value.trim()
            : "";
    }

    function normalizeArray(value) {

        if (Array.isArray(value)) {
            return value
                .map(item => String(item).trim())
                .filter(Boolean);
        }

        if (typeof value === "string") {
            return value
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);
        }

        return [];

    }

    function clone(value) {
        return structuredClone(value);
    }

    /* ======================================================
       Validation
    ====================================================== */

    function validate(data) {

        const errors = [];

        if (!clean(data.profile.preferredName))
            errors.push("Preferred Name is required.");

        if (!clean(data.profile.firstName))
            errors.push("First Name is required.");

        if (!clean(data.profile.lastName))
            errors.push("Last Name is required.");

        if (!clean(data.profile.grade))
            errors.push("Grade is required.");

        if (!clean(data.profile.advisor))
            errors.push("Advisor is required.");

        if (!clean(data.profile.mood))
            errors.push("Mood is required.");

        return {
            valid: errors.length === 0,
            errors
        };

    }

    /* ======================================================
       Student Factory
    ====================================================== */

    function createStudent(data = {}) {

        const student = {

            id: generateId(),

            profile: {
                preferredName: clean(data.profile?.preferredName),
                firstName: clean(data.profile?.firstName),
                lastName: clean(data.profile?.lastName),
                grade: clean(data.profile?.grade),
                advisor: clean(data.profile?.advisor),
                mood: clean(data.profile?.mood)
            },

            journey: {
                careerInterests: normalizeArray(data.journey?.careerInterests),
                currentProjects: normalizeArray(data.journey?.currentProjects),
                drivingQuestions: normalizeArray(data.journey?.drivingQuestions),
                milestones: normalizeArray(data.journey?.milestones),
                reflections: normalizeArray(data.journey?.reflections),
                newQuestions: normalizeArray(data.journey?.newQuestions)
            },

            support: {
                internships: normalizeArray(data.support?.internships),
                communityPartners: normalizeArray(data.support?.communityPartners),
                followUps: normalizeArray(data.support?.followUps),
                teacherNotes: normalizeArray(data.support?.teacherNotes)
            },

            metadata: {
                created: timestamp(),
                updated: timestamp()
            }

        };

        const validation = validate(student);

        if (!validation.valid) {
            throw new Error(validation.errors.join("\n"));
        }

        students.push(student);

        notifyChange();

        return clone(student);

    }

    /* ======================================================
       CRUD
    ====================================================== */

    function addStudent(data) {
        return createStudent(data);
    }

    function editStudent(id, updates = {}) {

        const student = students.find(s => s.id === id);

        if (!student) {
            throw new Error("Student not found.");
        }

        if (updates.profile) {

            Object.keys(student.profile).forEach(key => {

                if (key in updates.profile) {
                    student.profile[key] = clean(updates.profile[key]);
                }

            });

        }

        if (updates.journey) {

            Object.keys(student.journey).forEach(key => {

                if (key in updates.journey) {
                    student.journey[key] = normalizeArray(updates.journey[key]);
                }

            });

        }

        if (updates.support) {

            Object.keys(student.support).forEach(key => {

                if (key in updates.support) {
                    student.support[key] = normalizeArray(updates.support[key]);
                }

            });

        }

        student.metadata.updated = timestamp();

        const validation = validate(student);

        if (!validation.valid) {
            throw new Error(validation.errors.join("\n"));
        }

        notifyChange();

        return clone(student);

    }

    function deleteStudent(id) {

        const index = students.findIndex(s => s.id === id);

        if (index === -1) {
            return false;
        }

        students.splice(index, 1);

        notifyChange();

        return true;

    }

    /* ======================================================
       Retrieval
    ====================================================== */

    function getStudents() {
        return clone(students);
    }

    function getStudent(id) {

        const student = students.find(s => s.id === id);

        return student ? clone(student) : null;

    }

    /* ======================================================
       Search
    ====================================================== */

    function searchStudents(search = "") {

        const term = search.toLowerCase().trim();

        if (!term) {
            return getStudents();
        }

        return students.filter(student => {

            return (

                student.id.toLowerCase().includes(term) ||

                student.profile.preferredName.toLowerCase().includes(term) ||

                student.profile.firstName.toLowerCase().includes(term) ||

                student.profile.lastName.toLowerCase().includes(term) ||

                student.profile.grade.toLowerCase().includes(term) ||

                student.profile.advisor.toLowerCase().includes(term) ||

                student.profile.mood.toLowerCase().includes(term) ||

                student.journey.careerInterests.some(item =>
                    item.toLowerCase().includes(term)
                ) ||

                student.journey.currentProjects.some(item =>
                    item.toLowerCase().includes(term)
                ) ||

                student.journey.drivingQuestions.some(item =>
                    item.toLowerCase().includes(term)
                ) ||

                student.support.communityPartners.some(item =>
                    item.toLowerCase().includes(term)
                ) ||

                student.support.internships.some(item =>
                    item.toLowerCase().includes(term)
                )

            );

        }).map(clone);

    }

    /* ======================================================
       Collection Management
    ====================================================== */

    function replaceAll(data = []) {

        students = clone(data);

        notifyChange();

    }

    function clearAll() {

        students = [];

        notifyChange();

    }

    function count() {
        return students.length;
    }

    /* ======================================================
       Events
    ====================================================== */

    function notifyChange() {

        window.dispatchEvent(
            new CustomEvent("studentDataChanged", {
                detail: getStudents()
            })
        );

    }

    /* ======================================================
       Public API
    ====================================================== */

    return {

        addStudent,
        editStudent,
        deleteStudent,

        getStudent,
        getStudents,
        searchStudents,

        replaceAll,
        clearAll,
        count,

        validate

    };

})();

window.StudentManager = StudentManager;
