/*
Momentum Community College Explorer
Build v23.6.0
*/
"use strict";

const CommunityCollegeUI = (() => {
    const REGIONAL_TRAINING_PARTNER_IDS = [
        "LOM-ADULTED",
        "REG-CET-SANTA-MARIA",
        "REG-SBCC-CAREER-ED",
        "REG-CUESTA-SKILLED-TRADES",
        "REG-LAURUS-SANTA-MARIA",
        "REG-SLO-ADULT-CULINARY",
        "REG-SBCEO-CTE",
        "REG-SMJUHSD-CTE",
        "REG-VENTURA-CAREER-ED"
    ];
    const PROGRAMS = {
        "Business & Finance": [
            "Accounting",
            "Business",
            "Computer Business Information Systems",
            "Computer Business Office Technology",
            "Entrepreneurship"
        ],
        "Creative Arts": [
            "Animation and Game Art",
            "Art",
            "Dance",
            "Drama, Theatre Arts, and Technical Theatre",
            "Film and Video Production",
            "Graphic Design",
            "Multimedia",
            "Music",
            "Photography and Commercial Photography",
            "Sound Technology",
            "Web Design"
        ],
        "Health Sciences": [
            "Dental Assisting",
            "Human Services",
            "Kinesiology",
            "Medical Assisting",
            "Medical Billing and Coding",
            "Nursing",
            "Nutrition and Dietetics",
            "Pre-Radiography",
            "Sports Medicine",
            "Veterinary Technology"
        ],
        "Hospitality, Recreation & Fashion": [
            "Culinary Arts and Management",
            "Culinology",
            "Fashion Studies",
            "Interior Design Merchandising",
            "Recreation Management"
        ],
        "People, Cultures & Languages": [
            "Anthropology",
            "Communication Studies",
            "English",
            "English Language Development",
            "Geography",
            "Global Studies",
            "History",
            "Latina/o Studies",
            "Liberal Arts: Arts and Humanities",
            "Liberal Arts: Social and Behavioral Sciences",
            "Philosophy",
            "Political Science",
            "Psychology",
            "Social Justice Studies",
            "Sociology",
            "Spanish"
        ],
        "Public Service": [
            "Administration of Justice",
            "Emergency Medical Services",
            "Fire Technology",
            "Law Enforcement Academy",
            "Paralegal Studies",
            "Wildland Fire Technology"
        ],
        "Sciences & Technologies": [
            "Agriculture",
            "Architectural Drafting",
            "Auto Body Technology",
            "Automotive Technology",
            "Biology",
            "Chemistry",
            "Computer Science",
            "Computer Networking and Electronics Technology",
            "Engineering",
            "Engineering Technology",
            "Geology",
            "Liberal Arts: Mathematics and Science",
            "Machining and Manufacturing Technology",
            "Mathematics",
            "Physics",
            "Viticulture and Enology",
            "Welding Technology"
        ],
        "Education & Teaching": [
            "Early Childhood Studies",
            "Elementary Teacher Education",
            "Liberal Studies: Elementary Teacher Preparation"
        ]
    };

    const CATEGORY_URLS = {
        "Business & Finance":
            "https://www.hancockcollege.edu/pathways/business-finance/index.php",
        "Creative Arts":
            "https://www.hancockcollege.edu/pathways/creative-arts/index.php",
        "Health Sciences":
            "https://www.hancockcollege.edu/pathways/health-sciences/index.php",
        "Hospitality, Recreation & Fashion":
            "https://www.hancockcollege.edu/pathways/food-fashion-fitness/index.php",
        "People, Cultures & Languages":
            "https://www.hancockcollege.edu/pathways/people-cultures-languages/index.php",
        "Public Service":
            "https://www.hancockcollege.edu/pathways/public-services/index.php",
        "Sciences & Technologies":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/index.php",
        "Education & Teaching":
            "https://www.hancockcollege.edu/pathways/people-cultures-languages/index.php"
    };

    const PROGRAM_URLS = {
        "Accounting": "https://www.hancockcollege.edu/pathways/business-finance/accounting.php",
        "Business": "https://www.hancockcollege.edu/pathways/business-finance/business.php",
        "Computer Business Information Systems": "https://www.hancockcollege.edu/pathways/business-finance/cbis.php",
        "Computer Business Office Technology": "https://www.hancockcollege.edu/pathways/business-finance/cbot.php",
        "Entrepreneurship": "https://www.hancockcollege.edu/pathways/business-finance/entrepreneurship.php",

        "Animation and Game Art": "https://www.hancockcollege.edu/pathways/creative-arts/animation/index.php",
        "Art": "https://www.hancockcollege.edu/pathways/creative-arts/art/index.php",
        "Dance": "https://www.hancockcollege.edu/pathways/creative-arts/dance/index.php",
        "Drama, Theatre Arts, and Technical Theatre": "https://www.hancockcollege.edu/pathways/creative-arts/drama.php",
        "Film and Video Production": "https://www.hancockcollege.edu/pathways/creative-arts/film/index.php",
        "Graphic Design": "https://www.hancockcollege.edu/pathways/creative-arts/graphic-design.php",
        "Multimedia": "https://www.hancockcollege.edu/pathways/creative-arts/multimedia/index.php",
        "Music": "https://www.hancockcollege.edu/pathways/creative-arts/music/index.php",
        "Photography and Commercial Photography": "https://www.hancockcollege.edu/pathways/creative-arts/photography/index.php",
        "Sound Technology": "https://www.hancockcollege.edu/pathways/creative-arts/sound/index.php",
        "Web Design": "https://www.hancockcollege.edu/pathways/creative-arts/web/index.php",

        "Dental Assisting": "https://www.hancockcollege.edu/pathways/health-sciences/dental-assist.php",
        "Human Services": "https://www.hancockcollege.edu/pathways/health-sciences/human-services.php",
        "Kinesiology": "https://www.hancockcollege.edu/pathways/health-sciences/kinesiology.php",
        "Medical Assisting": "https://www.hancockcollege.edu/pathways/health-sciences/medical-assist.php",
        "Medical Billing and Coding": "https://www.hancockcollege.edu/pathways/health-sciences/medical-bill.php",
        "Nursing": "https://www.hancockcollege.edu/pathways/health-sciences/nursing.php",
        "Nutrition and Dietetics": "https://www.hancockcollege.edu/pathways/health-sciences/nutrition.php",
        "Pre-Radiography": "https://www.hancockcollege.edu/pathways/health-sciences/pre-radiography.php",
        "Sports Medicine": "https://www.hancockcollege.edu/pathways/health-sciences/sports.php",
        "Veterinary Technology": "https://www.hancockcollege.edu/pathways/health-sciences/vet-tech.php",

        "Culinary Arts and Management": "https://www.hancockcollege.edu/pathways/food-fashion-fitness/culinary.php",
        "Culinology": "https://www.hancockcollege.edu/pathways/food-fashion-fitness/culinology.php",
        "Fashion Studies": "https://www.hancockcollege.edu/pathways/food-fashion-fitness/fashion.php",
        "Interior Design Merchandising": "https://www.hancockcollege.edu/pathways/food-fashion-fitness/interior-design.php",
        "Recreation Management": "https://www.hancockcollege.edu/pathways/food-fashion-fitness/recreation.php",

        "Anthropology": "https://www.hancockcollege.edu/pathways/people-cultures-languages/anthropology.php",
        "Communication Studies": "https://www.hancockcollege.edu/pathways/people-cultures-languages/speech.php",
        "English": "https://www.hancockcollege.edu/pathways/people-cultures-languages/english.php",
        "English Language Development": "https://www.hancockcollege.edu/pathways/people-cultures-languages/esl.php",
        "Geography": "https://www.hancockcollege.edu/pathways/people-cultures-languages/geography.php",
        "Global Studies": "https://www.hancockcollege.edu/pathways/people-cultures-languages/global-studies.php",
        "History": "https://www.hancockcollege.edu/pathways/people-cultures-languages/history.php",
        "Latina/o Studies": "https://www.hancockcollege.edu/pathways/people-cultures-languages/latin-studies.php",
        "Liberal Arts: Arts and Humanities": "https://www.hancockcollege.edu/pathways/people-cultures-languages/liberal-arts.php",
        "Liberal Arts: Social and Behavioral Sciences": "https://www.hancockcollege.edu/pathways/people-cultures-languages/lib%20arts-social%20and%20behavioral.php",
        "Philosophy": "https://www.hancockcollege.edu/pathways/people-cultures-languages/philosophy.php",
        "Political Science": "https://www.hancockcollege.edu/pathways/people-cultures-languages/polisci.php",
        "Psychology": "https://www.hancockcollege.edu/pathways/people-cultures-languages/psychology.php",
        "Social Justice Studies": "https://www.hancockcollege.edu/pathways/people-cultures-languages/lgbtq.php",
        "Sociology": "https://www.hancockcollege.edu/pathways/people-cultures-languages/sociology.php",
        "Spanish": "https://www.hancockcollege.edu/pathways/people-cultures-languages/spanish/index.php",

        "Administration of Justice": "https://www.hancockcollege.edu/pathways/public-services/administration-of-justice.php",
        "Emergency Medical Services": "https://www.hancockcollege.edu/pathways/public-services/ems/index.php",
        "Fire Technology": "https://www.hancockcollege.edu/pathways/public-services/firetech.php",
        "Law Enforcement Academy": "https://www.hancockcollege.edu/pathways/public-services/lawenforcement/index.php",
        "Paralegal Studies": "https://www.hancockcollege.edu/pathways/public-services/paralegal.php",
        "Wildland Fire Technology": "https://www.hancockcollege.edu/pathways/public-services/wildland-fire.php",

        "Agriculture": "https://www.hancockcollege.edu/pathways/sciences-technologies/agriculture/index.php",
        "Architectural Drafting": "https://www.hancockcollege.edu/pathways/sciences-technologies/architecture.php",
        "Auto Body Technology": "https://www.hancockcollege.edu/pathways/sciences-technologies/autobody.php",
        "Automotive Technology": "https://www.hancockcollege.edu/pathways/sciences-technologies/automotive.php",
        "Biology": "https://www.hancockcollege.edu/pathways/sciences-technologies/biology.php",
        "Chemistry": "https://www.hancockcollege.edu/pathways/sciences-technologies/chemistry.php",
        "Computer Science": "https://www.hancockcollege.edu/pathways/sciences-technologies/computer-science.php",
        "Computer Networking and Electronics Technology": "https://www.hancockcollege.edu/pathways/sciences-technologies/electronics.php",
        "Engineering": "https://www.hancockcollege.edu/pathways/sciences-technologies/engineering.php",
        "Engineering Technology": "https://www.hancockcollege.edu/pathways/sciences-technologies/engineering-technology.php",
        "Geology": "https://www.hancockcollege.edu/pathways/sciences-technologies/geology.php",
        "Liberal Arts: Mathematics and Science": "https://www.hancockcollege.edu/pathways/sciences-technologies/liberalarts-math-science.php",
        "Machining and Manufacturing Technology": "https://www.hancockcollege.edu/pathways/sciences-technologies/machining.php",
        "Mathematics": "https://www.hancockcollege.edu/pathways/sciences-technologies/math.php",
        "Physics": "https://www.hancockcollege.edu/pathways/sciences-technologies/physics.php",
        "Viticulture and Enology": "https://www.hancockcollege.edu/pathways/sciences-technologies/viticulture-enology.php",
        "Welding Technology": "https://www.hancockcollege.edu/pathways/sciences-technologies/welding.php",

        "Early Childhood Studies": "https://www.hancockcollege.edu/pathways/people-cultures-languages/ecs.php",
        "Elementary Teacher Education": "https://www.hancockcollege.edu/pathways/people-cultures-languages/ete.php",
        "Liberal Studies: Elementary Teacher Preparation": "https://www.hancockcollege.edu/pathways/people-cultures-languages/liberal-studies-etp.php"
    };

    const PATHWAY_META = {
        "Business & Finance": {
            key: "business", icon: "$", description: "Business, accounting, entrepreneurship, and office technology."
        },
        "Creative Arts": {
            key: "creative", icon: "✦", description: "Art, design, performance, media production, photography, and sound."
        },
        "Health Sciences": {
            key: "health", icon: "✚", description: "Patient care, nursing, wellness, human services, and veterinary technology."
        },
        "Hospitality, Recreation & Fashion": {
            key: "hospitality", icon: "⌂", description: "Food, recreation, fitness, fashion, and interior design."
        },
        "People, Cultures & Languages": {
            key: "people", icon: "◉", description: "Communication, humanities, social sciences, languages, and human behavior."
        },
        "Public Service": {
            key: "public", icon: "◆", description: "Justice, fire, emergency response, law enforcement, and legal support."
        },
        "Sciences & Technologies": {
            key: "technology", icon: "⚙", description: "Science, engineering, computers, automotive, agriculture, welding, and manufacturing."
        },
        "Education & Teaching": {
            key: "education", icon: "▰", description: "Early childhood, elementary teaching, and transfer preparation."
        }
    };

    function programUrl(category, program) {
        return PROGRAM_URLS[program] || "";
    }

    let root = null;
    let query = "";
    let modalRoot = null;

    function esc(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function studentName(student) {
        return student.profile.preferredName ||
            `${student.profile.firstName} ${student.profile.lastName}`.trim() ||
            "Unnamed Student";
    }

    function totalPrograms() {
        return Object.values(PROGRAMS).reduce((count, programs) => count + programs.length, 0);
    }

    function renderProgramRow(category, program, meta) {
        return `
            <article class="college-program-row college-tone-${meta.key}">
                <span class="college-program-marker" aria-hidden="true">${meta.icon}</span>
                <div>
                    <strong>${esc(program)}</strong>
                    <small>${esc(category)}</small>
                </div>
                <div class="college-program-actions">
                    <button class="button button-secondary button-small" type="button"
                        data-action="connect-college-program"
                        data-category="${esc(category)}"
                        data-program="${esc(program)}">
                        Connect Student
                    </button>
                    <a class="button button-secondary button-small"
                        target="_blank" rel="noopener noreferrer"
                        href="${esc(programUrl(category, program))}">
                        Program Page
                    </a>
                </div>
            </article>
        `;
    }

    function regionalTrainingProviders(needle = "") {
        return REGIONAL_TRAINING_PARTNER_IDS
            .map((id) => PartnerManager.getPartner(id))
            .filter(Boolean)
            .filter((partner) => !partner.meta?.archived)
            .filter((partner) => {
                if (!needle) return true;
                const haystack = [
                    partner.organization,
                    partner.location,
                    partner.notes,
                    ...(partner.services || []),
                    ...(partner.careerFields || [])
                ].join(" ").toLowerCase();
                return haystack.includes(needle);
            })
            .sort((a, b) => a.organization.localeCompare(b.organization));
    }

    function renderTrainingProvider(partner) {
        const programs = (partner.services || []).slice(0, 7);
        return `
            <article class="regional-training-card">
                <div class="regional-training-card-header">
                    <span class="college-program-marker college-tone-technology" aria-hidden="true">⚙</span>
                    <div>
                        <strong>${esc(partner.organization)}</strong>
                        <small>${esc(partner.location || "Central Coast")}</small>
                    </div>
                </div>
                <p>${esc(partner.notes || "Regional career and technical training provider.")}</p>
                <div class="tag-list">
                    ${programs.map((item) => `<span class="tag">${esc(item)}</span>`).join("")}
                </div>
                <div class="card-actions">
                    <button class="button button-secondary button-small" type="button"
                        data-action="open-community-partner"
                        data-partner-id="${esc(partner.id)}"
                        data-organization="${esc(partner.organization)}">
                        View in Directory
                    </button>
                    ${partner.website ? `<a class="button button-secondary button-small" target="_blank" rel="noopener noreferrer" href="${esc(partner.website)}">School Website</a>` : ""}
                </div>
            </article>
        `;
    }

    function render() {
        if (!root) return;
        const needle = query.trim().toLowerCase();
        const visibleGroups = Object.entries(PROGRAMS).map(([category, items]) => ({
            category,
            meta: PATHWAY_META[category],
            items: items.filter((item) =>
                !needle ||
                category.toLowerCase().includes(needle) ||
                PATHWAY_META[category].description.toLowerCase().includes(needle) ||
                item.toLowerCase().includes(needle)
            )
        })).filter((group) => group.items.length);
        const visibleProgramCount = visibleGroups.reduce((count, group) => count + group.items.length, 0);
        const trainingProviders = regionalTrainingProviders(needle);

        root.innerHTML = `
            <div class="community-section-intro college-section-intro">
                <div>
                    <h3>Allan Hancock College & Regional Career Pathways</h3>
                    <p>
                        Start with the detailed Allan Hancock College pathway explorer,
                        then scroll down to compare other Santa Barbara County and Central Coast schools.
                    </p>
                </div>
                <a class="button button-primary" target="_blank" rel="noopener noreferrer"
                    href="https://www.hancockcollege.edu/pathways/index.php">
                    Allan Hancock Pathways
                </a>
            </div>

            <div class="community-metric-strip college-metric-strip">
                <article class="community-metric college-metric-pathways"><span>Regional Providers</span><strong>${trainingProviders.length}</strong></article>
                <article class="community-metric college-metric-programs"><span>Hancock Programs</span><strong>${totalPrograms()}</strong></article>
                <article class="community-metric college-metric-visible"><span>Programs Showing</span><strong>${visibleProgramCount}</strong></article>
                <article class="community-metric college-metric-location"><span>Coverage</span><strong>Central Coast</strong><small>Lompoc to SLO and Ventura</small></article>
            </div>

            <div class="college-subsection-heading">
                <div>
                    <p class="eyebrow">Detailed local explorer</p>
                    <h4>Allan Hancock College programs</h4>
                </div>
            </div>

            <div class="college-explorer-toolbar college-v23-toolbar">
                <label class="search-field">
                    <span aria-hidden="true">⌕</span>
                    <input id="collegeProgramSearch" type="search"
                        value="${esc(query)}"
                        placeholder="Search programs, careers, or pathway areas">
                </label>
                <button class="button button-secondary" type="button"
                    data-action="clear-college-search">Clear Search</button>
            </div>

            <div class="college-source-note college-v23-note">
                <strong>Use this as an exploration guide.</strong>
                <p>
                    Program availability, degree and certificate options, locations,
                    schedules, costs, and admission requirements can change. Verify current
                    details with each school before making a student plan.
                </p>
            </div>

            ${visibleGroups.length ? `
                <div class="college-pathway-groups">
                    ${visibleGroups.map(({ category, meta, items }, index) => `
                        <details class="college-pathway-section college-tone-${meta.key}" ${needle || index === 0 ? "open" : ""}>
                            <summary>
                                <span class="college-pathway-icon" aria-hidden="true">${meta.icon}</span>
                                <div>
                                    <strong>${esc(category)}</strong>
                                    <small>${esc(meta.description)}</small>
                                </div>
                                <span class="college-pathway-count">${items.length}</span>
                                <span class="community-row-arrow" aria-hidden="true">›</span>
                            </summary>
                            <div class="college-pathway-body">
                                <div class="college-program-list">
                                    ${items.map((program) => renderProgramRow(category, program, meta)).join("")}
                                </div>
                                <a class="college-pathway-link" target="_blank" rel="noopener noreferrer"
                                    href="${esc(CATEGORY_URLS[category] || "https://www.hancockcollege.edu/pathways/index.php")}">
                                    Open ${esc(category)} pathway page →
                                </a>
                            </div>
                        </details>
                    `).join("")}
                </div>
            ` : `
                <div class="empty-state community-empty-state">
                    <h3>No matching programs</h3>
                    <p>Try a broader term such as health, art, business, welding, teaching, or computers.</p>
                    <button class="button button-secondary" type="button" data-action="clear-college-search">Clear Search</button>
                </div>
            `}

            <section class="regional-training-section" aria-labelledby="regionalTrainingHeading">
                <div class="regional-training-heading">
                    <div>
                        <p class="eyebrow">Beyond one college</p>
                        <h4 id="regionalTrainingHeading">Trade and technical schools</h4>
                    </div>
                    <span>${trainingProviders.length} matching providers</span>
                </div>
                ${trainingProviders.length ? `
                    <div class="regional-training-grid">
                        ${trainingProviders.map(renderTrainingProvider).join("")}
                    </div>
                ` : `<p class="empty-copy">No regional training providers match this search.</p>`}
            </section>
        `;
    }

    function connectProgramTemplate(category, program) {
        const students = StudentManager.getStudents({ includeArchived: false })
            .sort((a, b) => studentName(a).localeCompare(studentName(b)));
        return `
            <div class="modal-backdrop">
                <section class="modal community-connect-modal" role="dialog" aria-modal="true" aria-labelledby="collegeConnectTitle">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">College pathway connection</p>
                            <h2 id="collegeConnectTitle">${esc(program)}</h2>
                            <p>${esc(category)} · Allan Hancock College</p>
                        </div>
                        <button class="icon-button" type="button" data-action="close-college-modal" aria-label="Close">×</button>
                    </div>
                    <form id="connectCollegeProgramForm">
                        <div class="modal-body">
                            <input type="hidden" name="category" value="${esc(category)}">
                            <input type="hidden" name="program" value="${esc(program)}">
                            <fieldset class="community-student-picker">
                                <legend>Student *</legend>
                                ${students.length ? students.map((student) => `
                                    <label class="community-student-choice">
                                        <input type="radio" name="studentId" value="${esc(student.id)}" required>
                                        <span class="community-student-choice-main">
                                            <strong>${esc(studentName(student))}</strong>
                                            <small>${esc((student.profile.postSecondaryGoals || []).slice(0, 2).join(" · ") || "No college goals added")}</small>
                                        </span>
                                        <span class="community-student-context compact">
                                            <span><b>Interests</b>${esc((student.profile.interests || []).slice(0, 2).join(", ") || "—")}</span>
                                            <span><b>Next Steps</b>${(student.journey.followUps || []).filter((item) => String(item.status || "").toLowerCase() !== "completed").length}</span>
                                        </span>
                                    </label>
                                `).join("") : `<p class="empty-copy">Add a student before connecting a college program.</p>`}
                            </fieldset>

                            <label class="college-next-step-option">
                                <input type="checkbox" name="createNextStep" value="yes" checked>
                                <span><strong>Create a Next Step</strong><small>“Research ${esc(program)} at Allan Hancock College”</small></span>
                            </label>
                            <div class="form-field">
                                <label for="collegeNextStepDueDate">Optional due date</label>
                                <input id="collegeNextStepDueDate" name="dueDate" type="date">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="button button-secondary" type="button" data-action="close-college-modal">Cancel</button>
                            <button class="button button-primary" type="submit" ${students.length ? "" : "disabled"}>Connect Program</button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function closeModal() {
        modalRoot.innerHTML = "";
        document.body.style.overflow = "";
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;
        const action = target.dataset.action;

        if (action === "connect-college-program") {
            modalRoot.innerHTML = connectProgramTemplate(
                target.dataset.category || "College Pathway",
                target.dataset.program || "Program"
            );
            document.body.style.overflow = "hidden";
        } else if (action === "close-college-modal") {
            closeModal();
        } else if (action === "clear-college-search") {
            query = "";
            render();
        }
    }

    function handleSubmit(event) {
        if (event.target.id !== "connectCollegeProgramForm") return;
        event.preventDefault();
        const formData = new FormData(event.target);
        const studentId = String(formData.get("studentId") || "");
        const program = String(formData.get("program") || "");
        const category = String(formData.get("category") || "");
        if (!studentId || !program) return;

        const student = StudentManager.getStudent(studentId);
        const currentGoals = student?.profile.postSecondaryGoals || [];
        const goal = `${program} — Allan Hancock College`;
        if (!currentGoals.some((item) => item.toLowerCase() === goal.toLowerCase())) {
            StudentManager.updateStudent(studentId, {
                profile: {
                    postSecondaryGoals: [...currentGoals, goal]
                }
            });
        }

        if (formData.get("createNextStep") === "yes") {
            StudentManager.addJourneyItem(studentId, "followUps", {
                title: `Research ${program} at Allan Hancock College`,
                description: `Explore the ${category} pathway, program requirements, location, and a next enrollment step.`,
                dueDate: formData.get("dueDate"),
                status: "open",
                linkedType: "general",
                linkedLabel: `College · ${program}`
            });
        }

        closeModal();
        App.showToast(`${program} connected to ${studentName(student)}.`);
    }

    function initialize() {
        root = document.getElementById("communityCollegeContent");
        modalRoot = document.getElementById("modalRoot");
        document.addEventListener("input", (event) => {
            if (event.target.id !== "collegeProgramSearch") return;
            query = event.target.value;
            render();
            const input = document.getElementById("collegeProgramSearch");
            input?.focus();
            input?.setSelectionRange(query.length, query.length);
        });
        document.addEventListener("click", handleClick);
        document.addEventListener("submit", handleSubmit);
        render();
    }

    return Object.freeze({ initialize, render });
})();
