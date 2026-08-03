/*
==========================================================
Momentum
Student Manager Module
Build v21.0.0
File: js/studentManager.js
==========================================================
*/

"use strict";

const StudentManager = (() => {
    const DATA_CHANGED_EVENT = "studentDataChanged";
    const SCHEMA_VERSION = 4;
    let students = [];

    const PROFILE_ARRAY_FIELDS = [
        "interests",
        "postSecondaryGoals"
    ];

    const JOURNEY_ARRAY_FIELDS = [
        "dreamJobs",
        "currentProjects",
        "drivingQuestions",
        "milestones",
        "reflections",
        "newQuestions",
        "notes",
        "opportunityEngagements",
        "internships",
        "partnerEngagements",
        "goals",
        "evidence",
        "checkIns",
        "followUps"
    ];

    function now() {
        return new Date().toISOString();
    }

    function createId(prefix = "STU") {
        const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
        return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomPart}`;
    }

    function clone(value) {
        if (typeof structuredClone === "function") {
            return structuredClone(value);
        }
        return JSON.parse(JSON.stringify(value));
    }

    function cleanString(value) {
        return typeof value === "string" ? value.trim() : "";
    }

    function cleanArray(value) {
        if (Array.isArray(value)) {
            return [...new Set(value.map(cleanString).filter(Boolean))];
        }

        if (typeof value === "string") {
            return [...new Set(
                value
                    .split(/[\n,;]+/)
                    .map(cleanString)
                    .filter(Boolean)
            )];
        }

        return [];
    }

    function cleanRecordArray(value, type) {
        if (!Array.isArray(value)) {
            return [];
        }

        return value
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
                id: cleanString(item.id) || createId(type),
                title: cleanString(item.title || item.name || item.question || item.text),
                description: cleanString(item.description || item.notes || item.detail),
                status: cleanString(item.status) || (item.archived ? "archived" : "active"),
                archived: Boolean(item.archived || item.status === "archived"),
                dueDate: cleanString(item.dueDate || item.date),
                completedAt: cleanString(item.completedAt),
                phase: cleanString(item.phase),
                projectQuestion: cleanString(item.projectQuestion),
                skills: cleanArray(item.skills),
                partners: cleanArray(item.partners),
                evidence: cleanArray(item.evidence),
                reflections: cleanArray(item.reflections),
                nextSteps: cleanArray(item.nextSteps),
                organization: cleanString(item.organization),
                supervisor: cleanString(item.supervisor),
                supervisorEmail: cleanString(item.supervisorEmail),
                supervisorPhone: cleanString(item.supervisorPhone),
                location: cleanString(item.location),
                schedule: cleanString(item.schedule),
                hoursPerWeek: cleanString(item.hoursPerWeek),
                currentObjective: cleanString(item.currentObjective),
                nextShift: cleanString(item.nextShift),
                startDate: cleanString(item.startDate),
                endDate: cleanString(item.endDate),
                responsibilities: cleanArray(item.responsibilities),
                category: cleanString(item.category),
                progress: Math.max(0, Math.min(100, Number(item.progress) || 0)),
                successCriteria: cleanString(item.successCriteria),
                supportNeeded: cleanString(item.supportNeeded),
                checkpoints: cleanArray(item.checkpoints),
                progressNotes: cleanArray(item.progressNotes),
                linkedProjectId: cleanString(item.linkedProjectId),
                linkedInternshipId: cleanString(item.linkedInternshipId),
                activityLog: Array.isArray(item.activityLog)
                    ? item.activityLog
                        .filter((entry) => entry && typeof entry === "object")
                        .map((entry) => ({
                            id: cleanString(entry.id) || createId("UPD"),
                            date: cleanString(entry.date) || now().slice(0, 10),
                            time: cleanString(entry.time),
                            type: cleanString(entry.type) || "Update",
                            note: cleanString(entry.note || entry.description),
                            nextStep: cleanString(entry.nextStep),
                            source: cleanString(entry.source) || "Manual",
                            meetingId: cleanString(entry.meetingId),
                            createdAt: cleanString(entry.createdAt) || now()
                        }))
                        .filter((entry) => entry.note || entry.nextStep)
                    : [],
                createdAt: cleanString(item.createdAt) || now(),
                updatedAt: cleanString(item.updatedAt) || cleanString(item.createdAt) || now()
            }))
            .filter((item) => item.title || item.description);
    }

    function normalizeLegacyStudent(input = {}) {
        const source = input && typeof input === "object" ? input : {};
        const legacyName = cleanString(source.name || source.studentName);
        const nameParts = legacyName.split(/\s+/).filter(Boolean);

        const profileSource = source.profile && typeof source.profile === "object"
            ? source.profile
            : {};

        const journeySource = source.journey && typeof source.journey === "object"
            ? source.journey
            : {};

        const metaSource = source.meta && typeof source.meta === "object"
            ? source.meta
            : {};

        const createdAt = cleanString(metaSource.createdAt || source.createdAt) || now();
        const updatedAt = cleanString(metaSource.updatedAt || source.updatedAt) || createdAt;

        const profile = {
            preferredName: cleanString(profileSource.preferredName || source.preferredName || source.nickname),
            firstName: cleanString(profileSource.firstName || source.firstName || nameParts[0]),
            lastName: cleanString(
                profileSource.lastName ||
                source.lastName ||
                (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "")
            ),
            grade: cleanString(profileSource.grade || source.grade),
            advisor: cleanString(profileSource.advisor || source.advisor),
            mood: cleanString(profileSource.mood || source.mood || source.vibe),
            interests: cleanArray([
                ...cleanArray(profileSource.interests || source.interests),
                ...cleanArray(profileSource.hobbies || source.hobbies),
                ...cleanArray(profileSource.passions || source.passions),
                ...cleanArray(profileSource.strengths || source.strengths),
                ...cleanArray(
                    profileSource.learningPreferences || source.learningPreferences
                )
            ]),
            postSecondaryGoals: cleanArray(
                profileSource.postSecondaryGoals || source.postSecondaryGoals
            ),
            studentVoice: cleanString(
                profileSource.studentVoice || source.studentVoice || source.voice
            ),
            portfolioUrl: cleanString(
                profileSource.portfolioUrl ||
                source.portfolioUrl ||
                source.googleSiteUrl ||
                source.portfolioLink
            ),
            currentFocus: cleanString(
                profileSource.currentFocus || source.currentFocus
            ),
            focusWhy: cleanString(
                profileSource.focusWhy || source.focusWhy
            ),
            focusNextAction: cleanString(
                profileSource.focusNextAction || source.focusNextAction
            ),
            discovery: {
                futureDirection: cleanString(profileSource.discovery?.futureDirection || source.futureDirection) || "not-yet",
                favoriteYouTube: cleanArray(profileSource.discovery?.favoriteYouTube || source.favoriteYouTube),
                favoriteGames: cleanArray(profileSource.discovery?.favoriteGames || source.favoriteGames),
                favoriteMedia: cleanArray(profileSource.discovery?.favoriteMedia || source.favoriteMedia),
                freeTime: cleanArray(profileSource.discovery?.freeTime || source.freeTime),
                curiosities: cleanArray(profileSource.discovery?.curiosities || source.curiosities),
                thingsToTry: cleanArray(profileSource.discovery?.thingsToTry || source.thingsToTry),
                thingsToLearn: cleanArray(profileSource.discovery?.thingsToLearn || source.thingsToLearn),
                othersNotice: cleanArray(profileSource.discovery?.othersNotice || source.othersNotice)
            },
            transportation: {
                modes: cleanArray(
                    profileSource.transportation?.modes ||
                    source.transportationModes ||
                    profileSource.transportation?.primaryMode ||
                    source.transportationMode
                ),
                primaryMode: cleanString(profileSource.transportation?.primaryMode || source.transportationMode),
                licenseStatus: cleanString(profileSource.transportation?.licenseStatus || source.licenseStatus),
                hasReliableAccess: Boolean(profileSource.transportation?.hasReliableAccess ?? source.hasReliableTransportation),
                notes: cleanString(profileSource.transportation?.notes || source.transportationNotes)
            }
        };

        const journey = {
            dreamJobs: cleanArray(
                journeySource.dreamJobs ||
                source.dreamJobs ||
                journeySource.careerInterests ||
                source.careerInterests
            ),
            currentProjects: cleanRecordArray(
                journeySource.currentProjects || source.currentProjects,
                "PRJ"
            ),
            drivingQuestions: cleanRecordArray(
                journeySource.drivingQuestions || source.drivingQuestions,
                "QUE"
            ),
            milestones: cleanRecordArray(
                journeySource.milestones || source.milestones,
                "MIL"
            ),
            reflections: cleanRecordArray(
                journeySource.reflections || source.reflections,
                "REF"
            ),
            newQuestions: cleanRecordArray(
                journeySource.newQuestions || source.newQuestions,
                "NQ"
            ),
            notes: cleanRecordArray(
                journeySource.notes || source.notes || source.studentNotes,
                "NOT"
            ),
            observations: Array.isArray(journeySource.observations || source.observations)
                ? (journeySource.observations || source.observations).filter(Boolean).map((item) => ({
                    id: cleanString(item.id) || createId("OBS"),
                    date: cleanString(item.date) || now().slice(0, 10),
                    time: cleanString(item.time),
                    category: cleanString(item.category) || "General",
                    note: cleanString(item.note || item.description),
                    strength: cleanString(item.strength),
                    barrier: cleanString(item.barrier),
                    supportProvided: cleanString(item.supportProvided),
                    nextMove: cleanString(item.nextMove),
                    followUpNeeded: Boolean(item.followUpNeeded),
                    createdAt: cleanString(item.createdAt) || now(),
                    updatedAt: cleanString(item.updatedAt) || cleanString(item.createdAt) || now()
                })) : [],
            checkIns: Array.isArray(journeySource.checkIns || source.checkIns)
                ? (journeySource.checkIns || source.checkIns)
                    .filter((item) => item && typeof item === "object")
                    .map((item) => ({
                        id: cleanString(item.id) || createId("CHK"),
                        meetingDate: cleanString(item.meetingDate || item.date),
                        meetingTime: cleanString(item.meetingTime || item.time),
                        summary: cleanString(item.summary),
                        mood: cleanString(item.mood),
                        projectUpdates: cleanArray(item.projectUpdates),
                        opportunityUpdates: cleanArray(item.opportunityUpdates),
                        followUpUpdates: cleanArray(item.followUpUpdates),
                        reflection: cleanString(item.reflection),
                        newQuestions: cleanArray(item.newQuestions),
                        nextSteps: cleanArray(item.nextSteps),
                        nextMeetingDate: cleanString(item.nextMeetingDate),
                        meetingTopics: cleanArray(item.meetingTopics),
                        createdAt: cleanString(item.createdAt) || now(),
                        updatedAt: cleanString(item.updatedAt) || cleanString(item.createdAt) || now()
                    }))
                : [],
            actionPlans: Array.isArray(journeySource.actionPlans || source.actionPlans)
                ? (journeySource.actionPlans || source.actionPlans)
                    .filter((item) => item && typeof item === "object")
                    .map((item) => ({
                        id: cleanString(item.id) || createId("PLN"),
                        checkInId: cleanString(item.checkInId),
                        meetingDate: cleanString(item.meetingDate || item.date),
                        meetingTime: cleanString(item.meetingTime || item.time),
                        mood: cleanString(item.mood),
                        summary: cleanString(item.summary),
                        currentProjects: cleanArray(item.currentProjects),
                        currentInternships: cleanArray(item.currentInternships),
                        goalsReviewed: cleanArray(item.goalsReviewed),
                        studentCommitments: cleanArray(item.studentCommitments),
                        advisorCommitments: cleanArray(item.advisorCommitments),
                        followUps: Array.isArray(item.followUps)
                            ? item.followUps
                                .filter((entry) => entry && typeof entry === "object")
                                .map((entry) => ({
                                    title: cleanString(entry.title),
                                    assignedTo: cleanString(entry.assignedTo),
                                    priority: cleanString(entry.priority),
                                    dueDate: cleanString(entry.dueDate)
                                }))
                            : [],
                        reflection: cleanString(item.reflection),
                        nextMeetingDate: cleanString(item.nextMeetingDate),
                        createdAt: cleanString(item.createdAt) || now(),
                        updatedAt: cleanString(item.updatedAt) ||
                            cleanString(item.createdAt) || now()
                    }))
                : [],
            opportunityEngagements: Array.isArray(
                journeySource.opportunityEngagements || source.opportunityEngagements
            )
                ? (journeySource.opportunityEngagements || source.opportunityEngagements)
                    .filter((item) => item && typeof item === "object")
                    .map((item) => ({
                        id: cleanString(item.id) || createId("OPE"),
                        opportunityId: cleanString(item.opportunityId),
                        status: cleanString(item.status) || "Interested",
                        notes: cleanString(item.notes),
                        nextStep: cleanString(item.nextStep),
                        dueDate: cleanString(item.dueDate),
                        createdAt: cleanString(item.createdAt) || now(),
                        updatedAt: cleanString(item.updatedAt) || cleanString(item.createdAt) || now()
                    }))
                    .filter((item) => item.opportunityId)
                : [],
            internships: cleanRecordArray(
                journeySource.internships || source.internships,
                "INT"
            ),
            partnerEngagements: Array.isArray(
                journeySource.partnerEngagements || source.partnerEngagements
            )
                ? (journeySource.partnerEngagements || source.partnerEngagements)
                    .filter((item) => item && typeof item === "object")
                    .map((item) => ({
                        id: cleanString(item.id) || createId("PEN"),
                        partnerId: cleanString(item.partnerId),
                        relationshipType: cleanString(item.relationshipType) || "Connection",
                        status: cleanString(item.status) || "Exploring",
                        notes: cleanString(item.notes),
                        nextStep: cleanString(item.nextStep),
                        startDate: cleanString(item.startDate),
                        updatedAt: cleanString(item.updatedAt) || now(),
                        createdAt: cleanString(item.createdAt) || now()
                    }))
                    .filter((item) => item.partnerId)
                : [],
            goals: cleanRecordArray(
                journeySource.goals || source.goals,
                "GOA"
            ),
            evidence: cleanRecordArray(
                journeySource.evidence || source.evidence,
                "EVI"
            ),
            followUps: Array.isArray(
                journeySource.followUps || source.followUps || source.actionItems
            )
                ? (journeySource.followUps || source.followUps || source.actionItems)
                    .filter((item) => item && typeof item === "object")
                    .map((item) => ({
                        id: cleanString(item.id) || createId("FUP"),
                        title: cleanString(item.title || item.name),
                        description: cleanString(item.description || item.notes),
                        dueDate: cleanString(item.dueDate),
                        status: cleanString(item.status) || (item.completedAt ? "completed" : "open"),
                        assignedTo: cleanString(item.assignedTo) || "Advisor",
                        priority: cleanString(item.priority) || "Normal",
                        completedAt: cleanString(item.completedAt),
                        createdAt: cleanString(item.createdAt) || now(),
                        updatedAt: cleanString(item.updatedAt) || cleanString(item.createdAt) || now()
                    }))
                : [],
            promises: Array.isArray(journeySource.promises || source.promises)
                ? (journeySource.promises || source.promises)
                    .filter((item) => item && typeof item === "object")
                    .map((item) => ({
                        id: cleanString(item.id) || createId("PRO"),
                        title: cleanString(item.title || item.promise),
                        owner: cleanString(item.owner) || "Student",
                        dueDate: cleanString(item.dueDate),
                        status: cleanString(item.status) || (item.completedAt ? "completed" : "open"),
                        sourceMeetingId: cleanString(item.sourceMeetingId),
                        notes: cleanString(item.notes),
                        completedAt: cleanString(item.completedAt),
                        createdAt: cleanString(item.createdAt) || now(),
                        updatedAt: cleanString(item.updatedAt) || cleanString(item.createdAt) || now()
                    }))
                : []
        };

        return {
            id: cleanString(source.id) || createId(),
            profile,
            journey,
            meta: {
                archived: Boolean(metaSource.archived || source.archived),
                createdAt,
                updatedAt,
                schemaVersion: SCHEMA_VERSION
            }
        };
    }

    function normalizePatch(patch = {}) {
        const result = {
            profile: {},
            journey: {},
            meta: {}
        };

        const profilePatch = patch.profile && typeof patch.profile === "object"
            ? patch.profile
            : {};

        Object.keys(profilePatch).forEach((key) => {
            if (PROFILE_ARRAY_FIELDS.includes(key)) {
                result.profile[key] = cleanArray(profilePatch[key]);
            } else if (key === "transportation" && profilePatch.transportation &&
                typeof profilePatch.transportation === "object") {
                const current = result.profile.transportation || {};
                const incoming = profilePatch.transportation;
                result.profile.transportation = {
                    modes: "modes" in incoming ? cleanArray(incoming.modes) :
                        cleanArray(current.modes || current.primaryMode),
                    primaryMode: "primaryMode" in incoming ?
                        cleanString(incoming.primaryMode) : cleanString(current.primaryMode),
                    licenseStatus: "licenseStatus" in incoming ?
                        cleanString(incoming.licenseStatus) : cleanString(current.licenseStatus),
                    hasReliableAccess: "hasReliableAccess" in incoming ?
                        Boolean(incoming.hasReliableAccess) : Boolean(current.hasReliableAccess),
                    notes: "notes" in incoming ?
                        cleanString(incoming.notes) : cleanString(current.notes)
                };
            } else if (key === "discovery" && profilePatch.discovery &&
                typeof profilePatch.discovery === "object") {
                result.profile.discovery = {...result.profile.discovery, ...profilePatch.discovery};
                Object.keys(result.profile.discovery).forEach((field) => {
                    result.profile.discovery[field] = field === "futureDirection"
                        ? cleanString(result.profile.discovery[field]) || "not-yet"
                        : cleanArray(result.profile.discovery[field]);
                });
            } else if (key in normalizeLegacyStudent().profile) {
                result.profile[key] = cleanString(profilePatch[key]);
            }
        });

        const journeyPatch = patch.journey && typeof patch.journey === "object"
            ? patch.journey
            : {};

        Object.keys(journeyPatch).forEach((key) => {
            if (!JOURNEY_ARRAY_FIELDS.includes(key)) {
                return;
            }

            if (key === "dreamJobs") {
                result.journey.dreamJobs = cleanArray(journeyPatch[key]);
            } else if (key === "careerInterests") {
                result.journey.dreamJobs = cleanArray(journeyPatch[key]);
            } else if (key === "followUps") {
                result.journey.followUps = Array.isArray(journeyPatch[key])
                    ? journeyPatch[key]
                        .filter((item) => item && typeof item === "object")
                        .map((item) => ({
                            id: cleanString(item.id) || createId("FUP"),
                            title: cleanString(item.title || item.name),
                            description: cleanString(item.description || item.notes),
                            dueDate: cleanString(item.dueDate),
                            status: cleanString(item.status) || (item.completedAt ? "completed" : "open"),
                            assignedTo: cleanString(item.assignedTo) || "Advisor",
                            priority: cleanString(item.priority) || "Normal",
                            completedAt: cleanString(item.completedAt),
                            createdAt: cleanString(item.createdAt) || now(),
                            updatedAt: cleanString(item.updatedAt) || cleanString(item.createdAt) || now()
                        }))
                    : [];
            } else if (key === "partnerEngagements") {
                result.journey[key] = Array.isArray(journeyPatch[key])
                    ? journeyPatch[key]
                        .filter((item) => item && typeof item === "object")
                        .map((item) => ({
                            id: cleanString(item.id) || createId("PEN"),
                            partnerId: cleanString(item.partnerId),
                            relationshipType: cleanString(item.relationshipType) || "Connection",
                            status: cleanString(item.status) || "Exploring",
                            notes: cleanString(item.notes),
                            nextStep: cleanString(item.nextStep),
                            startDate: cleanString(item.startDate),
                            updatedAt: cleanString(item.updatedAt) || now(),
                            createdAt: cleanString(item.createdAt) || now()
                        }))
                        .filter((item) => item.partnerId)
                    : [];
            } else if (key === "checkIns") {
                result.journey[key] = Array.isArray(journeyPatch[key])
                    ? journeyPatch[key]
                        .filter((item) => item && typeof item === "object")
                        .map((item) => ({
                            id: cleanString(item.id) || createId("CHK"),
                            meetingDate: cleanString(item.meetingDate || item.date),
                            meetingTime: cleanString(item.meetingTime || item.time),
                            summary: cleanString(item.summary),
                            mood: cleanString(item.mood),
                            projectUpdates: cleanArray(item.projectUpdates),
                            opportunityUpdates: cleanArray(item.opportunityUpdates),
                            followUpUpdates: cleanArray(item.followUpUpdates),
                            reflection: cleanString(item.reflection),
                            newQuestions: cleanArray(item.newQuestions),
                            nextSteps: cleanArray(item.nextSteps),
                            nextMeetingDate: cleanString(item.nextMeetingDate),
                            createdAt: cleanString(item.createdAt) || now(),
                            updatedAt: cleanString(item.updatedAt) || cleanString(item.createdAt) || now()
                        }))
                    : [];
            } else if (key === "opportunityEngagements") {
                result.journey[key] = Array.isArray(journeyPatch[key])
                    ? journeyPatch[key]
                        .filter((item) => item && typeof item === "object")
                        .map((item) => ({
                            id: cleanString(item.id) || createId("OPE"),
                            opportunityId: cleanString(item.opportunityId),
                            status: cleanString(item.status) || "Interested",
                            notes: cleanString(item.notes),
                            nextStep: cleanString(item.nextStep),
                            dueDate: cleanString(item.dueDate),
                            createdAt: cleanString(item.createdAt) || now(),
                            updatedAt: cleanString(item.updatedAt) || cleanString(item.createdAt) || now()
                        }))
                        .filter((item) => item.opportunityId)
                    : [];
            } else {
                const typeMap = {
                    currentProjects: "PRJ",
                    drivingQuestions: "QUE",
                    milestones: "MIL",
                    reflections: "REF",
                    newQuestions: "NQ",
                    notes: "NOT",
                    opportunityEngagements: "OPE",
                    internships: "INT",
                    goals: "GOA",
                    evidence: "EVI",
                    followUps: "FUP"
                };
                result.journey[key] = cleanRecordArray(journeyPatch[key], typeMap[key]);
            }
        });

        if (patch.meta && typeof patch.meta === "object" && "archived" in patch.meta) {
            result.meta.archived = Boolean(patch.meta.archived);
        }

        return result;
    }

    function emitChange(detail = {}) {
        document.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, {
            detail: {
                timestamp: now(),
                ...detail
            }
        }));
    }

    function findIndex(studentId) {
        return students.findIndex((student) => student.id === studentId);
    }

    function sortByUpdated(list) {
        return [...list].sort((a, b) =>
            new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime()
        );
    }

    function initialize(initialStudents = []) {
        const source = Array.isArray(initialStudents) ? initialStudents : [];
        students = source.map(normalizeLegacyStudent);
        emitChange({ action: "initialize", count: students.length });
        return getStudents();
    }

    function getStudents(options = {}) {
        const includeArchived = options.includeArchived !== false;
        const result = includeArchived
            ? students
            : students.filter((student) => !student.meta.archived);

        return clone(sortByUpdated(result));
    }

    function getStudent(studentId) {
        const student = students.find((item) => item.id === studentId);
        return student ? clone(student) : null;
    }

    function createStudent(data = {}) {
        const student = normalizeLegacyStudent({
            ...data,
            id: cleanString(data.id) || createId(),
            meta: {
                ...(data.meta || {}),
                createdAt: now(),
                updatedAt: now(),
                archived: false,
                schemaVersion: SCHEMA_VERSION
            }
        });

        students.push(student);
        emitChange({ action: "create", studentId: student.id });
        return clone(student);
    }

    function updateStudent(studentId, patch = {}) {
        const index = findIndex(studentId);
        if (index === -1) {
            return null;
        }

        const normalized = normalizePatch(patch);
        const current = students[index];

        students[index] = {
            ...current,
            profile: {
                ...current.profile,
                ...normalized.profile
            },
            journey: {
                ...current.journey,
                ...normalized.journey
            },
            meta: {
                ...current.meta,
                ...normalized.meta,
                updatedAt: now(),
                schemaVersion: SCHEMA_VERSION
            }
        };

        emitChange({ action: "update", studentId });
        return clone(students[index]);
    }

    function deleteStudent(studentId) {
        const index = findIndex(studentId);
        if (index === -1) {
            return false;
        }

        students.splice(index, 1);
        emitChange({ action: "delete", studentId });
        return true;
    }

    function archiveStudent(studentId) {
        return updateStudent(studentId, { meta: { archived: true } });
    }

    function restoreStudent(studentId) {
        return updateStudent(studentId, { meta: { archived: false } });
    }

    function searchStudents(query = "", options = {}) {
        const normalizedQuery = cleanString(query).toLowerCase();
        const status = cleanString(options.status || "active");

        let result = students.filter((student) => {
            if (status === "active" && student.meta.archived) {
                return false;
            }
            if (status === "archived" && !student.meta.archived) {
                return false;
            }
            return true;
        });

        if (normalizedQuery) {
            result = result.filter((student) => {
                const searchable = [
                    student.id,
                    student.profile.preferredName,
                    student.profile.firstName,
                    student.profile.lastName,
                    student.profile.grade,
                    student.profile.advisor,
                    student.profile.mood,
                    student.profile.studentVoice,
                    student.profile.portfolioUrl,
                    ...student.profile.interests,
                    ...student.profile.hobbies,
                    ...student.profile.passions,
                    ...student.profile.strengths,
                    ...student.profile.learningPreferences,
                    ...student.profile.postSecondaryGoals,
                    ...student.journey.dreamJobs,
                    ...student.journey.currentProjects.flatMap((item) => [item.title, item.description]),
                    ...student.journey.followUps.flatMap((item) => [item.title, item.description])
                ].join(" ").toLowerCase();

                return searchable.includes(normalizedQuery);
            });
        }

        return clone(sortByUpdated(result));
    }

    function replaceAll(list = []) {
        if (!Array.isArray(list)) {
            throw new TypeError("StudentManager.replaceAll expects an array.");
        }

        students = list.map(normalizeLegacyStudent);
        emitChange({ action: "replaceAll", count: students.length });
        return getStudents();
    }

    function addJourneyItem(studentId, collectionName, item = {}) {
        if (!JOURNEY_ARRAY_FIELDS.includes(collectionName) || collectionName === "dreamJobs") {
            throw new Error(`Unsupported journey collection: ${collectionName}`);
        }

        const student = getStudent(studentId);
        if (!student) {
            return null;
        }

        const typeMap = {
            currentProjects: "PRJ",
            drivingQuestions: "QUE",
            milestones: "MIL",
            reflections: "REF",
            newQuestions: "NQ",
            notes: "NOT",
            opportunityEngagements: "OPE",
            internships: "INT",
            goals: "GOA",
            evidence: "EVI",
            followUps: "FUP"
        };

        const [normalizedItem] = cleanRecordArray([{
            ...item,
            id: item.id || createId(typeMap[collectionName]),
            createdAt: item.createdAt || now(),
            updatedAt: now()
        }], typeMap[collectionName]);

        if (!normalizedItem) {
            return null;
        }

        const updatedCollection = [...student.journey[collectionName], normalizedItem];
        updateStudent(studentId, {
            journey: {
                [collectionName]: updatedCollection
            }
        });

        return clone(normalizedItem);
    }

    function updateJourneyItem(studentId, collectionName, itemId, patch = {}) {
        const student = getStudent(studentId);
        if (!student || !Array.isArray(student.journey[collectionName])) {
            return null;
        }

        const index = student.journey[collectionName].findIndex((item) => item.id === itemId);
        if (index === -1) {
            return null;
        }

        const collection = clone(student.journey[collectionName]);
        collection[index] = {
            ...collection[index],
            ...patch,
            id: collection[index].id,
            updatedAt: now()
        };

        updateStudent(studentId, {
            journey: {
                [collectionName]: collection
            }
        });

        return clone(collection[index]);
    }

    function removeJourneyItem(studentId, collectionName, itemId) {
        const student = getStudent(studentId);
        if (!student || !Array.isArray(student.journey[collectionName])) {
            return false;
        }

        const next = student.journey[collectionName].filter((item) => item.id !== itemId);
        if (next.length === student.journey[collectionName].length) {
            return false;
        }

        updateStudent(studentId, {
            journey: {
                [collectionName]: next
            }
        });

        return true;
    }

    function assignPartner(studentId, partnerId, details = {}) {
        const student = getStudent(studentId);
        if (!student || !cleanString(partnerId)) {
            return null;
        }

        const existing = student.journey.partnerEngagements.find(
            (item) => item.partnerId === partnerId
        );

        if (existing) {
            return updatePartnerEngagement(studentId, existing.id, details);
        }

        const engagement = {
            id: createId("PEN"),
            partnerId: cleanString(partnerId),
            relationshipType: cleanString(details.relationshipType) || "Connection",
            status: cleanString(details.status) || "Exploring",
            notes: cleanString(details.notes),
            nextStep: cleanString(details.nextStep),
            startDate: cleanString(details.startDate),
            createdAt: now(),
            updatedAt: now()
        };

        updateStudent(studentId, {
            journey: {
                partnerEngagements: [
                    ...student.journey.partnerEngagements,
                    engagement
                ]
            }
        });

        return clone(engagement);
    }

    function updatePartnerEngagement(studentId, engagementId, patch = {}) {
        const student = getStudent(studentId);
        if (!student) {
            return null;
        }

        const index = student.journey.partnerEngagements.findIndex(
            (item) => item.id === engagementId
        );

        if (index === -1) {
            return null;
        }

        const engagements = clone(student.journey.partnerEngagements);
        engagements[index] = {
            ...engagements[index],
            relationshipType: "relationshipType" in patch
                ? cleanString(patch.relationshipType) || engagements[index].relationshipType
                : engagements[index].relationshipType,
            status: "status" in patch
                ? cleanString(patch.status) || engagements[index].status
                : engagements[index].status,
            notes: "notes" in patch
                ? cleanString(patch.notes)
                : engagements[index].notes,
            nextStep: "nextStep" in patch
                ? cleanString(patch.nextStep)
                : engagements[index].nextStep,
            startDate: "startDate" in patch
                ? cleanString(patch.startDate)
                : engagements[index].startDate,
            updatedAt: now()
        };

        updateStudent(studentId, {
            journey: {
                partnerEngagements: engagements
            }
        });

        return clone(engagements[index]);
    }

    function removePartnerEngagement(studentId, engagementId) {
        const student = getStudent(studentId);
        if (!student) {
            return false;
        }

        const next = student.journey.partnerEngagements.filter(
            (item) => item.id !== engagementId
        );

        if (next.length === student.journey.partnerEngagements.length) {
            return false;
        }

        updateStudent(studentId, {
            journey: {
                partnerEngagements: next
            }
        });

        return true;
    }

    function addActionPlan(studentId, data = {}) {
        const student = getStudent(studentId);
        if (!student) {
            return null;
        }

        const plan = {
            id: createId("PLN"),
            checkInId: cleanString(data.checkInId),
            meetingDate: cleanString(data.meetingDate) || now().slice(0, 10),
            meetingTime: cleanString(data.meetingTime),
            mood: cleanString(data.mood),
            summary: cleanString(data.summary),
            currentProjects: cleanArray(data.currentProjects),
            currentInternships: cleanArray(data.currentInternships),
            goalsReviewed: cleanArray(data.goalsReviewed),
            studentCommitments: cleanArray(data.studentCommitments),
            advisorCommitments: cleanArray(data.advisorCommitments),
            followUps: Array.isArray(data.followUps)
                ? data.followUps
                    .filter((item) => item && typeof item === "object")
                    .map((item) => ({
                        title: cleanString(item.title),
                        assignedTo: cleanString(item.assignedTo),
                        priority: cleanString(item.priority),
                        dueDate: cleanString(item.dueDate)
                    }))
                : [],
            reflection: cleanString(data.reflection),
            nextMeetingDate: cleanString(data.nextMeetingDate),
            createdAt: now(),
            updatedAt: now()
        };

        updateStudent(studentId, {
            journey: {
                actionPlans: [
                    ...student.journey.actionPlans,
                    plan
                ]
            }
        });

        return clone(plan);
    }

    function addCheckIn(studentId, data = {}) {
        const student = getStudent(studentId);
        if (!student) {
            return null;
        }

        const checkIn = {
            id: createId("CHK"),
            meetingDate: cleanString(data.meetingDate) || now().slice(0, 10),
            meetingTime: cleanString(data.meetingTime),
            summary: cleanString(data.summary),
            mood: cleanString(data.mood),
            projectUpdates: cleanArray(data.projectUpdates),
            opportunityUpdates: cleanArray(data.opportunityUpdates),
            followUpUpdates: cleanArray(data.followUpUpdates),
            reflection: cleanString(data.reflection),
            newQuestions: cleanArray(data.newQuestions),
            nextSteps: cleanArray(data.nextSteps),
            nextMeetingDate: cleanString(data.nextMeetingDate),
            createdAt: now(),
            updatedAt: now()
        };

        updateStudent(studentId, {
            journey: {
                checkIns: [
                    ...student.journey.checkIns,
                    checkIn
                ]
            }
        });

        return clone(checkIn);
    }

    function updateCheckIn(studentId, checkInId, patch = {}) {
        const student = getStudent(studentId);
        if (!student) {
            return null;
        }

        const index = student.journey.checkIns.findIndex((item) => item.id === checkInId);
        if (index === -1) {
            return null;
        }

        const checkIns = clone(student.journey.checkIns);
        checkIns[index] = {
            ...checkIns[index],
            meetingDate: "meetingDate" in patch
                ? cleanString(patch.meetingDate)
                : checkIns[index].meetingDate,
            meetingTime: "meetingTime" in patch
                ? cleanString(patch.meetingTime)
                : checkIns[index].meetingTime,
            summary: "summary" in patch
                ? cleanString(patch.summary)
                : checkIns[index].summary,
            mood: "mood" in patch
                ? cleanString(patch.mood)
                : checkIns[index].mood,
            projectUpdates: "projectUpdates" in patch
                ? cleanArray(patch.projectUpdates)
                : checkIns[index].projectUpdates,
            opportunityUpdates: "opportunityUpdates" in patch
                ? cleanArray(patch.opportunityUpdates)
                : checkIns[index].opportunityUpdates,
            followUpUpdates: "followUpUpdates" in patch
                ? cleanArray(patch.followUpUpdates)
                : checkIns[index].followUpUpdates,
            reflection: "reflection" in patch
                ? cleanString(patch.reflection)
                : checkIns[index].reflection,
            newQuestions: "newQuestions" in patch
                ? cleanArray(patch.newQuestions)
                : checkIns[index].newQuestions,
            nextSteps: "nextSteps" in patch
                ? cleanArray(patch.nextSteps)
                : checkIns[index].nextSteps,
            nextMeetingDate: "nextMeetingDate" in patch
                ? cleanString(patch.nextMeetingDate)
                : checkIns[index].nextMeetingDate,
            updatedAt: now()
        };

        updateStudent(studentId, {
            journey: {
                checkIns
            }
        });

        return clone(checkIns[index]);
    }

    function removeCheckIn(studentId, checkInId) {
        const student = getStudent(studentId);
        if (!student) {
            return false;
        }

        const next = student.journey.checkIns.filter((item) => item.id !== checkInId);
        if (next.length === student.journey.checkIns.length) {
            return false;
        }

        updateStudent(studentId, {
            journey: {
                checkIns: next
            }
        });

        return true;
    }

    function assignOpportunity(studentId, opportunityId, details = {}) {
        const student = getStudent(studentId);
        if (!student || !cleanString(opportunityId)) {
            return null;
        }

        const existing = student.journey.opportunityEngagements.find(
            (item) => item.opportunityId === opportunityId
        );

        if (existing) {
            return updateOpportunityEngagement(studentId, existing.id, details);
        }

        const engagement = {
            id: createId("OPE"),
            opportunityId: cleanString(opportunityId),
            status: cleanString(details.status) || "Interested",
            notes: cleanString(details.notes),
            nextStep: cleanString(details.nextStep),
            dueDate: cleanString(details.dueDate),
            createdAt: now(),
            updatedAt: now()
        };

        updateStudent(studentId, {
            journey: {
                opportunityEngagements: [
                    ...student.journey.opportunityEngagements,
                    engagement
                ]
            }
        });

        return clone(engagement);
    }

    function updateOpportunityEngagement(studentId, engagementId, patch = {}) {
        const student = getStudent(studentId);
        if (!student) {
            return null;
        }

        const index = student.journey.opportunityEngagements.findIndex(
            (item) => item.id === engagementId
        );

        if (index === -1) {
            return null;
        }

        const engagements = clone(student.journey.opportunityEngagements);
        engagements[index] = {
            ...engagements[index],
            status: "status" in patch
                ? cleanString(patch.status) || engagements[index].status
                : engagements[index].status,
            notes: "notes" in patch
                ? cleanString(patch.notes)
                : engagements[index].notes,
            nextStep: "nextStep" in patch
                ? cleanString(patch.nextStep)
                : engagements[index].nextStep,
            dueDate: "dueDate" in patch
                ? cleanString(patch.dueDate)
                : engagements[index].dueDate,
            updatedAt: now()
        };

        updateStudent(studentId, {
            journey: {
                opportunityEngagements: engagements
            }
        });

        return clone(engagements[index]);
    }

    function removeOpportunityEngagement(studentId, engagementId) {
        const student = getStudent(studentId);
        if (!student) {
            return false;
        }

        const next = student.journey.opportunityEngagements.filter(
            (item) => item.id !== engagementId
        );

        if (next.length === student.journey.opportunityEngagements.length) {
            return false;
        }

        updateStudent(studentId, {
            journey: {
                opportunityEngagements: next
            }
        });

        return true;
    }

    function getNextMeetingDate(studentId) {
        const student = getStudent(studentId);
        if (!student) {
            return "";
        }

        return [...student.journey.checkIns]
            .filter((item) => item.nextMeetingDate)
            .sort((a, b) =>
                new Date(b.meetingDate || b.createdAt) -
                new Date(a.meetingDate || a.createdAt)
            )[0]?.nextMeetingDate || "";
    }

    function getLatestCheckIn(studentId) {
        const student = getStudent(studentId);
        if (!student || !student.journey.checkIns.length) {
            return null;
        }

        return clone(
            [...student.journey.checkIns]
                .sort((a, b) => {
                    const bDate = DateUtils.combineLocalDateTime(
                        b.meetingDate,
                        b.meetingTime || "12:00"
                    ) || new Date(b.createdAt || 0);
                    const aDate = DateUtils.combineLocalDateTime(
                        a.meetingDate,
                        a.meetingTime || "12:00"
                    ) || new Date(a.createdAt || 0);
                    return bDate - aDate;
                })[0]
        );
    }

    function getLatestMood(studentId) {
        const latest = getLatestCheckIn(studentId);
        return latest ? cleanString(latest.mood) : "";
    }

    function getStatistics() {
        const active = students.filter((student) => !student.meta.archived);
        const archived = students.filter((student) => student.meta.archived);
        const openFollowUps = active.reduce((count, student) => (
            count + student.journey.followUps.filter((item) =>
                item.status !== "completed" && !item.completedAt
            ).length
        ), 0);
        const activeProjects = active.reduce((count, student) => (
            count + student.journey.currentProjects.filter((item) =>
                item.status !== "completed"
            ).length
        ), 0);
        const overdueFollowUps = active.reduce((count, student) => (
            count + student.journey.followUps.filter((item) =>
                item.status !== "completed" &&
                !item.completedAt &&
                item.dueDate &&
                DateUtils.isOverdue(item.dueDate)
            ).length
        ), 0);

        const opportunityApplications = active.reduce((count, student) => (
            count + student.journey.opportunityEngagements.filter((item) =>
                ["Applied", "Interviewing", "Accepted"].includes(item.status)
            ).length
        ), 0);

        const acceptedOpportunities = active.reduce((count, student) => (
            count + student.journey.opportunityEngagements.filter((item) =>
                item.status === "Accepted"
            ).length
        ), 0);

        return {
            total: students.length,
            active: active.length,
            archived: archived.length,
            openFollowUps,
            overdueFollowUps,
            activeProjects,
            opportunityApplications,
            acceptedOpportunities
        };
    }

    return Object.freeze({
        DATA_CHANGED_EVENT,
        SCHEMA_VERSION,
        initialize,
        getStudents,
        getStudent,
        createStudent,
        updateStudent,
        deleteStudent,
        archiveStudent,
        restoreStudent,
        searchStudents,
        replaceAll,
        addJourneyItem,
        updateJourneyItem,
        removeJourneyItem,
        assignPartner,
        updatePartnerEngagement,
        removePartnerEngagement,
        addActionPlan,
        addCheckIn,
        updateCheckIn,
        removeCheckIn,
        assignOpportunity,
        updateOpportunityEngagement,
        removeOpportunityEngagement,
        getNextMeetingDate,
        getLatestCheckIn,
        getLatestMood,
        getStatistics
    });
})();
