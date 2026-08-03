/*
==========================================================
Momentum
Partner Manager Module
Build v19.0.0
File: js/partnerManager.js
==========================================================
*/

"use strict";

const PartnerManager = (() => {
    const STORAGE_KEY = "momentum.partners";
    const DATA_CHANGED_EVENT = "partnerDataChanged";
    let partners = [];

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
            if (!normalizedQuery) {
                return true;
            }

            return [
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
            ].join(" ").toLowerCase().includes(normalizedQuery);
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
        replaceAll,
        search
    });
})();
