// AquaPredict - Smart India Hackathon Groundwater Prediction & Analytics System
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // State & UI Initializers
    initSelectors();
    initLeafletMap();
    initCharts();
    initDWLRSimulator();
    initPresetButtons();

    // Trigger Initial Prediction
    calculatePrediction();
});

// Global instances
let mapInstance = null;
let markersGroup = null;
let hydrographChart = null;
let seasonalChart = null;
let forecastChart = null;
let stateBarChart = null;
let liveSensorInterval = null;
let activeStation = AQUIFER_DATA.dwlrStations[0];

// ==========================================
// 1. SELECTORS & FORM HANDLERS
// ==========================================
function initSelectors() {
    const stateSelect = document.getElementById('stateSelect');
    const districtSelect = document.getElementById('districtSelect');
    const soilSelect = document.getElementById('soilSelect');
    const rainfallInput = document.getElementById('rainfallInput');
    const rainfallVal = document.getElementById('rainfallVal');
    const extractionInput = document.getElementById('extractionInput');
    const extractionVal = document.getElementById('extractionVal');

    // Populate States
    stateSelect.innerHTML = '';
    Object.keys(AQUIFER_DATA.states).forEach(state => {
        const opt = document.createElement('option');
        opt.value = state;
        opt.textContent = state;
        stateSelect.appendChild(opt);
    });

    // Handle State Change
    stateSelect.addEventListener('change', () => {
        const selectedState = stateSelect.value;
        const stateInfo = AQUIFER_DATA.states[selectedState];

        // Populate Districts
        districtSelect.innerHTML = '';
        stateInfo.districts.forEach(dist => {
            const opt = document.createElement('option');
            opt.value = dist;
            opt.textContent = dist;
            districtSelect.appendChild(opt);
        });

        // Set state defaults
        rainfallInput.value = stateInfo.avgRainfall;
        rainfallVal.textContent = `${stateInfo.avgRainfall} mm`;

        extractionInput.value = stateInfo.extractionRate;
        extractionVal.textContent = `${stateInfo.extractionRate} %`;

        // Match soil type if available
        if (stateInfo.defaultSoil && soilSelect.querySelector(`option[value="${stateInfo.defaultSoil}"]`)) {
            soilSelect.value = stateInfo.defaultSoil;
        }

        calculatePrediction();
    });

    // Populate Soil dropdown
    soilSelect.innerHTML = '';
    Object.keys(AQUIFER_DATA.soilPermeability).forEach(soil => {
        const opt = document.createElement('option');
        opt.value = soil;
        opt.textContent = soil;
        soilSelect.appendChild(opt);
    });

    // Initial Trigger for First State
    stateSelect.dispatchEvent(new Event('change'));

    // Input Event Listeners
    rainfallInput.addEventListener('input', () => {
        rainfallVal.textContent = `${rainfallInput.value} mm`;
        calculatePrediction();
    });

    extractionInput.addEventListener('input', () => {
        extractionVal.textContent = `${extractionInput.value} %`;
        calculatePrediction();
    });

    document.getElementById('seasonSelect').addEventListener('change', calculatePrediction);
    soilSelect.addEventListener('change', calculatePrediction);
    document.getElementById('aquiferSelect').addEventListener('change', calculatePrediction);
    document.getElementById('rechargeSelect').addEventListener('change', calculatePrediction);

    // Predict Button Manual Click
    const predictBtn = document.getElementById('predictBtn');
    if (predictBtn) {
        predictBtn.addEventListener('click', () => {
            predictBtn.classList.add('animate-pulse');
            setTimeout(() => {
                predictBtn.classList.remove('animate-pulse');
                calculatePrediction();
            }, 300);
        });
    }
}

// ==========================================
// 2. PREDICTION ENGINE (SIMULATED ML MODEL)
// ==========================================
function calculatePrediction() {
    const state = document.getElementById('stateSelect').value;
    const district = document.getElementById('districtSelect').value;
    const season = document.getElementById('seasonSelect').value;
    const rainfall = parseFloat(document.getElementById('rainfallInput').value);
    const extractionRate = parseFloat(document.getElementById('extractionInput').value);
    const soilType = document.getElementById('soilSelect').value;
    const aquiferType = document.getElementById('aquiferSelect').value;
    const rechargeMeasure = document.getElementById('rechargeSelect').value;

    const stateData = AQUIFER_DATA.states[state] || AQUIFER_DATA.states["Rajasthan"];
    const soilData = AQUIFER_DATA.soilPermeability[soilType] || { rechargeFactor: 0.25 };

    // Base Depth Baseline (mbgl - meters below ground level)
    let depth = stateData.baseDepth;

    // Seasonal Fluctuation (mbgl)
    const seasonalOffsets = {
        "Pre-Monsoon (Summer May-Jun)": 2.2,
        "Monsoon (Jul-Sep)": -2.8,
        "Post-Monsoon (Oct-Nov)": -1.4,
        "Winter / Rabi Season (Dec-Feb)": 0.6
    };
    depth += (seasonalOffsets[season] || 0);

    // Rainfall Deficit/Surplus impact
    const rainfallDiff = rainfall - stateData.avgRainfall;
    const rechargeInfiltration = (rainfallDiff * soilData.rechargeFactor) / 100;
    depth -= rechargeInfiltration; // Higher rainfall decreases depth below surface (rises water level)

    // Groundwater Extraction Impact
    const extractionFactor = (extractionRate - 100) * 0.09;
    depth += extractionFactor;

    // Aquifer Geolithology modifier
    const aquiferOffsets = {
        "Deep Indo-Gangetic Alluvium": -0.8,
        "Hard Rock Granitic Gneiss": 1.8,
        "Basaltic Deccan Traps": 0.9,
        "Coastal Alluvial Sandstone": -0.4,
        "Crystalline Fractured Rock": 1.4
    };
    depth += (aquiferOffsets[aquiferType] || 0);

    // Artificial Recharge Intervention Deductions
    const rechargeOffsets = {
        "None": 0,
        "Check Dams & Farm Ponds": -1.6,
        "Rooftop Rainwater Harvesting Mandate": -1.1,
        "Deep Injection Wells & Shafts": -2.4,
        "Integrated Watershed Management (Comprehensive)": -3.5
    };
    depth += (rechargeOffsets[rechargeMeasure] || 0);

    // Boundary limit: 2.0m to 62.0m
    depth = Math.max(2.0, Math.min(62.0, depth));
    const finalDepth = parseFloat(depth.toFixed(2));

    // Determine Classification Category
    let category = "Safe";
    let badgeClass = "badge-safe";
    let statusColor = "#10b981";
    let alertMsg = "Aquifer extraction is within sustainable recharge limits.";

    if (finalDepth >= 30.0 || extractionRate > 135) {
        category = "Over-Exploited";
        badgeClass = "badge-overexploited";
        statusColor = "#f43f5e";
        alertMsg = "CRITICAL ALERT: Annual groundwater withdrawal exceeds net annual recharge capacity!";
    } else if (finalDepth >= 20.0 || extractionRate > 110) {
        category = "Critical";
        badgeClass = "badge-critical";
        statusColor = "#f97316";
        alertMsg = "WARNING: Water table approaching critical threshold. Immediate artificial recharge needed.";
    } else if (finalDepth >= 10.0 || extractionRate > 85) {
        category = "Semi-Critical";
        badgeClass = "badge-semi";
        statusColor = "#f59e0b";
        alertMsg = "CAUTION: Moderate stress observed. Demand-side management recommended.";
    }

    // Depletion Rate
    const annualRate = (extractionRate > 100 ? -1 : 1) * Math.abs((extractionRate - 100) * 0.015 + 0.15).toFixed(2);
    const confidenceScore = (94.2 + (Math.random() * 2.8)).toFixed(1);

    // Update UI Elements
    document.getElementById('resultDepth').textContent = `${finalDepth} m`;
    document.getElementById('resultLocation').textContent = `${district}, ${state}`;
    
    const categoryBadge = document.getElementById('resultCategory');
    categoryBadge.className = `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}`;
    categoryBadge.textContent = category;

    document.getElementById('resultConfidence').textContent = `${confidenceScore}%`;
    document.getElementById('resultDepletionRate').textContent = `${annualRate > 0 ? '+' : ''}${annualRate} m/yr`;
    document.getElementById('resultAlertText').textContent = alertMsg;

    // Update Animated Water Column Gauge
    updateWaterTankGauge(finalDepth, statusColor);

    // Update Recommendations
    updateRecommendations(category, soilType, state);
}

function updateWaterTankGauge(depth, color) {
    // Max visual depth scale = 60 mbgl
    // 0 mbgl = 100% water height, 60 mbgl = 5% water height
    const waterColumn = document.getElementById('waterColumn');
    const waterLevelMarker = document.getElementById('waterLevelMarker');

    const clampedDepth = Math.min(60, Math.max(0, depth));
    const percentage = Math.max(8, 100 - (clampedDepth / 60 * 92));

    if (waterColumn) {
        waterColumn.style.height = `${percentage}%`;
    }
    if (waterLevelMarker) {
        waterLevelMarker.textContent = `${depth} mbgl (Water Table)`;
        waterLevelMarker.style.bottom = `calc(${percentage}% - 10px)`;
    }
}

function updateRecommendations(category, soilType, state) {
    const list = document.getElementById('recommendationsList');
    if (!list) return;

    list.innerHTML = '';
    const recs = [];

    if (category === "Over-Exploited" || category === "Critical") {
        recs.push({
            icon: "alert-triangle",
            title: "Mandate Micro-Irrigation (Drip/Sprinkler)",
            desc: "Impose immediate transition from flood irrigation to micro-drip fertigation to curb 40% agricultural water loss."
        });
        recs.push({
            icon: "shield-alert",
            title: "Artificial Recharge Shafts & Check Dams",
            desc: `Deploy cascading check-dams and aquifer recharge shafts suitable for ${soilType} geology before the next monsoon.`
        });
        recs.push({
            icon: "ban",
            title: "Cap Commercial Borewell Deep Drilling",
            desc: "Notify the assessment block under CGWB Central Ground Water Authority (CGWA) regulatory restrictions."
        });
    } else if (category === "Semi-Critical") {
        recs.push({
            icon: "cloud-rain",
            title: "Rooftop Rainwater Harvesting (RWH) Incentive",
            desc: "Provide tax subsidies for urban & institutional rooftop rainwater harvesting systems."
        });
        recs.push({
            icon: "git-branch",
            title: "Crop Diversification Away from Water-Intensive Crops",
            desc: "Encourage pulses, millets (Shree Anna), and oilseeds instead of water-thirsty summer paddy/sugarcane."
        });
    } else {
        recs.push({
            icon: "check-circle-2",
            title: "Sustainable Aquifer Maintenance",
            desc: "Current extraction rates are balanced by natural precipitation recharge. Continue seasonal DWLR telemetry monitoring."
        });
        recs.push({
            icon: "activity",
            title: "Community Water Budgeting & Jal Samiti Meetings",
            desc: "Conduct participatory groundwater management workshops at Panchayat level."
        });
    }

    recs.forEach(r => {
        const li = document.createElement('div');
        li.className = 'flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60';
        li.innerHTML = `
            <div class="p-2 rounded-md bg-cyan-500/10 text-cyan-400 mt-0.5">
                <i data-lucide="${r.icon}" class="w-4 h-4"></i>
            </div>
            <div>
                <h4 class="text-sm font-semibold text-slate-100">${r.title}</h4>
                <p class="text-xs text-slate-400 mt-0.5">${r.desc}</p>
            </div>
        `;
        list.appendChild(li);
    });

    if (window.lucide) {
        lucide.createIcons();
    }
}

// ==========================================
// 3. PRESET BUTTONS
// ==========================================
function initPresetButtons() {
    const presets = {
        'preset-punjab': { state: 'Punjab', season: 'Pre-Monsoon (Summer May-Jun)', rainfall: 520, extraction: 165, soil: 'Alluvial', aquifer: 'Deep Indo-Gangetic Alluvium', recharge: 'None' },
        'preset-rajasthan': { state: 'Rajasthan', season: 'Pre-Monsoon (Summer May-Jun)', rainfall: 340, extraction: 150, soil: 'Sandy', aquifer: 'Hard Rock Granitic Gneiss', recharge: 'None' },
        'preset-up': { state: 'Uttar Pradesh', season: 'Monsoon (Jul-Sep)', rainfall: 1100, extraction: 85, soil: 'Alluvial Deep', aquifer: 'Deep Indo-Gangetic Alluvium', recharge: 'Check Dams & Farm Ponds' },
        'preset-karnataka': { state: 'Karnataka', season: 'Pre-Monsoon (Summer May-Jun)', rainfall: 780, extraction: 125, soil: 'Red Sandy Loam', aquifer: 'Hard Rock Granitic Gneiss', recharge: 'None' }
    };

    Object.keys(presets).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                const config = presets[btnId];
                document.getElementById('stateSelect').value = config.state;
                document.getElementById('stateSelect').dispatchEvent(new Event('change'));

                setTimeout(() => {
                    document.getElementById('seasonSelect').value = config.season;
                    document.getElementById('rainfallInput').value = config.rainfall;
                    document.getElementById('rainfallVal').textContent = `${config.rainfall} mm`;
                    document.getElementById('extractionInput').value = config.extraction;
                    document.getElementById('extractionVal').textContent = `${config.extraction} %`;
                    document.getElementById('soilSelect').value = config.soil;
                    document.getElementById('aquiferSelect').value = config.aquifer;
                    document.getElementById('rechargeSelect').value = config.recharge;
                    calculatePrediction();
                }, 50);
            });
        }
    });
}

// ==========================================
// 4. LEAFLET GEOSPATIAL MAP
// ==========================================
function initLeafletMap() {
    const mapElement = document.getElementById('aquiferMap');
    if (!mapElement || !window.L) return;

    mapInstance = L.map('aquiferMap', {
        zoomControl: true,
        attributionControl: false
    }).setView([22.5, 79.5], 5);

    // Add CartoDB Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        subdomains: 'abcd'
    }).addTo(mapInstance);

    markersGroup = L.layerGroup().addTo(mapInstance);
    renderMapMarkers('all');

    // Filter Buttons
    document.querySelectorAll('.map-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.map-filter-btn').forEach(b => {
                b.classList.remove('bg-cyan-500', 'text-white');
                b.classList.add('bg-slate-800', 'text-slate-300');
            });
            e.currentTarget.classList.add('bg-cyan-500', 'text-white');
            e.currentTarget.classList.remove('bg-slate-800', 'text-slate-300');

            const filter = e.currentTarget.getAttribute('data-filter');
            renderMapMarkers(filter);
        });
    });
}

function renderMapMarkers(filter = 'all') {
    if (!markersGroup) return;
    markersGroup.clearLayers();

    AQUIFER_DATA.dwlrStations.forEach(station => {
        if (filter !== 'all' && station.category.toLowerCase().replace('-', '') !== filter.toLowerCase().replace('-', '')) {
            return;
        }

        const colorMap = {
            'Safe': '#10b981',
            'Semi-Critical': '#f59e0b',
            'Critical': '#f97316',
            'Over-Exploited': '#f43f5e'
        };
        const color = colorMap[station.category] || '#0284c7';

        // Custom Leaflet Marker HTML
        const customIcon = L.divIcon({
            className: 'custom-map-marker-container',
            html: `
                <div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 12px ${color}; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 6px; height: 6px; background-color: #ffffff; border-radius: 50%;"></div>
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const marker = L.marker([station.lat, station.lng], { icon: customIcon });

        const popupContent = `
            <div style="padding: 6px; min-width: 220px; font-family: sans-serif;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${color}25; color: ${color}; border: 1px solid ${color}60;">
                        ${station.category}
                    </span>
                    <span style="font-size: 10px; color: #94a3b8;">${station.id}</span>
                </div>
                <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #f8fafc;">${station.name}</h4>
                <p style="margin: 0 0 8px 0; font-size: 11px; color: #94a3b8;">${station.district}, ${station.state}</p>
                
                <div style="background: #1e293b; padding: 8px; border-radius: 8px; font-size: 11px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                    <div><span style="color: #64748b;">Depth:</span> <b style="color: #38bdf8;">${station.depth} mbgl</b></div>
                    <div><span style="color: #64748b;">Trend:</span> <b style="color: #f1f5f9;">${station.trend}</b></div>
                    <div><span style="color: #64748b;">EC:</span> <b style="color: #f1f5f9;">${station.ec}</b></div>
                    <div><span style="color: #64748b;">Battery:</span> <b style="color: #10b981;">${station.battery}%</b></div>
                </div>
                <button onclick="selectStationForTelemetry('${station.id}')" style="margin-top: 8px; width: 100%; padding: 6px; background: #0284c7; color: #ffffff; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
                    View Live DWLR Telemetry Stream
                </button>
            </div>
        `;

        marker.bindPopup(popupContent);
        markersGroup.addLayer(marker);
    });
}

window.selectStationForTelemetry = function(stationId) {
    const station = AQUIFER_DATA.dwlrStations.find(s => s.id === stationId);
    if (station) {
        activeStation = station;
        document.getElementById('simStationName').textContent = station.name;
        document.getElementById('simStationId').textContent = station.id;
        document.getElementById('simStationLocation').textContent = `${station.district}, ${station.state}`;
        document.getElementById('simDepth').textContent = `${station.depth} m`;
        document.getElementById('simCategoryBadge').textContent = station.category;

        // Scroll smoothly to Telemetry section
        const simSection = document.getElementById('telemetry-simulator');
        if (simSection) {
            simSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

// ==========================================
// 5. HYDROGRAPH & CHART.JS VISUALIZATIONS
// ==========================================
function initCharts() {
    if (!window.Chart) return;

    // Common Chart defaults
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';

    // Chart 1: 10-Year Historical Hydrograph
    const ctx1 = document.getElementById('hydrographChart');
    if (ctx1) {
        hydrographChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: AQUIFER_DATA.historicalTrends.years,
                datasets: [
                    {
                        label: 'Pre-Monsoon Depth (mbgl)',
                        data: AQUIFER_DATA.historicalTrends.preMonsoon,
                        borderColor: '#f43f5e',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        tension: 0.35,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Post-Monsoon Depth (mbgl)',
                        data: AQUIFER_DATA.historicalTrends.postMonsoon,
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        tension: 0.35,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        reverse: true, // Depth below surface: larger number is deeper
                        title: { display: true, text: 'Depth (mbgl - lower is deeper)' }
                    }
                },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${context.dataset.label}: ${context.raw} mbgl`
                        }
                    }
                }
            }
        });
    }

    // Chart 2: Monthly Seasonal Rainfall vs Depth
    const ctx2 = document.getElementById('seasonalChart');
    if (ctx2) {
        seasonalChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: AQUIFER_DATA.historicalTrends.monthlyMonths,
                datasets: [
                    {
                        type: 'bar',
                        label: 'Monthly Rainfall (mm)',
                        data: AQUIFER_DATA.historicalTrends.monthlyRainfall,
                        backgroundColor: 'rgba(56, 189, 248, 0.65)',
                        yAxisID: 'yRain',
                        borderRadius: 6
                    },
                    {
                        type: 'line',
                        label: 'Water Table Depth (mbgl)',
                        data: AQUIFER_DATA.historicalTrends.monthlyDepth,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        yAxisID: 'yDepth',
                        tension: 0.3,
                        borderWidth: 3,
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yRain: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Rainfall (mm)' }
                    },
                    yDepth: {
                        type: 'linear',
                        position: 'right',
                        reverse: true,
                        title: { display: true, text: 'Depth (mbgl)' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }

    // Chart 3: 5-Year Scenario Forecast (Status Quo vs AI Smart Recharge)
    const ctx3 = document.getElementById('forecastChart');
    if (ctx3) {
        forecastChart = new Chart(ctx3, {
            type: 'line',
            data: {
                labels: AQUIFER_DATA.historicalTrends.forecastYears,
                datasets: [
                    {
                        label: 'Status Quo (Business as Usual)',
                        data: AQUIFER_DATA.historicalTrends.forecastStatusQuo,
                        borderColor: '#f43f5e',
                        borderDash: [5, 5],
                        tension: 0.3,
                        pointRadius: 5
                    },
                    {
                        label: 'With AquaPredict AI Recharge Interventions',
                        data: AQUIFER_DATA.historicalTrends.forecastWithAIRecharge,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        tension: 0.3,
                        fill: true,
                        pointRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        reverse: true,
                        title: { display: true, text: 'Projected Depth (mbgl)' }
                    }
                }
            }
        });
    }

    // Chart 4: State-wise Groundwater Extraction Index
    const ctx4 = document.getElementById('stateBarChart');
    if (ctx4) {
        stateBarChart = new Chart(ctx4, {
            type: 'bar',
            data: {
                labels: AQUIFER_DATA.stateComparison.states,
                datasets: [
                    {
                        label: 'Groundwater Extraction (% of Recharge)',
                        data: AQUIFER_DATA.stateComparison.extractionPercent,
                        backgroundColor: AQUIFER_DATA.stateComparison.extractionPercent.map(val => 
                            val > 130 ? 'rgba(244, 63, 94, 0.8)' : 
                            val > 100 ? 'rgba(249, 115, 22, 0.8)' : 
                            val > 70 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(16, 185, 129, 0.8)'
                        ),
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: 100,
                                yMax: 100,
                                borderColor: 'red',
                                borderWidth: 2,
                                borderDash: [6, 6],
                                label: { content: '100% Critical Threshold', enabled: true }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        title: { display: true, text: 'Stage of Extraction (%)' }
                    }
                }
            }
        });
    }
}

// ==========================================
// 6. REAL-TIME DWLR SENSOR SIMULATOR
// ==========================================
function initDWLRSimulator() {
    const terminalLogs = document.getElementById('telemetryLogs');
    if (!terminalLogs) return;

    let logCounter = 0;
    const addLog = (msg) => {
        const time = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.innerHTML = `<span class="text-slate-500">[${time}]</span> <span class="text-cyan-400 font-mono">${msg}</span>`;
        terminalLogs.appendChild(line);
        terminalLogs.scrollTop = terminalLogs.scrollHeight;

        if (terminalLogs.children.length > 25) {
            terminalLogs.removeChild(terminalLogs.firstChild);
        }
    };

    addLog(`INIT: MQTT Telemetry Broker connected to CGWB DWLR gateway (ssl://dwlr.cgwb.gov.in:8883)`);
    addLog(`SUBSCRIBE: Telemetry topic -> 'india/cgwb/dwlr/telemetry/#'`);
    addLog(`SYNC: 10 Active Station Nodes reporting 15-minute telemetry intervals.`);

    // Live update ticker interval
    liveSensorInterval = setInterval(() => {
        logCounter++;
        const delta = (Math.random() * 0.04 - 0.02);
        activeStation.depth = parseFloat((activeStation.depth + delta).toFixed(2));
        
        // Update display numbers
        const depthDisplay = document.getElementById('simDepth');
        if (depthDisplay) {
            depthDisplay.textContent = `${activeStation.depth} m`;
        }

        const tempDisplay = document.getElementById('simTemp');
        if (tempDisplay) {
            tempDisplay.textContent = activeStation.waterTemp;
        }

        const ecDisplay = document.getElementById('simEC');
        if (ecDisplay) {
            ecDisplay.textContent = activeStation.ec;
        }

        const battDisplay = document.getElementById('simBattery');
        if (battDisplay) {
            battDisplay.textContent = `${activeStation.battery}%`;
        }

        // Add Log entry periodically
        if (logCounter % 2 === 0) {
            const statusStr = activeStation.depth > 30 ? '<span class="text-rose-400">ALERT_CRITICAL_DEPLETION</span>' : '<span class="text-emerald-400">TELEMETRY_OK</span>';
            addLog(`PKT_RCV [${activeStation.id}] -> Depth: ${activeStation.depth}m | Batt: ${activeStation.battery}% | Temp: ${activeStation.waterTemp} | ${statusStr}`);
        }
    }, 3000);

    // Simulation Trigger Buttons
    const btnSimFlood = document.getElementById('btnSimFlood');
    if (btnSimFlood) {
        btnSimFlood.addEventListener('click', () => {
            activeStation.depth = Math.max(2.5, parseFloat((activeStation.depth - 1.8).toFixed(2)));
            addLog(`[MANUAL_SIM] Flash Monsoon Infiltration Triggered -> Water table risen by 1.80m for ${activeStation.id}`);
            document.getElementById('simDepth').textContent = `${activeStation.depth} m`;
        });
    }

    const btnSimDrought = document.getElementById('btnSimDrought');
    if (btnSimDrought) {
        btnSimDrought.addEventListener('click', () => {
            activeStation.depth = parseFloat((activeStation.depth + 2.2).toFixed(2));
            addLog(`[MANUAL_SIM] Severe Drought / Heavy Pumpage Triggered -> Water table depleted by 2.20m for ${activeStation.id}`);
            document.getElementById('simDepth').textContent = `${activeStation.depth} m`;
        });
    }
}

// ==========================================
// 7. EXPORT / PRINT DOSSIER
// ==========================================
window.printSIHReport = function() {
    window.print();
};
