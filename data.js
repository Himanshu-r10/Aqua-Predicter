// Central Ground Water Board (CGWB) & IMD Data Benchmarks for India
const AQUIFER_DATA = {
    states: {
        "Rajasthan": {
            districts: ["Jaipur", "Jodhpur", "Jaisalmer", "Bikaner", "Ajmer", "Udaipur", "Sikar"],
            defaultSoil: "Sandy",
            avgRainfall: 450,
            baseDepth: 28.5,
            extractionRate: 145,
            aquiferType: "Alluvial / Hard Rock Crystalline",
            riskLevel: "Over-Exploited"
        },
        "Punjab": {
            districts: ["Ludhiana", "Amritsar", "Patiala", "Bathinda", "Jalandhar", "Sangrur", "Moga"],
            defaultSoil: "Alluvial",
            avgRainfall: 650,
            baseDepth: 24.2,
            extractionRate: 165,
            aquiferType: "Deep Indo-Gangetic Alluvium",
            riskLevel: "Over-Exploited"
        },
        "Haryana": {
            districts: ["Gurugram", "Faridabad", "Karnal", "Hisar", "Ambala", "Panipat", "Kurukshetra"],
            defaultSoil: "Alluvial",
            avgRainfall: 560,
            baseDepth: 22.8,
            extractionRate: 140,
            aquiferType: "Indo-Gangetic Deep Alluvium",
            riskLevel: "Over-Exploited"
        },
        "Maharashtra": {
            districts: ["Pune", "Nagpur", "Nashik", "Chhatrapati Sambhajinagar", "Solapur", "Kolhapur", "Latur"],
            defaultSoil: "Black (Regur)",
            avgRainfall: 1100,
            baseDepth: 12.4,
            extractionRate: 88,
            aquiferType: "Basalt / Deccan Trap Volcanic",
            riskLevel: "Semi-Critical"
        },
        "Karnataka": {
            districts: ["Bengaluru Urban", "Mysuru", "Kolar", "Belagavi", "Tumakuru", "Kalaburagi", "Chikkaballapur"],
            defaultSoil: "Red Sandy Loam",
            avgRainfall: 950,
            baseDepth: 18.2,
            extractionRate: 115,
            aquiferType: "Hard Rock Granitic Gneiss",
            riskLevel: "Critical"
        },
        "Tamil Nadu": {
            districts: ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Thanjavur", "Erode"],
            defaultSoil: "Red Loamy / Clay",
            avgRainfall: 990,
            baseDepth: 14.8,
            extractionRate: 110,
            aquiferType: "Crystalline Fractured Rock & Coastal",
            riskLevel: "Critical"
        },
        "Gujarat": {
            districts: ["Ahmedabad", "Surat", "Rajkot", "Vadodara", "Kutch", "Banaskantha", "Mehsana"],
            defaultSoil: "Alluvial / Coastal Sandy",
            avgRainfall: 800,
            baseDepth: 21.0,
            extractionRate: 120,
            aquiferType: "Alluvial & Mesozoic Sandstone",
            riskLevel: "Critical"
        },
        "Uttar Pradesh": {
            districts: ["Lucknow", "Varanasi", "Kanpur", "Prayagraj", "Agra", "Meerut", "Gorakhpur"],
            defaultSoil: "Alluvial Deep",
            avgRainfall: 1020,
            baseDepth: 9.8,
            extractionRate: 92,
            aquiferType: "Deep Multi-layered Alluvium",
            riskLevel: "Safe"
        },
        "Madhya Pradesh": {
            districts: ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa"],
            defaultSoil: "Black Cotton",
            avgRainfall: 1150,
            baseDepth: 11.2,
            extractionRate: 82,
            aquiferType: "Vindhyan Sandstone / Basalt",
            riskLevel: "Safe"
        },
        "Kerala": {
            districts: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Palakkad", "Kottayam", "Wayanad", "Thrissur"],
            defaultSoil: "Laterite",
            avgRainfall: 2900,
            baseDepth: 5.6,
            extractionRate: 48,
            aquiferType: "Coastal Alluvium & Charnockite",
            riskLevel: "Safe"
        },
        "Telangana": {
            districts: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Nalgonda"],
            defaultSoil: "Red Loamy",
            avgRainfall: 900,
            baseDepth: 15.6,
            extractionRate: 102,
            aquiferType: "Granite / Hard Rock",
            riskLevel: "Semi-Critical"
        },
        "West Bengal": {
            districts: ["Kolkata", "Howrah", "Hooghly", "Murshidabad", "Bardhaman", "North 24 Parganas"],
            defaultSoil: "Alluvial Clayey",
            avgRainfall: 1650,
            baseDepth: 7.8,
            extractionRate: 75,
            aquiferType: "Deltaic Alluvial Aquifer",
            riskLevel: "Safe"
        }
    },

    soilPermeability: {
        "Sandy": { rechargeFactor: 0.35, retention: "Low", runOff: 0.15, desc: "High infiltration rate, low moisture retention" },
        "Alluvial": { rechargeFactor: 0.28, retention: "High", runOff: 0.25, desc: "Optimal agricultural percolation & storage" },
        "Alluvial Deep": { rechargeFactor: 0.30, retention: "Very High", runOff: 0.22, desc: "High multi-tier aquifer permeability" },
        "Red Sandy Loam": { rechargeFactor: 0.22, retention: "Medium", runOff: 0.30, desc: "Moderate infiltration across crystalline bedrocks" },
        "Black (Regur)": { rechargeFactor: 0.14, retention: "Very High", runOff: 0.45, desc: "Expansive clay, poor rapid infiltration" },
        "Black Cotton": { rechargeFactor: 0.15, retention: "Very High", runOff: 0.42, desc: "High swelling, crack drainage in dry seasons" },
        "Laterite": { rechargeFactor: 0.18, retention: "Medium", runOff: 0.35, desc: "Porous cellular structure with good transmission" },
        "Red Loamy / Clay": { rechargeFactor: 0.16, retention: "Medium", runOff: 0.38, desc: "Moderate storage, requires artificial recharge" },
        "Alluvial / Coastal Sandy": { rechargeFactor: 0.26, retention: "Low-Medium", runOff: 0.20, desc: "Subject to saline intrusion risk" },
        "Alluvial Clayey": { rechargeFactor: 0.19, retention: "High", runOff: 0.32, desc: "Deltaic floodplains with high shallow storage" }
    },

    dwlrStations: [
        {
            id: "DWLR-RJ-042",
            name: "Jaipur Central Aquifer Node",
            state: "Rajasthan",
            district: "Jaipur",
            lat: 26.9124,
            lng: 75.7873,
            depth: 31.45,
            trend: "Declining (-0.82 m/yr)",
            battery: 94,
            waterTemp: "24.2°C",
            ec: "1,250 µS/cm",
            signal: "4G LTE (98%)",
            status: "Online",
            category: "Over-Exploited"
        },
        {
            id: "DWLR-PB-019",
            name: "Ludhiana Deep Agro Borewell",
            state: "Punjab",
            district: "Ludhiana",
            lat: 30.9010,
            lng: 75.8573,
            depth: 26.80,
            trend: "Declining (-1.15 m/yr)",
            battery: 89,
            waterTemp: "22.5°C",
            ec: "980 µS/cm",
            signal: "4G LTE (92%)",
            status: "Online",
            category: "Over-Exploited"
        },
        {
            id: "DWLR-HR-031",
            name: "Gurugram Urban Basin Monitor",
            state: "Haryana",
            district: "Gurugram",
            lat: 28.4595,
            lng: 77.0266,
            depth: 29.10,
            trend: "Critical (-0.95 m/yr)",
            battery: 88,
            waterTemp: "23.9°C",
            ec: "1,410 µS/cm",
            signal: "4G LTE (95%)",
            status: "Online",
            category: "Over-Exploited"
        },
        {
            id: "DWLR-MH-108",
            name: "Pune Deccan Basalt Station",
            state: "Maharashtra",
            district: "Pune",
            lat: 18.5204,
            lng: 73.8567,
            depth: 13.15,
            trend: "Stable (+0.05 m/yr)",
            battery: 98,
            waterTemp: "25.1°C",
            ec: "640 µS/cm",
            signal: "4G LTE (99%)",
            status: "Online",
            category: "Semi-Critical"
        },
        {
            id: "DWLR-KA-073",
            name: "Kolar Hard-Rock Deep Well",
            state: "Karnataka",
            district: "Kolar",
            lat: 13.1367,
            lng: 78.1291,
            depth: 42.60,
            trend: "Severe Depletion (-1.40 m/yr)",
            battery: 76,
            waterTemp: "26.0°C",
            ec: "1,420 µS/cm",
            signal: "4G LTE (84%)",
            status: "Online",
            category: "Over-Exploited"
        },
        {
            id: "DWLR-UP-211",
            name: "Varanasi Gangetic Plain Unit",
            state: "Uttar Pradesh",
            district: "Varanasi",
            lat: 25.3176,
            lng: 82.9739,
            depth: 8.90,
            trend: "Recharging (+0.25 m/yr)",
            battery: 100,
            waterTemp: "23.8°C",
            ec: "510 µS/cm",
            signal: "4G LTE (100%)",
            status: "Online",
            category: "Safe"
        },
        {
            id: "DWLR-KL-005",
            name: "Palakkad Valley Groundwater Cell",
            state: "Kerala",
            district: "Palakkad",
            lat: 10.7867,
            lng: 76.6548,
            depth: 4.80,
            trend: "Safe (+0.40 m/yr)",
            battery: 92,
            waterTemp: "27.4°C",
            ec: "320 µS/cm",
            signal: "4G LTE (96%)",
            status: "Online",
            category: "Safe"
        },
        {
            id: "DWLR-GJ-088",
            name: "Kutch Semi-Arid Sensor Hub",
            state: "Gujarat",
            district: "Kutch",
            lat: 23.2420,
            lng: 69.6669,
            depth: 27.50,
            trend: "Declining (-0.65 m/yr)",
            battery: 85,
            waterTemp: "28.1°C",
            ec: "2,100 µS/cm",
            signal: "4G LTE (89%)",
            status: "Online",
            category: "Critical"
        },
        {
            id: "DWLR-TN-154",
            name: "Salem Crystalline Rock Well",
            state: "Tamil Nadu",
            district: "Salem",
            lat: 11.6643,
            lng: 78.1460,
            depth: 19.30,
            trend: "Semi-Critical (-0.35 m/yr)",
            battery: 91,
            waterTemp: "26.5°C",
            ec: "1,150 µS/cm",
            signal: "4G LTE (93%)",
            status: "Online",
            category: "Critical"
        },
        {
            id: "DWLR-MP-062",
            name: "Indore Malwa Plateau Node",
            state: "Madhya Pradesh",
            district: "Indore",
            lat: 22.7196,
            lng: 75.8577,
            depth: 11.40,
            trend: "Stable (+0.10 m/yr)",
            battery: 97,
            waterTemp: "24.9°C",
            ec: "590 µS/cm",
            signal: "4G LTE (97%)",
            status: "Online",
            category: "Safe"
        }
    ],

    historicalTrends: {
        years: ["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
        preMonsoon: [14.2, 14.8, 15.5, 16.1, 15.9, 16.8, 17.4, 18.1, 18.9, 19.4],
        postMonsoon: [10.5, 11.1, 11.8, 12.0, 11.4, 12.5, 13.0, 13.6, 14.2, 14.7],
        forecastYears: ["2026 (Pred)", "2027 (Pred)", "2028 (Pred)", "2029 (Pred)", "2030 (Pred)"],
        forecastStatusQuo: [20.2, 21.1, 22.0, 23.0, 24.1],
        forecastWithAIRecharge: [18.8, 17.9, 17.0, 16.1, 15.2],
        monthlyMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        monthlyRainfall: [15, 20, 28, 45, 90, 210, 340, 310, 190, 70, 30, 12],
        monthlyDepth: [18.2, 18.7, 19.3, 20.1, 20.9, 19.8, 16.2, 14.1, 14.5, 15.7, 16.9, 17.6]
    },

    stateComparison: {
        states: ["Punjab", "Rajasthan", "Haryana", "Tamil Nadu", "Karnataka", "Gujarat", "Maharashtra", "MP", "UP", "Kerala"],
        extractionPercent: [165, 145, 140, 110, 115, 120, 88, 82, 92, 48],
        safeLimit: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
    },

    sihDetails: {
        problemId: "SIH-1428",
        theme: "Clean & Green Technology / Smart Water Management",
        organization: "Ministry of Jal Shakti & Central Ground Water Board (CGWB)",
        category: "Software Edition (Grand Finale)",
        projectTitle: "AQUA-PREDICT: AI/ML Powered Predictive Groundwater Level & Aquifer Health Monitoring Platform",
        teamName: "HydroMind AI",
        tagline: "Empowering National Aquifer Governance through Deep Learning, IoT Telemetry, and Geospatial Intelligence",
        abstract: "Groundwater fulfills 85% of India's rural drinking needs and 60% of irrigated agriculture. AquaPredict addresses catastrophic groundwater depletion by building a spatio-temporal predictive engine combining real-time Digital Water Level Recorders (DWLR), NASA GRACE gravitational anomalies, Sentinel-2 surface soil moisture, and IMD gridded rainfall. Using a hybrid Temporal Fusion Transformer (TFT) and XGBoost model, AquaPredict provides 1 to 36-month groundwater depth forecasts at block/panchayat resolution, automatic depletion anomaly triggers, and automated aquifer recharge advisory generation.",
        sdgs: [
            { code: "SDG 6", title: "Clean Water & Sanitation", desc: "Target 6.4: Substantially increase water-use efficiency and sustainable groundwater withdrawals across all sectors." },
            { code: "SDG 13", title: "Climate Action", desc: "Target 13.1: Strengthen regional resilience and early warning systems against climate-induced drought emergencies." },
            { code: "SDG 2", title: "Zero Hunger", desc: "Target 2.4: Ensure sustainable food production through precision water-budgeted irrigation recommendations." },
            { code: "SDG 9", title: "Industry & Innovation", desc: "Target 9.5: Upgrade telemetric infrastructure and AI-driven governance tools for hydrological engineering." }
        ],
        teamMembers: [
            { name: "Aarav Sharma", role: "Team Lead & AI/ML Engineer", icon: "cpu", desc: "Architecture of Temporal Fusion Transformer (TFT) & LSTM PyTorch Models for Hydro-Forecasting." },
            { name: "Priya Patel", role: "Full Stack & WebGIS Developer", icon: "map-pin", desc: "Development of Leaflet/PostGIS Spatio-temporal interactive mapping & REST APIs." },
            { name: "Himanshu", role: "IoT & Telemetry Systems Engineer", icon: "radio", desc: "Edge DWLR sensor calibration, MQTT broker pipeline, and telemetry validation." },
            { name: "Ananya Iyer", role: "Data Scientist & Hydrogeologist", icon: "database", desc: "CGWB hydrological data integration, GRACE gravity anomaly ETL, & soil modeling." },
            { name: "Vikram Malhotra", role: "Backend & Cloud Architect", icon: "server", desc: "FastAPI microservices, Dockerization, Redis distributed caching, and automated pipelines." },
            { name: "Sneha Reddy", role: "UI/UX & Policy Intelligence Lead", icon: "layout", desc: "Jal Shakti policy dashboard, bilingual farmer advisory UI, and SDG impact metric tracker." }
        ]
    }
};
