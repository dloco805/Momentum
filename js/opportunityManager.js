/*
==========================================================
Momentum
Opportunity Manager Module
Build v23.2.1
File: js/opportunityManager.js
==========================================================
*/

"use strict";

const OpportunityManager = (() => {
    const STORAGE_KEY = "momentum.opportunities";
    const DATA_CHANGED_EVENT = "opportunityDataChanged";
    let opportunities = [];
    const STARTER_LIBRARY_VERSION = 3;
    const STARTER_VERSION_KEY = "momentum.opportunitiesStarterVersion";
    const OBSOLETE_STARTER_IDS = new Set([
        "LOCAL-DIR-CONSTRUCTION",
        "LOCAL-DIR-AUTO",
        "LOCAL-DIR-FOOD",
        "LOCAL-DIR-ARTS",
        "LOCAL-DIR-ANIMALS",
        "LOCAL-DIR-FINANCE",
        "LOCAL-DIR-NONPROFIT",
        "LOCAL-DIR-RETAIL",
        "LOCAL-DIR-TECH",
        "EXP-JOBSEARCH",
        "EXP-JOBSHADOW"
    ]);

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
                "title": "City of Lompoc public-service careers",
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
                "organization": "Lompoc / local tourism businesses",
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
                "title": "Auto Body Technology",
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
                "title": "Computer Networking & Electronics Technology",
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
                "title": "Engineering",
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
                "title": "Engineering Technology",
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
                "title": "Architectural Technology",
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
                "title": "Business and Finance programs",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / Lompoc Valley Center / online possibilities",
                "format": "Program-area research",
                "url": "https://www.hancockcollege.edu/pathways/business-finance/index.php",
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
                "title": "Creative Arts programs",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / regional",
                "format": "Program-area research",
                "url": "https://www.hancockcollege.edu/pathways/creative-arts/index.php",
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
                "title": "Health Sciences programs",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / regional",
                "format": "Program-area research",
                "url": "https://www.hancockcollege.edu/pathways/health-sciences/index.php",
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
                "title": "Hospitality, Recreation, and Fashion programs",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / regional",
                "format": "Program-area research",
                "url": "https://www.hancockcollege.edu/pathways/food-fashion-fitness/index.php",
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
                "title": "Public Service programs",
                "organization": "Allan Hancock College",
                "type": "College / Training Program",
                "location": "Santa Maria / regional",
                "format": "Program-area research",
                "url": "https://www.hancockcollege.edu/pathways/public-services/index.php",
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
        }
    ];


    const LOCAL_EXPERIENCE_LIBRARY = [
        {
                "id": "EXP-LVMC-TEEN",
                "title": "High School Teen Volunteer Program",
                "organization": "Lompoc Valley Medical Center",
                "type": "Volunteer",
                "location": "Lompoc",
                "format": "In person",
                "url": "https://www.lompocvmc.com/the-foundation/volunteer/teen-volunteer-program/",
                "description": "Students age 15 and older can build healthcare experience through service.",
                "eligibility": "Review current program requirements directly with LVMC.",
                "tags": [
                        "healthcare",
                        "service",
                        "teen"
                ],
                "interestAreas": [
                        "healthcare",
                        "helping people"
                ],
                "gradeLevels": [],
                "skills": [
                        "communication",
                        "responsibility",
                        "patient service"
                ]
        },
        {
                "id": "EXP-LVMC-VOL",
                "title": "Healthcare Volunteer Program",
                "organization": "Lompoc Valley Medical Center",
                "type": "Volunteer",
                "location": "Lompoc",
                "format": "In person",
                "url": "https://www.lompocvmc.com/the-foundation/volunteer/",
                "description": "Volunteer opportunities connected to healthcare facilities and foundation events.",
                "eligibility": "Confirm current openings and age requirements.",
                "tags": [
                        "healthcare",
                        "volunteer"
                ],
                "interestAreas": [
                        "medicine",
                        "community service"
                ],
                "gradeLevels": [],
                "skills": [
                        "service",
                        "communication"
                ]
        },
        {
                "id": "EXP-PARKS-VOL",
                "title": "Volunteer with Lompoc Parks",
                "organization": "Lompoc Parks & Recreation",
                "partnerId": "LOM-REC",
                "type": "Volunteer",
                "location": "Lompoc",
                "format": "In person",
                "url": "https://www.cityoflompoc.com/government/departments/community-development/parks",
                "description": "Community service connected to parks, recreation, and local events.",
                "eligibility": "Contact Parks & Recreation for current projects.",
                "tags": [
                        "parks",
                        "outdoors",
                        "community"
                ],
                "interestAreas": [
                        "environment",
                        "sports",
                        "service"
                ],
                "gradeLevels": [],
                "skills": [
                        "teamwork",
                        "outdoor work"
                ]
        },
        {
                "id": "EXP-VOLUNTEEN",
                "title": "Volunteen Leadership Program",
                "organization": "Lompoc Parks & Recreation",
                "partnerId": "LOM-REC",
                "type": "Leadership",
                "location": "Lompoc",
                "format": "Seasonal",
                "url": "https://www.cityoflompoc.com/government/departments/recreation",
                "description": "Youth work experience, community involvement, and leadership development.",
                "eligibility": "Check current seasonal registration and age requirements.",
                "tags": [
                        "youth",
                        "leadership",
                        "summer"
                ],
                "interestAreas": [
                        "leadership",
                        "community service"
                ],
                "gradeLevels": [],
                "skills": [
                        "leadership",
                        "teamwork",
                        "responsibility"
                ]
        },
        {
                "id": "EXP-LIBRARY",
                "title": "Teen Library Volunteer",
                "organization": "Lompoc Public Library",
                "type": "Volunteer",
                "location": "Lompoc",
                "format": "In person",
                "url": "https://www.cityoflompoc.com/government/departments/library",
                "description": "Support literacy, library events, and community learning.",
                "eligibility": "Ask the library about current teen volunteer openings.",
                "tags": [
                        "books",
                        "library",
                        "service"
                ],
                "interestAreas": [
                        "reading",
                        "education",
                        "community"
                ],
                "gradeLevels": [],
                "skills": [
                        "organization",
                        "communication"
                ]
        },
        {
                "id": "EXP-FUTURE",
                "title": "Career Readiness Academy",
                "organization": "FUTURE for Lompoc Youth",
                "type": "Career Program",
                "location": "Lompoc",
                "format": "In person",
                "url": "https://www.futureforlompocyouth.org/",
                "description": "Career-readiness and customer-service learning for local youth.",
                "eligibility": "Check current enrollment schedule.",
                "tags": [
                        "career readiness",
                        "youth"
                ],
                "interestAreas": [
                        "jobs",
                        "business",
                        "leadership"
                ],
                "gradeLevels": [],
                "skills": [
                        "customer service",
                        "communication"
                ]
        },
        {
                "id": "EXP-AHC-OPEN",
                "title": "Allan Hancock Program Visit",
                "organization": "Allan Hancock College — Lompoc Valley Center",
                "type": "College",
                "location": "Lompoc",
                "format": "Visit / L2L",
                "url": "https://www.hancockcollege.edu/about/campuses/lvc.php",
                "description": "Plan a campus visit or program-exploration day at the Lompoc Valley Center.",
                "eligibility": "Coordinate visit details with the college.",
                "tags": [
                        "college",
                        "L2L"
                ],
                "interestAreas": [
                        "college",
                        "career training"
                ],
                "gradeLevels": [],
                "skills": [
                        "planning",
                        "questions"
                ]
        },
        {
                "id": "EXP-AHC-CTE",
                "title": "Career Education Program Research",
                "organization": "Allan Hancock College",
                "type": "College",
                "location": "Lompoc / Santa Maria",
                "format": "Research / Visit",
                "url": "https://www.hancockcollege.edu/pathways/index.php",
                "description": "Compare specific certificate and degree pathways tied to student interests.",
                "eligibility": "Use official program pages for current details.",
                "tags": [
                        "college",
                        "CTE",
                        "certificates"
                ],
                "interestAreas": [
                        "trades",
                        "healthcare",
                        "business",
                        "arts"
                ],
                "gradeLevels": [],
                "skills": [
                        "research",
                        "planning"
                ]
        },
        {
                "id": "EXP-MAPLEDIR",
                "title": "Maple Career Conversation",
                "organization": "Maple High School",
                "type": "Career Exploration",
                "location": "Maple High School",
                "format": "On campus",
                "url": "https://maplehighschool.lusd.org/",
                "description": "Invite a local professional, employer, or program representative to meet with students.",
                "eligibility": "Plan through Maple staff.",
                "tags": [
                        "guest speaker",
                        "career"
                ],
                "interestAreas": [
                        "career exploration"
                ],
                "gradeLevels": [],
                "skills": [
                        "questions",
                        "communication"
                ]
        },
        {
                "id": "EXP-VANDENBERG",
                "title": "Aerospace and Base Career Research",
                "organization": "Vandenberg Space Force Base",
                "type": "Career Exploration",
                "location": "Vandenberg SFB",
                "format": "Research / Visit",
                "url": "https://www.vandenberg.spaceforce.mil/",
                "description": "Research military and civilian careers in aerospace, technology, logistics, and public safety.",
                "eligibility": "Verify current public events or approved visit options.",
                "tags": [
                        "aerospace",
                        "technology",
                        "military"
                ],
                "interestAreas": [
                        "space",
                        "engineering",
                        "cybersecurity"
                ],
                "gradeLevels": [],
                "skills": [
                        "research",
                        "technical awareness"
                ]
        },
        {
                "id": "EXP-CITYCAREERS",
                "title": "City Department Career Day",
                "organization": "City of Lompoc",
                "type": "Career Exploration",
                "location": "Lompoc",
                "format": "Visit / Guest speaker",
                "url": "https://www.cityoflompoc.com/government/departments",
                "description": "Explore careers in utilities, transit, parks, public works, library, fire, police, and administration.",
                "eligibility": "Coordinate directly with the relevant department.",
                "tags": [
                        "government",
                        "public service"
                ],
                "interestAreas": [
                        "community",
                        "public safety",
                        "trades"
                ],
                "gradeLevels": [],
                "skills": [
                        "questions",
                        "communication"
                ]
        },
        {
                "id": "EXP-SMALLBIZ",
                "title": "Interview a Local Business Owner",
                "organization": "Lompoc Small Business Community",
                "type": "Entrepreneurship",
                "location": "Lompoc",
                "format": "Interview",
                "url": "https://explorelompoc.com/shop/",
                "description": "Learn how a local business started, serves customers, manages money, and solves problems.",
                "eligibility": "Arrange an interview with educator support.",
                "tags": [
                        "business",
                        "entrepreneurship"
                ],
                "interestAreas": [
                        "small business",
                        "marketing"
                ],
                "gradeLevels": [],
                "skills": [
                        "interviewing",
                        "questions"
                ]
        },
        {
                "id": "EXP-PARKPROJECT",
                "title": "Community Improvement Project",
                "organization": "City of Lompoc / Local Nonprofit",
                "type": "Service Project",
                "location": "Lompoc",
                "format": "Group project",
                "url": "https://www.cityoflompoc.com/government/departments/recreation",
                "description": "Plan a cleanup, beautification, donation, awareness, or community-service project.",
                "eligibility": "Coordinate permissions and supervision.",
                "tags": [
                        "service",
                        "project"
                ],
                "interestAreas": [
                        "community",
                        "environment",
                        "leadership"
                ],
                "gradeLevels": [],
                "skills": [
                        "planning",
                        "teamwork",
                        "leadership"
                ]
        }
    ];


    const COMMUNITY_ACTION_LIBRARY = [
        {
            id: "COMMUNITY-LEAD-ANIMAL-CARE",
            title: "Animal shelter volunteer inquiry",
            organization: "Lompoc Animal Shelter",
            partnerId: "LOM-SHELTER",
            type: "Volunteer",
            location: "Lompoc, CA",
            format: "In person",
            description: "Explore age-appropriate ways to support animal care, enrichment, adoption events, cleaning, or community education.",
            eligibility: "Research lead. Contact the organization to verify current youth volunteer rules and supervision requirements.",
            verificationStatus: "Verify availability",
            schedule: "Ask about after-school or weekend options",
            commitment: "To be confirmed",
            applicationSteps: ["Review current volunteer information", "Prepare a short introduction", "Ask about age and supervision requirements"],
            tags: ["volunteer", "animals", "community service"],
            interestAreas: ["animals", "veterinary", "helping people"],
            skills: ["responsibility", "teamwork", "animal care"]
        },
        {
            id: "COMMUNITY-LEAD-LIBRARY",
            title: "Library volunteer or program-support inquiry",
            organization: "Lompoc Public Library",
            type: "Volunteer",
            location: "Lompoc, CA",
            format: "In person",
            description: "Explore support for library programs, events, displays, technology help, reading activities, or collection projects.",
            eligibility: "Research lead. Verify current volunteer openings and age requirements directly with the library.",
            verificationStatus: "Verify availability",
            schedule: "Ask about after-school, evening, or event-based service",
            applicationSteps: ["Identify a library interest area", "Contact library staff", "Confirm training and schedule"],
            tags: ["volunteer", "books", "technology", "events"],
            interestAreas: ["education", "writing", "technology", "community"],
            skills: ["organization", "communication", "customer service"]
        },
        {
            id: "COMMUNITY-LEAD-MUSEUM",
            title: "Museum collections or event volunteer inquiry",
            organization: "Lompoc Museum",
            type: "Volunteer",
            location: "Lompoc, CA",
            format: "In person",
            description: "Explore local-history research, exhibits, events, visitor support, photography, archives, or community storytelling.",
            eligibility: "Research lead. Verify current projects and youth participation requirements.",
            verificationStatus: "Verify availability",
            schedule: "Project or event based",
            applicationSteps: ["Choose a history or arts interest", "Prepare two questions", "Ask about a small first project"],
            tags: ["volunteer", "history", "museum", "arts"],
            interestAreas: ["history", "art", "photography", "community"],
            skills: ["research", "writing", "public speaking"]
        },
        {
            id: "COMMUNITY-LEAD-YMCA",
            title: "Youth program volunteer inquiry",
            organization: "Lompoc Family YMCA",
            type: "Volunteer",
            location: "Lompoc, CA",
            format: "In person",
            description: "Explore support roles connected to youth activities, recreation, events, fitness, member services, or community programs.",
            eligibility: "Research lead. Verify age, background-check, and supervision requirements.",
            verificationStatus: "Verify availability",
            schedule: "Ask about after-school, weekend, or event shifts",
            applicationSteps: ["Choose a program area", "Ask about youth volunteer pathways", "Confirm orientation requirements"],
            tags: ["volunteer", "youth", "recreation", "fitness"],
            interestAreas: ["sports", "teaching", "health", "community"],
            skills: ["leadership", "communication", "reliability"]
        },
        {
            id: "COMMUNITY-LEAD-FUTURE",
            title: "Youth leadership and community-event volunteer inquiry",
            organization: "FUTURE for Lompoc Youth",
            partnerId: "LOM-FUTURE",
            type: "Volunteer",
            location: "Lompoc, CA",
            format: "In person",
            url: "https://www.futureforlompocyouth.org/",
            description: "Explore youth leadership, event support, outreach, mentoring, communications, or community-improvement projects.",
            eligibility: "Research lead. Verify current projects and participation process.",
            verificationStatus: "Verify availability",
            schedule: "Project and event based",
            applicationSteps: ["Review the organization mission", "Select a community issue", "Ask about a first volunteer role"],
            tags: ["volunteer", "leadership", "youth", "community"],
            interestAreas: ["leadership", "community service", "events"],
            skills: ["teamwork", "event planning", "communication"]
        },
        {
            id: "COMMUNITY-LEAD-HEALTH",
            title: "Healthcare career visit or job-shadow inquiry",
            organization: "Lompoc Valley Medical Center",
            type: "Job Shadow",
            location: "Lompoc, CA",
            format: "In person",
            description: "Explore clinical and nonclinical healthcare careers such as nursing, imaging, laboratory, facilities, food service, technology, administration, or patient support.",
            eligibility: "Research lead. Hospital access, privacy rules, age requirements, and job-shadow availability must be verified directly.",
            verificationStatus: "Verify availability",
            schedule: "One-time visit or short observation",
            applicationSteps: ["Choose two healthcare career areas", "Prepare privacy-aware questions", "Ask an educator to support outreach"],
            tags: ["healthcare", "job shadow", "career visit"],
            interestAreas: ["healthcare", "science", "technology", "helping people"],
            skills: ["professionalism", "communication", "confidentiality"]
        },
        {
            id: "COMMUNITY-LEAD-DENMAT",
            title: "Manufacturing and healthcare technology internship inquiry",
            organization: "DenMat Holdings",
            type: "Internship",
            location: "Lompoc, CA",
            format: "In person",
            description: "Explore a structured learning experience connected to manufacturing, dental products, quality, engineering, business, marketing, or operations.",
            eligibility: "Research lead. Verify whether a student internship, tour, mentor, or project option is currently available.",
            verificationStatus: "Verify availability",
            schedule: "To be arranged with the organization",
            commitment: "Short-term or semester inquiry",
            applicationSteps: ["Create a one-page interest summary", "Choose a department", "Request an informational conversation"],
            tags: ["internship", "manufacturing", "healthcare technology"],
            interestAreas: ["engineering", "healthcare", "business", "design"],
            skills: ["quality control", "technology", "communication"]
        },
        {
            id: "COMMUNITY-LEAD-CITY",
            title: "Public-service internship or department visit inquiry",
            organization: "City of Lompoc",
            type: "Internship",
            location: "Lompoc, CA",
            format: "In person",
            description: "Explore utilities, parks, library services, planning, public works, transit, administration, communications, or community development.",
            eligibility: "Research lead. Verify current student programs, department access, and any formal application requirements.",
            verificationStatus: "Verify availability",
            schedule: "Department dependent",
            applicationSteps: ["Select one city department", "Research its work", "Prepare a specific learning request"],
            tags: ["internship", "public service", "government"],
            interestAreas: ["government", "environment", "construction", "community"],
            skills: ["professional communication", "organization", "public service"]
        },
        {
            id: "COMMUNITY-LEAD-CHAMBER",
            title: "Small-business mentor match inquiry",
            organization: "Lompoc Valley Chamber of Commerce",
            type: "Mentorship",
            location: "Lompoc, CA",
            format: "Hybrid",
            description: "Explore a short mentor conversation or business connection aligned with a student's career interest, project, or entrepreneurial idea.",
            eligibility: "Research lead. A mentor match or introduction must be arranged and verified with the Chamber or participating business.",
            verificationStatus: "Verify availability",
            schedule: "One-time or short series of conversations",
            applicationSteps: ["Define the student's interest", "Write three mentor questions", "Request an introduction"],
            tags: ["mentorship", "business", "entrepreneurship"],
            interestAreas: ["business", "entrepreneurship", "local careers"],
            skills: ["networking", "communication", "goal setting"]
        },
        {
            id: "COMMUNITY-LEAD-AHC",
            title: "Lompoc Valley Center program visit",
            organization: "Allan Hancock College — Lompoc Valley Center",
            type: "Career Visit",
            location: "Lompoc, CA",
            format: "In person",
            description: "Plan a focused visit to explore programs, student services, career education, enrollment steps, and the Lompoc Valley Center.",
            eligibility: "Research lead. Schedule and available services should be confirmed with Allan Hancock College.",
            verificationStatus: "Verify schedule",
            schedule: "One-time visit",
            applicationSteps: ["Choose two program pathways", "Prepare enrollment questions", "Identify one next step after the visit"],
            tags: ["college", "career visit", "program exploration"],
            interestAreas: ["college", "career education", "training"],
            skills: ["self-advocacy", "planning", "question asking"]
        },
        {
            id: "COMMUNITY-LEAD-RETAIL",
            title: "Retail operations career conversation",
            organization: "Harbor Freight Tools",
            type: "Career Visit",
            location: "Lompoc, CA",
            format: "In person",
            description: "Explore customer service, inventory, merchandising, tools, supervision, loss prevention, and store operations.",
            eligibility: "Research lead. Verify whether a manager conversation, tour, or student visit can be arranged.",
            verificationStatus: "Verify availability",
            schedule: "One-time conversation or visit",
            applicationSteps: ["Research store roles", "Prepare three operations questions", "Request a short career conversation"],
            tags: ["retail", "career visit", "tools"],
            interestAreas: ["business", "tools", "customer service"],
            skills: ["communication", "inventory", "problem solving"]
        },
        {
            id: "COMMUNITY-LEAD-HOSPITALITY",
            title: "Hospitality operations internship inquiry",
            organization: "Embassy Suites by Hilton Lompoc",
            type: "Internship",
            location: "Lompoc, CA",
            format: "In person",
            description: "Explore guest services, housekeeping operations, food service, facilities, events, marketing, or hotel management.",
            eligibility: "Research lead. Verify age requirements and whether a tour, job shadow, or internship is available.",
            verificationStatus: "Verify availability",
            schedule: "To be arranged",
            applicationSteps: ["Choose a hotel department", "Prepare a professional introduction", "Ask about an age-appropriate learning experience"],
            tags: ["internship", "hospitality", "tourism"],
            interestAreas: ["hospitality", "food", "business", "events"],
            skills: ["customer service", "teamwork", "professionalism"]
        }
    ,
{
        "id": "OPP-RTF-VOLUNTEER-DAYS",
        "title": "Wild horse sanctuary volunteer day",
        "organization": "Return to Freedom Wild Horse Conservation",
        "partnerId": "LOM-RETURN-TO-FREEDOM",
        "type": "Volunteer",
        "location": "4115 Jalama Rd, Lompoc, CA 93436",
        "format": "In person",
        "url": "https://returntofreedom.org/volunteer/",
        "description": "Support sanctuary projects during recurring public volunteer days while learning about wild horse and burro care, habitat, conservation, and nonprofit operations.",
        "eligibility": "The organization lists a recommended minimum age of 8. Confirm current dates, adult supervision expectations, and task requirements directly.",
        "ageRequirements": "Recommended minimum age 8; confirm supervision requirements",
        "schedule": "Weekly public volunteer days; confirm current calendar",
        "commitment": "One volunteer day or recurring service",
        "transportation": "Transportation to the rural sanctuary is required",
        "compensation": "Unpaid volunteer service",
        "capacity": "Registration required",
        "contactEmail": "volunteers@returntofreedom.org",
        "verificationStatus": "Official program — verify date",
        "applicationSteps": [
                "Review the official volunteer page",
                "Email the volunteer team",
                "Confirm date, clothing, supervision, and transportation"
        ],
        "tags": [
                "volunteer",
                "animals",
                "conservation",
                "outdoors"
        ],
        "interestAreas": [
                "animal care",
                "environment",
                "conservation",
                "nonprofit work"
        ],
        "skills": [
                "teamwork",
                "physical work",
                "responsibility",
                "animal safety"
        ]
},
{
        "id": "OPP-FEEDING-LOMPOC-DRIVER",
        "title": "Food pantry volunteer driver",
        "organization": "Feeding Lompoc — Lompoc Food Pantry",
        "partnerId": "LOM-FEEDING-LOMPOC",
        "type": "Volunteer",
        "location": "Lompoc, CA",
        "format": "In person",
        "url": "https://www.feedinglompoc.org/volunteer",
        "description": "Help pick up food donations from local grocery stores so the pantry can keep food available for Lompoc families.",
        "eligibility": "The current posting requests volunteer drivers. Confirm driver age, license, insurance, vehicle, and schedule requirements directly.",
        "ageRequirements": "Likely adult driver role; confirm directly",
        "schedule": "Recurring pickup routes; confirm current need",
        "commitment": "Ongoing route support preferred",
        "transportation": "Driver and vehicle requirements apply",
        "compensation": "Unpaid volunteer service",
        "verificationStatus": "Official current need — verify details",
        "applicationSteps": [
                "Open the official volunteer page",
                "Contact Feeding Lompoc",
                "Confirm driver and scheduling requirements"
        ],
        "tags": [
                "volunteer",
                "food pantry",
                "driving",
                "logistics"
        ],
        "interestAreas": [
                "community service",
                "food access",
                "logistics"
        ],
        "skills": [
                "reliability",
                "driving",
                "time management",
                "communication"
        ]
},
{
        "id": "OPP-FOODBANK-NORTH-COUNTY",
        "title": "North County food distribution volunteer shifts",
        "organization": "Foodbank of Santa Barbara County — North County",
        "partnerId": "LOM-FOODBANK-SBC",
        "type": "Volunteer",
        "location": "North Santa Barbara County, including Lompoc",
        "format": "In person",
        "url": "https://foodbanksbc.org/give-help/volunteer/",
        "description": "Register for food distribution, warehouse, nutrition, outreach, and special-event volunteer shifts serving North County communities.",
        "eligibility": "Create a volunteer account and review each shift for age, supervision, location, and physical requirements.",
        "ageRequirements": "Varies by shift",
        "schedule": "Shift-based; current openings appear in the volunteer portal",
        "commitment": "One-time or recurring shifts",
        "transportation": "Varies by site",
        "compensation": "Unpaid volunteer service",
        "contactEmail": "volunteersb@foodbanksbc.org",
        "verificationStatus": "Official program — choose current shift",
        "applicationSteps": [
                "Create a VolunteerHub account",
                "Filter for North County opportunities",
                "Select a shift and review requirements"
        ],
        "tags": [
                "volunteer",
                "food access",
                "nutrition",
                "warehouse"
        ],
        "interestAreas": [
                "nutrition",
                "community health",
                "logistics",
                "nonprofit work"
        ],
        "skills": [
                "teamwork",
                "organization",
                "customer service"
        ]
},
{
        "id": "OPP-CPC-SENIOR-SUPPORT",
        "title": "Senior support volunteer",
        "organization": "Community Partners in Caring",
        "partnerId": "LOM-PARTNERSCARING",
        "type": "Volunteer",
        "location": "Lompoc Valley, CA",
        "format": "In person / phone",
        "url": "https://partnersincaring.org/",
        "description": "Support older adults with services such as transportation, grocery assistance, friendly calls, and other non-medical help coordinated by the organization.",
        "eligibility": "Volunteer screening, training, background-check, driving, and age requirements depend on the role. Confirm current Lompoc Valley needs directly.",
        "ageRequirements": "Varies by role; some driving roles may require adults",
        "schedule": "Flexible and coordinated with client needs",
        "commitment": "One-time or recurring",
        "transportation": "Driving roles may require a vehicle",
        "compensation": "Unpaid volunteer service",
        "verificationStatus": "Official program — verify youth eligibility",
        "applicationSteps": [
                "Review the organization and services",
                "Contact the volunteer coordinator",
                "Choose a role and complete required screening"
        ],
        "tags": [
                "volunteer",
                "seniors",
                "transportation",
                "friendly calls"
        ],
        "interestAreas": [
                "helping people",
                "healthcare",
                "community service"
        ],
        "skills": [
                "empathy",
                "communication",
                "reliability",
                "confidentiality"
        ]
},
{
        "id": "OPP-LOMPOC-POLICE-VOLUNTEER",
        "title": "Police community volunteer inquiry",
        "organization": "Lompoc Police Department",
        "partnerId": "LOM-POLICE",
        "type": "Volunteer",
        "location": "Lompoc, CA",
        "format": "In person",
        "url": "https://www.cityoflompoc.com/government/departments/police/programs/volunteers",
        "description": "Explore volunteer service supporting clerical work, bicycle licensing, civic events, searches, public-safety outreach, and other department needs.",
        "eligibility": "Public-safety volunteer roles may have age, background, training, confidentiality, and scheduling requirements. Verify youth eligibility directly.",
        "ageRequirements": "Confirm directly",
        "schedule": "Department dependent",
        "commitment": "Varies by assignment",
        "transportation": "Local transportation required",
        "compensation": "Unpaid volunteer service",
        "verificationStatus": "Official program — verify eligibility",
        "applicationSteps": [
                "Review the official volunteer page",
                "Prepare questions about student-appropriate roles",
                "Contact the program coordinator"
        ],
        "tags": [
                "volunteer",
                "public safety",
                "events",
                "government"
        ],
        "interestAreas": [
                "public safety",
                "government",
                "community service"
        ],
        "skills": [
                "professionalism",
                "confidentiality",
                "communication",
                "reliability"
        ]
},
{
        "id": "OPP-LA-PURISIMA-INTERPRETIVE",
        "title": "Interpretive volunteer at La Purísima Mission",
        "organization": "La Purísima Mission State Historic Park",
        "partnerId": "LOM-LA-PURISIMA",
        "type": "Volunteer",
        "location": "2295 Purisima Rd, Lompoc, CA 93436",
        "format": "In person",
        "url": "https://app.betterimpact.com/PublicOrganization/4b914e72-d2b1-4209-b858-a211dd86a4c2/Gvi/2cac84df-e4b8-4383-bf48-12bfc2110434/2",
        "description": "Train with interpreters and subject-matter experts, then help deliver natural and cultural history programs for park visitors.",
        "eligibility": "Review the current application for age, training, background, scheduling, and supervision requirements.",
        "ageRequirements": "Confirm in current application",
        "schedule": "Training and scheduled interpretive service",
        "commitment": "Ongoing after training",
        "transportation": "Transportation to the park required",
        "compensation": "Unpaid volunteer service",
        "verificationStatus": "Official listing — verify intake schedule",
        "applicationSteps": [
                "Review the official volunteer listing",
                "Submit an inquiry or application",
                "Complete required training and orientation"
        ],
        "tags": [
                "volunteer",
                "history",
                "state parks",
                "education"
        ],
        "interestAreas": [
                "history",
                "education",
                "parks",
                "museum studies"
        ],
        "skills": [
                "public speaking",
                "research",
                "visitor service",
                "reliability"
        ]
},
{
        "id": "OPP-UBGC-TUTOR-MENTOR",
        "title": "Tutor, mentor, coach, or event volunteer",
        "organization": "United Boys & Girls Clubs — Lompoc",
        "partnerId": "LOM-UNITEDBOYS",
        "type": "Volunteer",
        "location": "Lompoc, CA",
        "format": "In person",
        "url": "https://www.unitedbg.org/volunteer",
        "description": "Support youth through tutoring, mentoring, sports coaching, refereeing, meal distribution, donation projects, and seasonal events.",
        "eligibility": "Roles have different age, screening, training, and schedule requirements. Ask which options are appropriate for high-school students.",
        "ageRequirements": "Varies by role; confirm student options",
        "schedule": "After school, sports schedules, and seasonal events",
        "commitment": "One-time events or recurring support",
        "transportation": "Local transportation required",
        "compensation": "Unpaid volunteer service",
        "verificationStatus": "Official program — verify student roles",
        "applicationSteps": [
                "Review volunteer role options",
                "Choose tutoring, mentoring, sports, or events",
                "Contact the organization and confirm requirements"
        ],
        "tags": [
                "volunteer",
                "youth",
                "tutoring",
                "sports",
                "mentoring"
        ],
        "interestAreas": [
                "education",
                "sports",
                "youth development",
                "community service"
        ],
        "skills": [
                "mentoring",
                "communication",
                "leadership",
                "patience"
        ]
},
{
        "id": "OPP-THEATRE-PROJECT-VOLUNTEER",
        "title": "Historic theatre restoration and event volunteer inquiry",
        "organization": "Lompoc Theatre Project",
        "partnerId": "LOM-THEATRE-PROJECT",
        "type": "Volunteer",
        "location": "238 N H St, Lompoc, CA 93436",
        "format": "In person / project based",
        "url": "https://lompoctheatre.org/",
        "description": "Explore volunteer roles connected to community events, fundraising, publicity, design, historical preservation, and the restoration of the Lompoc Theatre.",
        "eligibility": "Current projects and student-appropriate roles must be confirmed with the organization. Construction-related tasks may have age and safety limits.",
        "ageRequirements": "Varies by task; confirm directly",
        "schedule": "Project and event based",
        "commitment": "One-time or recurring",
        "transportation": "Local transportation required",
        "compensation": "Unpaid volunteer service",
        "contactEmail": "info@lompoctheatre.org",
        "verificationStatus": "Verify current projects",
        "applicationSteps": [
                "Review the project mission and current updates",
                "Choose an arts, event, publicity, or preservation interest",
                "Email a specific volunteer inquiry"
        ],
        "tags": [
                "volunteer",
                "arts",
                "theatre",
                "preservation",
                "events"
        ],
        "interestAreas": [
                "performing arts",
                "construction",
                "design",
                "marketing",
                "history"
        ],
        "skills": [
                "teamwork",
                "creativity",
                "event support",
                "communication"
        ]
},
{
        "id": "OPP-FESTIVAL-VOLUNTEER",
        "title": "Flower Festival and community-event volunteer",
        "organization": "Lompoc Valley Festival Association",
        "partnerId": "LOM-FESTIVAL-ASSOC",
        "type": "Volunteer",
        "location": "Lompoc, CA",
        "format": "In person",
        "url": "https://www.lompocvalleyfestivals.com/",
        "description": "Help with planning, setup, parade support, event operations, community outreach, and other needs connected to Lompoc festivals.",
        "eligibility": "Confirm current events, student age requirements, supervision, and available roles with the association.",
        "ageRequirements": "Varies by role; confirm directly",
        "schedule": "Seasonal and event based",
        "commitment": "One event or planning cycle",
        "transportation": "Local transportation required",
        "compensation": "Unpaid volunteer service",
        "contactEmail": "office@lompocvalleyfestivals.com",
        "verificationStatus": "Official organization — verify current roles",
        "applicationSteps": [
                "Review upcoming events",
                "Contact the association",
                "Choose a planning, setup, hospitality, or outreach role"
        ],
        "tags": [
                "volunteer",
                "events",
                "festival",
                "parade"
        ],
        "interestAreas": [
                "event planning",
                "hospitality",
                "marketing",
                "community service"
        ],
        "skills": [
                "organization",
                "teamwork",
                "customer service",
                "communication"
        ]
},
{
        "id": "OPP-HISTORICAL-SOCIETY-VOLUNTEER",
        "title": "Local history, archives, and tour volunteer inquiry",
        "organization": "Lompoc Valley Historical Society",
        "partnerId": "LOM-HISTORICAL-SOCIETY",
        "type": "Volunteer",
        "location": "207 N L St, Lompoc, CA 93436",
        "format": "In person",
        "url": "https://lompochistory.org/",
        "description": "Explore volunteer work supporting local history research, archives, exhibits, tours, visitor service, and community outreach.",
        "eligibility": "The organization is volunteer-run. Confirm current projects, open hours, supervision, and student-appropriate roles directly.",
        "ageRequirements": "Confirm directly",
        "schedule": "Limited open hours and project-based work",
        "commitment": "Flexible or project based",
        "transportation": "Local transportation required",
        "compensation": "Unpaid volunteer service",
        "contactEmail": "lompochistory@gmail.com",
        "verificationStatus": "Verify current need",
        "applicationSteps": [
                "Review the organization website",
                "Choose an archive, exhibit, tour, or research interest",
                "Contact the society with a specific request"
        ],
        "tags": [
                "volunteer",
                "history",
                "archives",
                "museum"
        ],
        "interestAreas": [
                "history",
                "research",
                "museums",
                "education"
        ],
        "skills": [
                "research",
                "organization",
                "writing",
                "visitor service"
        ]
},
{
        "id": "OPP-SBCAS-DOGGY-DAY-TRIP",
        "title": "Doggy Day Trip shelter enrichment",
        "organization": "Lompoc Animal Shelter",
        "partnerId": "LOM-SHELTER",
        "type": "Volunteer",
        "location": "1501 W Central Ave, Lompoc, CA 93436",
        "format": "In person",
        "url": "https://www.countyofsb.org/doggy-day-trip",
        "description": "Take an adoptable dog out for a short community excursion, helping provide exercise, enrichment, visibility, and useful information for adopters.",
        "eligibility": "Review the official program for handler age, identification, safety, animal-selection, and supervision requirements.",
        "ageRequirements": "Confirm handler and minor-supervision rules",
        "schedule": "During shelter program hours",
        "commitment": "Minimum outing defined by the shelter",
        "transportation": "Vehicle and safe animal transport may be required",
        "compensation": "Unpaid volunteer service",
        "verificationStatus": "Official program — verify current hours",
        "applicationSteps": [
                "Review the official program page",
                "Confirm Lompoc shelter participation and hours",
                "Complete check-out and safety instructions at the shelter"
        ],
        "tags": [
                "volunteer",
                "animals",
                "shelter",
                "outdoors"
        ],
        "interestAreas": [
                "animal care",
                "veterinary",
                "community service"
        ],
        "skills": [
                "animal safety",
                "responsibility",
                "observation",
                "communication"
        ]
},
{
        "id": "OPP-LOMPOC-TEEN-CENTER-INTERNSHIP",
        "title": "Teen leadership or internship opportunity inquiry",
        "organization": "Lompoc Teen Center",
        "partnerId": "LOM-TEEN-CENTER",
        "type": "Internship",
        "location": "732 N H St, Lompoc, CA 93436",
        "format": "In person",
        "url": "https://www.lompocteencenter.org/",
        "description": "Explore youth-led projects, events, tutoring, communications, career-readiness programming, and internship opportunities through the Lompoc Teen Center.",
        "eligibility": "Programs serve students in grades 7–12. Confirm current internship openings, application steps, schedule, and expectations.",
        "ageRequirements": "Grades 7–12; internship details vary",
        "schedule": "After school and event based",
        "commitment": "Program dependent",
        "transportation": "Local transportation required",
        "compensation": "Confirm whether a specific role is paid or unpaid",
        "contactEmail": "info@lompocteencenter.org",
        "verificationStatus": "Official program — verify current opening",
        "applicationSteps": [
                "Review current Teen Center programs",
                "Identify a leadership or career interest",
                "Contact the center about current internship or project roles"
        ],
        "tags": [
                "internship",
                "youth leadership",
                "events",
                "career readiness"
        ],
        "interestAreas": [
                "leadership",
                "education",
                "events",
                "communications",
                "nonprofit work"
        ],
        "skills": [
                "communication",
                "teamwork",
                "initiative",
                "planning"
        ]
},
{
        "id": "OPP-LVMC-CCC-VOLUNTEER",
        "title": "Comprehensive Care Center volunteer",
        "organization": "Lompoc Valley Medical Center",
        "partnerId": "LOM-LVMC",
        "type": "Volunteer",
        "location": "Lompoc, CA",
        "format": "In person",
        "url": "https://www.lompocvmc.com/the-foundation/volunteer/volunteer-at-ccc/",
        "description": "Support residents, visitors, staff, and activities at Lompoc Valley Medical Center’s Comprehensive Care Center.",
        "eligibility": "Healthcare volunteer screening, health, privacy, training, schedule, and age requirements apply. Confirm current openings directly.",
        "ageRequirements": "Confirm with Volunteer Services",
        "schedule": "Recurring shifts",
        "commitment": "Ongoing after orientation",
        "transportation": "Local transportation required",
        "compensation": "Unpaid volunteer service",
        "verificationStatus": "Official program — verify openings",
        "applicationSteps": [
                "Review the CCC volunteer page",
                "Contact Volunteer Services",
                "Complete application, screening, and orientation requirements"
        ],
        "tags": [
                "volunteer",
                "healthcare",
                "senior care",
                "patient support"
        ],
        "interestAreas": [
                "healthcare",
                "helping people",
                "senior care"
        ],
        "skills": [
                "empathy",
                "confidentiality",
                "reliability",
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

    function cleanOpportunityTitle(value) {
        return cleanString(value)
            .replace(/^Explore\s+/i,"")
            .replace(/\s+careers at\s+/i," — ")
            .replace(/\s+careers with\s+/i," — ")
            .replace(/^Career exploration:\s*/i,"")
            .trim();
    }

    function cleanOpportunityDescription(value) {
        return cleanString(value)
            .replace(/^Research lead only[—.:\s]*/i,"")
            .replace(/^This is a research lead only[—.:\s]*/i,"")
            .replace(/^Explore\s+/i,"")
            .replace(/\s*Verify any visit, job shadow, internship, or current opening directly.*$/i,"")
            .trim();
    }

    function normalize(input = {}) {
        const meta = input.meta && typeof input.meta === "object" ? input.meta : {};
        const createdAt = cleanString(meta.createdAt || input.createdAt) || now();

        return {
            id: cleanString(input.id) || createId(),
            title: cleanOpportunityTitle(input.title),
            organization: cleanString(input.organization),
            partnerId: cleanString(input.partnerId),
            type: cleanString(input.type) === "Local Organization Research"
                ? "Local Career Area"
                : (cleanString(input.type) || "Other"),
            location: cleanString(input.location),
            format: cleanString(input.format) === "Research / outreach"
                ? "Local"
                : (cleanString(input.format) || "In person"),
            deadline: cleanString(input.deadline),
            url: cleanString(input.url),
            description: cleanOpportunityDescription(input.description),
            eligibility: cleanString(input.eligibility),
            ageRequirements: cleanString(input.ageRequirements),
            schedule: cleanString(input.schedule),
            commitment: cleanString(input.commitment),
            transportation: cleanString(input.transportation),
            compensation: cleanString(input.compensation),
            capacity: cleanString(input.capacity),
            contactName: cleanString(input.contactName),
            contactEmail: cleanString(input.contactEmail),
            verificationStatus: cleanString(input.verificationStatus),
            applicationSteps: cleanArray(input.applicationSteps),
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


    const STARTER_LINK_REPAIRS = {
        "EXP-PARKS-VOL": {
            organization: "Lompoc Parks & Recreation",
            partnerId: "LOM-REC",
            oldOrganizations: ["City of Lompoc Parks & Recreation", "Lompoc Parks & Recreation"],
            oldPartnerIds: ["", "LOM-PARKS", "LOM-REC"]
        },
        "EXP-VOLUNTEEN": {
            organization: "Lompoc Parks & Recreation",
            partnerId: "LOM-REC",
            oldOrganizations: ["Lompoc Parks & Recreation"],
            oldPartnerIds: ["", "LOM-PARKS", "LOM-REC"]
        },
        "COMMUNITY-LEAD-ANIMAL-CARE": {
            organization: "Lompoc Animal Shelter",
            partnerId: "LOM-SHELTER",
            oldOrganizations: ["Lompoc Animal Shelter"],
            oldPartnerIds: ["", "LOM-ANIMAL", "LOM-SHELTER"]
        },
        "OPP-CPC-SENIOR-SUPPORT": {
            organization: "Community Partners in Caring",
            partnerId: "LOM-PARTNERSCARING",
            oldOrganizations: ["Community Partners in Caring"],
            oldPartnerIds: ["", "LOM-CPC", "LOM-PARTNERSCARING"]
        },
        "OPP-UBGC-TUTOR-MENTOR": {
            organization: "United Boys & Girls Clubs — Lompoc",
            partnerId: "LOM-UNITEDBOYS",
            oldOrganizations: ["United Boys & Girls Clubs — Lompoc"],
            oldPartnerIds: ["", "LOM-BOYSGIRLS", "LOM-UNITEDBOYS"]
        },
        "OPP-SBCAS-DOGGY-DAY-TRIP": {
            organization: "Lompoc Animal Shelter",
            partnerId: "LOM-SHELTER",
            oldOrganizations: ["Lompoc Animal Shelter"],
            oldPartnerIds: ["", "LOM-ANIMAL", "LOM-SHELTER"]
        }
    };

    function repairStarterPartnerLinks() {
        let repaired = 0;
        opportunities = opportunities.map((item) => {
            const repair = STARTER_LINK_REPAIRS[item.id];
            if (!repair) return item;

            const organizationCanChange = repair.oldOrganizations.includes(item.organization || "");
            const partnerCanChange = repair.oldPartnerIds.includes(item.partnerId || "");
            if (!organizationCanChange && !partnerCanChange) return item;

            const nextOrganization = organizationCanChange
                ? repair.organization
                : item.organization;
            const nextPartnerId = partnerCanChange
                ? repair.partnerId
                : item.partnerId;

            if (nextOrganization === item.organization && nextPartnerId === item.partnerId) {
                return item;
            }

            repaired += 1;
            return normalize({
                ...item,
                organization: nextOrganization,
                partnerId: nextPartnerId,
                meta: {
                    ...item.meta,
                    updatedAt: now()
                }
            });
        });
        return repaired;
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

        opportunities = loaded.map(normalize).filter((item) =>
            !OBSOLETE_STARTER_IDS.has(item.id) &&
            !(
                item.id.startsWith("LOCAL-LOMPOC-") &&
                ["Local Career Area", "Local Business Research"].includes(item.type)
            )
        );
        document.addEventListener(DATA_CHANGED_EVENT, save);

        const installedStarterVersion = Number(
            localStorage.getItem(STARTER_VERSION_KEY) || 0
        );
        let starterAdditions = 0;

        if (installedStarterVersion < STARTER_LIBRARY_VERSION) {
            starterAdditions = loadLocalStarterLibrary();
            localStorage.setItem(STARTER_VERSION_KEY, String(STARTER_LIBRARY_VERSION));
        }

        const repairedPartnerLinks = repairStarterPartnerLinks();
        if (starterAdditions || repairedPartnerLinks) save();

        emitChange({
            action: "initialize",
            count: opportunities.length,
            starterAdditions,
            repairedPartnerLinks
        });
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
        opportunities = opportunities.filter((item) =>
            !OBSOLETE_STARTER_IDS.has(item.id)
        );

        const existingIds = new Set(opportunities.map((item) => item.id));
        const additions = [
            ...LOCAL_STARTER_LIBRARY.filter((item) =>
                !String(item.id || "").startsWith("LOCAL-LOMPOC-") &&
                !OBSOLETE_STARTER_IDS.has(String(item.id || ""))
            ),
            ...LOCAL_EXPERIENCE_LIBRARY.filter((item) =>
                !OBSOLETE_STARTER_IDS.has(String(item.id || ""))
            ),
            ...COMMUNITY_ACTION_LIBRARY.filter((item) =>
                !OBSOLETE_STARTER_IDS.has(String(item.id || ""))
            )
        ]
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

                const haystack = [
                    item.title,
                    item.organization,
                    item.partnerId,
                    item.type,
                    item.location,
                    item.format,
                    item.description,
                    item.eligibility,
                    item.ageRequirements,
                    item.schedule,
                    item.commitment,
                    item.transportation,
                    item.compensation,
                    item.capacity,
                    item.contactName,
                    item.contactEmail,
                    item.verificationStatus,
                    ...item.applicationSteps,
                    ...item.tags,
                    ...item.interestAreas,
                    ...item.gradeLevels,
                    ...item.skills
                ].join(" ").toLowerCase();

                return normalized
                    .split(/\s+/)
                    .filter(Boolean)
                    .every((term) => haystack.includes(term));
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
