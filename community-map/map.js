/*
==========================================================
Momentum Community Map
Build v23.7.0
==========================================================
*/

"use strict";

(() => {
    const LOCATIONS = Array.isArray(window.MOMENTUM_COMMUNITY_LOCATIONS)
        ? window.MOMENTUM_COMMUNITY_LOCATIONS
        : [];

    const STORAGE_KEY = "momentum-community-map-coordinates-v1";
    const SETUP_HIDDEN_KEY = "momentum-community-map-setup-hidden-v1";
    const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
    const CENTRAL_COAST_BOUNDS = {
        minLat: 33.35,
        maxLat: 36.35,
        minLon: -122.25,
        maxLon: -118.45
    };
    const CATEGORY_COLORS = [
        "#2f80ed", "#9b51e0", "#f2994a", "#27ae60", "#eb5757",
        "#56ccf2", "#bb6bd9", "#f2c94c", "#219653", "#e76f51",
        "#457b9d", "#8d6e63", "#6c757d", "#d65db1", "#008f7a"
    ];

    const state = {
        search: "",
        category: "",
        mapStatus: "all",
        coordinates: loadCoordinates(),
        markers: new Map(),
        activeId: "",
        geocoding: false,
        stopRequested: false
    };

    const elements = {
        searchInput: document.getElementById("searchInput"),
        categoryFilter: document.getElementById("categoryFilter"),
        mapStatusFilter: document.getElementById("mapStatusFilter"),
        locateVisibleButton: document.getElementById("locateVisibleButton"),
        stopLocateButton: document.getElementById("stopLocateButton"),
        fitMapButton: document.getElementById("fitMapButton"),
        clearFiltersButton: document.getElementById("clearFiltersButton"),
        locationList: document.getElementById("locationList"),
        visibleCount: document.getElementById("visibleCount"),
        locatedCount: document.getElementById("locatedCount"),
        unlocatedCount: document.getElementById("unlocatedCount"),
        progressText: document.getElementById("progressText"),
        mapEmptyMessage: document.getElementById("mapEmptyMessage"),
        exportCoordinatesButton: document.getElementById("exportCoordinatesButton"),
        importCoordinatesInput: document.getElementById("importCoordinatesInput"),
        clearCoordinatesButton: document.getElementById("clearCoordinatesButton"),
        setupNote: document.querySelector(".setup-note"),
        dismissSetup: document.getElementById("dismissSetup")
    };

    if (!window.L) {
        elements.progressText.textContent = "The map library could not load. Check the internet connection and reload.";
        return;
    }

    const map = L.map("map", {
        zoomControl: true,
        preferCanvas: true
    }).setView([34.6729, -120.0169], 9);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
    }).addTo(map);

    const categoryColor = new Map();
    const categories = [...new Set(LOCATIONS.map((location) => location.category).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));
    categories.forEach((category, index) => {
        categoryColor.set(category, CATEGORY_COLORS[index % CATEGORY_COLORS.length]);
    });

    function loadCoordinates() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch (error) {
            return {};
        }
    }

    function saveCoordinates() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.coordinates));
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    }

    function isLocated(location) {
        const coordinate = state.coordinates[location.id];
        return Boolean(
            coordinate &&
            Number.isFinite(Number(coordinate.lat)) &&
            Number.isFinite(Number(coordinate.lon))
        );
    }

    function getFilteredLocations() {
        const search = normalize(state.search);
        return LOCATIONS.filter((location) => {
            if (state.category && location.category !== state.category) return false;
            const located = isLocated(location);
            if (state.mapStatus === "located" && !located) return false;
            if (state.mapStatus === "unlocated" && located) return false;
            if (!search) return true;
            return normalize([
                location.name,
                location.address,
                location.category,
                location.type,
                location.description,
                location.services,
                location.careerFields,
                location.studentConnections
            ].join(" ")).includes(search);
        });
    }

    function googleMapsUrl(location) {
        const query = [location.name, location.address].filter(Boolean).join(", ");
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }

    function websiteUrl(value) {
        if (!value) return "";
        try {
            const url = new URL(value);
            return ["http:", "https:"].includes(url.protocol) ? url.href : "";
        } catch (error) {
            return "";
        }
    }

    function popupHtml(location) {
        const safeWebsite = websiteUrl(location.website);
        return `
            <div class="map-popup">
                <h3>${escapeHtml(location.name)}</h3>
                <p>${escapeHtml(location.address || "Address not listed")}</p>
                <p><strong>${escapeHtml(location.category)}</strong></p>
                ${location.description ? `<p>${escapeHtml(location.description)}</p>` : ""}
                <p>
                    <a href="${escapeHtml(googleMapsUrl(location))}" target="_blank" rel="noopener">Open directions</a>
                    ${safeWebsite ? ` · <a href="${escapeHtml(safeWebsite)}" target="_blank" rel="noopener">Website</a>` : ""}
                </p>
            </div>
        `;
    }

    function createOrUpdateMarker(location) {
        if (!isLocated(location)) return null;
        const coordinate = state.coordinates[location.id];
        const latLng = [Number(coordinate.lat), Number(coordinate.lon)];
        const color = categoryColor.get(location.category) || "#2f80ed";
        let marker = state.markers.get(location.id);
        if (!marker) {
            marker = L.circleMarker(latLng, {
                radius: 7,
                weight: 2,
                color: "#ffffff",
                fillColor: color,
                fillOpacity: 0.92
            }).bindPopup(popupHtml(location));
            marker.on("click", () => setActiveLocation(location.id, false));
            state.markers.set(location.id, marker);
        } else {
            marker.setLatLng(latLng);
            marker.setStyle({ fillColor: color });
            marker.setPopupContent(popupHtml(location));
        }
        return marker;
    }

    function renderMarkers(filteredLocations) {
        const visibleIds = new Set(filteredLocations.map((location) => location.id));
        state.markers.forEach((marker, id) => {
            if (map.hasLayer(marker)) map.removeLayer(marker);
            if (!visibleIds.has(id)) return;
            marker.addTo(map);
        });
        filteredLocations.forEach((location) => {
            const marker = createOrUpdateMarker(location);
            if (marker && !map.hasLayer(marker)) marker.addTo(map);
        });
        const hasVisibleMarker = filteredLocations.some(isLocated);
        elements.mapEmptyMessage.hidden = hasVisibleMarker;
    }

    function locationCard(location) {
        const located = isLocated(location);
        const coordinate = state.coordinates[location.id] || {};
        const color = categoryColor.get(location.category) || "#2f80ed";
        const safeWebsite = websiteUrl(location.website);
        const detail = location.description || location.services || "Community directory listing.";
        return `
            <article class="location-card${state.activeId === location.id ? " is-active" : ""}" data-location-id="${escapeHtml(location.id)}">
                <div class="category-row">
                    <span class="category-dot" style="--category-color:${escapeHtml(color)}"></span>
                    <span>${escapeHtml(location.category)}</span>
                    <span class="status-chip${located ? " is-located" : ""}">${located ? "Located" : "Not located"}</span>
                </div>
                <h3>${escapeHtml(location.name)}</h3>
                <p>${escapeHtml(location.address || "Address not listed")}</p>
                <p>${escapeHtml(detail)}</p>
                ${coordinate.displayName ? `<p title="Geocoding result">Matched: ${escapeHtml(coordinate.displayName)}</p>` : ""}
                <div class="location-actions">
                    ${located ? `<button class="mini-button" type="button" data-action="show-marker" data-id="${escapeHtml(location.id)}">Show marker</button>` : ""}
                    <a class="mini-button" href="${escapeHtml(googleMapsUrl(location))}" target="_blank" rel="noopener">Google Maps</a>
                    ${safeWebsite ? `<a class="mini-button" href="${escapeHtml(safeWebsite)}" target="_blank" rel="noopener">Website</a>` : ""}
                </div>
            </article>
        `;
    }

    function render() {
        const filtered = getFilteredLocations();
        const totalLocated = LOCATIONS.filter(isLocated).length;
        elements.visibleCount.textContent = String(filtered.length);
        elements.locatedCount.textContent = String(totalLocated);
        elements.unlocatedCount.textContent = String(LOCATIONS.length - totalLocated);
        elements.locationList.innerHTML = filtered.length
            ? filtered.map(locationCard).join("")
            : '<p class="empty-list">No community places match these filters.</p>';
        renderMarkers(filtered);
    }

    function setActiveLocation(id, panToMarker = true) {
        state.activeId = id;
        const location = LOCATIONS.find((item) => item.id === id);
        if (!location) return;
        if (panToMarker && isLocated(location)) {
            const marker = state.markers.get(id) || createOrUpdateMarker(location);
            if (marker) {
                map.setView(marker.getLatLng(), Math.max(map.getZoom(), 15));
                marker.openPopup();
            }
        }
        elements.locationList.querySelectorAll(".location-card").forEach((card) => {
            card.classList.toggle("is-active", card.dataset.locationId === id);
        });
        const activeCard = elements.locationList.querySelector(`[data-location-id="${CSS.escape(id)}"]`);
        activeCard?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    function fitVisibleMarkers() {
        const points = getFilteredLocations()
            .filter(isLocated)
            .map((location) => {
                const coordinate = state.coordinates[location.id];
                return [Number(coordinate.lat), Number(coordinate.lon)];
            });
        if (!points.length) {
            map.setView([34.6729, -120.0169], 9);
            elements.progressText.textContent = "No visible markers are available to fit.";
            return;
        }
        if (points.length === 1) {
            map.setView(points[0], 15);
            return;
        }
        map.fitBounds(points, { padding: [30, 30], maxZoom: 15 });
    }

    function populateCategories() {
        elements.categoryFilter.insertAdjacentHTML(
            "beforeend",
            categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")
        );
    }

    function hasStreetNumber(address) {
        return /^\s*\d+[A-Za-z-]*\s/.test(address || "");
    }

    function isGenericArea(address) {
        const value = normalize(address);
        return !hasStreetNumber(address) && (
            value.endsWith(" area") ||
            value.includes("service area") ||
            value.includes("county") ||
            value.includes("valley ca") ||
            /^[a-z ]+ ca(?: \d{5})?$/.test(value)
        );
    }

    function geocodeQuery(location) {
        if (hasStreetNumber(location.address)) return location.address;
        return [location.name, location.address].filter(Boolean).join(", ");
    }

    function insideCentralCoast(lat, lon) {
        return lat >= CENTRAL_COAST_BOUNDS.minLat &&
            lat <= CENTRAL_COAST_BOUNDS.maxLat &&
            lon >= CENTRAL_COAST_BOUNDS.minLon &&
            lon <= CENTRAL_COAST_BOUNDS.maxLon;
    }

    function genericResultLooksValid(location, result) {
        if (!isGenericArea(location.address)) return true;
        const resultText = normalize(result.display_name);
        const significantWords = normalize(location.name)
            .split(" ")
            .filter((word) => word.length >= 4 && !["lompoc", "santa", "county", "valley", "center", "services"].includes(word));
        return significantWords.some((word) => resultText.includes(word));
    }

    async function geocodeLocation(location) {
        const params = new URLSearchParams({
            format: "jsonv2",
            limit: "1",
            countrycodes: "us",
            addressdetails: "1",
            q: geocodeQuery(location),
            viewbox: "-122.25,36.35,-118.45,33.35"
        });
        const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
            headers: { Accept: "application/json" },
            referrerPolicy: "strict-origin-when-cross-origin"
        });
        if (response.status === 429) {
            const error = new Error("The geocoding service asked the map to slow down. The lookup was stopped.");
            error.code = 429;
            throw error;
        }
        if (!response.ok) throw new Error(`Geocoding request failed (${response.status}).`);
        const results = await response.json();
        const result = Array.isArray(results) ? results[0] : null;
        if (!result) return null;
        const lat = Number(result.lat);
        const lon = Number(result.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || !insideCentralCoast(lat, lon)) return null;
        if (!genericResultLooksValid(location, result)) return null;
        return {
            lat,
            lon,
            displayName: result.display_name || "",
            osmType: result.osm_type || "",
            osmId: result.osm_id || "",
            matchedAt: new Date().toISOString()
        };
    }

    function sleep(milliseconds) {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    async function locateVisiblePlaces() {
        if (state.geocoding) return;
        const queue = getFilteredLocations().filter((location) => !isLocated(location));
        if (!queue.length) {
            elements.progressText.textContent = "Every visible place already has a saved location.";
            return;
        }
        const accepted = window.confirm(
            `Locate ${queue.length} visible place${queue.length === 1 ? "" : "s"} one at a time? ` +
            "The public OpenStreetMap geocoder is rate-limited, and results will be cached in this browser."
        );
        if (!accepted) return;

        state.geocoding = true;
        state.stopRequested = false;
        elements.locateVisibleButton.disabled = true;
        elements.stopLocateButton.disabled = false;
        let found = 0;
        let notFound = 0;

        for (let index = 0; index < queue.length; index += 1) {
            if (state.stopRequested) break;
            const location = queue[index];
            elements.progressText.textContent = `Locating ${index + 1} of ${queue.length}: ${location.name}`;
            try {
                const coordinate = await geocodeLocation(location);
                if (coordinate) {
                    state.coordinates[location.id] = coordinate;
                    saveCoordinates();
                    found += 1;
                    createOrUpdateMarker(location)?.addTo(map);
                } else {
                    notFound += 1;
                }
                render();
            } catch (error) {
                elements.progressText.textContent = error.message || "The lookup stopped because of a network error.";
                break;
            }
            if (index < queue.length - 1 && !state.stopRequested) await sleep(1100);
        }

        state.geocoding = false;
        elements.locateVisibleButton.disabled = false;
        elements.stopLocateButton.disabled = true;
        if (state.stopRequested) {
            elements.progressText.textContent = `Stopped. ${found} new marker${found === 1 ? "" : "s"} saved; ${notFound} unmatched.`;
        } else if (!elements.progressText.textContent.includes("failed") && !elements.progressText.textContent.includes("stopped")) {
            elements.progressText.textContent = `Finished this selection. ${found} new marker${found === 1 ? "" : "s"} saved; ${notFound} unmatched.`;
        }
        fitVisibleMarkers();
    }

    function exportCoordinates() {
        const payload = {
            format: "Momentum Community Map Coordinates",
            version: "23.7.0",
            exportedAt: new Date().toISOString(),
            totalDirectoryRecords: LOCATIONS.length,
            coordinates: state.coordinates
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Momentum-Community-Map-Coordinates.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        elements.progressText.textContent = `Exported ${Object.keys(state.coordinates).length} saved coordinates.`;
    }

    async function importCoordinates(file) {
        if (!file) return;
        try {
            const parsed = JSON.parse(await file.text());
            const incoming = parsed.coordinates && typeof parsed.coordinates === "object"
                ? parsed.coordinates
                : parsed;
            if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
                throw new Error("The selected file does not contain a coordinate collection.");
            }
            let imported = 0;
            Object.entries(incoming).forEach(([id, coordinate]) => {
                const lat = Number(coordinate?.lat);
                const lon = Number(coordinate?.lon);
                if (!Number.isFinite(lat) || !Number.isFinite(lon) || !insideCentralCoast(lat, lon)) return;
                state.coordinates[id] = { ...coordinate, lat, lon };
                imported += 1;
            });
            saveCoordinates();
            render();
            fitVisibleMarkers();
            elements.progressText.textContent = `Imported ${imported} coordinate${imported === 1 ? "" : "s"}.`;
        } catch (error) {
            elements.progressText.textContent = error.message || "The coordinate file could not be imported.";
        } finally {
            elements.importCoordinatesInput.value = "";
        }
    }

    function clearCoordinates() {
        if (!Object.keys(state.coordinates).length) {
            elements.progressText.textContent = "There are no saved coordinates to clear.";
            return;
        }
        if (!window.confirm("Clear every saved coordinate from this browser? The directory records will remain.")) return;
        state.coordinates = {};
        saveCoordinates();
        state.markers.forEach((marker) => map.removeLayer(marker));
        state.markers.clear();
        render();
        map.setView([34.6729, -120.0169], 9);
        elements.progressText.textContent = "Saved coordinates cleared.";
    }

    function bindEvents() {
        elements.searchInput.addEventListener("input", () => {
            state.search = elements.searchInput.value;
            render();
        });
        elements.categoryFilter.addEventListener("change", () => {
            state.category = elements.categoryFilter.value;
            render();
            fitVisibleMarkers();
        });
        elements.mapStatusFilter.addEventListener("change", () => {
            state.mapStatus = elements.mapStatusFilter.value;
            render();
            fitVisibleMarkers();
        });
        elements.clearFiltersButton.addEventListener("click", () => {
            state.search = "";
            state.category = "";
            state.mapStatus = "all";
            elements.searchInput.value = "";
            elements.categoryFilter.value = "";
            elements.mapStatusFilter.value = "all";
            render();
            fitVisibleMarkers();
        });
        elements.locationList.addEventListener("click", (event) => {
            const button = event.target.closest("[data-action=\"show-marker\"]");
            if (!button) return;
            setActiveLocation(button.dataset.id || "");
        });
        elements.locateVisibleButton.addEventListener("click", locateVisiblePlaces);
        elements.stopLocateButton.addEventListener("click", () => {
            state.stopRequested = true;
            elements.stopLocateButton.disabled = true;
            elements.progressText.textContent = "Stopping after the current lookup.";
        });
        elements.fitMapButton.addEventListener("click", fitVisibleMarkers);
        elements.exportCoordinatesButton.addEventListener("click", exportCoordinates);
        elements.importCoordinatesInput.addEventListener("change", () => importCoordinates(elements.importCoordinatesInput.files?.[0]));
        elements.clearCoordinatesButton.addEventListener("click", clearCoordinates);
        elements.dismissSetup.addEventListener("click", () => {
            elements.setupNote.classList.add("is-hidden");
            localStorage.setItem(SETUP_HIDDEN_KEY, "1");
        });
    }

    function initialize() {
        populateCategories();
        bindEvents();
        if (localStorage.getItem(SETUP_HIDDEN_KEY) === "1") elements.setupNote.classList.add("is-hidden");
        render();
        if (Object.keys(state.coordinates).length) fitVisibleMarkers();
        elements.progressText.textContent = `${LOCATIONS.length} directory records loaded.`;
        window.setTimeout(() => map.invalidateSize(), 100);
    }

    initialize();
})();
