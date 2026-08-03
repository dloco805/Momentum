/*
==========================================================
Momentum Resource Library Manager
Build v19.0.0
==========================================================
*/
"use strict";

const ResourceManager = (() => {
    const STORAGE_KEY = "momentum.resources";
    const FAVORITES_KEY = "momentum.resourceFavorites";
    const WEEKLY_KEY = "momentum.weeklyQuestion";
    const DATA_CHANGED_EVENT = "resourceDataChanged";
    const SEED_RESOURCES = Object.freeze([
    {
        "id": "TOP-CRITICAL-THINKING",
        "type": "topic",
        "title": "What Makes a Strong Thinker?",
        "essentialQuestion": "What does it mean to think well?",
        "prompts": [
            "What is the difference between having an opinion and reaching a well-reasoned conclusion?",
            "What makes a question important?",
            "How do you decide whether information is relevant or trustworthy?",
            "When should you reconsider something you believe?",
            "Is changing your mind a weakness or a strength?",
            "How can people disagree and still think together productively?"
        ],
        "reflection": "What is one thinking habit you would like to improve?",
        "activity": "Choose a claim and identify the evidence, assumptions, and questions needed to evaluate it.",
        "tags": [
            "critical thinking",
            "evidence",
            "communication",
            "open-mindedness"
        ]
    },
    {
        "id": "TOP-QUESTIONS",
        "type": "topic",
        "title": "Questions Before Answers",
        "essentialQuestion": "Why might a good question be more valuable than a quick answer?",
        "prompts": [
            "What makes a question worth discussing?",
            "What questions have changed how you think?",
            "Why do people sometimes rush toward answers?",
            "What happens when we begin with assumptions instead of questions?",
            "Can a question have several reasonable answers?",
            "What questions should adults ask young people more often?"
        ],
        "reflection": "Write one question you are currently carrying.",
        "activity": "Improve a weak or closed question until it invites investigation and multiple perspectives.",
        "tags": [
            "inquiry",
            "curiosity",
            "uncertainty",
            "learning"
        ]
    },
    {
        "id": "TOP-RELEVANCE",
        "type": "topic",
        "title": "Learning Through What Matters",
        "essentialQuestion": "Do people learn more deeply when a problem feels relevant to them?",
        "prompts": [
            "What makes something feel worth learning?",
            "Have you become interested in something only after understanding why it mattered?",
            "Can a teacher introduce an important topic students have never considered?",
            "What is the difference between choosing your learning and helping shape it?",
            "Why might people resist learning something they do not care about?",
            "How could school connect required learning to real problems?"
        ],
        "reflection": "What is something you would genuinely like to understand better?",
        "activity": "Connect one required school topic to a real question, decision, or problem students care about.",
        "tags": [
            "relevance",
            "student voice",
            "motivation",
            "engagement"
        ]
    },
    {
        "id": "TOP-MESSINESS",
        "type": "topic",
        "title": "The Messiness of Learning",
        "essentialQuestion": "Why are uncertainty and mistakes often necessary for learning?",
        "prompts": [
            "How do you feel when there is no clear right answer?",
            "Why do people prefer safe and familiar solutions?",
            "What can experimentation teach us that planning cannot?",
            "When has a mistake helped you learn?",
            "What is the difference between a productive mess and careless work?",
            "What would school look like if experimentation were expected?"
        ],
        "reflection": "Name one safe experiment you could try this week.",
        "activity": "Choose one small idea to test, decide what you will observe, and reflect on what happened.",
        "tags": [
            "ambiguity",
            "experimentation",
            "growth mindset",
            "risk-taking"
        ]
    },
    {
        "id": "TOP-WHAT-IF",
        "type": "topic",
        "title": "What If?",
        "essentialQuestion": "How can possibility-thinking help people create change?",
        "prompts": [
            "What is something people accept only because it has always been done that way?",
            "What if one school rule could be redesigned?",
            "When should traditions be protected?",
            "When should people challenge accepted practices?",
            "What is the difference between complaining and designing a better possibility?",
            "What idea would you test if failure had no consequences?"
        ],
        "reflection": "Complete the sentence: What if we...",
        "activity": "Select one everyday frustration and generate ten possible alternatives without judging them first.",
        "tags": [
            "design thinking",
            "imagination",
            "change",
            "innovation"
        ]
    },
    {
        "id": "TOP-WORTH-KNOWING",
        "type": "topic",
        "title": "What Is Worth Knowing?",
        "essentialQuestion": "Who decides what knowledge matters?",
        "prompts": [
            "What is something everyone should know before becoming an adult?",
            "Is useful knowledge always practical?",
            "What knowledge helps someone live a meaningful life?",
            "Who currently decides what students learn?",
            "What knowledge is missing from school?",
            "Can something be worth knowing even if it never helps you earn money?",
            "How do you decide what deserves your time and attention?"
        ],
        "reflection": "Add one subject or question to your personal worth-knowing list.",
        "activity": "Build a class list of ten things worth knowing and explain the criteria used.",
        "tags": [
            "purpose",
            "education",
            "knowledge",
            "priorities"
        ]
    },
    {
        "id": "TOP-WORRIES",
        "type": "topic",
        "title": "Worries, Problems, and First Steps",
        "essentialQuestion": "How can we understand a worry well enough to act on it?",
        "prompts": [
            "What do young people worry about most?",
            "What is the difference between a worry and a problem?",
            "Which problems can we influence even if we cannot completely solve them?",
            "How do you decide which problem to address first?",
            "How can you learn whether other people share the same concern?",
            "What makes asking for help difficult?",
            "What is one small action that can make a problem feel more manageable?"
        ],
        "reflection": "Identify one concern and one possible first step.",
        "activity": "Sort concerns into control, influence, and concern; then choose one action.",
        "tags": [
            "wellness",
            "problem solving",
            "agency",
            "support"
        ]
    },
    {
        "id": "TOP-FUTURE-SELF",
        "type": "topic",
        "title": "Adults, Identity, and the Person I Want to Become",
        "essentialQuestion": "What kind of adult do I want to become?",
        "prompts": [
            "What qualities do you respect in adults?",
            "What adult behaviors frustrate young people?",
            "How do you want to be similar to adults you know?",
            "How do you want to be different?",
            "What kind of person do you hope others experience you as?",
            "What experiences shape the person someone becomes?",
            "Can people intentionally change who they are becoming?"
        ],
        "reflection": "Choose one quality you want your future self to possess.",
        "activity": "Write a short note from your future self describing the habits that helped you grow.",
        "tags": [
            "identity",
            "adulthood",
            "character",
            "future"
        ]
    },
    {
        "id": "TOP-HOPES",
        "type": "topic",
        "title": "Hopes, Goals, and Sacrifice",
        "essentialQuestion": "What does it take to turn a hope into something real?",
        "prompts": [
            "What would you most like to be able to do?",
            "What would you need to learn first?",
            "What might you need to practice repeatedly?",
            "What support would make the goal more possible?",
            "What might you need to give up?",
            "How can you tell whether a goal is truly yours?",
            "Should a goal change as you learn more about yourself?"
        ],
        "reflection": "Name one hope and the next thing you would need to learn.",
        "activity": "Turn one hope into a first step, support request, and possible obstacle.",
        "tags": [
            "goals",
            "future planning",
            "persistence",
            "sacrifice"
        ]
    },
    {
        "id": "TOP-PROGRESS",
        "type": "topic",
        "title": "What Is Progress?",
        "essentialQuestion": "How should we decide whether a change is progress?",
        "prompts": [
            "Does new always mean better?",
            "Who benefits from a particular change?",
            "Who might be harmed or left behind?",
            "What important changes are happening right now?",
            "Which changes should be encouraged?",
            "Which should be questioned or resisted?",
            "How can we predict the consequences of a change?",
            "What would you change in your school or community?"
        ],
        "reflection": "Describe one change you consider genuine progress and explain why.",
        "activity": "Evaluate one change using benefits, costs, evidence, and unintended consequences.",
        "tags": [
            "change",
            "society",
            "ethics",
            "consequences"
        ]
    },
    {
        "id": "TOP-LANGUAGE",
        "type": "topic",
        "title": "Language, Symbols, and Meaning",
        "essentialQuestion": "How do language and symbols shape what people understand?",
        "prompts": [
            "Where does meaning come from?",
            "Can the same word mean different things to different people?",
            "What are some languages that do not primarily use words?",
            "How do music, clothing, images, numbers, and gestures communicate?",
            "What symbols bring people together?",
            "What symbols divide people?",
            "How would human life be different without written language or numbers?",
            "Could your group invent a new symbol that communicates an important idea?"
        ],
        "reflection": "Choose a symbol from your life and explain what it means to you.",
        "activity": "Invent a symbol for a class value and explain its design choices.",
        "tags": [
            "communication",
            "language",
            "culture",
            "meaning"
        ]
    },
    {
        "id": "TOP-ANSWERABLE",
        "type": "topic",
        "title": "What Makes a Question Answerable?",
        "essentialQuestion": "How can we tell what kind of evidence a question requires?",
        "prompts": [
            "Which questions can be answered with certainty?",
            "Which require opinion or judgment?",
            "Which require a clearer definition before answering?",
            "What makes someone an expert?",
            "Can experts disagree?",
            "How do hidden assumptions shape a question?",
            "What information makes a prediction more reliable?",
            "How could a poorly worded question be improved?"
        ],
        "reflection": "Rewrite one question so it becomes clearer and more answerable.",
        "activity": "Sort questions into factual, predictive, personal, ambiguous, and value-based categories.",
        "tags": [
            "evidence",
            "expertise",
            "assumptions",
            "question design"
        ]
    },
    {
        "id": "TOP-EFFECT-CAUSE",
        "type": "topic",
        "title": "What Problem Was This Trying to Solve?",
        "essentialQuestion": "Can we understand an invention or institution by working backward from the solution?",
        "prompts": [
            "What problem were people trying to solve when they created schools?",
            "What problem was voting designed to address?",
            "Why were laws, judges, roads, money, or hospitals created?",
            "Did the solution create any new problems?",
            "Does the original solution still make sense today?",
            "What would you redesign?",
            "What current problem needs a solution that does not exist yet?"
        ],
        "reflection": "Choose one familiar object or institution and name the problem behind it.",
        "activity": "Show an object, custom, rule, or institution and work backward from effect to possible cause.",
        "tags": [
            "effect-to-cause",
            "invention",
            "history",
            "problem solving"
        ]
    },
    {
        "id": "TOP-COMMUNITY",
        "type": "topic",
        "title": "Building a Community",
        "essentialQuestion": "What allows people to live together successfully?",
        "prompts": [
            "What values must a successful community share?",
            "What rules are truly necessary?",
            "How should power be distributed?",
            "What responsibilities do members have to one another?",
            "How should resources be shared?",
            "What kind of leadership works best?",
            "How should a community respond when someone causes harm?",
            "What would an ideal school community look and feel like?",
            "Would everyone agree on what makes a community ideal?"
        ],
        "reflection": "Choose one change that would strengthen our classroom or school community.",
        "activity": "Design a small community and decide its values, rules, leadership, and way of resolving conflict.",
        "tags": [
            "community",
            "leadership",
            "fairness",
            "responsibility"
        ]
    },
    {
        "id": "TOP-LEADERSHIP",
        "type": "topic",
        "title": "Student-Centered Leadership",
        "essentialQuestion": "What does leadership look like when everyone’s knowledge matters?",
        "prompts": [
            "Does a leader always need to have the answer?",
            "How can a leader recognize the intelligence already in a group?",
            "What is the difference between leading people and controlling them?",
            "When should leaders take action before everything is certain?",
            "How should a leader invite ideas from quieter members?",
            "Can students lead meaningful change in a school?",
            "What qualities make people willing to follow someone?"
        ],
        "reflection": "Identify one way you can practice leadership without holding a title.",
        "activity": "Redesign a teacher-centered decision so student knowledge and voice shape the result.",
        "tags": [
            "leadership",
            "student voice",
            "collaboration",
            "action"
        ]
    },
    {
        "id": "Q-QUIET",
        "type": "question",
        "title": "When a Student Is Quiet",
        "essentialQuestion": "What could make this conversation feel safer or more meaningful?",
        "prompts": [
            "What has been on your mind lately?",
            "What have you been thinking about that nobody knows?",
            "What is something you have wanted someone to ask you?",
            "Would it be easier to start with what is going well or what feels difficult?",
            "What would make today’s conversation useful?",
            "What is one thing you do not feel like talking about yet?"
        ],
        "reflection": "",
        "activity": "",
        "tags": [
            "quiet",
            "relationship",
            "meeting"
        ]
    },
    {
        "id": "Q-NO-GOALS",
        "type": "question",
        "title": "When a Student Has No Goals Yet",
        "essentialQuestion": "What clues can help us discover what matters to you?",
        "prompts": [
            "What makes you lose track of time?",
            "What YouTube rabbit hole do you keep returning to?",
            "What do friends ask you for help with?",
            "What problem would you enjoy solving?",
            "What would you try if nobody graded you?",
            "What kind of work would you never want to do, and why?"
        ],
        "reflection": "",
        "activity": "",
        "tags": [
            "discovery",
            "goals",
            "interests"
        ]
    },
    {
        "id": "Q-STUCK",
        "type": "question",
        "title": "When a Student Feels Stuck",
        "essentialQuestion": "What is the smallest move that could create momentum?",
        "prompts": [
            "What is keeping you stuck?",
            "What is one tiny thing that could change this week?",
            "What part is under your control?",
            "What would make the next step easier?",
            "Who could help?",
            "What would Future You suggest doing first?"
        ],
        "reflection": "",
        "activity": "",
        "tags": [
            "stuck",
            "motivation",
            "next steps"
        ]
    },
    {
        "id": "Q-CONFIDENCE",
        "type": "question",
        "title": "When Confidence Is Low",
        "essentialQuestion": "What evidence of capability are we overlooking?",
        "prompts": [
            "Tell me about something you have already overcome.",
            "When do you feel most capable?",
            "Who sees strengths in you?",
            "What did you learn to do that once felt impossible?",
            "What is one strength you used recently?",
            "What would you attempt if you trusted yourself a little more?"
        ],
        "reflection": "",
        "activity": "",
        "tags": [
            "confidence",
            "strengths",
            "identity"
        ]
    },
    {
        "id": "Q-ANGER",
        "type": "question",
        "title": "When a Student Is Angry",
        "essentialQuestion": "What needs to be understood before deciding what happens next?",
        "prompts": [
            "What feels unfair?",
            "What happened before you felt this way?",
            "What would feeling heard look like?",
            "What do you need right now: space, support, information, or action?",
            "What part of the situation matters most to you?",
            "What would a fair next step look like?"
        ],
        "reflection": "",
        "activity": "",
        "tags": [
            "anger",
            "conflict",
            "support"
        ]
    },
    {
        "id": "R-EFFECT-CAUSE",
        "type": "routine",
        "title": "Effect → Cause",
        "essentialQuestion": "What problem was this trying to solve?",
        "prompts": [
            "What existed before this solution?",
            "Who experienced the problem?",
            "What were people trying to change, fix, or avoid?",
            "How well did the solution work?",
            "What new problems did it create?",
            "How might we redesign it now?"
        ],
        "reflection": "What did working backward help you notice?",
        "activity": "Choose an object, rule, institution, or invention and trace it back to the problem that produced it.",
        "tags": [
            "thinking routine",
            "history",
            "problem solving"
        ]
    },
    {
        "id": "R-FIVE-WHYS",
        "type": "routine",
        "title": "Five Whys",
        "essentialQuestion": "What is underneath the first explanation?",
        "prompts": [
            "Why did this happen?",
            "Why does that matter?",
            "What caused that condition?",
            "What assumption is underneath it?",
            "What deeper need or problem is present?"
        ],
        "reflection": "Which answer felt closest to the real issue?",
        "activity": "Begin with one problem statement and ask why repeatedly without blaming people.",
        "tags": [
            "thinking routine",
            "root cause",
            "reflection"
        ]
    },
    {
        "id": "R-PERSPECTIVE",
        "type": "routine",
        "title": "Perspective Shift",
        "essentialQuestion": "How might this look from another point of view?",
        "prompts": [
            "How would your younger self see this?",
            "How would your future self see this?",
            "How would someone who disagrees see this?",
            "How might a person most affected by the decision respond?",
            "What perspective is missing?",
            "What changes when you switch viewpoints?"
        ],
        "reflection": "Which perspective changed your thinking most?",
        "activity": "Respond to one issue from three different perspectives.",
        "tags": [
            "thinking routine",
            "perspective",
            "empathy"
        ]
    },
    {
        "id": "R-EVIDENCE",
        "type": "routine",
        "title": "Evidence Check",
        "essentialQuestion": "How do we know?",
        "prompts": [
            "What evidence supports this?",
            "Where did the information come from?",
            "What evidence challenges it?",
            "What assumptions are being made?",
            "What would increase our confidence?",
            "What conclusion is reasonable right now?"
        ],
        "reflection": "What remains uncertain?",
        "activity": "Evaluate one claim using source, evidence, assumptions, and alternative explanations.",
        "tags": [
            "thinking routine",
            "evidence",
            "critical thinking"
        ]
    },
    {
        "id": "R-WHAT-IF",
        "type": "routine",
        "title": "What If...",
        "essentialQuestion": "What becomes possible when we temporarily remove a constraint?",
        "prompts": [
            "What if the opposite were true?",
            "What if money were not the limitation?",
            "What if we had to solve this in one day?",
            "What if students designed the solution?",
            "What if the current rule disappeared?",
            "What unexpected benefit or problem might appear?"
        ],
        "reflection": "Which possibility deserves a small experiment?",
        "activity": "Generate ten what-if possibilities before evaluating any of them.",
        "tags": [
            "thinking routine",
            "design",
            "possibility"
        ]
    },
    {
        "id": "A-FINISH",
        "type": "activity",
        "title": "Finish the Sentence",
        "essentialQuestion": "What can incomplete sentences reveal about interests and identity?",
        "prompts": [
            "I lose track of time when...",
            "I feel useful when...",
            "I wish I knew more about...",
            "People ask me for help with...",
            "I would try... if I knew I could not fail.",
            "A problem I notice is..."
        ],
        "reflection": "Which answer surprised you?",
        "activity": "Choose three sentence stems, answer quickly, then look for patterns.",
        "tags": [
            "discovery",
            "identity",
            "quick activity"
        ]
    },
    {
        "id": "A-PICK-THREE",
        "type": "activity",
        "title": "Pick Three",
        "essentialQuestion": "Which themes feel most like you right now?",
        "prompts": [
            "Adventure",
            "Helping",
            "Money",
            "Competition",
            "Creating",
            "Animals",
            "Leadership",
            "Technology",
            "Teaching",
            "Music",
            "Building",
            "Nature",
            "Sports"
        ],
        "reflection": "Why did you choose those three?",
        "activity": "Pick three words, explain each choice, and identify an experience that matches it.",
        "tags": [
            "discovery",
            "values",
            "interests"
        ]
    },
    {
        "id": "A-ALGORITHM",
        "type": "activity",
        "title": "What Is Your Algorithm?",
        "essentialQuestion": "What do your recommendations reveal about your curiosity?",
        "prompts": [
            "What videos keep appearing?",
            "Which ones do you actually watch?",
            "What do you search for on purpose?",
            "What topic sends you down a rabbit hole?",
            "What do you skip immediately?",
            "What might your feed misunderstand about you?"
        ],
        "reflection": "What interest or curiosity appeared most often?",
        "activity": "Describe your recent recommendations without showing private account information, then identify themes.",
        "tags": [
            "discovery",
            "media",
            "curiosity"
        ]
    },
    {
        "id": "A-WOULD-RATHER",
        "type": "activity",
        "title": "Would You Rather Explore?",
        "essentialQuestion": "What do your choices reveal about how you like to learn and work?",
        "prompts": [
            "Build a robot or design a room?",
            "Lead a team or master a skill alone?",
            "Fix a machine or help a person?",
            "Work outdoors or with technology?",
            "Create something new or improve something existing?",
            "Solve a mystery or organize an event?"
        ],
        "reflection": "What pattern do you notice across your choices?",
        "activity": "Choose quickly, explain why, and allow neither or both when the options do not fit.",
        "tags": [
            "discovery",
            "preferences",
            "career exploration"
        ]
    }
]);
    let customResources = [];
    let favorites = new Set();

    function clean(value) {
        return typeof value === "string" ? value.trim() : "";
    }

    function list(value) {
        if (Array.isArray(value)) return value.map(clean).filter(Boolean);
        return clean(value).split(/\n|,/).map(clean).filter(Boolean);
    }

    function clone(value) {
        return structuredClone(value);
    }

    function normalize(item = {}) {
        return {
            id: clean(item.id) || `RES-${Date.now().toString(36).toUpperCase()}`,
            type: ["topic","question","routine","activity"].includes(item.type)
                ? item.type : "topic",
            title: clean(item.title) || "Untitled Resource",
            essentialQuestion: clean(item.essentialQuestion),
            prompts: list(item.prompts),
            reflection: clean(item.reflection),
            activity: clean(item.activity),
            tags: list(item.tags),
            custom: item.custom !== false,
            createdAt: clean(item.createdAt) || new Date().toISOString(),
            updatedAt: clean(item.updatedAt) || clean(item.createdAt) ||
                new Date().toISOString()
        };
    }

    function load() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            customResources = Array.isArray(parsed) ? parsed.map(normalize) : [];
            favorites = new Set(JSON.parse(
                localStorage.getItem(FAVORITES_KEY) || "[]"
            ));
        } catch (error) {
            console.warn("Momentum could not load Resource Library data.", error);
            customResources = [];
            favorites = new Set();
        }
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customResources));
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    }

    function emit() {
        document.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT));
    }

    function initialize() {
        load();
    }

    function getResources() {
        return [
            ...SEED_RESOURCES.map((item) => ({...clone(item), custom:false})),
            ...customResources.map(clone)
        ];
    }

    function getResource(id) {
        const found = getResources().find((item) => item.id === id);
        return found ? clone(found) : null;
    }

    function addResource(payload) {
        const item = normalize({...payload, custom:true});
        customResources.push(item);
        save();
        emit();
        return clone(item);
    }

    function updateResource(id, payload) {
        const index = customResources.findIndex((item) => item.id === id);
        if (index < 0) return null;
        customResources[index] = normalize({
            ...customResources[index],
            ...payload,
            id,
            custom:true,
            createdAt: customResources[index].createdAt,
            updatedAt: new Date().toISOString()
        });
        save();
        emit();
        return clone(customResources[index]);
    }

    function removeResource(id) {
        const before = customResources.length;
        customResources = customResources.filter((item) => item.id !== id);
        favorites.delete(id);
        save();
        if (customResources.length !== before) emit();
        return customResources.length !== before;
    }

    function toggleFavorite(id) {
        if (favorites.has(id)) favorites.delete(id);
        else favorites.add(id);
        save();
        emit();
        return favorites.has(id);
    }

    function isFavorite(id) {
        return favorites.has(id);
    }

    function getFavorites() {
        return [...favorites];
    }

    function replaceCustom(items = [], favoriteIds = []) {
        customResources = Array.isArray(items)
            ? items.map((item) => normalize({...item, custom:true}))
            : [];
        favorites = new Set(Array.isArray(favoriteIds) ? favoriteIds : []);
        save();
        emit();
    }

    function weekNumber(date = new Date()) {
        const start = new Date(date.getFullYear(), 0, 1);
        return Math.floor((date - start) / 604800000);
    }

    function getWeeklyQuestion() {
        const topics = getResources().filter((item) =>
            item.type === "topic" && item.essentialQuestion
        );
        if (!topics.length) return null;
        const index = (new Date().getFullYear() + weekNumber()) % topics.length;
        return clone(topics[index]);
    }

    function getRandomQuestion() {
        const prompts = getResources().flatMap((item) =>
            item.prompts.map((prompt) => ({
                prompt,
                resourceId:item.id,
                title:item.title,
                type:item.type
            }))
        );
        return prompts.length
            ? clone(prompts[Math.floor(Math.random() * prompts.length)])
            : null;
    }

    return Object.freeze({
        STORAGE_KEY,
        FAVORITES_KEY,
        DATA_CHANGED_EVENT,
        initialize,
        getResources,
        getResource,
        addResource,
        updateResource,
        removeResource,
        toggleFavorite,
        isFavorite,
        getFavorites,
        getWeeklyQuestion,
        getRandomQuestion,
        replaceCustom
    });
})();
