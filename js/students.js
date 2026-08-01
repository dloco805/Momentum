
/*
==========================================================
Momentum
Student Manager Module
Build v0.2.0
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
            Math.random().toString(36).substring(2, 7).toUpperCase()
        );
    }

    function now() {
        return new Date().toISOString();
    }

    function clean(value) {
        if (typeof value !== "string") return "";
        return value.trim();
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

    /* ======================================================
       Validation
    ====================================================== */

    function validate(student) {

        const errors = [];

        if (!clean(student.preferredName))
            errors.push("Preferred Name is required.");

        if (!clean(student.firstName))
            errors.push("First Name is required.");

        if (!clean(student.lastName))
            errors.push("Last Name is required.");

        if (!clean(student.grade))
            errors.push("Grade is required.");

        if (!clean(student.advisor))
            errors.push("Advisor is required.");

        if (!clean(student.mood))
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

            preferredName: clean(data.preferredName),

            firstName: clean(data.firstName),

            lastName: clean(data.lastName),

            grade: clean(data.grade),

            advisor: clean(data.advisor),

            mood: clean(data.mood),

            careerInterests: normalizeArray(data.careerInterests),

            projects: [],

            drivingQuestions: [],

            milestones: [],

            communityPartners: [],

            internships: [],

            reflections: [],

            newQuestions: [],

            strengths: [],

            teacherNotes: [],

            followUps: [],

            createdDate: now(),

            lastUpdated: now()

        };

        const result = validate(student);

        if (!result.valid) {
            throw new Error(result.errors.join("\n"));
        }

        students.push(student);

        return structuredClone(student);

    }

    /* ======================================================
       CRUD
    ====================================================== */

    function addStudent(data) {
        return createStudent(data);
    }

    function getStudents() {
        return students.map(student => structuredClone(student));
    }

    function getStudentById(id) {

        return students.find(student => student.id === id) || null;

    }

    function updateStudent(id, updates = {}) {

        const student = students.find(student => student.id === id);

        if (!student) {
            throw new Error("Student not found.");
        }

        const editableFields = [

            "preferredName",
            "firstName",
            "lastName",
            "grade",
            "advisor",
            "mood"

        ];

        editableFields.forEach(field => {

            if (field in updates) {
                student[field] = clean(updates[field]);
            }

        });

        if ("careerInterests" in updates) {
            student.careerInterests = normalizeArray(
                updates.careerInterests
            );
        }

        student.lastUpdated = now();

        const result = validate(student);

        if (!result.valid) {
            throw new Error(result.errors.join("\n"));
        }

        return structuredClone(student);

    }

    function deleteStudent(id) {

        const index = students.findIndex(
            student => student.id === id
        );

        if (index === -1) {
            return false;
        }

        students.splice(index, 1);

        return true;

    }

    /* ======================================================
       Search
    ====================================================== */

    function searchStudents(searchTerm = "") {

        const term = searchTerm.toLowerCase().trim();

        if (!term) {
            return getStudents();
        }

        return students.filter(student => {

            return (

                student.id.toLowerCase().includes(term) ||

                student.preferredName.toLowerCase().includes(term) ||

                student.firstName.toLowerCase().includes(term) ||

                student.lastName.toLowerCase().includes(term) ||

                student.grade.toLowerCase().includes(term) ||

                student.advisor.toLowerCase().includes(term) ||

                student.mood.toLowerCase().includes(term) ||

                student.careerInterests.some(interest =>
                    interest.toLowerCase().includes(term)
                )

            );

        }).map(student => structuredClone(student));

    }

    /* ======================================================
       Helpers
    ====================================================== */

    function count() {
        return students.length;
    }

    function clearAll() {
        students = [];
    }

    function replaceAll(studentArray = []) {

        students = studentArray.map(student => ({

            ...student,

            careerInterests: normalizeArray(student.careerInterests),
            projects: student.projects || [],
            drivingQuestions: student.drivingQuestions || [],
            milestones: student.milestones || [],
            communityPartners: student.communityPartners || [],
            internships: student.internships || [],
            reflections: student.reflections || [],
            newQuestions: student.newQuestions || [],
            strengths: student.strengths || [],
            teacherNotes: student.teacherNotes || [],
            followUps: student.followUps || []

        }));

    }

    /* ======================================================
       Public API
    ====================================================== */

    return {

        addStudent,

        updateStudent,

        deleteStudent,

        getStudents,

        getStudentById,

        searchStudents,

        count,

        clearAll,

        replaceAll,

        validate

    };

})();

window.StudentManager = StudentManager;
