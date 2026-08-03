/*
==========================================================
Momentum Inquiry Coach
Build v21.0.0
==========================================================
*/
"use strict";
const InquiryCoach = (() => {
    const QUESTIONS = Object.freeze({
    "discovery": [
        "What YouTube videos keep your attention?",
        "What games do you keep coming back to, and why?",
        "What do you enjoy doing when nobody tells you what to do?",
        "What could you spend an entire Saturday doing?",
        "What do you search for when you are bored?",
        "What is something you know a lot about that surprises people?",
        "What is something you have always wanted to try?",
        "If someone gave you $500 to learn a hobby, what would you choose?",
        "What kind of problems do you enjoy solving?",
        "What do your friends ask you for help with?",
        "What activity makes time go by quickly?",
        "What is something you would love to learn how to make?"
    ],
    "project": [
        "Why does this project matter to you?",
        "What problem are you trying to solve?",
        "What part makes you most curious?",
        "What has surprised you while working on it?",
        "What is the hardest part right now?",
        "Who could help you move it forward?",
        "What is the smallest useful next step?",
        "How has your thinking changed?"
    ],
    "career": [
        "What kind of work sounds interesting enough to explore?",
        "What skills do you want a future job to let you use?",
        "Would you rather work with people, ideas, tools, technology, nature, or something else?",
        "What job would you never want, and what does that tell you?",
        "What environment helps you do your best?",
        "What would make work feel meaningful?"
    ],
    "reflection": [
        "What was your biggest win since we last met?",
        "What was your biggest obstacle?",
        "What are you thinking differently about now?",
        "What did you figure out on your own?",
        "What question are you still carrying?",
        "What would you do differently next time?"
    ],
    "transportation": [
        "How would you get to this opportunity?",
        "What transportation is reliable for you right now?",
        "What times are easiest or hardest for transportation?",
        "Who could help if transportation became a barrier?"
    ],
    "observation": [
        "What pattern are you noticing?",
        "What strength might be underneath this behavior?",
        "What support seemed to help?",
        "What would you watch for next time?"
    ],
    "followup": [
        "Can you tell me a little more about that?",
        "What makes you say that?",
        "Can you give me an example?",
        "When did you first notice that?",
        "What happened next?",
        "What might be another way to look at it?"
    ]
});
    function getQuestions(category, count = 4, seed = 0) {
        const list = QUESTIONS[category] || QUESTIONS.discovery;
        return Array.from({length: Math.min(count, list.length)}, (_, i) =>
            list[(Math.abs(Number(seed) || 0) + i) % list.length]
        );
    }
    function contextualQuestions(student, context, count = 4) {
        const map = {
            overview:"reflection", discovery:"discovery", projects:"project",
            career:"career", transportation:"transportation",
            observations:"observation", meetings:"reflection"
        };
        let category = map[context] || "discovery";
        const direction = student.profile.discovery?.futureDirection || "not-yet";
        if (direction === "not-yet" && ["overview","career"].includes(context)) category = "discovery";
        const seed = String(student.id || "").split("").reduce((s,c)=>s+c.charCodeAt(0),0);
        return getQuestions(category, count, seed);
    }
    return Object.freeze({QUESTIONS,getQuestions,contextualQuestions});
})();
