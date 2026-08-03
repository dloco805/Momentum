/*
Momentum Community College Explorer
Build v19.0.0
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
                    Open Official Program Page
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
                                                href="https://www.hancockcollege.edu/pathways/index.php">
                                                Research program
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
