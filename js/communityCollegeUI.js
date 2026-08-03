/*
Momentum Community College Explorer
Build v21.0.0
*/
"use strict";

const CommunityCollegeUI = (() => {
    const PROGRAMS = {
    "Business & Finance": [
        "Accounting",
        "Agribusiness",
        "Agricultural Business",
        "Business",
        "Business Administration",
        "Business Law",
        "Customer Service",
        "Entrepreneurship",
        "Human Resource Management",
        "Management",
        "Marketing",
        "Sales and Marketing",
        "Supervisory Management",
        "Computer Business Information Systems",
        "Office Technology",
        "Paralegal Studies"
    ],
    "Creative Arts": [
        "Art",
        "Studio Arts",
        "Ceramics",
        "Commercial Dance",
        "Dance",
        "Drama",
        "Theatre Arts",
        "Professional Acting",
        "Technical Theatre",
        "Film and Video Production",
        "Media Arts",
        "Animation and Game Art",
        "Commercial Photography",
        "Graphic Design",
        "Multimedia",
        "Photography",
        "Visual Design",
        "Web Design",
        "Music",
        "Sound Technology",
        "Two-Dimensional Studio Art"
    ],
    "Health Sciences": [
        "Biology",
        "Dental Assisting",
        "Emergency Medical Services",
        "Emergency Medical Technician",
        "Paramedic",
        "Human Services",
        "Addiction Studies",
        "Medical Assisting",
        "Medical Billing and Coding",
        "Nursing",
        "Certified Nursing Assistant",
        "Licensed Vocational Nursing",
        "Registered Nursing",
        "Nutrition and Dietetics",
        "Sports Medicine",
        "Veterinary Technology"
    ],
    "Hospitality, Recreation & Fashion": [
        "Culinary Arts and Management",
        "Baking",
        "Catering and Events Management",
        "Food Production Supervision",
        "Restaurant Management",
        "Culinology",
        "Fashion Studies",
        "Fashion Merchandising",
        "Interior Design Merchandising",
        "Recreation Management",
        "Kinesiology",
        "Clothing Construction",
        "Floral Design"
    ],
    "People, Cultures & Languages": [
        "Anthropology",
        "Communication Studies",
        "English",
        "English as a Second Language",
        "Geography",
        "Global Studies",
        "History",
        "Latino/a Studies",
        "LGBTQ Studies",
        "Liberal Arts: Arts and Humanities",
        "Liberal Arts: Social and Behavioral Sciences",
        "Philosophy",
        "Political Science",
        "Psychology",
        "Social Science",
        "Sociology",
        "Spanish",
        "Speech Communication"
    ],
    "Public Service": [
        "Administration of Justice",
        "Basic Law Enforcement Academy",
        "Core Custody Academy",
        "Fire Technology",
        "Firefighter Academy",
        "Wildland Fire Technology",
        "Environmental Health and Safety",
        "Public Safety Communication",
        "State Hospital Academy"
    ],
    "Sciences & Technologies": [
        "Architectural Drafting",
        "Auto Body Technology",
        "Automotive Technology",
        "Chemistry",
        "Commercial Truck Driving",
        "Computer Networking and Electronics Technology",
        "Computer Science",
        "Crop Protection",
        "Engineering",
        "Engineering Drafting",
        "Engineering Technology",
        "Mechatronics",
        "Civil Engineering",
        "Environmental Science",
        "Machining and Manufacturing Technology",
        "Mathematics",
        "Physics",
        "Welding Technology",
        "Metal Fabrication",
        "Pipe Welding",
        "Viticulture",
        "Enology",
        "Agricultural Science",
        "Plant Science",
        "Green Landscaping and Gardening"
    ],
    "Education & Transfer": [
        "Early Childhood Education",
        "Early Childhood Studies",
        "Elementary Education",
        "Special Education",
        "Elementary Teacher Education",
        "Liberal Studies: Elementary Teacher Preparation",
        "Liberal Arts: Mathematics and Science",
        "Transfer Studies"
    ],
    "Noncredit & Career Preparation": [
        "Career Preparation",
        "Basic Skills",
        "Beginning Computer Skills",
        "Microsoft Office Basics",
        "Advanced ESL",
        "Basic ESL",
        "High School Equivalency Preparation",
        "Income Tax Preparation",
        "Career Development Certificates"
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
        "Education & Transfer":
            "https://www.hancockcollege.edu/pathways/people-cultures-languages/index.php",
        "Noncredit & Career Preparation":
            "https://www.hancockcollege.edu/communityed/certificates.php"
    };

    const PROGRAM_URLS = {
        "Accounting":
            "https://www.hancockcollege.edu/pathways/business-finance/accounting.php",
        "Business":
            "https://www.hancockcollege.edu/pathways/business-finance/business.php",
        "Business Administration":
            "https://www.hancockcollege.edu/pathways/business-finance/business.php",
        "Business Law":
            "https://www.hancockcollege.edu/pathways/business-finance/business.php",
        "Customer Service":
            "https://www.hancockcollege.edu/pathways/business-finance/business.php",
        "Entrepreneurship":
            "https://www.hancockcollege.edu/pathways/business-finance/entrepreneurship.php",
        "Human Resource Management":
            "https://www.hancockcollege.edu/pathways/business-finance/business.php",
        "Management":
            "https://www.hancockcollege.edu/pathways/business-finance/business.php",
        "Marketing":
            "https://www.hancockcollege.edu/pathways/business-finance/business.php",
        "Sales and Marketing":
            "https://www.hancockcollege.edu/pathways/business-finance/business.php",
        "Supervisory Management":
            "https://www.hancockcollege.edu/pathways/business-finance/business.php",
        "Paralegal Studies":
            "https://www.hancockcollege.edu/pathways/public-services/paralegal.php",

        "Animation and Game Art":
            "https://www.hancockcollege.edu/pathways/creative-arts/animation/index.php",
        "Multimedia":
            "https://www.hancockcollege.edu/pathways/creative-arts/multimedia/index.php",
        "Web Design":
            "https://www.hancockcollege.edu/pathways/creative-arts/web/index.php",
        "Film and Video Production":
            "https://www.hancockcollege.edu/pathways/creative-arts/film-video/index.php",
        "Graphic Design":
            "https://www.hancockcollege.edu/pathways/creative-arts/graphic-design/index.php",
        "Photography":
            "https://www.hancockcollege.edu/pathways/creative-arts/photography/index.php",
        "Commercial Photography":
            "https://www.hancockcollege.edu/pathways/creative-arts/photography/index.php",
        "Music":
            "https://www.hancockcollege.edu/pathways/creative-arts/music/index.php",
        "Sound Technology":
            "https://www.hancockcollege.edu/pathways/creative-arts/sound/index.php",
        "Drama":
            "https://www.hancockcollege.edu/pathways/creative-arts/drama.php",
        "Theatre Arts":
            "https://www.hancockcollege.edu/pathways/creative-arts/drama.php",
        "Professional Acting":
            "https://www.pcpa.org/",
        "Technical Theatre":
            "https://www.hancockcollege.edu/pathways/creative-arts/drama.php",
        "Dance":
            "https://www.hancockcollege.edu/pathways/creative-arts/dance.php",
        "Commercial Dance":
            "https://www.hancockcollege.edu/pathways/creative-arts/dance.php",
        "Art":
            "https://www.hancockcollege.edu/pathways/creative-arts/art.php",
        "Studio Arts":
            "https://www.hancockcollege.edu/pathways/creative-arts/art.php",
        "Ceramics":
            "https://www.hancockcollege.edu/pathways/creative-arts/art.php",

        "Nursing":
            "https://www.hancockcollege.edu/pathways/health-sciences/nursing.php",
        "Registered Nursing":
            "https://www.hancockcollege.edu/pathways/health-sciences/rn.php",
        "Certified Nursing Assistant":
            "https://www.hancockcollege.edu/pathways/health-sciences/cna.php",
        "Licensed Vocational Nursing":
            "https://www.hancockcollege.edu/pathways/health-sciences/lvn.php",
        "Nutrition and Dietetics":
            "https://www.hancockcollege.edu/pathways/health-sciences/nutrition.php",
        "Kinesiology":
            "https://www.hancockcollege.edu/pathways/health-sciences/kinesiology.php",
        "Veterinary Technology":
            "https://www.hancockcollege.edu/pathways/health-sciences/veterinary-technology.php",
        "Dental Assisting":
            "https://www.hancockcollege.edu/pathways/health-sciences/dental-assisting.php",
        "Medical Assisting":
            "https://www.hancockcollege.edu/pathways/health-sciences/medical-assisting.php",
        "Emergency Medical Services":
            "https://www.hancockcollege.edu/pathways/public-services/ems.php",
        "Emergency Medical Technician":
            "https://www.hancockcollege.edu/pathways/public-services/ems.php",
        "Paramedic":
            "https://www.hancockcollege.edu/pathways/public-services/paramedic.php",

        "Culinary Arts and Management":
            "https://www.hancockcollege.edu/pathways/food-fashion-fitness/culinary.php",
        "Baking":
            "https://www.hancockcollege.edu/pathways/food-fashion-fitness/culinary.php",
        "Catering and Events Management":
            "https://www.hancockcollege.edu/pathways/food-fashion-fitness/culinary.php",
        "Restaurant Management":
            "https://www.hancockcollege.edu/pathways/food-fashion-fitness/culinary.php",
        "Culinology":
            "https://www.hancockcollege.edu/pathways/food-fashion-fitness/culinology.php",
        "Fashion Studies":
            "https://www.hancockcollege.edu/pathways/food-fashion-fitness/fashion.php",
        "Fashion Merchandising":
            "https://www.hancockcollege.edu/pathways/food-fashion-fitness/fashion.php",
        "Interior Design Merchandising":
            "https://www.hancockcollege.edu/pathways/food-fashion-fitness/interior-design.php",
        "Recreation Management":
            "https://www.hancockcollege.edu/pathways/food-fashion-fitness/recreation.php",

        "Administration of Justice":
            "https://www.hancockcollege.edu/pathways/public-services/administration-of-justice.php",
        "Basic Law Enforcement Academy":
            "https://www.hancockcollege.edu/pathways/public-services/law-enforcement.php",
        "Core Custody Academy":
            "https://www.hancockcollege.edu/pathways/public-services/core-custody.php",
        "Fire Technology":
            "https://www.hancockcollege.edu/pathways/public-services/fire.php",
        "Firefighter Academy":
            "https://www.hancockcollege.edu/pathways/public-services/fire.php",
        "Wildland Fire Technology":
            "https://www.hancockcollege.edu/pathways/public-services/wildland-fire.php",
        "Public Safety Communication":
            "https://www.hancockcollege.edu/pathways/public-services/index.php",

        "Architectural Drafting":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/architecture.php",
        "Auto Body Technology":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/autobody.php",
        "Automotive Technology":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/automotive.php",
        "Computer Networking and Electronics Technology":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/electronics.php",
        "Engineering":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/engineering.php",
        "Engineering Drafting":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/engineering.php",
        "Engineering Technology":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/engineering-technology.php",
        "Mechatronics":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/engineering-technology.php",
        "Welding Technology":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/welding.php",
        "Metal Fabrication":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/welding.php",
        "Pipe Welding":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/welding.php",
        "Viticulture":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/viticulture-enology.php",
        "Enology":
            "https://www.hancockcollege.edu/pathways/sciences-technologies/viticulture-enology.php",

        "Early Childhood Education":
            "https://www.hancockcollege.edu/pathways/people-cultures-languages/early-childhood-studies.php",
        "Early Childhood Studies":
            "https://www.hancockcollege.edu/pathways/people-cultures-languages/early-childhood-studies.php",
        "Elementary Education":
            "https://www.hancockcollege.edu/pathways/people-cultures-languages/elementary-teacher-education.php",
        "Elementary Teacher Education":
            "https://www.hancockcollege.edu/pathways/people-cultures-languages/elementary-teacher-education.php",

        "Career Preparation":
            "https://www.hancockcollege.edu/communityed/certificates.php",
        "Beginning Computer Skills":
            "https://www.hancockcollege.edu/communityed/certificates.php",
        "Microsoft Office Basics":
            "https://www.hancockcollege.edu/communityed/certificates.php",
        "Advanced ESL":
            "https://www.hancockcollege.edu/communityed/esl.php",
        "Basic ESL":
            "https://www.hancockcollege.edu/communityed/esl.php",
        "High School Equivalency Preparation":
            "https://www.hancockcollege.edu/communityed/ged.php",
        "Career Development Certificates":
            "https://www.hancockcollege.edu/communityed/certificates.php"
    };

    function programUrl(category, program) {
        return PROGRAM_URLS[program] ||
            CATEGORY_URLS[category] ||
            "https://www.hancockcollege.edu/pathways/index.php";
    }

    let root = null;
    let query = "";

    function esc(value) {
        return String(value ?? "")
            .replaceAll("&","&amp;").replaceAll("<","&lt;")
            .replaceAll(">","&gt;").replaceAll('"',"&quot;");
    }

    function render() {
        if (!root) return;
        const needle = query.trim().toLowerCase();

        root.innerHTML = `
            <div class="college-explorer-toolbar">
                <label class="search-field">
                    <span aria-hidden="true">⌕</span>
                    <input id="collegeProgramSearch" type="search"
                        value="${esc(query)}"
                        placeholder="Search Allan Hancock programs">
                </label>
                <a class="button button-secondary" target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.hancockcollege.edu/pathways/index.php">
                    Browse All Hancock Programs
                </a>
            </div>

            <div class="college-source-note">
                <strong>Allan Hancock College Program Explorer</strong>
                <p>
                    Browse program areas, then verify current degrees, certificates,
                    locations, and requirements through Allan Hancock College.
                    Some programs may be available at Santa Maria, Lompoc Valley Center,
                    online, or a specialized training location.
                </p>
            </div>

            <div class="college-program-groups">
                ${Object.entries(PROGRAMS).map(([category,items]) => {
                    const visible = items.filter((item) =>
                        !needle ||
                        category.toLowerCase().includes(needle) ||
                        item.toLowerCase().includes(needle)
                    );
                    if (!visible.length) return "";
                    return `
                        <section class="college-program-group">
                            <div class="panel-header">
                                <h3>${esc(category)}</h3>
                                <span class="support-count">${visible.length}</span>
                            </div>
                            <div class="college-program-grid">
                                ${visible.map((program)=>`
                                    <article class="college-program-card">
                                        <strong>${esc(program)}</strong>
                                        <div>
                                            <a target="_blank" rel="noopener noreferrer"
                                                href="${esc(programUrl(category, program))}">
                                                Open program page
                                            </a>
                                        </div>
                                    </article>
                                `).join("")}
                            </div>
                        </section>
                    `;
                }).join("")}
            </div>
        `;
    }

    function initialize() {
        root = document.getElementById("communityCollegeContent");
        document.addEventListener("input", (event) => {
            if (event.target.id !== "collegeProgramSearch") return;
            query = event.target.value;
            render();
            const input = document.getElementById("collegeProgramSearch");
            input?.focus();
            input?.setSelectionRange(query.length,query.length);
        });
        render();
    }

    return Object.freeze({ initialize, render });
})();
