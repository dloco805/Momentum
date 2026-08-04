/*
==========================================================
Momentum
Partner Manager Module
Build v23.6.0
File: js/partnerManager.js
==========================================================
*/

"use strict";

const PartnerManager = (() => {
    const STORAGE_KEY = "momentum.partners";
    const DATA_CHANGED_EVENT = "partnerDataChanged";
    let partners = [];
    const STARTER_LIBRARY_VERSION = 6;
    const STARTER_VERSION_KEY = "momentum.partnersStarterVersion";
    const LEGACY_PARTNER_ID_ALIASES = Object.freeze({
        "LOM-CTE": "LOM-COLLEGE"
    });
    const STARTER_RECORD_REMOVALS = new Set(["LOM-CTE"]);

    const LOMPOC_BUSINESS_DIRECTORY = [
    {
        "id": "LOM-WALMART",
        "organization": "Walmart Supercenter",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.walmart.com/store/1989-lompoc-ca",
        "type": "Business",
        "industry": "Retail",
        "location": "701 W Central Ave, Lompoc, CA 93436",
        "services": [
            "Customer service",
            "Inventory",
            "Pharmacy",
            "Automotive",
            "Management"
        ],
        "opportunities": [],
        "notes": "Large retail workplace with many departments and career paths.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-HARBOR",
        "organization": "Harbor Freight Tools",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.harborfreight.com/storelocator/609-n-h-st-lompoc-93436?number=683",
        "type": "Business",
        "industry": "Retail",
        "location": "609 N H St, Lompoc, CA 93436",
        "services": [
            "Tools",
            "Sales",
            "Inventory",
            "Customer service",
            "Management"
        ],
        "opportunities": [],
        "notes": "Tool and equipment retail.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-TEAKLISH",
        "organization": "TEAklish Boba & Cafe",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://teaklish-boba-cafe.snackpass.site/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "517 W Central Ave, Lompoc, CA 93436",
        "services": [
            "Boba tea",
            "Food service",
            "Customer service",
            "Marketing",
            "Small business"
        ],
        "opportunities": [],
        "notes": "Local boba and café business.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-DIAMOND",
        "organization": "Diamond Tea & Sushi",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.diamondteasushi.com/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "1133 N H St Suite H, Lompoc, CA 93436",
        "services": [
            "Tea",
            "Restaurant service",
            "Food preparation",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Tea, boba, and restaurant service.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-CAPULIN",
        "organization": "Capulin Eats & Provisions",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/capulin-eats-provisions/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "300 N 12th St Suite 1E, Lompoc, CA 93436",
        "services": [
            "Food service",
            "Coffee",
            "Baking",
            "Hospitality"
        ],
        "opportunities": [],
        "notes": "Breakfast, lunch, coffee, and desserts.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-IZZIES",
        "organization": "Izzie's Foodies Place",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/izziefoodiesplace/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "426 N H St, Lompoc, CA 93436",
        "services": [
            "Restaurant service",
            "Cooking",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Local restaurant serving breakfast, lunch, and dinner.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-OLDTOWN",
        "organization": "Old Town Kitchen & Bar",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.oldtownkitchenlompoc.com/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "319 E Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Restaurant service",
            "Cooking",
            "Hospitality",
            "Management"
        ],
        "opportunities": [],
        "notes": "Local restaurant and hospitality business.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-HANGAR7",
        "organization": "Hangar 7 Social House",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/hangar-7-lompoc/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "300 N 12th St, Lompoc, CA 93436",
        "services": [
            "Hospitality",
            "Food service",
            "Events",
            "Marketing"
        ],
        "opportunities": [],
        "notes": "Aerospace-inspired social house and restaurant.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-JUPITER",
        "organization": "Jupiter's Spark Collective",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/jupiters-spark-collection/",
        "type": "Business",
        "industry": "Retail",
        "location": "101 S H St, Lompoc, CA 93436",
        "services": [
            "Retail",
            "Art",
            "Fashion",
            "Plants",
            "Small business"
        ],
        "opportunities": [],
        "notes": "Local collective featuring clothing, art, plants, and gifts.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-MUSEUM",
        "organization": "Lompoc Museum",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/lompoc-museum/",
        "type": "Business",
        "industry": "Arts & Culture",
        "location": "200 S H St, Lompoc, CA 93436",
        "services": [
            "History",
            "Museums",
            "Education",
            "Art",
            "Community service"
        ],
        "opportunities": [],
        "notes": "Museum with local history, art, and photography.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-CITY",
        "organization": "City of Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.cityoflompoc.com/government/departments",
        "type": "Government",
        "industry": "Government",
        "location": "100 Civic Center Plaza, Lompoc, CA 93436",
        "services": [
            "Public works",
            "Library",
            "Parks",
            "Utilities",
            "Fire",
            "Police",
            "Administration"
        ],
        "opportunities": [],
        "notes": "City departments and public-service career areas.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-LIBRARY",
        "organization": "Lompoc Public Library",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.cityoflompoc.com/government/departments/library",
        "type": "Government",
        "industry": "Government",
        "location": "501 E North Ave, Lompoc, CA 93436",
        "services": [
            "Libraries",
            "Education",
            "Technology",
            "Community service"
        ],
        "opportunities": [],
        "notes": "Public library and community learning services.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-REC",
        "organization": "Lompoc Parks & Recreation",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.cityoflompoc.com/government/departments/parks-recreation",
        "type": "Government",
        "industry": "Government",
        "location": "125 W Walnut Ave, Lompoc, CA 93436",
        "services": [
            "Recreation",
            "Sports",
            "Youth programs",
            "Events"
        ],
        "opportunities": [],
        "notes": "Community recreation and youth programming.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-FIRE",
        "organization": "Lompoc Fire Department",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.cityoflompoc.com/government/departments/fire-department",
        "type": "Public Safety",
        "industry": "Public Safety",
        "location": "115 S G St, Lompoc, CA 93436",
        "services": [
            "Fire service",
            "Emergency response",
            "Public safety"
        ],
        "opportunities": [],
        "notes": "Fire and emergency-services careers.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-POLICE",
        "organization": "Lompoc Police Department",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.cityoflompoc.com/government/departments/police",
        "type": "Public Safety",
        "industry": "Public Safety",
        "location": "107 Civic Center Plaza, Lompoc, CA 93436",
        "services": [
            "Law enforcement",
            "Dispatch",
            "Community service",
            "Public safety"
        ],
        "opportunities": [],
        "notes": "Police and public-safety careers.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-LVMC",
        "organization": "Lompoc Valley Medical Center",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://lompocvmc.com/",
        "type": "Business",
        "industry": "Healthcare",
        "location": "1515 E Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Nursing",
            "Medical assisting",
            "Administration",
            "Facilities",
            "Nutrition"
        ],
        "opportunities": [],
        "notes": "Hospital and healthcare career exploration.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-LOMPOC-HC",
        "organization": "Lompoc Health Care Center",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.countyofsb.org/732/Lompoc-Health-Care-Center",
        "type": "Business",
        "industry": "Healthcare",
        "location": "301 N R St, Lompoc, CA 93436",
        "services": [
            "Public health",
            "Nursing",
            "Medical services",
            "Administration"
        ],
        "opportunities": [],
        "notes": "County health services.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-SHELTER",
        "organization": "Lompoc Animal Shelter",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.countyofsb.org/845/Animal-Services",
        "type": "Business",
        "industry": "Animals",
        "location": "1501 W Central Ave, Lompoc, CA 93436",
        "services": [
            "Animal care",
            "Veterinary support",
            "Public service"
        ],
        "opportunities": [],
        "notes": "Animal care and shelter services.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-CHAMBER",
        "organization": "Lompoc Valley Chamber of Commerce",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://lompoc.com/",
        "type": "Business",
        "industry": "Business Services",
        "location": "111 S I St, Lompoc, CA 93436",
        "services": [
            "Business",
            "Marketing",
            "Events",
            "Community development"
        ],
        "opportunities": [],
        "notes": "Local business and community organization.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-WINEFACTORY",
        "organization": "Lompoc Wine Factory",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/lompoc-wine-factory/",
        "type": "Business",
        "industry": "Manufacturing",
        "location": "321 N D St, Lompoc, CA 93436",
        "services": [
            "Winemaking",
            "Production",
            "Warehousing",
            "Hospitality"
        ],
        "opportunities": [],
        "notes": "Wine production and storage.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-PALI",
        "organization": "Pali Wine Co. / Tower 15",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/pali-wine-company/",
        "type": "Business",
        "industry": "Manufacturing",
        "location": "1036 W Aviation Dr, Lompoc, CA 93436",
        "services": [
            "Winemaking",
            "Production",
            "Hospitality",
            "Sales"
        ],
        "opportunities": [],
        "notes": "Wine production and tasting.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-JAEL",
        "organization": "Jael & Jabez Salon and Spa",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/jael-jabez-salon-and-spa/",
        "type": "Business",
        "industry": "Beauty & Wellness",
        "location": "437 N H St, Lompoc, CA 93436",
        "services": [
            "Cosmetology",
            "Massage",
            "Customer service",
            "Small business"
        ],
        "opportunities": [],
        "notes": "Salon and spa services.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-GROCERY",
        "organization": "Grocery Outlet",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.groceryoutlet.com/circulars/storeid/214",
        "type": "Business",
        "industry": "Markets",
        "location": "316 E Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Retail",
            "Inventory",
            "Food",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Discount grocery retail.",
        "source": "Lompoc starter directory",
        "category": "markets",
        "subcategory": "Markets"
    },
    {
        "id": "LOM-VONS",
        "organization": "Vons",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://local.vons.com/vons/ca/lompoc/729-n-h-st.html",
        "type": "Business",
        "industry": "Markets",
        "location": "729 N H St, Lompoc, CA 93436",
        "services": [
            "Grocery",
            "Bakery",
            "Pharmacy",
            "Customer service",
            "Management"
        ],
        "opportunities": [],
        "notes": "Grocery and pharmacy careers.",
        "source": "Lompoc starter directory",
        "category": "markets",
        "subcategory": "Markets"
    },
    {
        "id": "LOM-ALBERTSONS",
        "organization": "Albertsons",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://local.albertsons.com/albertsons/ca/lompoc.html",
        "type": "Business",
        "industry": "Markets",
        "location": "1500 N H St, Lompoc, CA 93436",
        "services": [
            "Grocery",
            "Bakery",
            "Pharmacy",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Grocery retail.",
        "source": "Lompoc starter directory",
        "category": "markets",
        "subcategory": "Markets"
    },
    {
        "id": "LOM-CVS",
        "organization": "CVS Pharmacy",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.cvs.com/store-locator/lompoc-ca-pharmacies/1317-n-h-st-lompoc-ca-93436/storeid=9876",
        "type": "Business",
        "industry": "Retail",
        "location": "1317 N H St, Lompoc, CA 93436",
        "services": [
            "Pharmacy",
            "Retail",
            "Customer service",
            "Healthcare"
        ],
        "opportunities": [],
        "notes": "Pharmacy and retail careers.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-AUTOZONE",
        "organization": "AutoZone",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.autozone.com/locations/ca/lompoc.html",
        "type": "Business",
        "industry": "Automotive",
        "location": "701 N H St, Lompoc, CA 93436",
        "services": [
            "Auto parts",
            "Sales",
            "Inventory",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Automotive parts retail.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-OReilly",
        "organization": "O'Reilly Auto Parts",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://locations.oreillyauto.com/ca/lompoc/",
        "type": "Business",
        "industry": "Automotive",
        "location": "511 W Central Ave, Lompoc, CA 93436",
        "services": [
            "Auto parts",
            "Sales",
            "Inventory",
            "Delivery"
        ],
        "opportunities": [],
        "notes": "Automotive parts and service support.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-HOMEDEPOT",
        "organization": "The Home Depot",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.homedepot.com/l/Lompoc/CA/Lompoc/93436/6623",
        "type": "Business",
        "industry": "Trades & Home Services",
        "location": "1701 E Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Construction",
            "Tools",
            "Electrical",
            "Plumbing",
            "Retail"
        ],
        "opportunities": [],
        "notes": "Home improvement and skilled-trade products.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-TRACTOR",
        "organization": "Tractor Supply Co.",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.tractorsupply.com/tsc/store_Lompoc-CA-93436_2037",
        "type": "Business",
        "industry": "Retail",
        "location": "1700 N H St, Lompoc, CA 93436",
        "services": [
            "Agriculture",
            "Animals",
            "Tools",
            "Retail",
            "Inventory"
        ],
        "opportunities": [],
        "notes": "Farm, ranch, pet, and tool retail.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-YMCA",
        "organization": "Lompoc Family YMCA",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.ciymca.org/locations/lompoc-family-ymca",
        "type": "Business",
        "industry": "Fitness & Youth",
        "location": "201 W College Ave, Lompoc, CA 93436",
        "services": [
            "Fitness",
            "Youth programs",
            "Aquatics",
            "Community service"
        ],
        "opportunities": [],
        "notes": "Youth, fitness, and community programming.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-COLLEGE",
        "organization": "Allan Hancock College — Lompoc Valley Center",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.hancockcollege.edu/about/campuses/lvc.php",
        "type": "Education",
        "industry": "Education & Training",
        "location": "1 Hancock Dr, Lompoc, CA 93436",
        "services": [
            "College programs",
            "Career and technical education",
            "Certificates and degrees",
            "Student services",
            "Career pathways",
            "Technical training"
        ],
        "opportunities": [],
        "notes": "Local Allan Hancock College campus with academic, certificate, and career-technical pathways. Use the College Pathways section in Momentum for the detailed program explorer.",
        "source": "Official Allan Hancock College Lompoc Valley Center and pathways pages; reviewed 2026-08",
        "category": "education",
        "subcategory": "Colleges & Career Training",
        "careerFields": [
            "College pathways",
            "Skilled trades",
            "Healthcare",
            "Business",
            "Public safety",
            "Arts and technology"
        ],
        "studentSupport": [
            "Local college exploration",
            "Career-program research",
            "Enrollment and student-services inquiry"
        ]
    },
    {
        "id": "LOM-COLT",
        "organization": "City of Lompoc Transit",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.cityoflompoc.com/government/departments/public-works/transit",
        "type": "Business",
        "industry": "Transportation",
        "location": "1300 W Laurel Ave, Lompoc, CA 93436",
        "services": [
            "Transportation",
            "Driving",
            "Customer service",
            "Maintenance"
        ],
        "opportunities": [],
        "notes": "Public transportation services.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-CABS",
        "organization": "Lompoc Taxi",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/cabs/",
        "type": "Business",
        "industry": "Transportation",
        "location": "Lompoc, CA 93436",
        "services": [
            "Transportation",
            "Customer service",
            "Dispatch"
        ],
        "opportunities": [],
        "notes": "Local taxi service.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-CHAPTER2",
        "organization": "Chapter Two Bookstore",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/the-book-store/",
        "type": "Business",
        "industry": "Arts & Culture",
        "location": "Lompoc, CA",
        "services": [
            "Books",
            "Retail",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Independent bookstore and community retail.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-FATTES",
        "organization": "Fatte's Pizza",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/casual-eats/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Food preparation",
            "Delivery",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Local pizza restaurant.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-MAMAS",
        "organization": "Mama's Caffè",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/labotteitalianrestaurant/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Coffee",
            "Food service",
            "Hospitality"
        ],
        "opportunities": [],
        "notes": "Family-operated café and restaurant.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-SASSAFRASS",
        "organization": "Sassafrass",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/casual-eats/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Food service",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Local casual dining business.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-PIZZA",
        "organization": "Lompoc Pizza",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/casual-eats/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Food preparation",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Local pizza business.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-APPLEBEES",
        "organization": "Applebee's",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/restaurants/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "621 W Central Ave, Lompoc, CA 93436",
        "services": [
            "Food service",
            "Cooking",
            "Management"
        ],
        "opportunities": [],
        "notes": "Full-service restaurant.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-BURRITOSLALO",
        "organization": "Burritos Lalo",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/restaurants/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Cooking",
            "Food preparation",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Family-operated Mexican restaurant.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-DONGHAE",
        "organization": "Dong Hae Sushi",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/restaurants/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Food preparation",
            "Restaurant service"
        ],
        "opportunities": [],
        "notes": "Japanese restaurant.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-MIAMORE",
        "organization": "Mi Amore Pizza and Pasta",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/restaurants/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Cooking",
            "Food service",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Family-owned Italian restaurant.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-LAMICHOACANA",
        "organization": "Tacos y Mariscos La Michoacana",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/restaurants/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Cooking",
            "Food preparation"
        ],
        "opportunities": [],
        "notes": "Family-operated Mexican restaurant.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-SWEETBAKING",
        "organization": "Sweet Baking Co.",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/blog/top-places-to-satisfy-your-sweet-tooth-in-lompoc/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Baking",
            "Cake decorating",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Local bakery and custom cakery.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-ONEROOM",
        "organization": "One Room Coffee Shop",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.oneroomcoffee.com/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Coffee",
            "Baking",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Local coffee shop.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-SISSYS",
        "organization": "Sissy's Uptown Café",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/blog/5-family-owned-restaurants-in-lompoc-that-locals-love/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Food service",
            "Baking",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Family-owned café.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-LABOTTE",
        "organization": "La Botte Italian Ristorante",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/labotteitalianrestaurant/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Cooking",
            "Hospitality",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Family-operated Italian restaurant.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-OCAIRNS",
        "organization": "O'Cairns Bistro",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/breakfast/",
        "type": "Business",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Food service",
            "Cooking",
            "Hospitality"
        ],
        "opportunities": [],
        "notes": "Breakfast, lunch, and dinner restaurant.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-FUTURE",
        "organization": "FUTURE for Lompoc Youth",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.futureforlompocyouth.org/",
        "type": "Nonprofit",
        "industry": "Youth & Community",
        "location": "Lompoc, CA",
        "services": [
            "Youth programs",
            "Career readiness",
            "Customer service training",
            "Mentoring"
        ],
        "opportunities": [],
        "notes": "Youth development and career-readiness programs.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-PARTNERSCARING",
        "organization": "Community Partners in Caring",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://partnersincaring.org/",
        "type": "Nonprofit",
        "industry": "Senior & Community Services",
        "location": "Lompoc, CA",
        "services": [
            "Volunteer service",
            "Senior support",
            "Transportation",
            "Community care"
        ],
        "opportunities": [],
        "notes": "Volunteer-supported services for older adults and adults with disabilities.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-FSA",
        "organization": "Family Service Agency — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://fsacares.org/",
        "type": "Nonprofit",
        "industry": "Family & Community Services",
        "location": "Lompoc, CA",
        "services": [
            "Family support",
            "Counseling",
            "Youth services",
            "Community programs"
        ],
        "opportunities": [],
        "notes": "Family and community support services.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-GOODWILL",
        "organization": "Goodwill Industries",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.goodwillsocal.org/",
        "type": "Nonprofit",
        "industry": "Retail",
        "location": "Lompoc, CA",
        "services": [
            "Retail",
            "Job training",
            "Donations",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Thrift retail and workforce-development organization.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-UNITEDBOYS",
        "organization": "United Boys & Girls Clubs — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://unitedbg.org/",
        "type": "Nonprofit",
        "industry": "Youth & Community",
        "location": "Lompoc, CA",
        "services": [
            "Youth programs",
            "Tutoring",
            "Recreation",
            "Mentoring"
        ],
        "opportunities": [],
        "notes": "Youth development, recreation, and learning programs.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-LOMPOCPRIDE",
        "organization": "Lompoc Valley Pride Association",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.lompocvalleypride.com/",
        "type": "Nonprofit",
        "industry": "Arts & Community",
        "location": "Lompoc, CA",
        "services": [
            "Events",
            "Community outreach",
            "Advocacy",
            "Volunteer service"
        ],
        "opportunities": [],
        "notes": "Community events and outreach organization.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-EMPTYBOWLS",
        "organization": "Lompoc Empty Bowls",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.facebook.com/LompocEmptyBowls/",
        "type": "Nonprofit",
        "industry": "Food & Drink",
        "location": "Lompoc, CA",
        "services": [
            "Fundraising",
            "Food security",
            "Events",
            "Volunteer service"
        ],
        "opportunities": [],
        "notes": "Community fundraising and food-security support.",
        "source": "Lompoc starter directory",
        "category": "food",
        "subcategory": "Food & Drink"
    },
    {
        "id": "LOM-VILLAGEVET",
        "organization": "Village Veterinary Clinic",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.villagevetlompoc.com/",
        "type": "Business",
        "industry": "Animals",
        "location": "Lompoc, CA",
        "services": [
            "Animal care",
            "Veterinary support",
            "Customer service",
            "Medical records"
        ],
        "opportunities": [],
        "notes": "Veterinary care and animal-health careers.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-DOGGROOM",
        "organization": "Doggie Parlour",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Doggie+Parlour+Lompoc+CA",
        "type": "Business",
        "industry": "Animals",
        "location": "Lompoc, CA",
        "services": [
            "Animal care",
            "Grooming",
            "Customer service",
            "Small business"
        ],
        "opportunities": [],
        "notes": "Pet grooming and animal-care business.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-COUNTYLIB",
        "organization": "Santa Barbara County Library Services",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.countyofsb.org/",
        "type": "Government",
        "industry": "Government",
        "location": "Lompoc, CA",
        "services": [
            "Public service",
            "Records",
            "Community programs",
            "Administration"
        ],
        "opportunities": [],
        "notes": "County government and public-service career areas.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-PUBLICHEALTH",
        "organization": "Santa Barbara County Public Health",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.countyofsb.org/732/Lompoc-Health-Care-Center",
        "type": "Government",
        "industry": "Healthcare",
        "location": "301 N R St, Lompoc, CA 93436",
        "services": [
            "Public health",
            "Nursing",
            "Administration",
            "Community outreach"
        ],
        "opportunities": [],
        "notes": "County public-health services.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-PROBATION",
        "organization": "Santa Barbara County Probation",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.countyofsb.org/230/Probation",
        "type": "Government",
        "industry": "Public Safety",
        "location": "Lompoc, CA",
        "services": [
            "Youth services",
            "Public safety",
            "Case management",
            "Administration"
        ],
        "opportunities": [],
        "notes": "County probation and youth-service careers.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-SUPCOURT",
        "organization": "Santa Barbara County Superior Court — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.sbcourts.org/",
        "type": "Government",
        "industry": "Government",
        "location": "115 Civic Center Plaza, Lompoc, CA 93436",
        "services": [
            "Law",
            "Court operations",
            "Clerical work",
            "Public service"
        ],
        "opportunities": [],
        "notes": "Court and legal-system career exploration.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-USPS",
        "organization": "United States Postal Service — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.usps.com/",
        "type": "Government",
        "industry": "Transportation",
        "location": "801 W Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Mail operations",
            "Logistics",
            "Customer service",
            "Transportation"
        ],
        "opportunities": [],
        "notes": "Postal, logistics, and customer-service careers.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-CALFIRE",
        "organization": "CAL FIRE / Santa Barbara County Fire",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.sbcfire.com/",
        "type": "Government",
        "industry": "Public Safety",
        "location": "Lompoc area",
        "services": [
            "Fire service",
            "Emergency response",
            "Forestry",
            "Public safety"
        ],
        "opportunities": [],
        "notes": "Regional fire and emergency-response careers.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-LUSD",
        "organization": "Lompoc Unified School District",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.lusd.org/",
        "type": "Government",
        "industry": "Education",
        "location": "1301 N A St, Lompoc, CA 93436",
        "services": [
            "Teaching",
            "Technology",
            "Transportation",
            "Food service",
            "Maintenance"
        ],
        "opportunities": [],
        "notes": "School-district careers beyond classroom teaching.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-ADULTED",
        "organization": "Lompoc Adult School",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.lusd.org/",
        "type": "Education",
        "industry": "Education",
        "location": "Lompoc, CA",
        "services": [
            "Adult education",
            "GED preparation",
            "Career training",
            "Student support"
        ],
        "opportunities": [],
        "notes": "Adult education and career preparation.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-DENMAT",
        "organization": "DenMat Holdings",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.denmat.com/",
        "type": "Business",
        "industry": "Manufacturing",
        "location": "1017 W Central Ave, Lompoc, CA 93436",
        "services": [
            "Manufacturing",
            "Dental products",
            "Quality control",
            "Marketing",
            "Shipping"
        ],
        "opportunities": [],
        "notes": "Dental manufacturing and business operations.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-IMERYs",
        "organization": "Imerys",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.imerys.com/",
        "type": "Business",
        "industry": "Manufacturing",
        "location": "Lompoc area",
        "services": [
            "Mining",
            "Engineering",
            "Equipment",
            "Environmental science"
        ],
        "opportunities": [],
        "notes": "Industrial minerals, equipment, and technical careers.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-EXXON",
        "organization": "Energy and Environmental Operations",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.exxonmobil.com/",
        "type": "Business",
        "industry": "Energy & Environment",
        "location": "Lompoc area",
        "services": [
            "Energy",
            "Environmental science",
            "Maintenance",
            "Safety"
        ],
        "opportunities": [],
        "notes": "Energy and environmental career exploration.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-SPACEFORCE",
        "organization": "Vandenberg Space Force Base",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.vandenberg.spaceforce.mil/",
        "type": "Government",
        "industry": "Aerospace",
        "location": "Vandenberg SFB, CA",
        "services": [
            "Aerospace",
            "Cybersecurity",
            "Engineering",
            "Public safety",
            "Logistics"
        ],
        "opportunities": [],
        "notes": "Military and civilian aerospace career areas.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-RGNEXT",
        "organization": "RGNext",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.rgnext.com/",
        "type": "Business",
        "industry": "Aerospace",
        "location": "Vandenberg SFB area",
        "services": [
            "Aerospace",
            "Information technology",
            "Engineering",
            "Mission support"
        ],
        "opportunities": [],
        "notes": "Range operations and technical mission support.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-SPACE-X",
        "organization": "SpaceX — Vandenberg",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.spacex.com/careers/",
        "type": "Business",
        "industry": "Aerospace",
        "location": "Vandenberg SFB area",
        "services": [
            "Aerospace",
            "Engineering",
            "Manufacturing",
            "Operations"
        ],
        "opportunities": [],
        "notes": "Launch, engineering, and operations career exploration.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-COASTHILLS",
        "organization": "CoastHills Credit Union",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.coasthills.coop/",
        "type": "Business",
        "industry": "Finance",
        "location": "1320 N H St, Lompoc, CA 93436",
        "services": [
            "Banking",
            "Customer service",
            "Finance",
            "Marketing"
        ],
        "opportunities": [],
        "notes": "Local credit union and financial-services careers.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-SESCLOCU",
        "organization": "SESLOC Federal Credit Union",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.sesloc.org/",
        "type": "Business",
        "industry": "Finance",
        "location": "Lompoc, CA",
        "services": [
            "Banking",
            "Finance",
            "Customer service",
            "Technology"
        ],
        "opportunities": [],
        "notes": "Credit union and financial-services careers.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-RABOBANK",
        "organization": "Mechanics Bank",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.mechanicsbank.com/",
        "type": "Business",
        "industry": "Finance",
        "location": "Lompoc, CA",
        "services": [
            "Banking",
            "Finance",
            "Customer service",
            "Business services"
        ],
        "opportunities": [],
        "notes": "Banking and financial-services careers.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-EDWARDJONES",
        "organization": "Edward Jones — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.edwardjones.com/us-en/financial-advisor-office/lompoc-ca",
        "type": "Business",
        "industry": "Finance",
        "location": "Lompoc, CA",
        "services": [
            "Financial planning",
            "Customer service",
            "Business",
            "Administration"
        ],
        "opportunities": [],
        "notes": "Financial-advising and office careers.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-EMBASSY",
        "organization": "Embassy Suites by Hilton Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.hilton.com/en/hotels/slolpes-embassy-suites-lompoc-central-coast/",
        "type": "Business",
        "industry": "Hospitality",
        "location": "1117 N H St, Lompoc, CA 93436",
        "services": [
            "Hospitality",
            "Front desk",
            "Housekeeping",
            "Food service",
            "Management"
        ],
        "opportunities": [],
        "notes": "Hotel and hospitality careers.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-OCAIRNINN",
        "organization": "O'Cairns Inn & Suites",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.ocairnsinn.com/",
        "type": "Business",
        "industry": "Hospitality",
        "location": "940 E Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Hospitality",
            "Front desk",
            "Housekeeping",
            "Maintenance"
        ],
        "opportunities": [],
        "notes": "Locally operated hotel.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-HILTON",
        "organization": "Hilton Garden Inn Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.hilton.com/en/hotels/sbplogi-hilton-garden-inn-lompoc/",
        "type": "Business",
        "industry": "Hospitality",
        "location": "1201 N H St, Lompoc, CA 93436",
        "services": [
            "Hospitality",
            "Food service",
            "Front desk",
            "Management"
        ],
        "opportunities": [],
        "notes": "Hotel and hospitality operations.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-TARGET",
        "organization": "Target",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.target.com/sl/lompoc/2760",
        "type": "Business",
        "industry": "Retail",
        "location": "Lompoc, CA",
        "services": [
            "Retail",
            "Inventory",
            "Customer service",
            "Management"
        ],
        "opportunities": [],
        "notes": "Large retail workplace with multiple departments.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-ROSS",
        "organization": "Ross Dress for Less",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.rossstores.com/store-locator/",
        "type": "Business",
        "industry": "Retail",
        "location": "Lompoc, CA",
        "services": [
            "Retail",
            "Inventory",
            "Customer service",
            "Loss prevention"
        ],
        "opportunities": [],
        "notes": "Clothing and home-goods retail.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-MARSHALLS",
        "organization": "Marshalls",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.marshalls.com/us/store/stores/Lompoc-CA-93436/1624/aboutstore",
        "type": "Business",
        "industry": "Retail",
        "location": "Lompoc, CA",
        "services": [
            "Retail",
            "Inventory",
            "Customer service",
            "Merchandising"
        ],
        "opportunities": [],
        "notes": "Clothing and home-goods retail.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-DOLLARTREE",
        "organization": "Dollar Tree",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.dollartree.com/locations/ca/lompoc/",
        "type": "Business",
        "industry": "Retail",
        "location": "Lompoc, CA",
        "services": [
            "Retail",
            "Inventory",
            "Customer service",
            "Management"
        ],
        "opportunities": [],
        "notes": "Discount retail.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-STAPLES",
        "organization": "Staples",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://stores.staples.com/ca/lompoc",
        "type": "Business",
        "industry": "Retail",
        "location": "Lompoc, CA",
        "services": [
            "Retail",
            "Printing",
            "Technology",
            "Customer service"
        ],
        "opportunities": [],
        "notes": "Office supplies, printing, and technology services.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-TMOBILE",
        "organization": "T-Mobile",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.t-mobile.com/stores/locator",
        "type": "Business",
        "industry": "Technology",
        "location": "Lompoc, CA",
        "services": [
            "Technology",
            "Sales",
            "Customer service",
            "Mobile devices"
        ],
        "opportunities": [],
        "notes": "Technology sales and customer service.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-VERIZON",
        "organization": "Verizon Authorized Retailer",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.verizon.com/stores/city/california/lompoc/",
        "type": "Business",
        "industry": "Technology",
        "location": "Lompoc, CA",
        "services": [
            "Technology",
            "Sales",
            "Customer service",
            "Mobile devices"
        ],
        "opportunities": [],
        "notes": "Technology sales and customer service.",
        "source": "Lompoc starter directory"
    },
    {
        "id": "LOM-SOUTHSIDE-COFFEE",
        "organization": "South Side Coffee Co.",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-737-3730",
        "website": "https://explorelompoc.com/directory/southsidecoffeecompanycaf/",
        "type": "Business",
        "category": "food",
        "subcategory": "Food & Drink",
        "industry": "Food & Drink",
        "location": "105 S H St, Lompoc, CA 93436",
        "services": [
            "Coffee and tea",
            "Breakfast and lunch",
            "Customer service",
            "Local art displays",
            "Small business operations"
        ],
        "careerFields": [
            "Hospitality",
            "Culinary arts",
            "Customer service",
            "Marketing",
            "Entrepreneurship"
        ],
        "studentSupport": [
            "Career conversation inquiry",
            "Small-business exploration"
        ],
        "opportunities": [],
        "notes": "Locally operated coffeehouse and café with connections to Lompoc art and community life.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-AMERICAN-HOST",
        "organization": "American Host Restaurant & Catering",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-735-5188",
        "website": "https://explorelompoc.com/directory/americanhostamericandiner/",
        "type": "Business",
        "category": "food",
        "subcategory": "Food & Drink",
        "industry": "Food & Drink",
        "location": "113 N I St, Lompoc, CA 93436",
        "services": [
            "Restaurant service",
            "Catering",
            "Food preparation",
            "Customer service",
            "Event support"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Event planning",
            "Business operations"
        ],
        "studentSupport": [
            "Career conversation inquiry"
        ],
        "opportunities": [],
        "notes": "Longstanding local restaurant and catering business.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-CERTAIN-SPARKS",
        "organization": "Certain Sparks Music",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-588-9479",
        "website": "https://certainsparks.com/",
        "type": "Business",
        "category": "creative",
        "subcategory": "Music, Recording & Education",
        "industry": "Arts & Culture",
        "location": "107 S H St, Lompoc, CA 93436",
        "services": [
            "Music lessons",
            "Music retail",
            "Recording studio",
            "Youth camps",
            "Live events"
        ],
        "careerFields": [
            "Music",
            "Audio production",
            "Teaching",
            "Retail",
            "Event production"
        ],
        "studentSupport": [
            "Creative career exploration",
            "Project partner inquiry"
        ],
        "opportunities": [],
        "notes": "Local music school, store, recording studio, and performance space.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-NEW-LOWS",
        "organization": "New Lows",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/new-lows/",
        "type": "Business",
        "category": "creative",
        "subcategory": "Art, Apparel & Printing",
        "industry": "Arts & Culture",
        "location": "Old Town Lompoc, CA 93436",
        "services": [
            "Art retail",
            "Apparel",
            "Skateboards",
            "Custom screen printing",
            "Community art events"
        ],
        "careerFields": [
            "Graphic design",
            "Screen printing",
            "Fashion",
            "Retail",
            "Entrepreneurship"
        ],
        "studentSupport": [
            "Creative business exploration"
        ],
        "opportunities": [],
        "notes": "Local art, apparel, skateboard, and custom screen-printing business.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-ZELLERS-FARMS",
        "organization": "Zellers Farms",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-757-7906",
        "website": "https://explorelompoc.com/directory/zellers-farms/",
        "type": "Business",
        "category": "trades",
        "subcategory": "Agriculture & Farm Retail",
        "industry": "Agriculture",
        "location": "2050 Sweeney Rd, Lompoc, CA 93436",
        "services": [
            "Local honey",
            "Seasonal fruit",
            "Farm retail",
            "Agriculture"
        ],
        "careerFields": [
            "Agriculture",
            "Food systems",
            "Small business",
            "Sales"
        ],
        "studentSupport": [
            "Agriculture career inquiry"
        ],
        "opportunities": [],
        "notes": "Local farm business offering honey and seasonal fruit.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-TORO-LOCO",
        "organization": "Toro Loco",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/directory/toro-loco/",
        "type": "Business",
        "category": "food",
        "subcategory": "Food & Drink",
        "industry": "Food & Drink",
        "location": "200 E Ocean Ave and 129 W Central Ave, Lompoc, CA 93436",
        "services": [
            "Restaurant service",
            "Food preparation",
            "Customer service",
            "Multi-location operations"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Management",
            "Entrepreneurship"
        ],
        "studentSupport": [
            "Career conversation inquiry"
        ],
        "opportunities": [],
        "notes": "Locally operated Mexican restaurant with multiple Lompoc locations.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-ROCKETTOWN-HONDA",
        "organization": "RocketTown Honda",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-741-2300",
        "website": "https://www.rockettownhonda.com/",
        "type": "Business",
        "category": "auto",
        "subcategory": "Dealerships & Automotive Service",
        "industry": "Automotive",
        "location": "1224 N H St, Lompoc, CA 93436",
        "services": [
            "Vehicle sales",
            "Automotive service",
            "Parts",
            "Finance",
            "Customer service"
        ],
        "careerFields": [
            "Automotive technology",
            "Sales",
            "Finance",
            "Service advising",
            "Business operations"
        ],
        "studentSupport": [
            "Automotive career conversation inquiry"
        ],
        "opportunities": [],
        "notes": "Full-service local Honda dealership with sales, service, and parts departments.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-TOYOTA",
        "organization": "Toyota of Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-1295",
        "website": "https://www.toyotaoflompoc.com/",
        "type": "Business",
        "category": "auto",
        "subcategory": "Dealerships & Automotive Service",
        "industry": "Automotive",
        "location": "203 E Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Vehicle sales",
            "Automotive service",
            "Parts",
            "Finance",
            "Customer care"
        ],
        "careerFields": [
            "Automotive technology",
            "Sales",
            "Finance",
            "Marketing",
            "Management"
        ],
        "studentSupport": [
            "Automotive career conversation inquiry"
        ],
        "opportunities": [],
        "notes": "Local Toyota dealership with sales, finance, parts, and service career areas.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-THEATRE-PROJECT",
        "organization": "Lompoc Theatre Project",
        "contactName": "",
        "contactTitle": "",
        "email": "info@lompoctheatre.org",
        "phone": "",
        "website": "https://lompoctheatre.org/",
        "type": "Nonprofit",
        "category": "creative",
        "subcategory": "Performing Arts & Community Development",
        "industry": "Arts & Culture",
        "location": "238 N H St, Lompoc, CA 93436",
        "services": [
            "Historic theatre restoration",
            "Performing arts",
            "Community events",
            "Fundraising",
            "Volunteer coordination"
        ],
        "careerFields": [
            "Performing arts",
            "Construction",
            "Event production",
            "Marketing",
            "Nonprofit management"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "Creative project partnership"
        ],
        "opportunities": [],
        "notes": "Community nonprofit restoring the historic Lompoc Theatre as an arts and education center.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-RETURN-TO-FREEDOM",
        "organization": "Return to Freedom Wild Horse Conservation",
        "contactName": "",
        "contactTitle": "",
        "email": "volunteers@returntofreedom.org",
        "phone": "805-737-9246",
        "website": "https://returntofreedom.org/",
        "type": "Nonprofit",
        "category": "animals",
        "subcategory": "Animal Sanctuary & Conservation",
        "industry": "Animals & Environment",
        "location": "4115 Jalama Rd, Lompoc, CA 93436",
        "services": [
            "Wild horse sanctuary",
            "Animal care",
            "Conservation education",
            "Advocacy",
            "Volunteer days"
        ],
        "careerFields": [
            "Animal care",
            "Environmental science",
            "Nonprofit work",
            "Education",
            "Communications"
        ],
        "studentSupport": [
            "Volunteer program",
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Wild horse and burro sanctuary with recurring public volunteer days in Lompoc.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-FEEDING-LOMPOC",
        "organization": "Feeding Lompoc — Lompoc Food Pantry",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.feedinglompoc.org/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Food Access & Community Support",
        "industry": "Food & Community",
        "location": "Lompoc, CA 93436",
        "services": [
            "Food pantry",
            "Food donation pickup",
            "Community assistance",
            "Volunteer coordination"
        ],
        "careerFields": [
            "Community service",
            "Logistics",
            "Food systems",
            "Nonprofit operations"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "Service-learning partner"
        ],
        "opportunities": [],
        "notes": "Local food pantry supporting Lompoc families and coordinating volunteer help.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-FOODBANK-SBC",
        "organization": "Foodbank of Santa Barbara County — North County",
        "contactName": "",
        "contactTitle": "",
        "email": "volunteersb@foodbanksbc.org",
        "phone": "",
        "website": "https://foodbanksbc.org/give-help/volunteer/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Food Access & Nutrition",
        "industry": "Food & Community",
        "location": "North Santa Barbara County, including Lompoc",
        "services": [
            "Food distribution",
            "Nutrition education",
            "Volunteer shifts",
            "Community outreach"
        ],
        "careerFields": [
            "Nutrition",
            "Logistics",
            "Community health",
            "Nonprofit management"
        ],
        "studentSupport": [
            "Volunteer shifts",
            "Service-learning inquiry"
        ],
        "opportunities": [],
        "notes": "Countywide food-access organization with North County volunteer opportunities including Lompoc.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-PRELADO",
        "organization": "Prelado de los Tesoros de La Purísima",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-3606",
        "website": "https://www.lapurisimamission.org/",
        "type": "Nonprofit",
        "category": "creative",
        "subcategory": "History, Preservation & Education",
        "industry": "Arts & Culture",
        "location": "2295 Purisima Rd, Lompoc, CA 93436",
        "services": [
            "Historic preservation",
            "School programs",
            "Docent support",
            "Animal care support",
            "Fundraising"
        ],
        "careerFields": [
            "History",
            "Education",
            "Museum studies",
            "Preservation",
            "Event planning"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "History project partner"
        ],
        "opportunities": [],
        "notes": "Volunteer-operated nonprofit partner supporting programs and preservation at La Purísima Mission.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-LA-PURISIMA",
        "organization": "La Purísima Mission State Historic Park",
        "contactName": "",
        "contactTitle": "",
        "email": "LPM.SpecialEvents@parks.ca.gov",
        "phone": "805-733-3713",
        "website": "https://www.parks.ca.gov/lapurisimamission",
        "type": "Government",
        "category": "government",
        "subcategory": "State Parks, History & Interpretation",
        "industry": "Government & Public Service",
        "location": "2295 Purisima Rd, Lompoc, CA 93436",
        "services": [
            "State park operations",
            "Historic interpretation",
            "Natural resources",
            "Visitor services",
            "Educational programs"
        ],
        "careerFields": [
            "Parks and recreation",
            "History",
            "Environmental science",
            "Education",
            "Public service"
        ],
        "studentSupport": [
            "Interpretive volunteer inquiry",
            "Career visit inquiry"
        ],
        "opportunities": [],
        "notes": "California State Historic Park with interpretation, education, preservation, and volunteer roles.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-HISTORICAL-SOCIETY",
        "organization": "Lompoc Valley Historical Society",
        "contactName": "",
        "contactTitle": "",
        "email": "lompochistory@gmail.com",
        "phone": "805-735-4626",
        "website": "https://lompochistory.org/",
        "type": "Nonprofit",
        "category": "creative",
        "subcategory": "Local History & Archives",
        "industry": "Arts & Culture",
        "location": "207 N L St, Lompoc, CA 93436",
        "services": [
            "Local history",
            "Archives",
            "Museum exhibits",
            "Tours",
            "Volunteer operations"
        ],
        "careerFields": [
            "History",
            "Archives",
            "Museum studies",
            "Education",
            "Research"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "Local-history research partner"
        ],
        "opportunities": [],
        "notes": "Volunteer-run organization preserving and interpreting Lompoc Valley history.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-TEEN-CENTER",
        "organization": "Lompoc Teen Center",
        "contactName": "",
        "contactTitle": "",
        "email": "info@lompocteencenter.org",
        "phone": "805-741-7904",
        "website": "https://www.lompocteencenter.org/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Youth Development & Career Readiness",
        "industry": "Youth & Community",
        "location": "732 N H St, Lompoc, CA 93436",
        "services": [
            "After-school programs",
            "Tutoring",
            "Career readiness",
            "Events",
            "Internship opportunities"
        ],
        "careerFields": [
            "Youth development",
            "Education",
            "Nonprofit work",
            "Event planning",
            "Career services"
        ],
        "studentSupport": [
            "Youth programs",
            "Internship inquiry",
            "Leadership development"
        ],
        "opportunities": [],
        "notes": "Youth-focused center offering academic support, enrichment, college and career readiness, and internship opportunities.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-EXPLORE-LOMPOC",
        "organization": "Explore Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://explorelompoc.com/",
        "type": "Business Organization",
        "category": "hospitality",
        "subcategory": "Tourism, Marketing & Visitor Services",
        "industry": "Hospitality & Tourism",
        "location": "Lompoc, CA 93436",
        "services": [
            "Destination marketing",
            "Local business promotion",
            "Visitor information",
            "Events",
            "Digital content"
        ],
        "careerFields": [
            "Marketing",
            "Tourism",
            "Photography",
            "Writing",
            "Business development"
        ],
        "studentSupport": [
            "Marketing project inquiry",
            "Tourism career exploration"
        ],
        "opportunities": [],
        "notes": "Official tourism and destination-marketing organization for Lompoc.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-FESTIVAL-ASSOC",
        "organization": "Lompoc Valley Festival Association",
        "contactName": "",
        "contactTitle": "",
        "email": "office@lompocvalleyfestivals.com",
        "phone": "805-735-8511",
        "website": "https://www.lompocvalleyfestivals.com/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Festivals, Events & Community Service",
        "industry": "Events & Community",
        "location": "414 W Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Flower Festival",
            "Parade",
            "Community events",
            "Volunteer coordination",
            "Event planning"
        ],
        "careerFields": [
            "Event planning",
            "Hospitality",
            "Marketing",
            "Operations",
            "Community service"
        ],
        "studentSupport": [
            "Event volunteer inquiry",
            "Event-planning exploration"
        ],
        "opportunities": [],
        "notes": "Volunteer-run organization coordinating major Lompoc community festivals and events.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-FLYING-GOAT",
        "organization": "Flying Goat Cellars",
        "contactName": "",
        "contactTitle": "",
        "email": "info@flyinggoatcellars.com",
        "phone": "805-736-9032",
        "website": "https://flyinggoatcellars.com/",
        "type": "Business",
        "category": "trades",
        "subcategory": "Agriculture, Production & Marketing",
        "industry": "Agriculture & Production",
        "location": "1520 E Chestnut Ct, Lompoc, CA 93436",
        "services": [
            "Agricultural production",
            "Bottling and logistics",
            "Marketing",
            "Art exhibits",
            "Customer experience"
        ],
        "careerFields": [
            "Agriculture",
            "Production",
            "Chemistry",
            "Graphic design",
            "Marketing"
        ],
        "studentSupport": [
            "Age-appropriate production career inquiry"
        ],
        "opportunities": [],
        "notes": "Family-owned local producer; student exploration should focus on agriculture, production, design, logistics, and business rather than alcohol service.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-AMPELOS",
        "organization": "Ampelos Cellars",
        "contactName": "",
        "contactTitle": "",
        "email": "rebecca@ampeloscellars.com",
        "phone": "805-736-9957",
        "website": "https://www.ampeloscellars.com/",
        "type": "Business",
        "category": "trades",
        "subcategory": "Sustainable Agriculture & Production",
        "industry": "Agriculture & Production",
        "location": "312 N 9th St, Suite A, Lompoc, CA 93436",
        "services": [
            "Sustainable agriculture",
            "Organic and biodynamic practices",
            "Production",
            "Marketing",
            "Hospitality operations"
        ],
        "careerFields": [
            "Agriculture",
            "Environmental science",
            "Production",
            "Business",
            "Marketing"
        ],
        "studentSupport": [
            "Age-appropriate sustainability career inquiry"
        ],
        "opportunities": [],
        "notes": "Local sustainable, organic, and biodynamic vineyard and production business; youth exploration should avoid alcohol-service roles.",
        "source": "Momentum Lompoc directory v23.1.0"
    },
    {
        "id": "LOM-CYPRESS-ART",
        "organization": "Lompoc Valley Art Association / Cypress Gallery",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-737-1129",
        "website": "https://lompocart.org/",
        "type": "Nonprofit",
        "category": "creative",
        "subcategory": "Visual Arts & Galleries",
        "industry": "Arts & Culture",
        "location": "119 E Cypress Ave, Lompoc, CA 93436",
        "services": [
            "Gallery operations",
            "Local artist exhibitions",
            "Ceramics",
            "Photography",
            "Jewelry and gift sales"
        ],
        "careerFields": [
            "Visual arts",
            "Gallery management",
            "Photography",
            "Ceramics",
            "Arts marketing"
        ],
        "studentSupport": [
            "Artist conversation inquiry",
            "Gallery or exhibit exploration"
        ],
        "opportunities": [],
        "notes": "Local nonprofit gallery operated by artists; strong fit for creative career exploration.",
        "source": "Official organization website; reviewed 2026-08"
    },
    {
        "id": "LOM-MASTER-CHORALE",
        "organization": "Lompoc Valley Master Chorale",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-735-5161",
        "website": "https://www.lvmasterchorale.org/",
        "type": "Nonprofit",
        "category": "creative",
        "subcategory": "Music & Performing Arts",
        "industry": "Arts & Culture",
        "location": "P.O. Box 24, Lompoc, CA 93438",
        "services": [
            "Choral music",
            "Concert production",
            "Community performances"
        ],
        "careerFields": [
            "Music performance",
            "Conducting",
            "Arts administration",
            "Event production"
        ],
        "studentSupport": [
            "Rehearsal observation inquiry",
            "Arts leadership conversation"
        ],
        "opportunities": [],
        "notes": "Community chorale and performing-arts organization.",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-MURAL-COALITION",
        "organization": "Lompoc Mural and Public Arts Coalition",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://members.lompoc.com/list/member/lompoc-mural-and-public-arts-coalition-1901",
        "type": "Nonprofit",
        "category": "creative",
        "subcategory": "Public Art & Murals",
        "industry": "Arts & Culture",
        "location": "1201-J E Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Public art",
            "Murals",
            "Community beautification",
            "Arts advocacy"
        ],
        "careerFields": [
            "Mural arts",
            "Public art planning",
            "Community engagement",
            "Project management"
        ],
        "studentSupport": [
            "Public-art project inquiry",
            "Artist interview inquiry"
        ],
        "opportunities": [],
        "notes": "Potential connection for mural, design, and civic-art projects.",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-CONCERT-ASSOC",
        "organization": "Lompoc Concert Association",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-588-5971",
        "website": "https://www.lompocconcert.org/",
        "type": "Nonprofit",
        "category": "creative",
        "subcategory": "Music & Performing Arts",
        "industry": "Arts & Culture",
        "location": "Lompoc, CA 93436",
        "services": [
            "Live concerts",
            "Artist booking",
            "Event production",
            "Volunteer coordination"
        ],
        "careerFields": [
            "Music",
            "Event production",
            "Marketing",
            "Nonprofit management"
        ],
        "studentSupport": [
            "Event volunteer inquiry",
            "Behind-the-scenes career conversation"
        ],
        "opportunities": [],
        "notes": "All-volunteer community concert association.",
        "source": "Official organization website; reviewed 2026-08"
    },
    {
        "id": "LOM-POPS-ORCHESTRA",
        "organization": "Lompoc Pops Orchestra",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-735-6463",
        "website": "http://www.lompocpopsorchestra.com/",
        "type": "Nonprofit",
        "category": "creative",
        "subcategory": "Music & Performing Arts",
        "industry": "Arts & Culture",
        "location": "P.O. Box 1372, Lompoc, CA 93438",
        "services": [
            "Orchestra performances",
            "Concert production",
            "Community music"
        ],
        "careerFields": [
            "Instrumental music",
            "Conducting",
            "Stage production",
            "Arts administration"
        ],
        "studentSupport": [
            "Rehearsal or musician interview inquiry"
        ],
        "opportunities": [],
        "notes": "Professional and community orchestra based in the Lompoc Valley.",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-CIVIC-THEATRE",
        "organization": "Lompoc Civic Theatre",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-735-2281",
        "website": "https://www.lompoccivictheatre.com/",
        "type": "Nonprofit",
        "category": "creative",
        "subcategory": "Theatre & Production",
        "industry": "Arts & Culture",
        "location": "P.O. Box 69, Lompoc, CA 93438",
        "services": [
            "Community theatre",
            "Acting",
            "Stagecraft",
            "Production support"
        ],
        "careerFields": [
            "Acting",
            "Directing",
            "Costume design",
            "Lighting",
            "Set construction"
        ],
        "studentSupport": [
            "Production volunteer inquiry",
            "Theatre career conversation"
        ],
        "opportunities": [],
        "notes": "Community theatre with creative and technical pathways.",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-GARCIA-DANCE",
        "organization": "Garcia Dance Studio",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-717-9273",
        "website": "",
        "type": "Business",
        "category": "creative",
        "subcategory": "Dance & Movement",
        "industry": "Arts & Culture",
        "location": "1006 N H St, Lompoc, CA 93436",
        "services": [
            "Dance instruction",
            "Performance",
            "Youth arts"
        ],
        "careerFields": [
            "Dance",
            "Teaching",
            "Choreography",
            "Small business"
        ],
        "studentSupport": [
            "Dance-teaching career inquiry"
        ],
        "opportunities": [],
        "notes": "Local dance studio listed by the Lompoc Valley Chamber.",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-MEDIA-CENTER",
        "organization": "Lompoc Media Center / KPEG 100.9",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-875-2750",
        "website": "https://www.cityoflompoc.com/community/information/media-center",
        "type": "Government",
        "category": "creative",
        "subcategory": "Broadcasting & Media",
        "industry": "Media",
        "location": "125 W Walnut Ave, Lompoc, CA 93436",
        "services": [
            "Community television",
            "FM radio",
            "Video production",
            "Public access media"
        ],
        "careerFields": [
            "Broadcasting",
            "Audio production",
            "Video editing",
            "Journalism",
            "Public communication"
        ],
        "studentSupport": [
            "Studio tour inquiry",
            "Media-production career conversation"
        ],
        "opportunities": [],
        "notes": "City media center operating community television and radio services.",
        "source": "City of Lompoc official website; reviewed 2026-08"
    },
    {
        "id": "LOM-LOMPOC-RECORD",
        "organization": "Lompoc Record",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.lompocrecord.com/",
        "type": "Business",
        "category": "creative",
        "subcategory": "News & Journalism",
        "industry": "Media",
        "location": "Lompoc, CA 93436",
        "services": [
            "Local news",
            "Photography",
            "Advertising",
            "Digital publishing"
        ],
        "careerFields": [
            "Journalism",
            "Photography",
            "Editing",
            "Advertising",
            "Web publishing"
        ],
        "studentSupport": [
            "Reporter or editor interview inquiry"
        ],
        "opportunities": [],
        "notes": "Local news publication serving the Lompoc Valley.",
        "source": "Official organization website; reviewed 2026-08"
    },
    {
        "id": "LOM-LIBRARY-FOUNDATION",
        "organization": "Lompoc District Libraries Foundation",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.cityoflompoc.com/government/departments/library/how-you-can-help",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Libraries & Literacy",
        "industry": "Education",
        "location": "501 E North Ave, Lompoc, CA 93436",
        "services": [
            "Library support",
            "Literacy",
            "Fundraising",
            "Bookmobile support"
        ],
        "careerFields": [
            "Library science",
            "Nonprofit management",
            "Fundraising",
            "Community outreach"
        ],
        "studentSupport": [
            "Library-support volunteer inquiry"
        ],
        "opportunities": [],
        "notes": "Supports libraries in Lompoc and Vandenberg Village.",
        "source": "City of Lompoc official website; reviewed 2026-08"
    },
    {
        "id": "LOM-805-PLUMBING",
        "organization": "805 Plumbing, Inc.",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-734-7808",
        "website": "",
        "type": "Business",
        "category": "trades",
        "subcategory": "Plumbing",
        "industry": "Construction Trades",
        "location": "Lompoc, CA 93436",
        "services": [
            "Residential plumbing",
            "Commercial plumbing",
            "Repair service"
        ],
        "careerFields": [
            "Plumbing",
            "Construction",
            "Customer service",
            "Small business"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "Potential skilled-trades partner; availability must be confirmed.",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-RARE-ELECTRIC",
        "organization": "RARE Electric",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-0089",
        "website": "",
        "type": "Business",
        "category": "trades",
        "subcategory": "Electrical & Solar",
        "industry": "Construction Trades",
        "location": "432 Commerce Ct, Suite D, Lompoc, CA 93436",
        "services": [
            "Electrical work",
            "Solar installation",
            "Troubleshooting"
        ],
        "careerFields": [
            "Electrical trades",
            "Solar energy",
            "Construction safety",
            "Project estimating"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "Local electrical and solar contractor.",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-TOPLINE-TILE",
        "organization": "Topline Custom Tile & Stone",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-944-8074",
        "website": "",
        "type": "Business",
        "category": "trades",
        "subcategory": "Tile & Stone",
        "industry": "Construction Trades",
        "location": "Lompoc, CA 93436",
        "services": [
            "Tile installation",
            "Stonework",
            "Finish construction"
        ],
        "careerFields": [
            "Tile setting",
            "Design",
            "Construction",
            "Estimating"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "Local tile and stone contractor.",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-RIECK-PLUMBING",
        "organization": "Wm. Rieck Plumbing",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-2337",
        "website": "",
        "type": "Business",
        "category": "trades",
        "subcategory": "Plumbing",
        "industry": "Construction Trades",
        "location": "801 E Chestnut Ave, Lompoc, CA 93436",
        "services": [
            "Plumbing",
            "Repair",
            "Installation",
            "Customer service"
        ],
        "careerFields": [
            "Plumbing",
            "Construction",
            "Maintenance",
            "Business operations"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-UNIVERSAL-ELECTRIC",
        "organization": "Universal Electric",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-351-7681",
        "website": "",
        "type": "Business",
        "category": "trades",
        "subcategory": "Electrical",
        "industry": "Construction Trades",
        "location": "1507 E Chestnut Ave, Lompoc, CA 93436",
        "services": [
            "Electrical installation",
            "Maintenance",
            "Troubleshooting"
        ],
        "careerFields": [
            "Electrical trades",
            "Construction safety",
            "Project management"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-YOUNG-AIR",
        "organization": "Young Air, Inc.",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-618-4206",
        "website": "",
        "type": "Business",
        "category": "trades",
        "subcategory": "Heating & Air Conditioning",
        "industry": "Construction Trades",
        "location": "1528 Calle Miro, Lompoc, CA 93436",
        "services": [
            "HVAC installation",
            "Maintenance",
            "Diagnostics"
        ],
        "careerFields": [
            "HVAC",
            "Mechanical systems",
            "Customer service",
            "Construction"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-VJ-ROCK",
        "organization": "V&J Rock Transport",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-2317",
        "website": "",
        "type": "Business",
        "category": "auto",
        "subcategory": "Transport & Materials",
        "industry": "Transportation",
        "location": "Lompoc, CA 93438",
        "services": [
            "Material transport",
            "Trucking",
            "Construction support"
        ],
        "careerFields": [
            "Commercial driving",
            "Logistics",
            "Heavy equipment",
            "Dispatch"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-MID-COAST-GLASS",
        "organization": "Mid Coast Glass",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-5811",
        "website": "https://members.lompoc.com/list/member/mid-coast-glass-1046",
        "type": "Business",
        "category": "trades",
        "subcategory": "Glass & Glazing",
        "industry": "Construction Trades",
        "location": "913 N H St, Lompoc, CA 93438",
        "services": [
            "Glass products",
            "Installation",
            "Repair",
            "Customer service"
        ],
        "careerFields": [
            "Glazing",
            "Construction",
            "Fabrication",
            "Sales"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-ACCURATE-HVAC",
        "organization": "Accurate Heating & Air Conditioning",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-743-3403",
        "website": "",
        "type": "Business",
        "category": "trades",
        "subcategory": "Heating & Air Conditioning",
        "industry": "Construction Trades",
        "location": "811 E Chestnut Ave, Lompoc, CA 93436",
        "services": [
            "HVAC service",
            "Installation",
            "Diagnostics"
        ],
        "careerFields": [
            "HVAC",
            "Mechanical systems",
            "Electrical basics",
            "Customer service"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-OLIVEIRA-FLOORS",
        "organization": "Oliveira's Fashion Floors",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-2396",
        "website": "",
        "type": "Business",
        "category": "trades",
        "subcategory": "Flooring & Interior Finishes",
        "industry": "Construction Trades",
        "location": "307 W Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Flooring sales",
            "Installation coordination",
            "Interior finishes"
        ],
        "careerFields": [
            "Interior design",
            "Flooring installation",
            "Retail",
            "Estimating"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-MILLER-LANDSCAPING",
        "organization": "Miller Landscaping & Maintenance",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-5299",
        "website": "",
        "type": "Business",
        "category": "trades",
        "subcategory": "Landscaping",
        "industry": "Construction Trades",
        "location": "1321 E Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Landscape maintenance",
            "Outdoor construction",
            "Plant care"
        ],
        "careerFields": [
            "Landscaping",
            "Horticulture",
            "Equipment operation",
            "Small business"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-INKLINGS-PRINTING",
        "organization": "Inklings Printing Co.",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-2737",
        "website": "",
        "type": "Business",
        "category": "creative",
        "subcategory": "Printing & Graphic Production",
        "industry": "Media",
        "location": "403 N G St, Lompoc, CA 93436",
        "services": [
            "Commercial printing",
            "Design production",
            "Customer service"
        ],
        "careerFields": [
            "Graphic design",
            "Printing",
            "Prepress",
            "Sales",
            "Small business"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-REARDON-LOCKSMITH",
        "organization": "Scott Reardon's Locksmith Service",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-734-7259",
        "website": "",
        "type": "Business",
        "category": "trades",
        "subcategory": "Locksmithing & Security",
        "industry": "Skilled Trades",
        "location": "914 N H St, Lompoc, CA 93436",
        "services": [
            "Locksmithing",
            "Security hardware",
            "Mobile service"
        ],
        "careerFields": [
            "Locksmithing",
            "Mechanical systems",
            "Customer service",
            "Entrepreneurship"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-EXCEL-PERSONNEL",
        "organization": "Excel Personnel Services",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-735-6723",
        "website": "https://www.excelpersonnelservices.com/",
        "type": "Business",
        "category": "finance",
        "subcategory": "Staffing & Human Resources",
        "industry": "Business Services",
        "location": "516 N H St, Lompoc, CA 93436",
        "services": [
            "Staffing",
            "Recruiting",
            "Resume support",
            "Employer services"
        ],
        "careerFields": [
            "Human resources",
            "Recruiting",
            "Office administration",
            "Career services"
        ],
        "studentSupport": [
            "Career-readiness conversation inquiry"
        ],
        "opportunities": [],
        "notes": "Local staffing office and career-services connection.",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-BOX-SHOP",
        "organization": "Box Shop",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-735-1567",
        "website": "",
        "type": "Business",
        "category": "retail",
        "subcategory": "Shipping & Logistics",
        "industry": "Business Services",
        "location": "740 N H St, Lompoc, CA 93436",
        "services": [
            "Packing",
            "Shipping",
            "Mail services",
            "Customer service"
        ],
        "careerFields": [
            "Logistics",
            "Retail",
            "Packaging",
            "Customer service"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-BUMATAY",
        "organization": "Bumatay Jewelers",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-4850",
        "website": "",
        "type": "Business",
        "category": "creative",
        "subcategory": "Jewelry & Metalwork",
        "industry": "Retail",
        "location": "111 W Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Jewelry sales",
            "Custom jewelry",
            "Goldsmithing",
            "Repair"
        ],
        "careerFields": [
            "Jewelry design",
            "Metalwork",
            "Retail",
            "Small business"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-SURF-CONNECTION",
        "organization": "Surf Connection",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.surfconnection.net/",
        "type": "Business",
        "category": "retail",
        "subcategory": "Outdoor & Sporting Goods",
        "industry": "Retail",
        "location": "Lompoc, CA 93436",
        "services": [
            "Surf equipment",
            "Apparel",
            "Retail",
            "Local recreation knowledge"
        ],
        "careerFields": [
            "Retail",
            "Outdoor recreation",
            "Marketing",
            "Small business"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Official organization website; reviewed 2026-08"
    },
    {
        "id": "LOM-LOMPOC-FLORIST",
        "organization": "Lompoc Valley Florist & Home Decor",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Lompoc+Valley+Florist+%26+Home+Decor%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "creative",
        "subcategory": "Floral Design",
        "industry": "Retail",
        "location": "322 N H St, Suite A, Lompoc, CA 93436",
        "services": [
            "Floral arrangements",
            "Event design",
            "Retail",
            "Delivery"
        ],
        "careerFields": [
            "Floral design",
            "Event planning",
            "Retail",
            "Entrepreneurship"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-BELLA-FLORIST",
        "organization": "Bella Florist & Gifts",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.bellafloristlompoc.com/",
        "type": "Business",
        "category": "creative",
        "subcategory": "Floral Design",
        "industry": "Retail",
        "location": "133 N I St, Lompoc, CA 93436",
        "services": [
            "Floral arrangements",
            "Gift retail",
            "Event support"
        ],
        "careerFields": [
            "Floral design",
            "Retail",
            "Customer service",
            "Small business"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-ASSISTED-HOME",
        "organization": "Assisted Home Health & Hospice",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-688-5222",
        "website": "https://www.assistedcares.com/",
        "type": "Healthcare",
        "category": "health",
        "subcategory": "Home Health & Hospice",
        "industry": "Healthcare",
        "location": "604 E Ocean Ave, Suite H, Lompoc, CA 93436",
        "services": [
            "Home health",
            "Hospice care",
            "Caregiver services"
        ],
        "careerFields": [
            "Nursing",
            "Home health",
            "Social work",
            "Healthcare administration"
        ],
        "studentSupport": [
            "Healthcare career conversation inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-CHC",
        "organization": "Community Health Centers — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-737-1169",
        "website": "https://www.communityhealthcenters.org/",
        "type": "Healthcare",
        "category": "health",
        "subcategory": "Community Health Clinic",
        "industry": "Healthcare",
        "location": "425 W Central Ave, Suite 201, Lompoc, CA 93436",
        "services": [
            "Primary care",
            "Community health",
            "Patient services"
        ],
        "careerFields": [
            "Medicine",
            "Nursing",
            "Medical assisting",
            "Public health",
            "Clinic administration"
        ],
        "studentSupport": [
            "Health-career exploration inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-TRANSITIONS",
        "organization": "Transitions-Mental Health Association — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.tmha.org/",
        "type": "Nonprofit",
        "category": "health",
        "subcategory": "Mental Health Services",
        "industry": "Healthcare",
        "location": "Lompoc service area",
        "services": [
            "Mental health support",
            "Housing support",
            "Community wellness"
        ],
        "careerFields": [
            "Behavioral health",
            "Social work",
            "Peer support",
            "Nonprofit services"
        ],
        "studentSupport": [
            "Behavioral-health career conversation inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-LVCHO",
        "organization": "Lompoc Valley Community Healthcare Organization",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-4509",
        "website": "https://members.lompoc.com/list/member/lompoc-valley-community-healthcare-organization-958",
        "type": "Nonprofit",
        "category": "health",
        "subcategory": "Community Health Planning",
        "industry": "Healthcare",
        "location": "1593 E Chestnut Ave, Lompoc, CA 93436",
        "services": [
            "Community health forums",
            "Health education",
            "Local collaboration"
        ],
        "careerFields": [
            "Public health",
            "Community organizing",
            "Healthcare policy",
            "Nonprofit management"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-VALLEY-MEDICAL-GROUP",
        "organization": "Valley Medical Group",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-1253",
        "website": "",
        "type": "Healthcare",
        "category": "health",
        "subcategory": "Medical Practice",
        "industry": "Healthcare",
        "location": "136 N Third St, Lompoc, CA 93436",
        "services": [
            "Medical care",
            "Patient services",
            "Office administration"
        ],
        "careerFields": [
            "Medicine",
            "Medical assisting",
            "Healthcare administration",
            "Patient service"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-GOOD-SAM-BRIDGEHOUSE",
        "organization": "Good Samaritan Shelter / Bridgehouse",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-735-4390",
        "website": "https://goodsamaritanshelter.org/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Housing & Human Services",
        "industry": "Community Services",
        "location": "2025 Sweeney Rd, Lompoc, CA 93436",
        "services": [
            "Emergency shelter",
            "Housing support",
            "Case management",
            "Community outreach"
        ],
        "careerFields": [
            "Social work",
            "Human services",
            "Nonprofit operations",
            "Case management"
        ],
        "studentSupport": [
            "Volunteer or human-services inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-NCRCCPC",
        "organization": "North County Rape Crisis & Child Protection Center",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-8535",
        "website": "https://sbstesa.org/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Crisis Support & Prevention",
        "industry": "Community Services",
        "location": "511 E Ocean Ave, Lompoc, CA 93438",
        "services": [
            "Crisis intervention",
            "Prevention education",
            "Advocacy"
        ],
        "careerFields": [
            "Social work",
            "Counseling",
            "Public education",
            "Advocacy"
        ],
        "studentSupport": [
            "Age-appropriate prevention-education inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-SKILLED-NURSING",
        "organization": "Lompoc Skilled Nursing & Rehabilitation Center",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-735-4010",
        "website": "",
        "type": "Healthcare",
        "category": "health",
        "subcategory": "Skilled Nursing & Rehabilitation",
        "industry": "Healthcare",
        "location": "1428 W North Ave, Lompoc, CA 93436",
        "services": [
            "Skilled nursing",
            "Rehabilitation",
            "Resident support"
        ],
        "careerFields": [
            "Nursing",
            "Physical therapy",
            "Occupational therapy",
            "Healthcare administration"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-CHIROPRACTIC",
        "organization": "Chiropractic Health Center",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-735-7763",
        "website": "",
        "type": "Healthcare",
        "category": "health",
        "subcategory": "Chiropractic Care",
        "industry": "Healthcare",
        "location": "133 N G St, Lompoc, CA 93436",
        "services": [
            "Chiropractic care",
            "Patient service",
            "Wellness"
        ],
        "careerFields": [
            "Chiropractic",
            "Healthcare administration",
            "Patient service"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-COMMUNIFY",
        "organization": "CommUnify — Lompoc Services",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-964-8857",
        "website": "https://www.communifysb.org/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Family & Community Services",
        "industry": "Community Services",
        "location": "Lompoc service area",
        "services": [
            "Family services",
            "Senior services",
            "Youth support",
            "Community assistance"
        ],
        "careerFields": [
            "Human services",
            "Social work",
            "Community outreach",
            "Program administration"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-UNITED-WAY-NORTH",
        "organization": "Northern Santa Barbara County United Way",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-922-0329",
        "website": "https://www.liveunitedsbc.org/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Community Impact & Fundraising",
        "industry": "Community Services",
        "location": "North Santa Barbara County",
        "services": [
            "Community programs",
            "Fundraising",
            "Volunteer coordination"
        ],
        "careerFields": [
            "Nonprofit management",
            "Fundraising",
            "Community outreach",
            "Marketing"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-ROTARY",
        "organization": "Lompoc Rotary Club",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.lompocrotary.com/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Civic Service",
        "industry": "Community Services",
        "location": "Lompoc, CA 93436",
        "services": [
            "Community service",
            "Scholarships",
            "Local projects",
            "Networking"
        ],
        "careerFields": [
            "Civic leadership",
            "Fundraising",
            "Event planning",
            "Community service"
        ],
        "studentSupport": [
            "Service-project inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-LHS-ALUMNI",
        "organization": "Lompoc High School Alumni Association",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-448-4295",
        "website": "",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Education Support",
        "industry": "Education",
        "location": "P.O. Box 1146, Lompoc, CA 93438",
        "services": [
            "Alumni engagement",
            "Scholarships",
            "School support"
        ],
        "careerFields": [
            "Nonprofit management",
            "Event planning",
            "Fundraising",
            "Education"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-PLACE-GRACE",
        "organization": "Place of Grace",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-736-9826",
        "website": "",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Community & Faith-Based Service",
        "industry": "Community Services",
        "location": "816 N C St, Lompoc, CA 93436",
        "services": [
            "Community gatherings",
            "Service",
            "Volunteer coordination"
        ],
        "careerFields": [
            "Community outreach",
            "Event support",
            "Nonprofit service"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-MICAH-MISSION",
        "organization": "Micah Mission Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-260-6724",
        "website": "https://www.micahmission.org/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Homeless Outreach",
        "industry": "Community Services",
        "location": "209 S Third St, Lompoc, CA 93436",
        "services": [
            "Street outreach",
            "Basic needs support",
            "Community service"
        ],
        "careerFields": [
            "Human services",
            "Outreach",
            "Volunteer coordination",
            "Nonprofit work"
        ],
        "studentSupport": [
            "Volunteer inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Lompoc Valley Chamber member directory; reviewed 2026-08"
    },
    {
        "id": "LOM-PEOPLES-SELF-HELP",
        "organization": "People's Self-Help Housing — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.pshhc.org/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Affordable Housing",
        "industry": "Community Services",
        "location": "Lompoc service area",
        "services": [
            "Affordable housing",
            "Resident services",
            "Property management",
            "Community development"
        ],
        "careerFields": [
            "Housing services",
            "Construction",
            "Property management",
            "Social services"
        ],
        "studentSupport": [
            "Potential partner inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Official organization website; reviewed 2026-08"
    },
    {
        "id": "LOM-SHP-NORTH",
        "organization": "Sleep in Heavenly Peace — Santa Barbara County North",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://shpbeds.org/chapter/ca-santa-barbara-county-n/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Youth & Volunteer Service",
        "industry": "Community Services",
        "location": "North Santa Barbara County",
        "services": [
            "Bed building",
            "Delivery",
            "Youth support",
            "Volunteer service"
        ],
        "careerFields": [
            "Carpentry",
            "Logistics",
            "Volunteer coordination",
            "Nonprofit operations"
        ],
        "studentSupport": [
            "Bed-build volunteer inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Official organization website; reviewed 2026-08"
    },
    {
        "id": "LOM-AQUATIC",
        "organization": "Lompoc Aquatic Center",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-875-2782",
        "website": "https://www.cityoflompoc.com/government/departments/parks-recreation/lompoc-aquatic-center",
        "type": "Government",
        "category": "wellness",
        "subcategory": "Aquatics & Recreation",
        "industry": "Recreation",
        "location": "207 W College Ave, Lompoc, CA 93436",
        "services": [
            "Aquatics",
            "Swim instruction",
            "Lifeguarding",
            "Facility operations"
        ],
        "careerFields": [
            "Lifeguarding",
            "Recreation",
            "Coaching",
            "Facility management"
        ],
        "studentSupport": [
            "Career and certification inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "City of Lompoc official website; reviewed 2026-08"
    },
    {
        "id": "LOM-AIRPORT",
        "organization": "Lompoc Airport",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-875-8268",
        "website": "https://www.cityoflompoc.com/government/departments/public-works/transportation/lompoc-airport",
        "type": "Government",
        "category": "auto",
        "subcategory": "Aviation & Airport Operations",
        "industry": "Transportation",
        "location": "1801 N H St, Lompoc, CA 93436",
        "services": [
            "Airport operations",
            "Aviation",
            "Transportation infrastructure"
        ],
        "careerFields": [
            "Aviation",
            "Airport management",
            "Maintenance",
            "Public works"
        ],
        "studentSupport": [
            "Aviation career conversation inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "City of Lompoc official website; reviewed 2026-08"
    },
    {
        "id": "LOM-DICK-DEWEES",
        "organization": "Dick DeWees Community & Senior Center",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-875-8090",
        "website": "https://www.cityoflompoc.com/home/components/facilitydirectory/facilitydirectory/109/242",
        "type": "Government",
        "category": "nonprofit",
        "subcategory": "Community & Senior Programs",
        "industry": "Community Services",
        "location": "1120 W Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Senior programs",
            "Community events",
            "Facility operations"
        ],
        "careerFields": [
            "Recreation",
            "Event management",
            "Human services",
            "Facility operations"
        ],
        "studentSupport": [
            "Community-event volunteer inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "City of Lompoc official website; reviewed 2026-08"
    },
    {
        "id": "LOM-YOUTH-LEADERSHIP",
        "organization": "Youth Leadership Lompoc Valley",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://lompoc.com/about-us/youth-leadership-lompoc-valley/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Youth Leadership",
        "industry": "Education",
        "location": "Lompoc, CA 93436",
        "services": [
            "Leadership development",
            "Community learning",
            "Local government and business exposure"
        ],
        "careerFields": [
            "Leadership",
            "Civic engagement",
            "Communication",
            "Community development"
        ],
        "studentSupport": [
            "Program participation inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Official organization website; reviewed 2026-08"
    },
    {
        "id": "LOM-POLICE-FOUNDATION",
        "organization": "Lompoc Police Foundation",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.lompocpolicefoundation.com/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Public Safety Support",
        "industry": "Community Services",
        "location": "Lompoc, CA 93436",
        "services": [
            "Community awareness",
            "Public safety support",
            "Fundraising",
            "Events"
        ],
        "careerFields": [
            "Public safety",
            "Nonprofit management",
            "Event planning",
            "Community relations"
        ],
        "studentSupport": [
            "Public-safety community event inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Official organization website; reviewed 2026-08"
    },
    {
        "id": "LOM-ULA",
        "organization": "United Launch Alliance — Vandenberg",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://jobs.ulalaunch.com/go/VANDENBERG-SPACE-FORCE-BASE-JOBS/9545600/",
        "type": "Business",
        "category": "aerospace",
        "subcategory": "Launch Operations",
        "industry": "Aerospace",
        "location": "Vandenberg Space Force Base, CA 93437",
        "services": [
            "Launch operations",
            "Aerospace systems",
            "Inventory",
            "Technical operations"
        ],
        "careerFields": [
            "Aerospace engineering",
            "Technician careers",
            "Logistics",
            "Systems testing"
        ],
        "studentSupport": [
            "Career-information inquiry only"
        ],
        "opportunities": [],
        "notes": "Vandenberg launch-operations employer; listing does not imply a student partnership.",
        "source": "Official organization website; reviewed 2026-08"
    },
    {
        "id": "LOM-AEROSPACE-CORP",
        "organization": "The Aerospace Corporation — Vandenberg",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-737-0903",
        "website": "https://aerospace.org/locations",
        "type": "Nonprofit",
        "category": "aerospace",
        "subcategory": "Systems Engineering & Space Operations",
        "industry": "Aerospace",
        "location": "806 13th St, Bldg 7015, Vandenberg SFB, CA 93437",
        "services": [
            "Systems engineering",
            "Launch support",
            "Space operations",
            "Technical analysis"
        ],
        "careerFields": [
            "Systems engineering",
            "Aerospace",
            "Cybersecurity",
            "Program management"
        ],
        "studentSupport": [
            "Career-information inquiry only"
        ],
        "opportunities": [],
        "notes": "Federally funded research and development organization with a Vandenberg location.",
        "source": "Official organization website; reviewed 2026-08"
    },
    {
        "id": "LOM-NORTHROP",
        "organization": "Northrop Grumman — Vandenberg",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://jobs.northropgrumman.com/careers/%2A/united_states_california_vandenberg_afb?domain=ngc.com",
        "type": "Business",
        "category": "aerospace",
        "subcategory": "Aerospace & Defense Systems",
        "industry": "Aerospace",
        "location": "Vandenberg Space Force Base, CA 93437",
        "services": [
            "Engineering",
            "Launch support",
            "Program management",
            "Technical operations"
        ],
        "careerFields": [
            "Aerospace engineering",
            "Project management",
            "Systems integration",
            "Technical trades"
        ],
        "studentSupport": [
            "Career-information inquiry only"
        ],
        "opportunities": [],
        "notes": "Employer listing for Vandenberg-area career exploration; not an established student partner.",
        "source": "Official organization website; reviewed 2026-08"
    },
    {
        "id": "LOM-DARE2DREAM",
        "organization": "Dare 2 Dream Farms",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-735-3233",
        "website": "https://dare2dreamfarms.com/",
        "type": "Business",
        "category": "trades",
        "subcategory": "Sustainable Agriculture & Farm Enterprise",
        "industry": "Agriculture",
        "location": "890 La Salle Canyon Rd, Lompoc, CA 93436",
        "services": [
            "Sustainable farming",
            "Poultry",
            "Farm stand",
            "Agritourism",
            "Small business"
        ],
        "careerFields": [
            "Agriculture",
            "Animal care",
            "Entrepreneurship",
            "Hospitality",
            "Marketing"
        ],
        "studentSupport": [
            "Farm-career conversation inquiry"
        ],
        "opportunities": [],
        "notes": "",
        "source": "Official organization website; reviewed 2026-08"
    },
    {
        "id": "LOM-BIG-E-PRODUCE",
        "organization": "Big E Produce",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "",
        "type": "Business",
        "category": "trades",
        "subcategory": "Produce Growing & Distribution",
        "industry": "Agriculture",
        "location": "Lompoc, CA 93436",
        "services": [
            "Produce growing",
            "Packing",
            "Distribution",
            "Logistics"
        ],
        "careerFields": [
            "Agriculture",
            "Food systems",
            "Warehouse operations",
            "Logistics"
        ],
        "studentSupport": [
            "Agriculture career inquiry"
        ],
        "opportunities": [],
        "notes": "Local produce company; confirm contact and student availability before outreach.",
        "source": "Momentum local partner research; reviewed 2026-08"
    },
    {
        "id": "LOM-JORDAN-FARMS",
        "organization": "Jordan Farms — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.sblandtrust.org/land/jordan-farms/",
        "type": "Business",
        "category": "trades",
        "subcategory": "Agriculture & Land Stewardship",
        "industry": "Agriculture",
        "location": "Lompoc Valley, CA",
        "services": [
            "Farming",
            "Land stewardship",
            "Agricultural conservation"
        ],
        "careerFields": [
            "Agriculture",
            "Environmental science",
            "Land management",
            "Food systems"
        ],
        "studentSupport": [
            "Agriculture or conservation inquiry"
        ],
        "opportunities": [],
        "notes": "Historic Lompoc farm protected through an agricultural conservation easement.",
        "source": "Momentum local partner research; reviewed 2026-08"
    },
    {
        "id": "LOM-ALFIES",
        "organization": "Alfie's Fish & Chips",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.alfiesfishandchips.com/",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant",
        "industry": "Food & Drink",
        "location": "610 N H St, Lompoc, CA 93436",
        "services": [
            "Restaurant service",
            "Food preparation",
            "Customer service",
            "Kitchen operations"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Business",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration",
            "Workplace visit inquiry"
        ],
        "opportunities": [],
        "notes": "Local restaurant connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-TOMS",
        "organization": "Tom's Burgers",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://tomsburgerslompoc.com/",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant",
        "industry": "Food & Drink",
        "location": "115 E College Ave, Suite 13, Lompoc, CA 93436",
        "services": [
            "Restaurant service",
            "Grill cooking",
            "Customer service",
            "Small business"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Entrepreneurship"
        ],
        "studentSupport": [
            "Career exploration",
            "Small-business interview"
        ],
        "opportunities": [],
        "notes": "Local restaurant connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-FLORIANOS",
        "organization": "Floriano's Mexican Food",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://florianos.net/",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant",
        "industry": "Food & Drink",
        "location": "1140 N H St, Lompoc, CA 93436",
        "services": [
            "Mexican cuisine",
            "Food preparation",
            "Customer service",
            "Catering"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Business"
        ],
        "studentSupport": [
            "Career exploration",
            "Culinary inquiry"
        ],
        "opportunities": [],
        "notes": "Local restaurant connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-ELTOROBRONCO",
        "organization": "El Toro Bronco",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.eltorobroncolompoc.com/",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant",
        "industry": "Food & Drink",
        "location": "1030 N H St, Lompoc, CA 93436",
        "services": [
            "Restaurant service",
            "Mexican cuisine",
            "Kitchen operations",
            "Customer service"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration",
            "Workplace visit inquiry"
        ],
        "opportunities": [],
        "notes": "Local restaurant connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-SUSHITERI",
        "organization": "Sushi Teri — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.sushiteri.com/",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant",
        "industry": "Food & Drink",
        "location": "213 W Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Sushi preparation",
            "Restaurant service",
            "Customer service",
            "Kitchen operations"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Food safety"
        ],
        "studentSupport": [
            "Career exploration",
            "Culinary inquiry"
        ],
        "opportunities": [],
        "notes": "Local restaurant connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-CHOWYA",
        "organization": "Chow-Ya",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Chow-Ya%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant",
        "industry": "Food & Drink",
        "location": "713 E Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Asian cuisine",
            "Food preparation",
            "Restaurant service",
            "Customer service"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local restaurant connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-SUVANS",
        "organization": "Suvan's Kitchen",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Suvan%27s+Kitchen%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant",
        "industry": "Food & Drink",
        "location": "129 W Central Ave, Suite E, Lompoc, CA 93436",
        "services": [
            "Thai and Lao cuisine",
            "Food preparation",
            "Restaurant service",
            "Customer service"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Small business"
        ],
        "studentSupport": [
            "Career exploration",
            "Small-business interview"
        ],
        "opportunities": [],
        "notes": "Local restaurant connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-CAJUNKITCHEN",
        "organization": "Cajun Kitchen Cafe — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.cajunkitchencafe.com/",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant & Cafe",
        "industry": "Food & Drink",
        "location": "1508 N H St, Lompoc, CA 93436",
        "services": [
            "Breakfast service",
            "Café operations",
            "Food preparation",
            "Customer service"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Business"
        ],
        "studentSupport": [
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local restaurant & cafe connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-VALLEEATERY",
        "organization": "Valle Eatery & Bar",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.valleeatery.com/",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant",
        "industry": "Food & Drink",
        "location": "1201 N H St, Lompoc, CA 93436",
        "services": [
            "Restaurant service",
            "Seasonal cooking",
            "Guest service",
            "Event dining"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Tourism",
            "Business"
        ],
        "studentSupport": [
            "Career exploration",
            "Hospitality inquiry"
        ],
        "opportunities": [],
        "notes": "Local restaurant connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-VILLAGECOFFEE",
        "organization": "Village Coffee Stop & Catering",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Village+Coffee+Stop+%26+Catering%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "food",
        "subcategory": "Cafe & Catering",
        "industry": "Food & Drink",
        "location": "3734 Constellation Rd, Suite J, Lompoc, CA 93436",
        "services": [
            "Coffee service",
            "Catering",
            "Food preparation",
            "Customer service"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Entrepreneurship"
        ],
        "studentSupport": [
            "Career exploration",
            "Small-business interview"
        ],
        "opportunities": [],
        "notes": "Local cafe & catering connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-HERBHOME",
        "organization": "Herb Home Thai Restaurant",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Herb+Home+Thai+Restaurant%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant",
        "industry": "Food & Drink",
        "location": "426 N H St, Lompoc, CA 93436",
        "services": [
            "Thai cuisine",
            "Food preparation",
            "Restaurant service",
            "Customer service"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Small business"
        ],
        "studentSupport": [
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local restaurant connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-ELPALMAR",
        "organization": "El Palmar Mexican Restaurant",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=El+Palmar+Mexican+Restaurant%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant",
        "industry": "Food & Drink",
        "location": "722 E Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Mexican cuisine",
            "Restaurant service",
            "Food preparation",
            "Customer service"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local restaurant connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-ANGELAS",
        "organization": "Angela's Mexican Restaurant",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Angela%27s+Mexican+Restaurant%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant",
        "industry": "Food & Drink",
        "location": "115 S J St, Lompoc, CA 93436",
        "services": [
            "Mexican cuisine",
            "Restaurant service",
            "Food preparation",
            "Customer service"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Small business"
        ],
        "studentSupport": [
            "Career exploration",
            "Small-business interview"
        ],
        "opportunities": [],
        "notes": "Local restaurant connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-LAREYNA",
        "organization": "La Reyna Tortillería",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=La+Reyna+Tortilleria%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "food",
        "subcategory": "Tortilleria & Market",
        "industry": "Food & Drink",
        "location": "401 W Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Tortilla production",
            "Food retail",
            "Customer service",
            "Small business"
        ],
        "careerFields": [
            "Culinary arts",
            "Food production",
            "Retail",
            "Entrepreneurship"
        ],
        "studentSupport": [
            "Career exploration",
            "Food-production inquiry"
        ],
        "opportunities": [],
        "notes": "Local tortilleria & market connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-EDDIESGRILL",
        "organization": "Eddie's Grill — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Eddie%27s+Grill%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant",
        "industry": "Food & Drink",
        "location": "1325 N H St, Lompoc, CA 93436",
        "services": [
            "Grill cooking",
            "Restaurant service",
            "Customer service",
            "Kitchen operations"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local restaurant connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-CARNICERIA100",
        "organization": "Carnicería al Cien",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Carniceria+al+Cien%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "markets",
        "subcategory": "Markets",
        "industry": "Markets",
        "location": "115 E College Ave, Suite 10, Lompoc, CA 93436",
        "services": [
            "Meat market",
            "Food retail",
            "Customer service",
            "Small business"
        ],
        "careerFields": [
            "Food service",
            "Retail",
            "Entrepreneurship",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration",
            "Local-business interview"
        ],
        "opportunities": [],
        "notes": "Local carniceria & market connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-LACHIQUITA",
        "organization": "Super Carniceria La Chiquita",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Super+Carniceria+La+Chiquita%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "markets",
        "subcategory": "Markets",
        "industry": "Markets",
        "location": "819 W Laurel Ave, Lompoc, CA 93436",
        "services": [
            "Meat market",
            "Grocery retail",
            "Food preparation",
            "Customer service"
        ],
        "careerFields": [
            "Food service",
            "Retail",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local carniceria & market connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-CARNICERIAJALISCO",
        "organization": "Carniceria Jalisco",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Carniceria+Jalisco%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "markets",
        "subcategory": "Markets",
        "industry": "Markets",
        "location": "928 N H St, Lompoc, CA 93436",
        "services": [
            "Meat market",
            "Grocery retail",
            "Food preparation",
            "Customer service"
        ],
        "careerFields": [
            "Food service",
            "Retail",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local carniceria & market connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-THAICUISINE",
        "organization": "Thai Cuisine — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://thaicuisinelompoc.com/",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant",
        "industry": "Food & Drink",
        "location": "Lompoc, CA 93436",
        "services": [
            "Thai cuisine",
            "Food preparation",
            "Restaurant service",
            "Customer service"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Small business"
        ],
        "studentSupport": [
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local restaurant connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-JALAMAGRILL",
        "organization": "Jalama Beach Store & Grill",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.jalamabeach.com/",
        "type": "Business",
        "category": "food",
        "subcategory": "Restaurant & Visitor Service",
        "industry": "Food & Drink",
        "location": "9999 Jalama Rd, Lompoc, CA 93436",
        "services": [
            "Food service",
            "Retail",
            "Visitor service",
            "Beach hospitality"
        ],
        "careerFields": [
            "Culinary arts",
            "Hospitality",
            "Tourism",
            "Retail"
        ],
        "studentSupport": [
            "Career exploration",
            "Hospitality inquiry"
        ],
        "opportunities": [],
        "notes": "Regional Lompoc-area destination known for food service, retail, and visitor hospitality at Jalama Beach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-FOODSCO",
        "organization": "Foods Co — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.foodsco.net/stores/grocery/ca/lompoc",
        "type": "Business",
        "category": "markets",
        "subcategory": "Markets",
        "industry": "Markets",
        "location": "601 W Central Ave, Lompoc, CA 93436",
        "services": [
            "Grocery retail",
            "Inventory",
            "Customer service",
            "Food operations"
        ],
        "careerFields": [
            "Retail",
            "Logistics",
            "Management",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration",
            "Employment inquiry"
        ],
        "opportunities": [],
        "notes": "Local grocery store connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-CHRISTIANSMATTRESS",
        "organization": "Christian's Mattress Xpress",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://christiansmattress.com/",
        "type": "Business",
        "category": "retail",
        "subcategory": "Home Furnishings",
        "industry": "Retail",
        "location": "663 W Central Ave, Lompoc, CA 93436",
        "services": [
            "Mattress sales",
            "Customer service",
            "Delivery coordination",
            "Retail operations"
        ],
        "careerFields": [
            "Retail",
            "Sales",
            "Business",
            "Logistics"
        ],
        "studentSupport": [
            "Career exploration",
            "Small-business interview"
        ],
        "opportunities": [],
        "notes": "Local home furnishings connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-SUNSHINEMARKET",
        "organization": "Sunshine Market & Gas",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://sunshinefoodmartlompoc.com/",
        "type": "Business",
        "category": "markets",
        "subcategory": "Markets",
        "industry": "Markets",
        "location": "719 W Laurel Ave, Lompoc, CA 93436",
        "services": [
            "Convenience retail",
            "Fuel service",
            "Inventory",
            "Customer service"
        ],
        "careerFields": [
            "Retail",
            "Automotive service",
            "Business",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local market & fuel connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-VILLAGEMARKET",
        "organization": "Village Market",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Village+Market+Vandenberg+Village%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "markets",
        "subcategory": "Markets",
        "industry": "Markets",
        "location": "3734 Constellation Rd, Lompoc, CA 93436",
        "services": [
            "Grocery retail",
            "Inventory",
            "Customer service",
            "Local market operations"
        ],
        "careerFields": [
            "Retail",
            "Food service",
            "Business",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local grocery store connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-CONSERVFUEL",
        "organization": "Conserv Fuel — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://conservfuel.com/",
        "type": "Business",
        "category": "auto",
        "subcategory": "Fuel & Convenience",
        "industry": "Automotive",
        "location": "801 E Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Fuel service",
            "Convenience retail",
            "Customer service",
            "Site operations"
        ],
        "careerFields": [
            "Automotive",
            "Retail",
            "Business",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration",
            "Employment inquiry"
        ],
        "opportunities": [],
        "notes": "Local fuel & convenience connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-LOMPOCFUEL",
        "organization": "Lompoc Fuel",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Lompoc+Fuel%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "auto",
        "subcategory": "Fuel & Convenience",
        "industry": "Automotive",
        "location": "1100 E Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Fuel service",
            "Convenience retail",
            "Customer service",
            "Site operations"
        ],
        "careerFields": [
            "Automotive",
            "Retail",
            "Business"
        ],
        "studentSupport": [
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local fuel & convenience connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-STUARTSPETROLEUM",
        "organization": "Stuart's Petroleum",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Stuart%27s+Petroleum%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "auto",
        "subcategory": "Fuel & Convenience",
        "industry": "Automotive",
        "location": "940 N H St, Lompoc, CA 93436",
        "services": [
            "Fuel service",
            "Convenience retail",
            "Customer service",
            "Site operations"
        ],
        "careerFields": [
            "Automotive",
            "Retail",
            "Business"
        ],
        "studentSupport": [
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local fuel & convenience connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-VALLEYROCK",
        "organization": "Valley Rock Landscape Supply",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://valleyrocklandscapesupply.com/",
        "type": "Business",
        "category": "trades",
        "subcategory": "Landscape Supply",
        "industry": "Construction & Landscaping",
        "location": "2222 N H St, Lompoc, CA 93436",
        "services": [
            "Landscape materials",
            "Equipment operation",
            "Sales",
            "Delivery logistics"
        ],
        "careerFields": [
            "Landscaping",
            "Construction",
            "Logistics",
            "Sales"
        ],
        "studentSupport": [
            "Career exploration",
            "Skilled-trades inquiry"
        ],
        "opportunities": [],
        "notes": "Local landscape supply connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-SUNSETAUTO",
        "organization": "Sunset Auto Center",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://sunsetautocenter.com/",
        "type": "Business",
        "category": "auto",
        "subcategory": "Automotive Sales & Service",
        "industry": "Automotive",
        "location": "1300 N H St, Lompoc, CA 93436",
        "services": [
            "Vehicle sales",
            "Automotive service",
            "Parts",
            "Customer service"
        ],
        "careerFields": [
            "Automotive technology",
            "Sales",
            "Business",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration",
            "Job-shadow inquiry"
        ],
        "opportunities": [],
        "notes": "Local automotive sales & service connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-ANIMALCAREHOSP",
        "organization": "Animal Care Hospital — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://achlompoc.com/",
        "type": "Business",
        "category": "animals",
        "subcategory": "Veterinary Hospital",
        "industry": "Veterinary",
        "location": "1307A N H St, Suite A, Lompoc, CA 93436",
        "services": [
            "Veterinary medicine",
            "Animal care",
            "Client service",
            "Clinic operations"
        ],
        "careerFields": [
            "Veterinary science",
            "Animal care",
            "Healthcare",
            "Business"
        ],
        "studentSupport": [
            "Career exploration",
            "Veterinary job-shadow inquiry"
        ],
        "opportunities": [],
        "notes": "Local veterinary hospital connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-OLDNAVY",
        "organization": "Old Navy — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://oldnavy.gap.com/stores",
        "type": "Business",
        "category": "retail",
        "subcategory": "Clothing Retail",
        "industry": "Retail",
        "location": "Lompoc, CA 93436",
        "services": [
            "Clothing retail",
            "Visual merchandising",
            "Inventory",
            "Customer service"
        ],
        "careerFields": [
            "Retail",
            "Fashion",
            "Marketing",
            "Management"
        ],
        "studentSupport": [
            "Career exploration",
            "Employment inquiry"
        ],
        "opportunities": [],
        "notes": "Local clothing retail connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-PETCO",
        "organization": "Petco — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://stores.petco.com/ca/lompoc",
        "type": "Business",
        "category": "animals",
        "subcategory": "Pet Retail & Services",
        "industry": "Retail",
        "location": "Lompoc, CA 93436",
        "services": [
            "Pet retail",
            "Animal care",
            "Grooming",
            "Customer service"
        ],
        "careerFields": [
            "Animal care",
            "Retail",
            "Customer service",
            "Business"
        ],
        "studentSupport": [
            "Career exploration",
            "Employment inquiry"
        ],
        "opportunities": [],
        "notes": "Local pet retail & services connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-BIG5",
        "organization": "Big 5 Sporting Goods — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.big5sportinggoods.com/store/locator",
        "type": "Business",
        "category": "retail",
        "subcategory": "Sporting Goods",
        "industry": "Retail",
        "location": "Lompoc, CA 93436",
        "services": [
            "Sporting goods retail",
            "Inventory",
            "Customer service",
            "Sales"
        ],
        "careerFields": [
            "Retail",
            "Recreation",
            "Sales",
            "Management"
        ],
        "studentSupport": [
            "Career exploration",
            "Employment inquiry"
        ],
        "opportunities": [],
        "notes": "Local sporting goods connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-SEEDMILLING",
        "organization": "Lompoc Valley Seed & Milling",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Lompoc+Valley+Seed+and+Milling%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "trades",
        "subcategory": "Agricultural Supply",
        "industry": "Agriculture",
        "location": "Lompoc, CA 93436",
        "services": [
            "Agricultural supplies",
            "Seed and feed",
            "Inventory",
            "Customer service"
        ],
        "careerFields": [
            "Agriculture",
            "Retail",
            "Logistics",
            "Business"
        ],
        "studentSupport": [
            "Career exploration",
            "Agriculture inquiry"
        ],
        "opportunities": [],
        "notes": "Local agricultural supply connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-GARDENSHOPPE",
        "organization": "The Garden Shoppe",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=The+Garden+Shoppe%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "retail",
        "subcategory": "Garden Center",
        "industry": "Retail",
        "location": "Lompoc, CA 93436",
        "services": [
            "Plants and garden supplies",
            "Customer service",
            "Merchandising",
            "Plant care"
        ],
        "careerFields": [
            "Horticulture",
            "Retail",
            "Landscaping",
            "Business"
        ],
        "studentSupport": [
            "Career exploration",
            "Horticulture inquiry"
        ],
        "opportunities": [],
        "notes": "Local garden center connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-THRIFTBOUTIQUE",
        "organization": "Lompoc Thrift Store & Boutique",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Lompoc+Thrift+Store+and+Boutique%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "retail",
        "subcategory": "Thrift & Resale",
        "industry": "Retail",
        "location": "330 W Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Resale retail",
            "Merchandising",
            "Donations",
            "Customer service"
        ],
        "careerFields": [
            "Retail",
            "Fashion",
            "Sustainability",
            "Business"
        ],
        "studentSupport": [
            "Career exploration",
            "Community retail inquiry"
        ],
        "opportunities": [],
        "notes": "Local thrift & resale connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-REVIVINGHOPE",
        "organization": "Reviving Hope Thrift",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Reviving+Hope+Thrift%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "retail",
        "subcategory": "Thrift & Resale",
        "industry": "Retail",
        "location": "646 N H St, Lompoc, CA 93436",
        "services": [
            "Resale retail",
            "Donations",
            "Merchandising",
            "Customer service"
        ],
        "careerFields": [
            "Retail",
            "Nonprofit service",
            "Sustainability",
            "Business"
        ],
        "studentSupport": [
            "Career exploration",
            "Volunteer inquiry"
        ],
        "opportunities": [],
        "notes": "Local thrift & resale connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-MARYSUNIQUE",
        "organization": "Mary's Unique Thrift Shop",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Mary%27s+Unique+Thrift+Shop%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "retail",
        "subcategory": "Thrift & Resale",
        "industry": "Retail",
        "location": "117 S H St, Lompoc, CA 93436",
        "services": [
            "Resale retail",
            "Merchandising",
            "Customer service",
            "Small business"
        ],
        "careerFields": [
            "Retail",
            "Fashion",
            "Entrepreneurship",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration",
            "Small-business interview"
        ],
        "opportunities": [],
        "notes": "Local thrift & resale connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-TNTSWEETREPEATS",
        "organization": "TNT Sweet Repeats",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=TNT+Sweet+Repeats%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "retail",
        "subcategory": "Thrift & Resale",
        "industry": "Retail",
        "location": "110 W Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Resale retail",
            "Merchandising",
            "Customer service",
            "Small business"
        ],
        "careerFields": [
            "Retail",
            "Fashion",
            "Entrepreneurship",
            "Sustainability"
        ],
        "studentSupport": [
            "Career exploration",
            "Small-business interview"
        ],
        "opportunities": [],
        "notes": "Local thrift & resale connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-CONWAYSTHRIFT",
        "organization": "Conway's Thrift",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Conway%27s+Thrift%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "retail",
        "subcategory": "Thrift & Resale",
        "industry": "Retail",
        "location": "322 N H St, Lompoc, CA 93436",
        "services": [
            "Resale retail",
            "Merchandising",
            "Customer service",
            "Inventory"
        ],
        "careerFields": [
            "Retail",
            "Sustainability",
            "Business",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local thrift & resale connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-GOODSONORANGE",
        "organization": "Goodson Orange",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://goodsonorange.com/",
        "type": "Business",
        "category": "retail",
        "subcategory": "Local Marketplace",
        "industry": "Retail",
        "location": "703 E Ocean Ave, Lompoc, CA 93436",
        "services": [
            "Local vendor marketplace",
            "Retail",
            "Community events",
            "Customer service"
        ],
        "careerFields": [
            "Retail",
            "Entrepreneurship",
            "Marketing",
            "Event planning"
        ],
        "studentSupport": [
            "Career exploration",
            "Local-maker interview"
        ],
        "opportunities": [],
        "notes": "Local multi-vendor marketplace supporting small businesses, makers, and community events.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-HOLIDAYINN",
        "organization": "Holiday Inn Express Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.ihg.com/holidayinnexpress/hotels/us/en/lompoc/lpcca/hoteldetail",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Hotel",
        "industry": "Hospitality",
        "location": "1417 N H St, Lompoc, CA 93436",
        "services": [
            "Guest services",
            "Housekeeping",
            "Hospitality operations",
            "Breakfast service"
        ],
        "careerFields": [
            "Hospitality",
            "Tourism",
            "Business",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration",
            "Hospitality employment inquiry"
        ],
        "opportunities": [],
        "notes": "Local hotel connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-INNHWY1",
        "organization": "Inn at Highway 1",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.innathighway1.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Hotel",
        "industry": "Hospitality",
        "location": "1200 N H St, Lompoc, CA 93436",
        "services": [
            "Guest services",
            "Housekeeping",
            "Reservations",
            "Hospitality operations"
        ],
        "careerFields": [
            "Hospitality",
            "Tourism",
            "Business",
            "Customer service"
        ],
        "studentSupport": [
            "Career exploration",
            "Hospitality inquiry"
        ],
        "opportunities": [],
        "notes": "Local hotel connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-INNOFLOMPOC",
        "organization": "Inn of Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.innlompoc.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Hotel",
        "industry": "Hospitality",
        "location": "1122 N H St, Lompoc, CA 93436",
        "services": [
            "Guest services",
            "Housekeeping",
            "Reservations",
            "Property operations"
        ],
        "careerFields": [
            "Hospitality",
            "Tourism",
            "Business",
            "Facilities"
        ],
        "studentSupport": [
            "Career exploration",
            "Hospitality inquiry"
        ],
        "opportunities": [],
        "notes": "Local hotel connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-MOTEL6",
        "organization": "Motel 6 Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://motel6.com/property/motel-lompoc-california-us-293936/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Hotel",
        "industry": "Hospitality",
        "location": "1521 N H St, Lompoc, CA 93436",
        "services": [
            "Guest services",
            "Housekeeping",
            "Reservations",
            "Property operations"
        ],
        "careerFields": [
            "Hospitality",
            "Tourism",
            "Customer service",
            "Facilities"
        ],
        "studentSupport": [
            "Career exploration",
            "Employment inquiry"
        ],
        "opportunities": [],
        "notes": "Local hotel connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-VALLEYINN",
        "organization": "Lompoc Valley Inn & Suites",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://lompocvalleyinnandsuites.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Hotel",
        "industry": "Hospitality",
        "location": "1621 N H St, Lompoc, CA 93436",
        "services": [
            "Guest services",
            "Housekeeping",
            "Reservations",
            "Property operations"
        ],
        "careerFields": [
            "Hospitality",
            "Tourism",
            "Business",
            "Facilities"
        ],
        "studentSupport": [
            "Career exploration",
            "Hospitality inquiry"
        ],
        "opportunities": [],
        "notes": "Current hotel name for the property formerly branded SureStay Plus; local hospitality and guest-service connection.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-VILLAGEINN",
        "organization": "Village Inn — Lompoc",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.villageinnca.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Hotel",
        "industry": "Hospitality",
        "location": "3955 Apollo Way, Lompoc, CA 93436",
        "services": [
            "Guest services",
            "Housekeeping",
            "Reservations",
            "Property operations"
        ],
        "careerFields": [
            "Hospitality",
            "Tourism",
            "Customer service",
            "Facilities"
        ],
        "studentSupport": [
            "Career exploration",
            "Hospitality inquiry"
        ],
        "opportunities": [],
        "notes": "Retro-modern Vandenberg Village hotel with guest service, events, food and beverage, and property-operations career paths.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-RIVERPARKRV",
        "organization": "River Park RV Campground",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.cityoflompoc.com/government/departments/parks-recreation/parks/river-park",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Campground & Visitor Service",
        "industry": "Hospitality",
        "location": "Lompoc, CA 93436",
        "services": [
            "Campground operations",
            "Visitor service",
            "Grounds maintenance",
            "Outdoor recreation"
        ],
        "careerFields": [
            "Hospitality",
            "Tourism",
            "Parks and recreation",
            "Facilities"
        ],
        "studentSupport": [
            "Career exploration",
            "Outdoor-hospitality inquiry"
        ],
        "opportunities": [],
        "notes": "Local campground & visitor service connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-JALAMAPARK",
        "organization": "Jalama Beach County Park",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.countyofsb.org/833/Jalama-Beach",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Park & Campground",
        "industry": "Hospitality",
        "location": "9999 Jalama Rd, Lompoc, CA 93436",
        "services": [
            "Park operations",
            "Campground service",
            "Visitor assistance",
            "Outdoor recreation"
        ],
        "careerFields": [
            "Parks and recreation",
            "Hospitality",
            "Environmental stewardship",
            "Tourism"
        ],
        "studentSupport": [
            "Career exploration",
            "Public-lands inquiry"
        ],
        "opportunities": [],
        "notes": "Local park & campground connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-BREWERCLIFTON",
        "organization": "Brewer-Clifton",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.brewerclifton.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Winery & Tasting",
        "industry": "Wine & Hospitality",
        "location": "Lompoc, CA 93436",
        "services": [
            "Winemaking",
            "Wine production",
            "Hospitality",
            "Direct-to-consumer sales"
        ],
        "careerFields": [
            "Viticulture",
            "Food science",
            "Hospitality",
            "Marketing"
        ],
        "studentSupport": [
            "Career exploration",
            "Winemaking inquiry"
        ],
        "opportunities": [],
        "notes": "Local winery & tasting connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-FIDDLEHEAD",
        "organization": "Fiddlehead Cellars",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.fiddleheadcellars.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Winery & Tasting",
        "industry": "Wine & Hospitality",
        "location": "1597 E Chestnut Ave, Lompoc, CA 93436",
        "services": [
            "Winemaking",
            "Wine production",
            "Tasting service",
            "Marketing"
        ],
        "careerFields": [
            "Viticulture",
            "Food science",
            "Hospitality",
            "Marketing"
        ],
        "studentSupport": [
            "Career exploration",
            "Winemaking inquiry"
        ],
        "opportunities": [],
        "notes": "Local winery & tasting connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-MONTEMAR",
        "organization": "Montemar Wines",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.montemarwines.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Winery & Tasting",
        "industry": "Wine & Hospitality",
        "location": "Lompoc Wine Ghetto, Lompoc, CA 93436",
        "services": [
            "Winemaking",
            "Wine production",
            "Tasting service",
            "Customer service"
        ],
        "careerFields": [
            "Viticulture",
            "Food science",
            "Hospitality",
            "Business"
        ],
        "studentSupport": [
            "Career exploration",
            "Wine-industry inquiry"
        ],
        "opportunities": [],
        "notes": "Local winery & tasting connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-LONGORIA",
        "organization": "Longoria Wines",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.longoriawine.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Winery & Tasting",
        "industry": "Wine & Hospitality",
        "location": "Lompoc, CA 93436",
        "services": [
            "Winemaking",
            "Wine production",
            "Tasting service",
            "Direct sales"
        ],
        "careerFields": [
            "Viticulture",
            "Food science",
            "Hospitality",
            "Sales"
        ],
        "studentSupport": [
            "Career exploration",
            "Wine-industry inquiry"
        ],
        "opportunities": [],
        "notes": "Local winery & tasting connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-TRANSCENDENCE",
        "organization": "Transcendence Wines",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.transcendencewinery.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Winery & Tasting",
        "industry": "Wine & Hospitality",
        "location": "Lompoc, CA 93436",
        "services": [
            "Winemaking",
            "Wine production",
            "Tasting service",
            "Customer experience"
        ],
        "careerFields": [
            "Viticulture",
            "Food science",
            "Hospitality",
            "Marketing"
        ],
        "studentSupport": [
            "Career exploration",
            "Wine-industry inquiry"
        ],
        "opportunities": [],
        "notes": "Local winery & tasting connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-HOLUSBOLUS",
        "organization": "Holus Bolus & The Joy Fantastic",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.holusboluswine.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Winery",
        "industry": "Wine & Hospitality",
        "location": "Lompoc, CA 93436",
        "services": [
            "Winemaking",
            "Wine production",
            "Vineyard operations",
            "Marketing"
        ],
        "careerFields": [
            "Viticulture",
            "Agriculture",
            "Food science",
            "Marketing"
        ],
        "studentSupport": [
            "Career exploration",
            "Wine-industry inquiry"
        ],
        "opportunities": [],
        "notes": "Local winery connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-SWEETZER",
        "organization": "Sweetzer Cellars",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.sweetzercellars.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Winery",
        "industry": "Wine & Hospitality",
        "location": "Lompoc, CA 93436",
        "services": [
            "Winemaking",
            "Wine production",
            "Hospitality",
            "Direct sales"
        ],
        "careerFields": [
            "Viticulture",
            "Food science",
            "Hospitality",
            "Business"
        ],
        "studentSupport": [
            "Career exploration",
            "Wine-industry inquiry"
        ],
        "opportunities": [],
        "notes": "Local winery connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-DALFONSOCURRAN",
        "organization": "D'Alfonso-Curran Wines",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.dalfonsocurran.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Winery",
        "industry": "Wine & Hospitality",
        "location": "Lompoc, CA 93436",
        "services": [
            "Winemaking",
            "Wine production",
            "Vineyard partnerships",
            "Marketing"
        ],
        "careerFields": [
            "Viticulture",
            "Food science",
            "Agriculture",
            "Marketing"
        ],
        "studentSupport": [
            "Career exploration",
            "Winemaking inquiry"
        ],
        "opportunities": [],
        "notes": "Local winery connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-TYLERWINERY",
        "organization": "Tyler Winery",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.tylerwinery.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Winery",
        "industry": "Wine & Hospitality",
        "location": "Lompoc, CA 93436",
        "services": [
            "Winemaking",
            "Wine production",
            "Cellar operations",
            "Direct sales"
        ],
        "careerFields": [
            "Viticulture",
            "Food science",
            "Agriculture",
            "Business"
        ],
        "studentSupport": [
            "Career exploration",
            "Winemaking inquiry"
        ],
        "opportunities": [],
        "notes": "Local winery connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-SANDHI",
        "organization": "Sandhi Wines",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.sandhiwines.com/",
        "type": "Business",
        "category": "hospitality",
        "subcategory": "Winery",
        "industry": "Wine & Hospitality",
        "location": "Lompoc, CA 93436",
        "services": [
            "Winemaking",
            "Wine production",
            "Cellar operations",
            "Marketing"
        ],
        "careerFields": [
            "Viticulture",
            "Food science",
            "Agriculture",
            "Marketing"
        ],
        "studentSupport": [
            "Career exploration",
            "Wine-industry inquiry"
        ],
        "opportunities": [],
        "notes": "Local winery connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-LVAR",
        "organization": "Lompoc Valley Association of Realtors",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.lvar.org/",
        "type": "Community Organization",
        "category": "finance",
        "subcategory": "Professional Association",
        "industry": "Real Estate",
        "location": "Lompoc, CA 93436",
        "services": [
            "Real estate education",
            "Professional networking",
            "Housing information",
            "Community service"
        ],
        "careerFields": [
            "Real estate",
            "Business",
            "Finance",
            "Community development"
        ],
        "studentSupport": [
            "Career exploration",
            "Professional interview"
        ],
        "opportunities": [],
        "notes": "Local professional association connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-AYSO",
        "organization": "Lompoc Valley AYSO",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Lompoc+Valley+AYSO%2C+Lompoc%2C+CA",
        "type": "Community Organization",
        "category": "nonprofit",
        "subcategory": "Youth Sports",
        "industry": "Youth Development",
        "location": "Lompoc, CA 93436",
        "services": [
            "Youth soccer",
            "Coaching",
            "Refereeing",
            "Volunteer coordination"
        ],
        "careerFields": [
            "Sports management",
            "Coaching",
            "Youth development",
            "Event operations"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local youth sports connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-BICYCLECLUB",
        "organization": "Lompoc Valley Bicycle Club",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Lompoc+Valley+Bicycle+Club%2C+Lompoc%2C+CA",
        "type": "Community Organization",
        "category": "nonprofit",
        "subcategory": "Recreation Club",
        "industry": "Recreation",
        "location": "Lompoc, CA 93436",
        "services": [
            "Cycling",
            "Community rides",
            "Safety education",
            "Volunteer events"
        ],
        "careerFields": [
            "Recreation",
            "Health and wellness",
            "Event planning",
            "Community service"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "Project partnership"
        ],
        "opportunities": [],
        "notes": "Local recreation club connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-BOTANICSOCIETY",
        "organization": "Lompoc Valley Botanic & Horticultural Society",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Lompoc+Valley+Botanic+and+Horticultural+Society%2C+Lompoc%2C+CA",
        "type": "Community Organization",
        "category": "nonprofit",
        "subcategory": "Horticulture Organization",
        "industry": "Environmental & Community",
        "location": "Lompoc, CA 93436",
        "services": [
            "Horticulture education",
            "Garden projects",
            "Community beautification",
            "Volunteer service"
        ],
        "careerFields": [
            "Horticulture",
            "Environmental science",
            "Landscaping",
            "Community service"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "Project partnership"
        ],
        "opportunities": [],
        "notes": "Local horticulture organization connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-DISTANCECLUB",
        "organization": "Lompoc Valley Distance Club",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Lompoc+Valley+Distance+Club%2C+Lompoc%2C+CA",
        "type": "Community Organization",
        "category": "nonprofit",
        "subcategory": "Running Club",
        "industry": "Recreation",
        "location": "Lompoc, CA 93436",
        "services": [
            "Running programs",
            "Fitness",
            "Community events",
            "Volunteer support"
        ],
        "careerFields": [
            "Recreation",
            "Health and wellness",
            "Coaching",
            "Event planning"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local running club connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-GENEALOGICAL",
        "organization": "Lompoc Valley Genealogical Society",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Lompoc+Valley+Genealogical+Society%2C+Lompoc%2C+CA",
        "type": "Community Organization",
        "category": "nonprofit",
        "subcategory": "Historical & Genealogy Organization",
        "industry": "History & Research",
        "location": "Lompoc, CA 93436",
        "services": [
            "Genealogy research",
            "Local history",
            "Archives",
            "Community education"
        ],
        "careerFields": [
            "History",
            "Research",
            "Library science",
            "Community education"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "Research project partnership"
        ],
        "opportunities": [],
        "notes": "Local historical & genealogy organization connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-EAA275",
        "organization": "Experimental Aircraft Association Chapter 275",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://chapters.eaa.org/eaa275",
        "type": "Community Organization",
        "category": "aerospace",
        "subcategory": "Aviation Organization",
        "industry": "Aviation & Aerospace",
        "location": "Lompoc Airport, Lompoc, CA 93436",
        "services": [
            "Aviation education",
            "Aircraft projects",
            "Young Eagles flights",
            "Community events"
        ],
        "careerFields": [
            "Aviation",
            "Aerospace",
            "Engineering",
            "Skilled trades"
        ],
        "studentSupport": [
            "Career exploration",
            "Mentorship inquiry"
        ],
        "opportunities": [],
        "notes": "Local aviation organization connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-HEALTHYLOMPOC",
        "organization": "Healthy Lompoc Coalition",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Healthy+Lompoc+Coalition%2C+Lompoc%2C+CA",
        "type": "Community Organization",
        "category": "nonprofit",
        "subcategory": "Health Coalition",
        "industry": "Community Health",
        "location": "Lompoc, CA 93436",
        "services": [
            "Community health",
            "Wellness initiatives",
            "Public outreach",
            "Partnership coordination"
        ],
        "careerFields": [
            "Public health",
            "Community service",
            "Program management",
            "Communications"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "Project partnership"
        ],
        "opportunities": [],
        "notes": "Local health coalition connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-TSUNAMI",
        "organization": "Lompoc Tsunami Aquatics",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Lompoc+Tsunami+Aquatics%2C+Lompoc%2C+CA",
        "type": "Community Organization",
        "category": "wellness",
        "subcategory": "Aquatics Organization",
        "industry": "Recreation",
        "location": "Lompoc, CA 93436",
        "services": [
            "Competitive swimming",
            "Coaching",
            "Youth development",
            "Aquatics"
        ],
        "careerFields": [
            "Coaching",
            "Sports management",
            "Recreation",
            "Youth development"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "Career exploration"
        ],
        "opportunities": [],
        "notes": "Local aquatics organization connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-SAVIEHEALTH",
        "organization": "Savie Health Free Clinic",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://saviehealth.org/",
        "type": "Nonprofit",
        "category": "health",
        "subcategory": "Free Clinic",
        "industry": "Healthcare",
        "location": "1111 E Ocean Ave, Suite 4A, Lompoc, CA 93436",
        "services": [
            "Free medical care",
            "Patient support",
            "Health education",
            "Community outreach"
        ],
        "careerFields": [
            "Healthcare",
            "Public health",
            "Social services",
            "Administration"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "Healthcare career exploration"
        ],
        "opportunities": [],
        "notes": "Local free clinic connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-ILRC",
        "organization": "Independent Living Resource Center — Lompoc Services",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://ilrc-trico.org/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Disability Services",
        "industry": "Human Services",
        "location": "Lompoc, CA 93436",
        "services": [
            "Independent living support",
            "Disability advocacy",
            "Assistive resources",
            "Benefits navigation"
        ],
        "careerFields": [
            "Human services",
            "Advocacy",
            "Public policy",
            "Community outreach"
        ],
        "studentSupport": [
            "Career exploration",
            "Service-learning inquiry"
        ],
        "opportunities": [],
        "notes": "Local disability services connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-EDC",
        "organization": "Economic Development Collaborative — Lompoc Business Support",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://edcollaborative.com/",
        "type": "Community Organization",
        "category": "finance",
        "subcategory": "Business Advising",
        "industry": "Business Services",
        "location": "Lompoc, CA 93436",
        "services": [
            "Business advising",
            "Small-business loans",
            "Entrepreneurship support",
            "Workshops"
        ],
        "careerFields": [
            "Entrepreneurship",
            "Finance",
            "Marketing",
            "Business management"
        ],
        "studentSupport": [
            "Career exploration",
            "Entrepreneurship mentoring"
        ],
        "opportunities": [],
        "notes": "Local business advising connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-SUPERIORSENIOR",
        "organization": "Superior Senior Home Care",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Superior+Senior+Home+Care+Lompoc%2C+Lompoc%2C+CA",
        "type": "Business",
        "category": "health",
        "subcategory": "Senior Care",
        "industry": "Healthcare",
        "location": "Lompoc, CA 93436",
        "services": [
            "In-home care",
            "Senior support",
            "Care coordination",
            "Companionship"
        ],
        "careerFields": [
            "Healthcare",
            "Human services",
            "Gerontology",
            "Administration"
        ],
        "studentSupport": [
            "Career exploration",
            "Healthcare inquiry"
        ],
        "opportunities": [],
        "notes": "Local senior care connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-LCBF",
        "organization": "Lompoc Community Benefit Foundation",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.google.com/maps/search/?api=1&query=Lompoc+Community+Benefit+Foundation%2C+Lompoc%2C+CA",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Community Foundation",
        "industry": "Philanthropy",
        "location": "Lompoc, CA 93436",
        "services": [
            "Community grants",
            "Philanthropy",
            "Local partnerships",
            "Nonprofit support"
        ],
        "careerFields": [
            "Nonprofit management",
            "Finance",
            "Community development",
            "Communications"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "Project partnership"
        ],
        "opportunities": [],
        "notes": "Local community foundation connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-AJCC",
        "organization": "America's Job Center of California — Lompoc Services",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://www.sbcwdb.org/",
        "type": "Community Organization",
        "category": "nonprofit",
        "subcategory": "Workforce Development",
        "industry": "Employment Services",
        "location": "Lompoc, CA 93436",
        "services": [
            "Job search support",
            "Career counseling",
            "Training referrals",
            "Employer services"
        ],
        "careerFields": [
            "Workforce development",
            "Human resources",
            "Career counseling",
            "Administration"
        ],
        "studentSupport": [
            "Career planning",
            "Training referral"
        ],
        "opportunities": [],
        "notes": "Local workforce development connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-4H",
        "organization": "Santa Barbara County 4-H — Lompoc Area",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://ucanr.edu/sites/sbc4h/",
        "type": "Community Organization",
        "category": "nonprofit",
        "subcategory": "Youth Development",
        "industry": "Education & Agriculture",
        "location": "Lompoc, CA 93436",
        "services": [
            "Youth leadership",
            "Agriculture projects",
            "STEM projects",
            "Community service"
        ],
        "careerFields": [
            "Agriculture",
            "Education",
            "Youth development",
            "STEM"
        ],
        "studentSupport": [
            "Youth program inquiry",
            "Volunteer inquiry"
        ],
        "opportunities": [],
        "notes": "Local youth development connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "LOM-VVCSD",
        "organization": "Vandenberg Village Community Services District",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "",
        "website": "https://vvcsd.org/",
        "type": "Government",
        "category": "government",
        "subcategory": "Community Services District",
        "industry": "Public Service",
        "location": "Vandenberg Village, Lompoc, CA 93436",
        "services": [
            "Water services",
            "Wastewater services",
            "Public administration",
            "Infrastructure"
        ],
        "careerFields": [
            "Public administration",
            "Utilities",
            "Engineering",
            "Environmental services"
        ],
        "studentSupport": [
            "Career exploration",
            "Public-service inquiry"
        ],
        "opportunities": [],
        "notes": "Local community services district connection for career exploration, projects, and community outreach.",
        "source": "Momentum local business research; reviewed 2026-08"
    },
    {
        "id": "REG-SBCC-CAREER-ED",
        "organization": "Santa Barbara City College Career Education",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-730-4000",
        "website": "https://www.sbcc.edu/careercenter/careereducationmajors/",
        "type": "Education",
        "category": "education",
        "subcategory": "Trade & Technical Schools",
        "industry": "Education & Training",
        "location": "721 Cliff Dr, Santa Barbara, CA 93109",
        "services": [
            "Automotive service and technology",
            "Construction technology",
            "Electrician trainee courses",
            "Culinary arts and hospitality",
            "Cosmetology",
            "Drafting and CAD",
            "Marine diving technology",
            "Computer networking and electronics"
        ],
        "careerFields": [
            "Automotive",
            "Construction",
            "Electrical",
            "Culinary arts",
            "Hospitality",
            "Cosmetology",
            "Drafting",
            "Technology"
        ],
        "studentSupport": [
            "Certificate and associate-degree exploration",
            "Career education planning",
            "Program research"
        ],
        "opportunities": [],
        "notes": "Regional community college with extensive hands-on career education and technical certificate pathways.",
        "source": "Official SBCC career education pages; reviewed 2026-08"
    },
    {
        "id": "REG-CET-SANTA-MARIA",
        "organization": "Center for Employment Training — Santa Maria",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-928-1737",
        "website": "https://cetweb.edu/location/santa-maria-ca",
        "type": "Trade School",
        "category": "education",
        "subcategory": "Trade & Technical Schools",
        "industry": "Education & Training",
        "location": "509 W Morrison Ave, Santa Maria, CA 93458",
        "services": [
            "Green building construction skills",
            "Medical assistant training",
            "Business office administration",
            "Hands-on job training",
            "Career placement support"
        ],
        "careerFields": [
            "Construction",
            "Green building",
            "Healthcare",
            "Medical assisting",
            "Office administration"
        ],
        "studentSupport": [
            "Trade-school exploration",
            "Admissions inquiry",
            "Career training research"
        ],
        "opportunities": [],
        "notes": "Accredited career-training center offering hands-on programs in Santa Maria.",
        "source": "Official CET Santa Maria location page; reviewed 2026-08"
    },
    {
        "id": "REG-CUESTA-SKILLED-TRADES",
        "organization": "Cuesta College — Skilled Trades & Technology",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-546-3100",
        "website": "https://www.cuesta.edu/academics/areas-of-study/skilled-trades-tech/index.html",
        "type": "Education",
        "category": "education",
        "subcategory": "Trade & Technical Schools",
        "industry": "Education & Training",
        "location": "3000 Education Dr, San Luis Obispo, CA 93405",
        "services": [
            "Automotive and auto body technology",
            "Aviation maintenance",
            "Construction technology",
            "Welding technology",
            "Electronics and electrical technology",
            "Computer and networking technology",
            "Architectural technology",
            "Criminal justice"
        ],
        "careerFields": [
            "Automotive",
            "Aviation",
            "Construction",
            "Welding",
            "Electrical",
            "Networking",
            "Architecture",
            "Public safety"
        ],
        "studentSupport": [
            "Degree and certificate exploration",
            "Dual-enrollment research",
            "Career technical education planning"
        ],
        "opportunities": [],
        "notes": "Central Coast community college division focused on hands-on skilled-trades and technology programs.",
        "source": "Official Cuesta College skilled trades pages; reviewed 2026-08"
    },
    {
        "id": "REG-LAURUS-SANTA-MARIA",
        "organization": "Laurus College — Santa Maria Learning Site",
        "contactName": "",
        "contactTitle": "",
        "email": "admissions@lauruscollege.edu",
        "phone": "805-267-1690",
        "website": "https://lauruscollege.edu/locations/",
        "type": "Career College",
        "category": "education",
        "subcategory": "Trade & Technical Schools",
        "industry": "Education & Training",
        "location": "411 E Betteravia Rd, Suite 100-B, Santa Maria, CA 93454",
        "services": [
            "Information technology",
            "Cyber security",
            "Business administration",
            "Audio and video production",
            "Online degree programs",
            "On-site computer labs and advising"
        ],
        "careerFields": [
            "Information technology",
            "Cybersecurity",
            "Business",
            "Audio production",
            "Video production"
        ],
        "studentSupport": [
            "Career-college exploration",
            "Online-program research",
            "Admissions inquiry"
        ],
        "opportunities": [],
        "notes": "Career-focused college with online programs and an on-site Santa Maria support location.",
        "source": "Official Laurus College locations and programs pages; reviewed 2026-08"
    },
    {
        "id": "REG-SLO-ADULT-CULINARY",
        "organization": "San Luis Obispo Adult School — Culinary Training",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-549-1222",
        "website": "https://ae.slcusd.org/",
        "type": "Adult Education",
        "category": "education",
        "subcategory": "Trade & Technical Schools",
        "industry": "Education & Training",
        "location": "1500 Lizzie St, Building H2, San Luis Obispo, CA 93401",
        "services": [
            "Food services program",
            "Culinary training",
            "Adult high school diploma",
            "High school equivalency",
            "English as a second language"
        ],
        "careerFields": [
            "Culinary arts",
            "Food service",
            "Hospitality",
            "Adult education"
        ],
        "studentSupport": [
            "Culinary-program inquiry",
            "Adult education planning",
            "Diploma and equivalency support"
        ],
        "opportunities": [],
        "notes": "Regional adult school with a food-services and culinary program alongside diploma and equivalency support.",
        "source": "Official San Luis Obispo Adult School website; reviewed 2026-08"
    },
    {
        "id": "REG-SBCEO-CTE",
        "organization": "Santa Barbara County Education Office — Career Technical Education",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-964-4711",
        "website": "https://www.sbceo.org/programs/cte/overview",
        "type": "Education Resource",
        "category": "education",
        "subcategory": "Trade & Technical Schools",
        "industry": "Education & Training",
        "location": "4400 Cathedral Oaks Rd, Santa Barbara, CA 93110",
        "services": [
            "Countywide CTE pathway information",
            "Industry certifications",
            "Work-based learning",
            "Internship connections",
            "College and career readiness"
        ],
        "careerFields": [
            "Career technical education",
            "Work-based learning",
            "Industry certification",
            "Education"
        ],
        "studentSupport": [
            "Regional CTE pathway research",
            "Certification exploration",
            "Work-based learning inquiry"
        ],
        "opportunities": [],
        "notes": "Countywide resource for hands-on CTE pathways, industry certifications, and real-world career preparation.",
        "source": "Official Santa Barbara County Education Office CTE page; reviewed 2026-08"
    },
    {
        "id": "REG-SMJUHSD-CTE",
        "organization": "Santa Maria Joint Union High School District — Career Technical Education",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-922-4573",
        "website": "https://www.smjuhsd.k12.ca.us/",
        "type": "Education",
        "category": "education",
        "subcategory": "Trade & Technical Schools",
        "industry": "Education & Training",
        "location": "2560 Skyway Dr, Santa Maria, CA 93455",
        "services": [
            "High-school career technical education",
            "Dual enrollment",
            "Hands-on pathway courses",
            "College and career readiness",
            "Industry-aligned instruction"
        ],
        "careerFields": [
            "Career technical education",
            "Skilled trades",
            "Healthcare",
            "Agriculture",
            "Technology"
        ],
        "studentSupport": [
            "High-school CTE pathway exploration",
            "Dual-enrollment research",
            "Regional program inquiry"
        ],
        "opportunities": [],
        "notes": "Regional high-school district offering career technical education and dual-enrollment pathways.",
        "source": "Official Santa Maria Joint Union High School District website; reviewed 2026-08"
    },
    {
        "id": "REG-VENTURA-CAREER-ED",
        "organization": "Ventura College Career Education",
        "contactName": "",
        "contactTitle": "",
        "email": "",
        "phone": "805-289-6000",
        "website": "https://www.venturacollege.edu/departments/academic/career-education",
        "type": "Education",
        "category": "education",
        "subcategory": "Trade & Technical Schools",
        "industry": "Education & Training",
        "location": "4667 Telegraph Rd, Ventura, CA 93003",
        "services": [
            "Automotive career education",
            "Construction technology",
            "Manufacturing technology",
            "Welding",
            "Public safety",
            "Healthcare programs",
            "Business and technology certificates"
        ],
        "careerFields": [
            "Automotive",
            "Construction",
            "Manufacturing",
            "Welding",
            "Public safety",
            "Healthcare",
            "Technology"
        ],
        "studentSupport": [
            "Certificate and degree exploration",
            "Career education planning",
            "Program research"
        ],
        "opportunities": [],
        "notes": "Central Coast community college with career education certificates and hands-on technical programs.",
        "source": "Official Ventura College career education page; reviewed 2026-08"
    },
    {
        "id": "REG-VEGGIE-RESCUE",
        "organization": "Veggie Rescue",
        "contactName": "",
        "contactTitle": "",
        "email": "info@veggierescue.org",
        "phone": "(805) 350-9154",
        "website": "https://veggierescue.org/",
        "type": "Nonprofit",
        "category": "nonprofit",
        "subcategory": "Volunteer & Food Rescue",
        "industry": "Community Services",
        "location": "3630 Sagunto St, Suite C-1, Santa Ynez, CA 93460",
        "services": [
            "Volunteer food rescue",
            "Produce gleaning",
            "Farm and food-business partnerships",
            "Food delivery to community organizations",
            "Food-waste reduction"
        ],
        "careerFields": [
            "Nonprofit service",
            "Agriculture and food systems",
            "Logistics",
            "Sustainability",
            "Community outreach"
        ],
        "studentSupport": [
            "Volunteer inquiry",
            "Service-learning exploration",
            "Food-systems project connection",
            "Community-impact interview"
        ],
        "opportunities": [],
        "notes": "Santa Ynez Valley nonprofit that mobilizes volunteers to rescue surplus produce and other food and deliver it to organizations serving people facing food insecurity across Santa Barbara County.",
        "source": "Official Veggie Rescue website and contact page; reviewed 2026-08"
    }
];


    const STARTER_RECORD_PATCHES = Object.freeze({
        "LOM-SOUTHSIDE-COFFEE": {
            category: "food",
            subcategory: "Food & Drink",
            industry: "Food & Drink"
        },
        "LOM-EMPTYBOWLS": {
            category: "food",
            subcategory: "Food & Drink",
            industry: "Food & Drink"
        },
        "LOM-AMERICAN-HOST": {
            category: "food",
            subcategory: "Food & Drink",
            industry: "Food & Drink"
        },
        "LOM-TORO-LOCO": {
            category: "food",
            subcategory: "Food & Drink",
            industry: "Food & Drink"
        },
        "LOM-GROCERY": { category: "markets", subcategory: "Markets", industry: "Markets" },
        "LOM-VONS": { category: "markets", subcategory: "Markets", industry: "Markets" },
        "LOM-ALBERTSONS": { category: "markets", subcategory: "Markets", industry: "Markets" },
        "LOM-CARNICERIA100": { category: "markets", subcategory: "Markets", industry: "Markets" },
        "LOM-LACHIQUITA": { category: "markets", subcategory: "Markets", industry: "Markets" },
        "LOM-CARNICERIAJALISCO": { category: "markets", subcategory: "Markets", industry: "Markets" },
        "LOM-FOODSCO": { category: "markets", subcategory: "Markets", industry: "Markets" },
        "LOM-SUNSHINEMARKET": { category: "markets", subcategory: "Markets", industry: "Markets" },
        "LOM-VILLAGEMARKET": { category: "markets", subcategory: "Markets", industry: "Markets" },
        "LOM-ZELLERS-FARMS": {
            category: "agriculture",
            subcategory: "Agriculture, Farming & Production",
            industry: "Agriculture & Environment"
        },
        "LOM-FLYING-GOAT": {
            category: "agriculture",
            subcategory: "Agriculture, Farming & Production",
            industry: "Agriculture & Environment"
        },
        "LOM-AMPELOS": {
            category: "agriculture",
            subcategory: "Agriculture, Farming & Production",
            industry: "Agriculture & Environment"
        },
        "LOM-DARE2DREAM": {
            category: "agriculture",
            subcategory: "Agriculture, Farming & Production",
            industry: "Agriculture & Environment"
        },
        "LOM-BIG-E-PRODUCE": {
            category: "agriculture",
            subcategory: "Agriculture, Farming & Production",
            industry: "Agriculture & Environment"
        },
        "LOM-JORDAN-FARMS": {
            category: "agriculture",
            subcategory: "Agriculture, Farming & Production",
            industry: "Agriculture & Environment"
        },
        "LOM-SEEDMILLING": {
            category: "agriculture",
            subcategory: "Agriculture, Farming & Production",
            industry: "Agriculture & Environment"
        },
        "LOM-4H": {
            category: "agriculture",
            subcategory: "Agriculture, Farming & Production",
            industry: "Agriculture & Environment"
        },
        "LOM-ADULTED": {
            organization: "Lompoc Adult School and Career Center",
            website: "https://adulteducation.lusd.org/",
            category: "education",
            subcategory: "Trade & Technical Schools",
            industry: "Education & Training",
            location: "1301 N A St, Lompoc, CA 93436",
            services: [
                "Adult education",
                "High school diploma and equivalency",
                "Healthcare career training",
                "Skilled-trades career training",
                "Nursing assistant program",
                "Online career certifications"
            ],
            careerFields: [
                "Healthcare",
                "Nursing assistant",
                "Skilled trades",
                "Adult education",
                "Career readiness"
            ],
            studentSupport: [
                "Local career-training inquiry",
                "Diploma and equivalency support",
                "Certification research"
            ],
            notes: "Local adult school and career center offering diploma, equivalency, healthcare, skilled-trades, and career-certification pathways."
        },
        "LOM-COLLEGE": {
            organization: "Allan Hancock College — Lompoc Valley Center",
            category: "education",
            subcategory: "Colleges & Career Training",
            industry: "Education & Training",
            services: [
                "College programs",
                "Career and technical education",
                "Certificates and degrees",
                "Student services",
                "Career pathways",
                "Technical training"
            ],
            careerFields: [
                "College pathways",
                "Skilled trades",
                "Healthcare",
                "Business",
                "Public safety",
                "Arts and technology"
            ],
            studentSupport: [
                "Local college exploration",
                "Career-program research",
                "Enrollment and student-services inquiry"
            ],
            notes: "Local Allan Hancock College campus with academic, certificate, and career-technical pathways. Use the College Pathways section in Momentum for the detailed program explorer."
        },
        "LOM-CTE": {
            category: "education",
            subcategory: "Trade & Technical Schools",
            industry: "Education & Training"
        }
    });

    function resolvePartnerId(id) {
        const cleanId = cleanString(id);
        return LEGACY_PARTNER_ID_ALIASES[cleanId] || cleanId;
    }

    function applyStarterRecordRemovals() {
        const before = partners.length;
        partners = partners.filter((partner) => !STARTER_RECORD_REMOVALS.has(partner.id));
        return before - partners.length;
    }

    function now() {
        return new Date().toISOString();
    }

    function createId() {
        return `PAR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }

    function cleanString(value) {
        return typeof value === "string" ? value.trim() : "";
    }

    function cleanArray(value) {
        if (Array.isArray(value)) {
            return [...new Set(value.map(cleanString).filter(Boolean))];
        }

        if (typeof value === "string") {
            return [...new Set(value.split(/[\n,;]+/).map(cleanString).filter(Boolean))];
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
            organization: cleanString(input.organization),
            contactName: cleanString(input.contactName),
            contactTitle: cleanString(input.contactTitle),
            email: cleanString(input.email),
            phone: cleanString(input.phone),
            website: cleanString(input.website),
            type: cleanString(input.type) || "Community Organization",
            category: cleanString(input.category),
            subcategory: cleanString(input.subcategory),
            industry: cleanString(input.industry),
            location: cleanString(input.location),
            services: cleanArray(input.services),
            careerFields: cleanArray(input.careerFields),
            studentSupport: cleanArray(input.studentSupport),
            opportunities: cleanArray(input.opportunities),
            notes: cleanString(input.notes),
            source: cleanString(input.source),
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
            partners
        }));
    }

    function applyStarterRecordPatches() {
        let updated = 0;

        partners = partners.map((partner) => {
            const patch = STARTER_RECORD_PATCHES[partner.id];
            if (!patch) return partner;

            const next = normalize({
                ...partner,
                ...patch,
                id: partner.id,
                meta: {
                    ...partner.meta,
                    updatedAt: now()
                }
            });

            const changed = JSON.stringify(next) !== JSON.stringify(partner);
            if (changed) updated += 1;
            return changed ? next : partner;
        });

        return updated;
    }

    function initialize() {
        let loaded = [];

        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            if (Array.isArray(parsed)) {
                loaded = parsed;
            } else if (parsed && Array.isArray(parsed.partners)) {
                loaded = parsed.partners;
            }
        } catch (error) {
            console.warn("Momentum could not load partners.", error);
        }

        partners = loaded.map(normalize);
        document.addEventListener(DATA_CHANGED_EVENT, save);

        const installedStarterVersion = Number(
            localStorage.getItem(STARTER_VERSION_KEY) || 0
        );
        let starterAdditions = 0;
        let starterUpdates = 0;
        let starterRemovals = 0;

        if (installedStarterVersion < STARTER_LIBRARY_VERSION) {
            starterAdditions = loadLompocBusinessDirectory();
            starterUpdates = applyStarterRecordPatches();
            starterRemovals = applyStarterRecordRemovals();
            localStorage.setItem(STARTER_VERSION_KEY, String(STARTER_LIBRARY_VERSION));
            save();
        }

        emitChange({
            action: "initialize",
            count: partners.length,
            starterAdditions,
            starterUpdates,
            starterRemovals
        });
        return getPartners();
    }

    function getPartners(options = {}) {
        const includeArchived = options.includeArchived !== false;
        const result = includeArchived
            ? partners
            : partners.filter((item) => !item.meta.archived);

        return clone([...result].sort((a, b) =>
            a.organization.localeCompare(b.organization)
        ));
    }

    function getPartner(id) {
        const resolvedId = resolvePartnerId(id);
        const partner = partners.find((item) => item.id === resolvedId);
        return partner ? clone(partner) : null;
    }

    function createPartner(data = {}) {
        const partner = normalize({
            ...data,
            meta: {
                createdAt: now(),
                updatedAt: now(),
                archived: false
            }
        });

        partners.push(partner);
        emitChange({ action: "create", partnerId: partner.id });
        return clone(partner);
    }

    function updatePartner(id, patch = {}) {
        const resolvedId = resolvePartnerId(id);
        const index = partners.findIndex((item) => item.id === resolvedId);
        if (index === -1) {
            return null;
        }

        const current = partners[index];
        partners[index] = normalize({
            ...current,
            ...patch,
            id: current.id,
            meta: {
                ...current.meta,
                ...(patch.meta || {}),
                updatedAt: now()
            }
        });

        emitChange({ action: "update", partnerId: resolvedId });
        return clone(partners[index]);
    }

    function archivePartner(id) {
        return updatePartner(id, { meta: { archived: true } });
    }

    function restorePartner(id) {
        return updatePartner(id, { meta: { archived: false } });
    }

    function loadLompocBusinessDirectory() {
        const existingIds = new Set(partners.map((item) => item.id));
        const existingNames = new Set(
            partners.map((item) => item.organization.toLowerCase())
        );

        const additions = LOMPOC_BUSINESS_DIRECTORY
            .filter((item) =>
                !existingIds.has(item.id) &&
                !existingNames.has(item.organization.toLowerCase())
            )
            .map((item) => normalize({
                ...item,
                meta: {
                    archived: false,
                    createdAt: now(),
                    updatedAt: now()
                }
            }));

        partners.push(...additions);
        emitChange({
            action: "loadLompocBusinessDirectory",
            count: additions.length
        });
        return additions.length;
    }

    function replaceAll(list = []) {
        if (!Array.isArray(list)) {
            throw new TypeError("PartnerManager.replaceAll expects an array.");
        }

        partners = list.map(normalize)
            .filter((item) => !STARTER_RECORD_REMOVALS.has(item.id));
        emitChange({ action: "replaceAll", count: partners.length });
        return getPartners();
    }

    function search(query = "", options = {}) {
        const normalizedQuery = cleanString(query).toLowerCase();
        const type = cleanString(options.type);
        const industry = cleanString(options.industry);
        const location = cleanString(options.location);
        const status = cleanString(options.status || "active");

        return getPartners().filter((partner) => {
            if (status === "active" && partner.meta.archived) {
                return false;
            }
            if (status === "archived" && !partner.meta.archived) {
                return false;
            }
            if (type && partner.type !== type) {
                return false;
            }
            if (industry && partner.industry !== industry) {
                return false;
            }
            if (location &&
                !partner.location.toLowerCase().includes(location.toLowerCase())) {
                return false;
            }
            if (!normalizedQuery) {
                return true;
            }

            const haystack = [
                partner.organization,
                partner.contactName,
                partner.contactTitle,
                partner.email,
                partner.phone,
                partner.type,
                partner.industry,
                partner.location,
                partner.notes,
                ...partner.services,
                ...partner.opportunities
            ].join(" ").toLowerCase();

            return normalizedQuery
                .split(/\s+/)
                .filter(Boolean)
                .every((term) => haystack.includes(term));
        });
    }

    return Object.freeze({
        STORAGE_KEY,
        DATA_CHANGED_EVENT,
        initialize,
        getPartners,
        getPartner,
        resolvePartnerId,
        createPartner,
        updatePartner,
        archivePartner,
        restorePartner,
        loadLompocBusinessDirectory,
        replaceAll,
        search
    });
})();
