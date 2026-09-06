/**
 * Café Location Intelligence & Market Opportunity Analysis Application JS
 * Client-Side Scoring Engine, Dynamic Leaflet Map & Interactive Visualizations
 */

let activeData = [];
let map = null;
let mapMarkers = [];
let rankChart = null;
let rentScatterChart = null;
let modalRadarChart = null;

// Initialize Web Portal on DOM Load
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    setupEventListeners();
    calculateAndRender();
    initMap();
}

function setupEventListeners() {
    // Weight Sliders
    const sliders = ["w-demand", "w-competition", "w-rent", "w-accessibility", "w-potential", "w-rating"];
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        if (slider) {
            slider.addEventListener("input", (e) => {
                document.getElementById(`${id}-val`).textContent = parseFloat(e.target.value).toFixed(2);
                calculateAndRender();
            });
        }
    });

    // Rent Budget Slider
    const rentSlider = document.getElementById("filter-rent");
    if (rentSlider) {
        rentSlider.addEventListener("input", (e) => {
            document.getElementById("filter-rent-val").textContent = `₹${parseInt(e.target.value).toLocaleString()}`;
            calculateAndRender();
        });
    }

    // Search Box
    const searchInput = document.getElementById("search-area");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            calculateAndRender();
        });
    }

    // Category Filter Checkboxes
    document.querySelectorAll(".category-checkbox").forEach(cb => {
        cb.addEventListener("change", () => {
            calculateAndRender();
        });
    });

    // Reset Weights Button
    const resetBtn = document.getElementById("btn-reset-weights");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            document.getElementById("w-demand").value = DEFAULT_WEIGHTS.demand;
            document.getElementById("w-demand-val").textContent = DEFAULT_WEIGHTS.demand;
            document.getElementById("w-competition").value = DEFAULT_WEIGHTS.competition;
            document.getElementById("w-competition-val").textContent = DEFAULT_WEIGHTS.competition;
            document.getElementById("w-rent").value = DEFAULT_WEIGHTS.rent;
            document.getElementById("w-rent-val").textContent = DEFAULT_WEIGHTS.rent;
            document.getElementById("w-accessibility").value = DEFAULT_WEIGHTS.accessibility;
            document.getElementById("w-accessibility-val").textContent = DEFAULT_WEIGHTS.accessibility;
            document.getElementById("w-potential").value = DEFAULT_WEIGHTS.potential;
            document.getElementById("w-potential-val").textContent = DEFAULT_WEIGHTS.potential;
            document.getElementById("w-rating").value = DEFAULT_WEIGHTS.rating;
            document.getElementById("w-rating-val").textContent = DEFAULT_WEIGHTS.rating;
            calculateAndRender();
        });
    }
}

// Client-Side Scoring Engine
function calculateAndRender() {
    const weights = {
        demand: parseFloat(document.getElementById("w-demand").value),
        competition: parseFloat(document.getElementById("w-competition").value),
        rent: parseFloat(document.getElementById("w-rent").value),
        accessibility: parseFloat(document.getElementById("w-accessibility").value),
        potential: parseFloat(document.getElementById("w-potential").value),
        rating: parseFloat(document.getElementById("w-rating").value)
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1.0;
    const normW = {
        demand: weights.demand / totalWeight,
        competition: weights.competition / totalWeight,
        rent: weights.rent / totalWeight,
        accessibility: weights.accessibility / totalWeight,
        potential: weights.potential / totalWeight,
        rating: weights.rating / totalWeight
    };

    // Deep Copy Data
    let processed = JSON.parse(JSON.stringify(RAW_CAFE_DATA));

    // Calculate Dynamic Scores
    processed.forEach(item => {
        item.overall_score = +(
            item.demand_score * normW.demand +
            item.competition_score * normW.competition +
            item.rent_score * normW.rent +
            item.accessibility_score * normW.accessibility +
            item.potential_score * normW.potential +
            item.rating_score * normW.rating
        ).toFixed(2);

        item.opportunity_category = classifyOpportunity(item.overall_score);
    });

    // Sort by Overall Score Descending
    processed.sort((a, b) => b.overall_score - a.overall_score);

    // Assign Rank
    processed.forEach((item, idx) => {
        item.rank = idx + 1;
    });

    // Apply User Filters
    const maxRent = parseInt(document.getElementById("filter-rent").value) || 300000;
    const searchText = (document.getElementById("search-area").value || "").toLowerCase().trim();

    const selectedCategories = Array.from(document.querySelectorAll(".category-checkbox:checked"))
        .map(cb => cb.value);

    activeData = processed.filter(item => {
        const matchesRent = item.avg_monthly_rent <= maxRent;
        const matchesSearch = item.area.toLowerCase().includes(searchText);
        const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(item.opportunity_category);
        return matchesRent && matchesSearch && matchesCat;
    });

    // Update UI Components
    renderKPICards(activeData, processed);
    renderLeaderboardTable(activeData);
    renderCharts(activeData);
    updateMapMarkers(activeData);
}

function classifyOpportunity(score) {
    if (score >= 80) return "Excellent Opportunity";
    if (score >= 65) return "Good Opportunity";
    if (score >= 50) return "Moderate Opportunity";
    return "Low Opportunity";
}

function getBadgeClass(category) {
    switch (category) {
        case "Excellent Opportunity": return "badge-excellent";
        case "Good Opportunity": return "badge-good";
        case "Moderate Opportunity": return "badge-moderate";
        default: return "badge-low";
    }
}

function getCategoryColor(category) {
    switch (category) {
        case "Excellent Opportunity": return "#10B981";
        case "Good Opportunity": return "#3B82F6";
        case "Moderate Opportunity": return "#F59E0B";
        default: return "#EF4444";
    }
}

// KPI Banner Summary
function renderKPICards(filtered, full) {
    document.getElementById("kpi-total-locations").textContent = filtered.length;
    
    if (filtered.length > 0) {
        const avgRent = filtered.reduce((acc, curr) => acc + curr.avg_monthly_rent, 0) / filtered.length;
        const avgCafes = filtered.reduce((acc, curr) => acc + curr.cafes, 0) / filtered.length;
        const topArea = filtered[0];

        document.getElementById("kpi-avg-rent").textContent = `₹${Math.round(avgRent).toLocaleString()}`;
        document.getElementById("kpi-avg-cafes").textContent = avgCafes.toFixed(1);
        document.getElementById("kpi-top-area").textContent = topArea.area;
        document.getElementById("kpi-top-score").textContent = `${topArea.overall_score} / 100`;
    } else {
        document.getElementById("kpi-avg-rent").textContent = "N/A";
        document.getElementById("kpi-avg-cafes").textContent = "N/A";
        document.getElementById("kpi-top-area").textContent = "None";
        document.getElementById("kpi-top-score").textContent = "0.0 / 100";
    }
}

// Leaderboard Data Table
function renderLeaderboardTable(data) {
    const tbody = document.getElementById("table-body");
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-6 text-slate-400">
                    <i class="fa-solid fa-triangle-exclamation mr-2 text-amber-500"></i> No Hyderabad locations match the current filter criteria.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(item => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-800/60 transition-colors border-b border-slate-800 cursor-pointer";
        tr.onclick = () => openDeepDiveModal(item.area);

        tr.innerHTML = `
            <td class="py-3 px-4 font-bold text-slate-300">#${item.rank}</td>
            <td class="py-3 px-4 font-semibold text-blue-400 hover:underline">${item.area}</td>
            <td class="py-3 px-4">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeClass(item.opportunity_category)}">
                    ${item.opportunity_category}
                </span>
            </td>
            <td class="py-3 px-4 font-bold text-emerald-400">${item.overall_score}</td>
            <td class="py-3 px-4">₹${item.avg_monthly_rent.toLocaleString()}</td>
            <td class="py-3 px-4">${item.cafes}</td>
            <td class="py-3 px-4">${item.average_customer_footfall.toLocaleString()}</td>
            <td class="py-3 px-4 text-right">
                <button onclick="event.stopPropagation(); openDeepDiveModal('${item.area}')" class="px-3 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded text-xs font-medium transition">
                    Analyze <i class="fa-solid fa-arrow-right ml-1"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Chart.js Visualization
function renderCharts(data) {
    const topData = data.slice(0, 15).reverse(); // Top locations for horizontal bar

    // 1. Leaderboard Bar Chart
    const ctxRank = document.getElementById("chart-rank").getContext("2d");
    if (rankChart) rankChart.destroy();

    rankChart = new Chart(ctxRank, {
        type: 'bar',
        data: {
            labels: topData.map(d => d.area),
            datasets: [{
                label: 'Overall Opportunity Score',
                data: topData.map(d => d.overall_score),
                backgroundColor: topData.map(d => getCategoryColor(d.opportunity_category)),
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Score: ${ctx.raw} / 100`
                    }
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    grid: { color: '#334155' },
                    ticks: { color: '#94A3B8' }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#F8FAFC' }
                }
            }
        }
    });

    // 2. Rent vs Score Scatter Plot
    const ctxScatter = document.getElementById("chart-scatter").getContext("2d");
    if (rentScatterChart) rentScatterChart.destroy();

    rentScatterChart = new Chart(ctxScatter, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Hyderabad Locations',
                data: data.map(d => ({
                    x: d.avg_monthly_rent,
                    y: d.overall_score,
                    area: d.area,
                    category: d.opportunity_category
                })),
                backgroundColor: data.map(d => getCategoryColor(d.opportunity_category)),
                pointRadius: 7,
                pointHoverRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw.area}: Score ${ctx.raw.y}, Rent ₹${ctx.raw.x.toLocaleString()}`
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Avg Monthly Rent (₹)', color: '#94A3B8' },
                    grid: { color: '#334155' },
                    ticks: { color: '#94A3B8', callback: (val) => `₹${val/1000}k` }
                },
                y: {
                    title: { display: true, text: 'Overall Opportunity Score', color: '#94A3B8' },
                    min: 0, max: 100,
                    grid: { color: '#334155' },
                    ticks: { color: '#94A3B8' }
                }
            }
        }
    });
}

// Leaflet Map Initialization & Markers
function initMap() {
    map = L.map('leaflet-map').setView([17.4200, 78.4100], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
}

function updateMapMarkers(data) {
    if (!map) return;

    // Clear existing markers
    mapMarkers.forEach(m => map.removeLayer(m));
    mapMarkers = [];

    data.forEach(item => {
        const color = getCategoryColor(item.opportunity_category);

        const marker = L.circleMarker([item.latitude, item.longitude], {
            radius: Math.max(6, item.overall_score / 6),
            fillColor: color,
            color: '#FFFFFF',
            weight: 1.5,
            opacity: 0.9,
            fillOpacity: 0.85
        }).addTo(map);

        const popupContent = `
            <div style="color: #0F172A; font-family: sans-serif;">
                <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${item.area}</h4>
                <p style="margin: 0; font-size: 12px;"><strong>Score:</strong> <span style="color:${color}; font-weight:bold;">${item.overall_score}</span> / 100</p>
                <p style="margin: 2px 0;"><strong>Category:</strong> ${item.opportunity_category}</p>
                <p style="margin: 2px 0;"><strong>Avg Rent:</strong> ₹${item.avg_monthly_rent.toLocaleString()}/mo</p>
                <p style="margin: 2px 0;"><strong>Competing Cafés:</strong> ${item.cafes}</p>
                <p style="margin: 2px 0;"><strong>Est. Daily Footfall:</strong> ${item.average_customer_footfall.toLocaleString()}</p>
                <button onclick="openDeepDiveModal('${item.area}')" style="margin-top: 6px; padding: 4px 8px; background:#2563EB; color:white; border:none; border-radius:4px; font-size:11px; cursor:pointer;">
                    View Strategy Deep Dive
                </button>
            </div>
        `;

        marker.bindPopup(popupContent);
        mapMarkers.push(marker);
    });
}

// Deep Dive Strategy Modal
function openDeepDiveModal(areaName) {
    const fullScored = JSON.parse(JSON.stringify(RAW_CAFE_DATA));
    const target = activeData.find(d => d.area === areaName) || fullScored.find(d => d.area === areaName);

    if (!target) return;

    // Set Header
    document.getElementById("modal-area-name").textContent = target.area;
    document.getElementById("modal-score").textContent = `${target.overall_score} / 100`;
    document.getElementById("modal-rank").textContent = `#${target.rank} of ${fullScored.length}`;
    document.getElementById("modal-rent").textContent = `₹${target.avg_monthly_rent.toLocaleString()}`;
    document.getElementById("modal-footfall").textContent = target.average_customer_footfall.toLocaleString();
    document.getElementById("modal-cafes").textContent = target.cafes;

    const catBadge = document.getElementById("modal-category-badge");
    catBadge.textContent = target.opportunity_category;
    catBadge.className = `px-3 py-1 rounded-full text-xs font-bold ${getBadgeClass(target.opportunity_category)}`;

    // Generate Dynamic Recommendation Insights matching src/analysis.py logic
    const insights = generateInsightsJS(target, fullScored);

    document.getElementById("modal-verdict").textContent = insights.recommendation;
    document.getElementById("modal-strategy").textContent = insights.suggested_strategy;

    // Strengths List
    const strengthsList = document.getElementById("modal-strengths");
    strengthsList.innerHTML = "";
    insights.strengths.forEach(s => {
        const li = document.createElement("li");
        li.className = "flex items-start gap-2 text-slate-300 text-sm";
        li.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400 mt-1"></i> <span>${s}</span>`;
        strengthsList.appendChild(li);
    });

    // Risks List
    const risksList = document.getElementById("modal-risks");
    risksList.innerHTML = "";
    insights.risks.forEach(r => {
        const li = document.createElement("li");
        li.className = "flex items-start gap-2 text-slate-300 text-sm";
        li.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber-400 mt-1"></i> <span>${r}</span>`;
        risksList.appendChild(li);
    });

    // Sub-Score Radar/Bar Chart
    renderModalChart(target);

    // Show Modal
    document.getElementById("deep-dive-modal").classList.remove("hidden");
}

function closeDeepDiveModal() {
    document.getElementById("deep-dive-modal").classList.add("hidden");
}

function renderModalChart(target) {
    const ctx = document.getElementById("chart-modal-sub").getContext("2d");
    if (modalRadarChart) modalRadarChart.destroy();

    modalRadarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Demand', 'Competition Opp', 'Rent Affordability', 'Accessibility', 'College/Office Hub', 'Café Benchmark'],
            datasets: [{
                label: 'Dimension Score (0–100)',
                data: [
                    target.demand_score,
                    target.competition_score,
                    target.rent_score,
                    target.accessibility_score,
                    target.potential_score,
                    target.rating_score
                ],
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'
                ],
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { min: 0, max: 100, grid: { color: '#334155' }, ticks: { color: '#94A3B8' } },
                y: { grid: { display: false }, ticks: { color: '#F8FAFC' } }
            }
        }
    });
}

// Derived Business Recommendation Logic matching Python src/analysis.py
function generateInsightsJS(row, fullData) {
    const footfalls = fullData.map(d => d.average_customer_footfall).sort((a, b) => a - b);
    const rents = fullData.map(d => d.avg_monthly_rent).sort((a, b) => a - b);
    const cafes = fullData.map(d => d.cafes).sort((a, b) => a - b);
    const offices = fullData.map(d => d.offices).sort((a, b) => a - b);
    const colleges = fullData.map(d => d.colleges).sort((a, b) => a - b);

    const getQuantile = (arr, q) => arr[Math.floor(q * arr.length)];

    const p70_footfall = getQuantile(footfalls, 0.70);
    const p30_footfall = getQuantile(footfalls, 0.30);
    const p70_rent = getQuantile(rents, 0.70);
    const p30_rent = getQuantile(rents, 0.30);
    const p70_cafes = getQuantile(cafes, 0.70);
    const p30_cafes = getQuantile(cafes, 0.30);
    const p70_offices = getQuantile(offices, 0.70);
    const p70_colleges = getQuantile(colleges, 0.70);

    const strengths = [];
    const risks = [];

    if (row.average_customer_footfall >= p70_footfall) strengths.push(`High daily customer footfall (~${row.average_customer_footfall.toLocaleString()} visitors/day)`);
    if (row.cafes <= p30_cafes) strengths.push(`Low existing café competition (${row.cafes} competing cafés)`);
    if (row.avg_monthly_rent <= p30_rent) strengths.push(`Favorable commercial rent (₹${row.avg_monthly_rent.toLocaleString()}/month)`);
    if (row.offices >= p70_offices) strengths.push(`Dense corporate office hub (${row.offices} major office buildings)`);
    if (row.colleges >= p70_colleges) strengths.push(`High student population (${row.colleges} nearby colleges/institutes)`);
    if (row.metro_distance_km <= 1.5) strengths.push(`Excellent metro connectivity (${row.metro_distance_km} km to station)`);
    if (row.parking_availability >= 8) strengths.push(`High parking facility score (${row.parking_availability}/10)`);

    if (strengths.length === 0) strengths.push(`Balanced market indicators across residential and commercial sectors.`);

    if (row.avg_monthly_rent >= p70_rent) risks.push(`High rental overhead (₹${row.avg_monthly_rent.toLocaleString()}/month)`);
    if (row.cafes >= p70_cafes) risks.push(`Saturated café market (${row.cafes} existing competitors)`);
    if (row.average_customer_footfall <= p30_footfall) risks.push(`Lower customer footfall (~${row.average_customer_footfall.toLocaleString()} visitors/day)`);
    if (row.metro_distance_km >= 4.0) risks.push(`Limited metro access (${row.metro_distance_km} km from nearest station)`);
    if (row.parking_availability <= 4) risks.push(`Restricted customer parking facility (${row.parking_availability}/10)`);

    if (risks.length === 0) risks.push(`Moderate competitive landscape requiring strong brand differentiation.`);

    let rec = "";
    let strat = "";
    const score = row.overall_score;

    if (score >= 80) {
        rec = "Strong Candidate (Prime Location)";
        if (row.offices >= p70_offices) {
            strat = "Launch a flagship quick-service & premium espresso bar. Focus heavily on morning corporate coffee runs, express lunch combos, and corporate catering.";
        } else if (row.colleges >= p70_colleges) {
            strat = "Target youth & student crowd. Offer budget-friendly specialty coffee, high-speed Wi-Fi, study booths, and vibrant social aesthetic.";
        } else {
            strat = "Deploy an upscale lifestyle café catering to high-income residential footfall with artisanal bakery items and indoor-outdoor seating.";
        }
    } else if (score >= 65) {
        rec = "Good Candidate (Promising Potential)";
        if (row.avg_monthly_rent >= p70_rent) {
            strat = "Optimize floor area to keep lease costs manageable. Emphasize takeaway orders, delivery partnerships, and high table turnover.";
        } else {
            strat = "Establish a neighborhood cozy café concept with loyalty programs for local residents and working professionals.";
        }
    } else if (score >= 50) {
        rec = "Moderate Candidate (Niche / Conditional Opportunity)";
        strat = "Consider low-capex formats such as a kiosk or cloud-kitchen coffee pop-up. Perform detailed micro-street footfall audits before signing long-term leases.";
    } else {
        rec = "Low Priority (High Commercial Risk)";
        strat = "Postpone brick-and-mortar investment. Reallocate budget toward higher-demand or lower-rent clusters in Hyderabad.";
    }

    return {
        recommendation: rec,
        suggested_strategy: strat,
        strengths: strengths,
        risks: risks
    };
}
