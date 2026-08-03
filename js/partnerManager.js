/*
==========================================================
Momentum
Partner Manager Module
Build v21.0.0
File: js/partnerManager.js
==========================================================
*/

"use strict";

const PartnerManager = (() => {
    const STORAGE_KEY = "momentum.partners";
    const DATA_CHANGED_EVENT = "partnerDataChanged";
    let partners = [];

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
                "website": "https://explorelompoc.com/directory/old-town-kitchen-bar/",
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
                "source": "Lompoc starter directory"
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
                "industry": "Retail",
                "location": "316 E Ocean Ave, Lompoc, CA 93436",
                "services": [
                        "Retail",
                        "Inventory",
                        "Food",
                        "Customer service"
                ],
                "opportunities": [],
                "notes": "Discount grocery retail.",
                "source": "Lompoc starter directory"
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
                "industry": "Retail",
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
                "source": "Lompoc starter directory"
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
                "industry": "Retail",
                "location": "1500 N H St, Lompoc, CA 93436",
                "services": [
                        "Grocery",
                        "Bakery",
                        "Pharmacy",
                        "Customer service"
                ],
                "opportunities": [],
                "notes": "Grocery retail.",
                "source": "Lompoc starter directory"
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
                "industry": "Education",
                "location": "1 Hancock Dr, Lompoc, CA 93436",
                "services": [
                        "College programs",
                        "Student services",
                        "Education",
                        "Career training"
                ],
                "opportunities": [],
                "notes": "Local community-college campus.",
                "source": "Lompoc starter directory"
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
                "website": "https://explorelompoc.com/blog/top-places-to-satisfy-your-sweet-tooth-in-lompoc/",
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
                "source": "Lompoc starter directory"
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
        }
,

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
                "industry": "Food & Community",
                "location": "Lompoc, CA",
                "services": [
                        "Fundraising",
                        "Food security",
                        "Events",
                        "Volunteer service"
                ],
                "opportunities": [],
                "notes": "Community fundraising and food-security support.",
                "source": "Lompoc starter directory"
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
                "id": "LOM-CTE",
                "organization": "Allan Hancock College Career Education",
                "contactName": "",
                "contactTitle": "",
                "email": "",
                "phone": "",
                "website": "https://www.hancockcollege.edu/pathways/index.php",
                "type": "Education",
                "industry": "Education",
                "location": "1 Hancock Dr, Lompoc, CA 93436",
                "services": [
                        "Career programs",
                        "College",
                        "Technical training",
                        "Student services"
                ],
                "opportunities": [],
                "notes": "Career and technical education programs.",
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
        }

];

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
            industry: cleanString(input.industry),
            location: cleanString(input.location),
            services: cleanArray(input.services),
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
        emitChange({ action: "initialize", count: partners.length });
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
        const partner = partners.find((item) => item.id === id);
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
        const index = partners.findIndex((item) => item.id === id);
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

        emitChange({ action: "update", partnerId: id });
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

        partners = list.map(normalize);
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
        createPartner,
        updatePartner,
        archivePartner,
        restorePartner,
        loadLompocBusinessDirectory,
        replaceAll,
        search
    });
})();
