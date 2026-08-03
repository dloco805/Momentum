/*
Momentum Demo Class 2.0
Build v21.0.0
*/
"use strict";

const DemoClass = (() => {
    const PREFIX = "DEMO-";

    const students = [
        ["Alex","Rivera","Restoring a Vintage Bike","Lompoc Bike Shop","Earn a learner permit","cars · mechanics"],
        ["Jordan","Lee","Community Mural Map","None","Publish the first portfolio page","art · design"],
        ["Maya","Thompson","Local Wildlife Photo Story","Animal Shelter","Interview an animal-care professional","animals · photography"],
        ["Eli","Martinez","Youth Music Podcast","Radio Station","Record the first episode","music · media"],
        ["Sam","Chen","Student Fitness Challenge","Recreation Center","Lead one group workout","sports · fitness"],
        ["Nia","Brooks","Pop-Up Food Concept","Local Café","Test one menu item","cooking · business"],
        ["Owen","Walker","Tiny Home Materials Study","Construction Company","Complete a material comparison","building · construction"],
        ["Avery","Patel","Faces of Lompoc Photo Essay","None","Photograph three community members","photography · storytelling"],
        ["Leo","Johnson","Healthcare Career Guide","Medical Clinic","Research three healthcare roles","healthcare · helping"],
        ["Zoe","Garcia","Indie Game Prototype","None","Build a playable first level","gaming · coding"],
        ["Kai","Williams","Sustainable Fashion Lookbook","Retail Boutique","Finish the first design board","fashion · marketing"],
        ["Mia","Brown","Welding Safety Demonstration","Fabrication Shop","Complete shop safety training","welding · hands-on"],
        ["Noah","Davis","Local Justice History Project","None","Choose one local case study","history · law"],
        ["Lena","Wilson","Creek Health Investigation","Parks Department","Collect the first water sample","nature · environment"],
        ["Isaac","Clark","Short Documentary","Community Media","Finish the interview outline","video · storytelling"]
    ];

    function isoDaysAgo(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString();
    }

    function dateDaysFromToday(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().slice(0,10);
    }

    function hasDemo() {
        return StudentManager.getStudents({includeArchived:true})
            .some((student) => student.id.startsWith(PREFIX));
    }

    function create() {
        if (hasDemo()) return 0;

        students.forEach((row, index) => {
            const [first,last,projectTitle,internshipSite,goalTitle,interestText] = row;
            const lastMeetingDays = index === 2 ? 32 :
                index === 7 ? 24 :
                index === 12 ? 18 :
                index % 6;
            const hasProject = ![4,11].includes(index);
            const hasInternship = internshipSite !== "None";
            const projectId = `${PREFIX}PRO-${index+1}`;
            const internshipId = `${PREFIX}INT-${index+1}`;

            StudentManager.createStudent({
                id: `${PREFIX}${String(index+1).padStart(2,"0")}`,
                profile: {
                    preferredName: first,
                    firstName: first,
                    lastName: last,
                    interests: interestText.split(" · "),
                    strengths: [index % 2 ? "Creative thinking" : "Hands-on problem solving"],
                    learningPreferences: [index % 3 ? "Learning by doing" : "Seeing an example first"],
                    postSecondaryGoals: [
                        index % 4 === 0
                            ? "Explore Allan Hancock College programs"
                            : "Build experience connected to my interests"
                    ],
                    currentFocus: hasProject ? "Move current project forward" : "Choose a meaningful project",
                    focusWhy: "This is the most useful priority for the next few weeks.",
                    focusNextAction: hasProject
                        ? `Complete the next step for ${projectTitle}`
                        : "Choose one project idea worth testing",
                    portfolioUrl: index % 3 === 0
                        ? `https://sites.google.com/view/demo-${first.toLowerCase()}`
                        : ""
                },
                journey: {
                    currentProjects: hasProject ? [{
                        id: projectId,
                        title: projectTitle,
                        status: index === 9 ? "completed" : "active",
                        phase: ["Exploring","Planning","Building","Presenting"][index % 4],
                        nextSteps: [
                            [
                                "Research one strong example",
                                "Create the first draft",
                                "Collect feedback",
                                "Add the newest work to Google Sites"
                            ][index % 4]
                        ],
                        activityLog: [
                            {
                                id: `${PREFIX}LOG-${index}-1`,
                                date: dateDaysFromToday(-lastMeetingDays),
                                note: `Made progress on ${projectTitle}.`,
                                nextStep: "Complete the next visible task."
                            }
                        ],
                        createdAt: isoDaysAgo(40-index),
                        updatedAt: isoDaysAgo(lastMeetingDays)
                    }] : [],
                    internships: hasInternship ? [{
                        id: internshipId,
                        title: "Student Intern",
                        organization: internshipSite,
                        status: "active",
                        schedule: index % 2 ? "Tuesdays" : "Thursdays",
                        currentObjective: [
                            "Ask the supervisor one career question",
                            "Complete the next assigned task",
                            "Document one skill used at the site"
                        ][index % 3],
                        nextSteps: ["Confirm the next visit"],
                        createdAt: isoDaysAgo(25-index),
                        updatedAt: isoDaysAgo(lastMeetingDays+1)
                    }] : [],
                    goals: [{
                        id: `${PREFIX}GOAL-${index+1}`,
                        title: goalTitle,
                        status: index === 5 ? "completed" : "active",
                        category: hasProject ? "Project" : "Personal",
                        linkedProjectId: hasProject ? projectId : "",
                        nextSteps: [
                            ["Take the first step","Ask for feedback","Finish the draft"][index%3]
                        ],
                        dueDate: dateDaysFromToday((index%5)+3),
                        createdAt: isoDaysAgo(20)
                    }],
                    checkIns: index === 10 ? [] : [{
                        id: `${PREFIX}CHK-${index+1}`,
                        meetingDate: dateDaysFromToday(-lastMeetingDays),
                        meetingTime: "10:00",
                        summary: [
                            `Reviewed ${projectTitle} and chose one clear next step.`,
                            hasInternship
                                ? `Talked about progress at ${internshipSite}.`
                                : "Discussed project direction and current goals."
                        ].join(" "),
                        mood: [["Hopeful"],["Focused"],["Unsure"]][index%3],
                        projectUpdates: hasProject ? [`Progress on ${projectTitle}`] : [],
                        opportunityUpdates: hasInternship ? [`Update from ${internshipSite}`] : [],
                        nextSteps: ["Complete one visible next step before the next check-in"],
                        newQuestions: index % 4 === 0
                            ? ["What would make this project more useful to other people?"]
                            : [],
                        nextMeetingDate: dateDaysFromToday((index%7)+5),
                        createdAt: isoDaysAgo(lastMeetingDays)
                    }],
                    followUps: index % 5 === 0 ? [{
                        id: `${PREFIX}STEP-${index+1}`,
                        title: "Dashboard attention",
                        description: "Demo student manually marked for attention.",
                        assignedTo: "Advisor",
                        priority: "High",
                        dueDate: dateDaysFromToday(index === 0 ? -2 : 4),
                        status: "open",
                        createdAt: isoDaysAgo(3)
                    }] : []
                }
            });
        });

        if (typeof PlannerManager !== "undefined") {
            [
                ["Circle: What makes work meaningful?","circle",1],
                ["L2L: Allan Hancock program visit","l2l",4],
                ["Internship site check-in","internship",2],
                ["Project showcase planning","project",6]
            ].forEach(([title,category,days]) =>
                PlannerManager.addEvent({
                    title,
                    category,
                    date: dateDaysFromToday(days),
                    status: "planned",
                    notes: "Demo Class 2.0 sample event"
                })
            );
        }

        if (typeof CircleManager !== "undefined") {
            CircleManager.addCircle({
                topic: "What makes a project worth caring about?",
                date: dateDaysFromToday(-5),
                studentsAbsent: ["DEMO-04","DEMO-09"],
                notes: "Students connected personal interests to possible projects."
            });
        }

        if (typeof ActivityManager !== "undefined") {
            ActivityManager.addActivity({
                title: "Interest-to-Project Brainstorm",
                status: "ready",
                tags: ["projects","curiosity"],
                notes: "Students choose one interest, one problem, and one possible product."
            });
            ActivityManager.saveNotepad(
                "• Invite a local guest speaker\n• Try a five-minute project pitch\n• Revisit the Question Lab before Friday"
            );
        }

        return students.length;
    }

    function clear() {
        const all = StudentManager.getStudents({includeArchived:true});
        const keep = all.filter((student) => !student.id.startsWith(PREFIX));
        const removed = all.length - keep.length;
        StudentManager.replaceAll(keep);

        if (typeof PlannerManager !== "undefined") {
            PlannerManager.replaceAll(
                PlannerManager.getEvents().filter((item) =>
                    item.notes !== "Demo Class 2.0 sample event"
                )
            );
        }

        return removed;
    }

    return Object.freeze({PREFIX,hasDemo,create,clear});
})();
