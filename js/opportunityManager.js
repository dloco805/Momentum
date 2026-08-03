/*
==========================================================
Momentum
Opportunity Manager Module
Build v19.0.0
File: js/opportunityManager.js
==========================================================
*/

"use strict";

const OpportunityManager = (() => {
    const STORAGE_KEY = "momentum.opportunities";
    const DATA_CHANGED_EVENT = "opportunityDataChanged";
    let opportunities = [];

    const LOCAL_STARTER_LIBRARY = [
        {
                "id": "LOCAL-LOMPOC-LVMC",
                "title": "Explore healthcare careers at Lompoc Valley Medical Center",
                "organization": "Lompoc Valley Medical Center",
                "type": "Local Organization Research",
                "location": "Lompoc, CA",
                "format": "Research / outreach",
                "url": "https://www.lompocvmc.com/",
                "description": "Research lead only—not a confirmed student placement. Explore careers, departments, job requirements, volunteer possibilities, and questions a student could ask during outreach.",
                "eligibility": "Student researches the organization and educator verifies any current opportunity directly.",
                "tags": [
                        "Lompoc",
                        "healthcare",
                        "local employer",
                        "research lead"
                ],
                "interestAreas": [
                        "healthcare",
                        "nursing",
                        "medicine",
                        "helping people"
                ],
                "skills": [
                        "communication",
                        "patient service",
                        "organization"
                ]
        },
        {
                "id": "LOCAL-LOMPOC-DENMAT",
                "title": "Explore dental manufacturing and business careers at DenMat",
                "organization": "DenMat Holdings",
                "type": "Local Organization Research",
                "location": "Lompoc, CA",
                "format": "Research / outreach",
                "url": "https://www.denmat.com/",
                "description": "Research lead only. Explore dental products, manufacturing, laboratory work, marketing, customer service, shipping, design, and business operations.",
                "eligibility": "Verify any visit, job shadow, or internship directly with the organization.",
                "tags": [
                        "Lompoc",
                        "manufacturing",
                        "dental",
                        "business",
                        "research lead"
                ],
                "interestAreas": [
                        "healthcare",
                        "manufacturing",
                        "science",
                        "business",
                        "design"
                ],
                "skills": [
                        "quality control",
                        "technology",
                        "customer service",
                        "production"
                ]
        },
        {
                "id": "LOCAL-LOMPOC-CITY",
                "title": "Explore City of Lompoc public-service careers",
                "organization": "City of Lompoc",
                "type": "Local Organization Research",
                "location": "Lompoc, CA",
                "format": "Research / outreach",
                "url": "https://www.cityoflompoc.com/",
                "description": "Research lead only. Explore city careers in utilities, parks and recreation, library services, planning, public works, transit, fire, police support, administration, and community development.",
                "eligibility": "Student researches departments; educator verifies any visit or experience with the City.",
                "tags": [
                        "Lompoc",
                        "public service",
                        "city government",
                        "utilities"
                ],
                "interestAreas": [
                        "public service",
                        "environment",
                        "construction",
                        "community",
                        "government"
                ],
                "skills": [
                        "teamwork",
                        "public communication",
                        "technical skills",
                        "organization"
                ]
        },
        {
                "id": "LOCAL-LOMPOC-LUSD",
                "title": "Explore education and school-support careers",
                "organization": "Lompoc Unified School District",
                "type": "Local Organization Research",
                "location": "Lompoc, CA",
                "format": "Research / outreach",
                "url": "https://www.lusd.org/",
                "description": "Research lead only. Explore teaching, instructional support, counseling, nutrition, maintenance, transportation, technology, athletics, office, and communications careers.",
                "eligibility": "Any student experience must be approved and arranged through appropriate school staff.",
                "tags": [
                        "Lompoc",
                        "education",
                        "schools",
                        "research lead"
                ],
                "interestAreas": [
                        "teaching",
                        "helping people",
                        "technology",
                        "sports",
                        "food"
                ],
                "skills": [
                        "communication",
                        "organization",
                        "mentoring",
                        "teamwork"
                ]
        },
        {
                "id": "LOCAL-LOMPOC-CHAMBER",
                "title": "Research local businesses through the Lompoc Valley Chamber directory",
                "organization": "Lompoc Valley Chamber of Commerce",
                "type": "Local Business Research",
                "location": "Lompoc, CA",
                "format": "Student research",
                "url": "https://lompoc.com/",
                "description": "Use the Chamber member directory to identify local businesses connected to a student's interests. Research what they do, jobs they may employ, required skills, and a respectful outreach question.",
                "eligibility": "Directory listing does not mean a business offers internships. Verify directly.",
                "tags": [
                        "Lompoc",
                        "business directory",
                        "career exploration"
                ],
                "interestAreas": [
                        "business",
                        "entrepreneurship",
                        "local careers"
                ],
                "skills": [
                        "research",
                        "professional communication",
                        "networking"
                ]
        },
        {
                "id": "LOCAL-LOMPOC-TOURISM",
                "title": "Explore tourism, hospitality, recreation, and local media",
                "organization": "Explore Lompoc / local tourism businesses",
                "type": "Local Industry Research",
                "location": "Lompoc Valley, CA",
                "format": "Student research",
                "url": "https://explorelompoc.com/",
                "description": "Research hotels, restaurants, outdoor recreation, visitor services, events, photography, social media, wineries, museums, and tourism marketing in the Lompoc Valley.",
                "eligibility": "Research lead only; verify age requirements and any opportunity directly.",
                "tags": [
                        "Lompoc",
                        "tourism",
                        "hospitality",
                        "media",
                        "outdoors"
                ],
                "interestAreas": [
                        "travel",
                        "food",
                        "photography",
                        "marketing",
                        "outdoors"
                ],
                "skills": [
                        "customer service",
                        "content creation",
                        "event planning",
                        "communication"
                ]
        },
        {
                "id": "LOCAL-LOMPOC-WINE",
                "title": "Explore vineyard, agriculture, hospitality, and production careers",
                "organization": "Lompoc Valley wineries and vineyards",
                "type": "Local Industry Research",
                "location": "Lompoc Valley, CA",
                "format": "Student research",
                "url": "https://explorelompoc.com/",
                "description": "Research careers beyond alcohol service: farming, irrigation, equipment, chemistry, bottling, graphic design, shipping, hospitality, accounting, marketing, and event work.",
                "eligibility": "Research only unless educator verifies an age-appropriate experience directly.",
                "tags": [
                        "Lompoc",
                        "agriculture",
                        "production",
                        "hospitality"
                ],
                "interestAreas": [
                        "agriculture",
                        "science",
                        "business",
                        "design",
                        "equipment"
                ],
                "skills": [
                        "production",
                        "safety",
                        "marketing",
                        "operations"
                ]
        },
        {
                "id": "LOCAL-LOMPOC-SPACE",
                "title": "Explore space, engineering, logistics, and public-service careers near Vandenberg",
                "organization": "Vandenberg Space Force Base and regional contractors",
                "type": "Regional Career Research",
                "location": "Near Lompoc, CA",
                "format": "Student research",
                "url": "https://www.vandenberg.spaceforce.mil/",
                "description": "Research military and civilian career areas such as aerospace, engineering, cybersecurity, communications, construction, logistics, emergency services, environmental work, and administration.",
                "eligibility": "Research lead only. Access and youth opportunities require direct verification.",
                "tags": [
                        "Lompoc region",
                        "space",
                        "engineering",
                        "cybersecurity",
                        "logistics"
                ],
                "interestAreas": [
                        "space",
                        "technology",
                        "engineering",
                        "public service"
                ],
                "skills": [
                        "technical problem solving",
                        "security awareness",
                        "teamwork"
                ]
        },
        {
                "id": "LOCAL-LOMPOC-MINING",
                "title": "Explore mining, industrial maintenance, and environmental careers",
                "organization": "Lompoc-area mineral and industrial employers",
                "type": "Local Industry Research",
                "location": "Lompoc, CA",
                "format": "Student research",
                "url": "https://www.cityoflompoc.com/community/history-of-lompoc",
                "description": "Research local industries connected to minerals, equipment operation, industrial maintenance, environmental compliance, laboratory work, logistics, and workplace safety.",
                "eligibility": "Research lead only; any site visit must be verified and arranged directly.",
                "tags": [
                        "Lompoc",
                        "industry",
                        "mining",
                        "maintenance",
                        "environment"
                ],
                "interestAreas": [
                        "equipment",
                        "mechanics",
                        "science",
                        "environment"
                ],
                "skills": [
                        "safety",
                        "maintenance",
                        "technical systems",
                        "quality control"
                ]
        },
        {
                "id": "AHC-AUTOBODY",
                "title": "Explore Auto Body Technology",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / regional",
                "format": "Program research",
                "url": "https://www.hancockcollege.edu/pathways/sciences-technologies/autobody.php",
                "description": "Research collision repair, structural repair, refinishing, painting, shop safety, and related career pathways. Official program information should be verified with Allan Hancock College.",
                "eligibility": "Check current admissions, course, and certificate requirements with the college.",
                "tags": [
                        "Allan Hancock College",
                        "auto body",
                        "trade",
                        "certificate"
                ],
                "interestAreas": [
                        "cars",
                        "painting",
                        "repair",
                        "hands-on learning"
                ],
                "skills": [
                        "collision repair",
                        "refinishing",
                        "shop safety"
                ]
        },
        {
                "id": "AHC-CNET",
                "title": "Explore Computer Networking & Electronics Technology",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / regional",
                "format": "Program research",
                "url": "https://www.hancockcollege.edu/pathways/sciences-technologies/electronics.php",
                "description": "Explore electronics, computer networking, technical troubleshooting, labs, certificates, degrees, and industry credentials.",
                "eligibility": "Verify current offerings and requirements with Allan Hancock College.",
                "tags": [
                        "Allan Hancock College",
                        "electronics",
                        "networking",
                        "technology"
                ],
                "interestAreas": [
                        "computers",
                        "electronics",
                        "technology",
                        "repair"
                ],
                "skills": [
                        "troubleshooting",
                        "networking",
                        "electronics"
                ]
        },
        {
                "id": "AHC-ENGINEERING",
                "title": "Explore Engineering",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / regional",
                "format": "Program research",
                "url": "https://www.hancockcollege.edu/pathways/sciences-technologies/engineering.php",
                "description": "Explore engineering pathways including robotics, CAD, civil infrastructure, automation, surveying, transfer preparation, and problem solving.",
                "eligibility": "Verify current degrees, courses, and transfer requirements with the college.",
                "tags": [
                        "Allan Hancock College",
                        "engineering",
                        "robotics",
                        "CAD"
                ],
                "interestAreas": [
                        "engineering",
                        "building",
                        "math",
                        "space",
                        "design"
                ],
                "skills": [
                        "CAD",
                        "robotics",
                        "surveying",
                        "problem solving"
                ]
        },
        {
                "id": "AHC-ENGTECH",
                "title": "Explore Engineering Technology",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / regional",
                "format": "Program research",
                "url": "https://www.hancockcollege.edu/pathways/sciences-technologies/engineering-technology.php",
                "description": "Explore electronics, mechatronics, robotics, software, automation, and hands-on technology careers.",
                "eligibility": "Verify current certificates and course schedules with the college.",
                "tags": [
                        "Allan Hancock College",
                        "mechatronics",
                        "robotics",
                        "technology"
                ],
                "interestAreas": [
                        "robotics",
                        "electronics",
                        "building",
                        "coding"
                ],
                "skills": [
                        "mechatronics",
                        "automation",
                        "technical problem solving"
                ]
        },
        {
                "id": "AHC-ARCH",
                "title": "Explore Architectural Technology",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / regional",
                "format": "Program research",
                "url": "https://www.hancockcollege.edu/pathways/sciences-technologies/architecture.php",
                "description": "Explore architectural graphics, drafting, computer-aided design, construction methods, and building-code knowledge.",
                "eligibility": "Verify current degrees, certificates, and courses with the college.",
                "tags": [
                        "Allan Hancock College",
                        "architecture",
                        "drafting",
                        "CAD"
                ],
                "interestAreas": [
                        "design",
                        "drawing",
                        "construction",
                        "buildings"
                ],
                "skills": [
                        "drafting",
                        "CAD",
                        "architectural drawing"
                ]
        },
        {
                "id": "AHC-BUSINESS",
                "title": "Explore Business and Finance programs",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / Lompoc Valley Center / online possibilities",
                "format": "Program-area research",
                "url": "https://www.hancockcollege.edu/pathways/index.php",
                "description": "Use the official pathway page to research business, accounting, office technology, management, entrepreneurship, and finance-related study options.",
                "eligibility": "Verify the exact program, campus, format, and current schedule with the college.",
                "tags": [
                        "Allan Hancock College",
                        "business",
                        "finance",
                        "entrepreneurship"
                ],
                "interestAreas": [
                        "business",
                        "money",
                        "management",
                        "office technology"
                ],
                "skills": [
                        "accounting",
                        "organization",
                        "business technology"
                ]
        },
        {
                "id": "AHC-CREATIVE",
                "title": "Explore Creative Arts programs",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / regional",
                "format": "Program-area research",
                "url": "https://www.hancockcollege.edu/pathways/index.php",
                "description": "Research official programs connected to music, visual art, dance, theatre, media, design, production, and creative technology.",
                "eligibility": "Verify current programs and course availability with the college.",
                "tags": [
                        "Allan Hancock College",
                        "creative arts",
                        "media",
                        "music"
                ],
                "interestAreas": [
                        "art",
                        "music",
                        "theatre",
                        "design",
                        "media"
                ],
                "skills": [
                        "creative production",
                        "performance",
                        "design"
                ]
        },
        {
                "id": "AHC-HEALTH",
                "title": "Explore Health Sciences programs",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / regional",
                "format": "Program-area research",
                "url": "https://www.hancockcollege.edu/pathways/index.php",
                "description": "Research health-science pathways for students interested in helping people, medical technology, wellness, rehabilitation, or animal health.",
                "eligibility": "Verify prerequisites, selective admissions, and current offerings with the college.",
                "tags": [
                        "Allan Hancock College",
                        "health sciences",
                        "medical"
                ],
                "interestAreas": [
                        "healthcare",
                        "science",
                        "helping people",
                        "animals"
                ],
                "skills": [
                        "patient care",
                        "science",
                        "communication"
                ]
        },
        {
                "id": "AHC-HOSPITALITY",
                "title": "Explore Hospitality, Recreation, and Fashion programs",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / regional",
                "format": "Program-area research",
                "url": "https://www.hancockcollege.edu/pathways/index.php",
                "description": "Research pathways connected to cooking, hospitality, recreation, fitness, fashion, and creating experiences for others.",
                "eligibility": "Verify current programs, certificates, and schedules with the college.",
                "tags": [
                        "Allan Hancock College",
                        "hospitality",
                        "recreation",
                        "fashion"
                ],
                "interestAreas": [
                        "cooking",
                        "fitness",
                        "fashion",
                        "events",
                        "hospitality"
                ],
                "skills": [
                        "customer service",
                        "food preparation",
                        "event support"
                ]
        },
        {
                "id": "AHC-PUBLIC",
                "title": "Explore Public Service programs",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / regional",
                "format": "Program-area research",
                "url": "https://www.hancockcollege.edu/pathways/index.php",
                "description": "Research programs for students interested in protecting people, serving communities, emergency response, justice, or environmental public service.",
                "eligibility": "Verify current program and physical or admissions requirements with the college.",
                "tags": [
                        "Allan Hancock College",
                        "public service",
                        "community"
                ],
                "interestAreas": [
                        "public service",
                        "law",
                        "fire",
                        "community",
                        "environment"
                ],
                "skills": [
                        "leadership",
                        "fitness",
                        "communication",
                        "service"
                ]
        },
        {
                "id": "AHC-COMMED",
                "title": "Explore free noncredit and career-development certificates",
                "organization": "Allan Hancock College Community Education",
                "type": "College / Training Program",
                "location": "Regional / online possibilities",
                "format": "Noncredit program research",
                "url": "https://www.hancockcollege.edu/communityed/certificates.php",
                "description": "Research noncredit career-development certificates and other Community Education options that may support employment or preparation for college-level study.",
                "eligibility": "Verify current certificate availability and enrollment steps with Community Education.",
                "tags": [
                        "Allan Hancock College",
                        "noncredit",
                        "certificate",
                        "career training"
                ],
                "interestAreas": [
                        "career training",
                        "college preparation",
                        "job skills"
                ],
                "skills": [
                        "career readiness",
                        "foundational skills"
                ]
        },

        {
                "id": "LOCAL-DIR-CONSTRUCTION",
                "title": "Research Lompoc construction, plumbing, electrical, and skilled-trade businesses",
                "organization": "Lompoc Valley Chamber Member Directory",
                "type": "Local Business Research",
                "location": "Lompoc, CA",
                "format": "Directory research",
                "url": "https://lompoc.com/",
                "description": "Use the official Chamber member directory to identify local contractors and skilled-trade businesses. Research services, entry-level roles, tools, training, and professional outreach questions.",
                "eligibility": "Directory research only. Verify any visit or student experience directly.",
                "tags": [
                        "Lompoc",
                        "Chamber directory",
                        "construction",
                        "trades"
                ],
                "interestAreas": [
                        "construction",
                        "plumbing",
                        "electrical",
                        "hands-on work"
                ],
                "skills": [
                        "research",
                        "professional communication",
                        "trade awareness"
                ]
        },
        {
                "id": "LOCAL-DIR-AUTO",
                "title": "Research Lompoc automotive, repair, parts, and transportation businesses",
                "organization": "Lompoc Valley Chamber Member Directory",
                "type": "Local Business Research",
                "location": "Lompoc, CA",
                "format": "Directory research",
                "url": "https://lompoc.com/",
                "description": "Find local automotive and transportation businesses and investigate technicians, service advisors, parts, detailing, logistics, and business operations.",
                "eligibility": "Directory research only; verify current businesses and opportunities directly.",
                "tags": [
                        "Lompoc",
                        "automotive",
                        "transportation",
                        "Chamber directory"
                ],
                "interestAreas": [
                        "cars",
                        "mechanics",
                        "transportation"
                ],
                "skills": [
                        "customer service",
                        "mechanical awareness",
                        "research"
                ]
        },
        {
                "id": "LOCAL-DIR-FOOD",
                "title": "Research Lompoc restaurants, bakeries, food service, and hospitality businesses",
                "organization": "Lompoc Valley Chamber Member Directory",
                "type": "Local Business Research",
                "location": "Lompoc, CA",
                "format": "Directory research",
                "url": "https://lompoc.com/",
                "description": "Explore local food and hospitality businesses, including culinary, baking, service, management, events, purchasing, and marketing roles.",
                "eligibility": "Verify age requirements and any student opportunity directly.",
                "tags": [
                        "Lompoc",
                        "food",
                        "hospitality",
                        "Chamber directory"
                ],
                "interestAreas": [
                        "cooking",
                        "baking",
                        "hospitality",
                        "business"
                ],
                "skills": [
                        "food service",
                        "customer service",
                        "teamwork"
                ]
        },
        {
                "id": "LOCAL-DIR-ARTS",
                "title": "Research Lompoc arts, photography, printing, media, and creative businesses",
                "organization": "Lompoc Valley Chamber Member Directory",
                "type": "Local Business Research",
                "location": "Lompoc, CA",
                "format": "Directory research",
                "url": "https://lompoc.com/",
                "description": "Identify local creative businesses and organizations connected to photography, murals, printing, design, video, events, advertising, and social media.",
                "eligibility": "Directory research only; confirm current details directly.",
                "tags": [
                        "Lompoc",
                        "arts",
                        "media",
                        "design",
                        "Chamber directory"
                ],
                "interestAreas": [
                        "art",
                        "photography",
                        "video",
                        "graphic design"
                ],
                "skills": [
                        "creative production",
                        "marketing",
                        "communication"
                ]
        },
        {
                "id": "LOCAL-DIR-ANIMALS",
                "title": "Research Lompoc animal care, veterinary, grooming, and pet-service organizations",
                "organization": "Lompoc Valley Chamber Member Directory",
                "type": "Local Business Research",
                "location": "Lompoc, CA",
                "format": "Directory research",
                "url": "https://lompoc.com/",
                "description": "Research animal-related businesses and organizations, their careers, education requirements, daily tasks, and possible volunteer questions.",
                "eligibility": "Research lead only; verify current organizations and age requirements.",
                "tags": [
                        "Lompoc",
                        "animals",
                        "veterinary",
                        "Chamber directory"
                ],
                "interestAreas": [
                        "animals",
                        "science",
                        "helping"
                ],
                "skills": [
                        "animal care awareness",
                        "communication",
                        "research"
                ]
        },
        {
                "id": "LOCAL-DIR-FINANCE",
                "title": "Research Lompoc banking, accounting, insurance, and real-estate businesses",
                "organization": "Lompoc Valley Chamber Member Directory",
                "type": "Local Business Research",
                "location": "Lompoc, CA",
                "format": "Directory research",
                "url": "https://lompoc.com/",
                "description": "Explore careers in banking, bookkeeping, taxes, insurance, real estate, property management, customer service, and office operations.",
                "eligibility": "Directory research only; verify opportunities directly.",
                "tags": [
                        "Lompoc",
                        "finance",
                        "real estate",
                        "Chamber directory"
                ],
                "interestAreas": [
                        "money",
                        "business",
                        "real estate",
                        "office work"
                ],
                "skills": [
                        "organization",
                        "communication",
                        "financial literacy"
                ]
        },
        {
                "id": "LOCAL-DIR-NONPROFIT",
                "title": "Research Lompoc nonprofits and community-service organizations",
                "organization": "Lompoc Valley Chamber Member Directory",
                "type": "Local Business Research",
                "location": "Lompoc, CA",
                "format": "Directory research",
                "url": "https://lompoc.com/",
                "description": "Find organizations serving youth, families, seniors, health, housing, food access, arts, and community development. Research volunteer and career possibilities.",
                "eligibility": "Verify current volunteer requirements directly.",
                "tags": [
                        "Lompoc",
                        "nonprofit",
                        "community service",
                        "Chamber directory"
                ],
                "interestAreas": [
                        "helping people",
                        "community",
                        "social services"
                ],
                "skills": [
                        "service",
                        "communication",
                        "organization"
                ]
        },
        {
                "id": "LOCAL-DIR-RETAIL",
                "title": "Research Lompoc retail, fashion, gifts, and customer-service businesses",
                "organization": "Lompoc Valley Chamber Member Directory",
                "type": "Local Business Research",
                "location": "Lompoc, CA",
                "format": "Directory research",
                "url": "https://lompoc.com/",
                "description": "Explore local retail businesses and careers in sales, merchandising, purchasing, inventory, displays, e-commerce, and management.",
                "eligibility": "Research lead only; verify hiring ages and student opportunities directly.",
                "tags": [
                        "Lompoc",
                        "retail",
                        "fashion",
                        "Chamber directory"
                ],
                "interestAreas": [
                        "fashion",
                        "sales",
                        "business",
                        "design"
                ],
                "skills": [
                        "customer service",
                        "merchandising",
                        "inventory"
                ]
        },
        {
                "id": "LOCAL-DIR-TECH",
                "title": "Research Lompoc technology, communications, and professional-service businesses",
                "organization": "Lompoc Valley Chamber Member Directory",
                "type": "Local Business Research",
                "location": "Lompoc, CA",
                "format": "Directory research",
                "url": "https://lompoc.com/",
                "description": "Identify businesses connected to IT, communications, web services, office technology, engineering support, consulting, and technical customer service.",
                "eligibility": "Directory research only; verify current listings and opportunities directly.",
                "tags": [
                        "Lompoc",
                        "technology",
                        "professional services",
                        "Chamber directory"
                ],
                "interestAreas": [
                        "computers",
                        "technology",
                        "business"
                ],
                "skills": [
                        "IT awareness",
                        "problem solving",
                        "communication"
                ]
        }

];

    function now() {
        return new Date().toISOString();
    }

    function createId() {
        return `OPP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
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
                value.split(/[\n,;]+/).map(cleanString).filter(Boolean)
            )];
        }

        return [];
    }

    function clone(value) {
        return typeof structuredClone === "function"
            ? structuredClone(value)
            : JSON.parse(JSON.stringify(value));
    }

    function normalize(input = {}) {
        const meta = input.meta && typeof input.meta === "object" ? input.meta : {};
        const createdAt = cleanString(meta.createdAt || input.createdAt) || now();

        return {
            id: cleanString(input.id) || createId(),
            title: cleanString(input.title),
            organization: cleanString(input.organization),
            type: cleanString(input.type) || "Other",
            location: cleanString(input.location),
            format: cleanString(input.format) || "In person",
            deadline: cleanString(input.deadline),
            url: cleanString(input.url),
            description: cleanString(input.description),
            eligibility: cleanString(input.eligibility),
            tags: cleanArray(input.tags),
            interestAreas: cleanArray(input.interestAreas),
            gradeLevels: cleanArray(input.gradeLevels),
            skills: cleanArray(input.skills),
            meta: {
                archived: Boolean(meta.archived || input.archived),
                createdAt,
                updatedAt: cleanString(meta.updatedAt || input.updatedAt) || createdAt
            }
        };
    }

    function emitChange(detail = {}) {
        document.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, {
            detail: {
                timestamp: now(),
                ...detail
            }
        }));
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            app: "Momentum",
            version: 1,
            savedAt: now(),
            opportunities
        }));
    }

    function initialize() {
        let loaded = [];

        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            if (Array.isArray(parsed)) {
                loaded = parsed;
            } else if (parsed && Array.isArray(parsed.opportunities)) {
                loaded = parsed.opportunities;
            }
        } catch (error) {
            console.warn("Momentum could not load opportunities.", error);
        }

        opportunities = loaded.map(normalize);
        document.addEventListener(DATA_CHANGED_EVENT, save);
        emitChange({ action: "initialize", count: opportunities.length });
        return getOpportunities();
    }

    function getOpportunities(options = {}) {
        const includeArchived = options.includeArchived !== false;
        const result = includeArchived
            ? opportunities
            : opportunities.filter((item) => !item.meta.archived);

        return clone([...result].sort((a, b) => {
            const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
            const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
            return aDeadline - bDeadline;
        }));
    }

    function getOpportunity(id) {
        const item = opportunities.find((opportunity) => opportunity.id === id);
        return item ? clone(item) : null;
    }

    function createOpportunity(data = {}) {
        const opportunity = normalize({
            ...data,
            meta: {
                createdAt: now(),
                updatedAt: now(),
                archived: false
            }
        });

        opportunities.push(opportunity);
        emitChange({ action: "create", opportunityId: opportunity.id });
        return clone(opportunity);
    }

    function updateOpportunity(id, patch = {}) {
        const index = opportunities.findIndex((item) => item.id === id);
        if (index === -1) {
            return null;
        }

        const current = opportunities[index];
        opportunities[index] = normalize({
            ...current,
            ...patch,
            id: current.id,
            meta: {
                ...current.meta,
                ...(patch.meta || {}),
                updatedAt: now()
            }
        });

        emitChange({ action: "update", opportunityId: id });
        return clone(opportunities[index]);
    }

    function deleteOpportunity(id) {
        const index = opportunities.findIndex((item) => item.id === id);
        if (index === -1) {
            return false;
        }

        opportunities.splice(index, 1);
        emitChange({ action: "delete", opportunityId: id });
        return true;
    }

    function archiveOpportunity(id) {
        return updateOpportunity(id, { meta: { archived: true } });
    }

    function restoreOpportunity(id) {
        return updateOpportunity(id, { meta: { archived: false } });
    }

    function loadLocalStarterLibrary() {
        const existingIds = new Set(opportunities.map((item) => item.id));
        const additions = LOCAL_STARTER_LIBRARY
            .filter((item) => !existingIds.has(item.id))
            .map((item) => normalize({
                ...item,
                meta: {
                    createdAt: now(),
                    updatedAt: now(),
                    archived: false
                }
            }));

        opportunities.push(...additions);
        emitChange({
            action: "loadLocalStarterLibrary",
            count: additions.length
        });
        return additions.length;
    }

    function replaceAll(list = []) {
        if (!Array.isArray(list)) {
            throw new TypeError("OpportunityManager.replaceAll expects an array.");
        }

        opportunities = list.map(normalize);
        emitChange({ action: "replaceAll", count: opportunities.length });
        return getOpportunities();
    }

    function search(query = "", options = {}) {
        const normalized = cleanString(query).toLowerCase();
        const type = cleanString(options.type);
        const status = cleanString(options.status || "active");

        return getOpportunities()
            .filter((item) => {
                if (status === "active" && item.meta.archived) {
                    return false;
                }
                if (status === "archived" && !item.meta.archived) {
                    return false;
                }
                if (type && item.type !== type) {
                    return false;
                }
                if (!normalized) {
                    return true;
                }

                return [
                    item.title,
                    item.organization,
                    item.type,
                    item.location,
                    item.format,
                    item.description,
                    item.eligibility,
                    ...item.tags,
                    ...item.interestAreas,
                    ...item.gradeLevels,
                    ...item.skills
                ].join(" ").toLowerCase().includes(normalized);
            });
    }

    function normalizeTerms(values) {
        return [...new Set(
            values
                .flat(Infinity)
                .map((item) => String(item || "").trim().toLowerCase())
                .filter((item) => item.length >= 2)
        )];
    }

    function termMatches(left, right) {
        return left === right ||
            left.includes(right) ||
            right.includes(left) ||
            left.split(/\s+/).some((word) => right.includes(word)) ||
            right.split(/\s+/).some((word) => left.includes(word));
    }

    function findMatches(studentTerms, opportunityTerms) {
        const matches = [];

        opportunityTerms.forEach((opportunityTerm) => {
            if (studentTerms.some((studentTerm) =>
                termMatches(studentTerm, opportunityTerm)
            )) {
                matches.push(opportunityTerm);
            }
        });

        return [...new Set(matches)];
    }

    function scoreStudentMatch(student, opportunity) {
        const reasons = [];
        const breakdown = [];
        let score = 0;

        const interests = normalizeTerms([
            student.profile.interests,
            student.journey.dreamJobs
        ]);
        const projectTerms = normalizeTerms(
            student.journey.currentProjects.flatMap((item) => [
                item.title,
                item.description,
                item.projectQuestion,
                item.skills
            ])
        );
        const internshipTerms = normalizeTerms(
            student.journey.internships.flatMap((item) => [
                item.title,
                item.organization,
                item.description,
                item.responsibilities,
                item.skills
            ])
        );
        const goalTerms = normalizeTerms(
            student.journey.goals.flatMap((item) => [
                item.title,
                item.description,
                item.successCriteria,
                item.nextSteps
            ])
        );
        const opportunityTerms = normalizeTerms([
            opportunity.title,
            opportunity.organization,
            opportunity.type,
            opportunity.description,
            opportunity.tags,
            opportunity.interestAreas,
            opportunity.skills
        ]);

        const interestMatches = findMatches(interests, opportunityTerms);
        if (interestMatches.length) {
            const points = Math.min(35, interestMatches.length * 12);
            score += points;
            breakdown.push({ category: "Interests & dream jobs", points });
            reasons.push(`Interest match: ${interestMatches.slice(0, 3).join(", ")}`);
        }

        const projectMatches = findMatches(projectTerms, opportunityTerms);
        if (projectMatches.length) {
            const points = Math.min(20, projectMatches.length * 8);
            score += points;
            breakdown.push({ category: "Project connection", points });
            reasons.push(`Project connection: ${projectMatches.slice(0, 2).join(", ")}`);
        }

        const internshipMatches = findMatches(internshipTerms, opportunityTerms);
        if (internshipMatches.length) {
            const points = Math.min(15, internshipMatches.length * 6);
            score += points;
            breakdown.push({ category: "Experience connection", points });
            reasons.push(`Experience connection: ${internshipMatches.slice(0, 2).join(", ")}`);
        }

        const goalMatches = findMatches(goalTerms, opportunityTerms);
        if (goalMatches.length) {
            const points = Math.min(15, goalMatches.length * 6);
            score += points;
            breakdown.push({ category: "Goal alignment", points });
            reasons.push(`Goal alignment: ${goalMatches.slice(0, 2).join(", ")}`);
        }

        const grade = String(student.profile.grade || "").trim().toLowerCase();
        const gradeMatches = opportunity.gradeLevels.some((level) =>
            String(level).trim().toLowerCase() === grade
        );

        if (!opportunity.gradeLevels.length) {
            score += 5;
            breakdown.push({ category: "Open grade eligibility", points: 5 });
        } else if (gradeMatches) {
            score += 10;
            breakdown.push({ category: "Grade eligible", points: 10 });
            reasons.push("Grade eligible");
        } else {
            score -= 15;
            breakdown.push({ category: "Grade mismatch", points: -15 });
        }

        const existingAssignment = student.journey.opportunityEngagements.some(
            (item) => item.opportunityId === opportunity.id
        );

        if (existingAssignment) {
            score -= 40;
            breakdown.push({ category: "Already assigned", points: -40 });
        }

        if (opportunity.deadline) {
            const deadline = DateUtils.parseLocalDate(opportunity.deadline);
            if (deadline && deadline < DateUtils.startOfToday()) {
                score = 0;
                reasons.push("Deadline passed");
            } else if (deadline) {
                const daysUntil = Math.ceil(
                    (deadline - DateUtils.startOfToday()) / 86400000
                );
                if (daysUntil <= 14) {
                    score += 5;
                    breakdown.push({ category: "Upcoming deadline", points: 5 });
                    reasons.push(`Deadline in ${daysUntil} days`);
                }
            }
        }

        const finalScore = Math.max(0, Math.min(100, score));

        return {
            score: finalScore,
            reasons: reasons.slice(0, 5),
            breakdown,
            alreadyAssigned: existingAssignment
        };
    }

    function getMatchesForStudent(studentId, limit = 5) {
        const student = StudentManager.getStudent(studentId);
        if (!student) {
            return [];
        }

        return getOpportunities({ includeArchived: false })
            .map((opportunity) => ({
                opportunity,
                ...scoreStudentMatch(student, opportunity)
            }))
            .filter((match) => match.score > 0 && !match.alreadyAssigned)
            .sort((a, b) =>
                b.score - a.score ||
                String(a.opportunity.deadline || "9999").localeCompare(
                    String(b.opportunity.deadline || "9999")
                )
            )
            .slice(0, limit);
    }

    return Object.freeze({
        STORAGE_KEY,
        DATA_CHANGED_EVENT,
        initialize,
        getOpportunities,
        getOpportunity,
        createOpportunity,
        updateOpportunity,
        deleteOpportunity,
        archiveOpportunity,
        restoreOpportunity,
        loadLocalStarterLibrary,
        replaceAll,
        search,
        getMatchesForStudent
    });
})();
