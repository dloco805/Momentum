/*
==========================================================
Momentum
Community Workspace UI
Build v23.6.0
File: js/communityUI.js
==========================================================
*/

"use strict";

const CommunityUI = (() => {
    const VALID_TABS = new Set(["opportunities", "partners", "college"]);
    let activeTab = "partners";
    let root = null;

    function showTab(tabName = activeTab) {
        const nextTab = VALID_TABS.has(tabName) ? tabName : "partners";
        activeTab = nextTab;

        document.querySelectorAll("[data-community-tab]").forEach((button) => {
            const selected = button.dataset.communityTab === activeTab;
            button.classList.toggle("is-active", selected);
            button.setAttribute("aria-selected", String(selected));
        });

        document.querySelectorAll("[data-community-panel]").forEach((panel) => {
            panel.hidden = panel.dataset.communityPanel !== activeTab;
        });

        if (activeTab === "partners") {
            PartnerUI.render();
        } else if (activeTab === "college") {
            CommunityCollegeUI.render();
        } else {
            OpportunityUI.render();
        }
    }

    function handleClick(event) {
        const button = event.target.closest("[data-action]");
        if (!button || !root || !root.contains(button)) return;

        const action = button.dataset.action;

        if (action === "switch-community-tab") {
            showTab(button.dataset.communityTab);
            return;
        }

        if (action === "load-community-starter-data") {
            const partnerCount = PartnerManager.loadLompocBusinessDirectory();
            const opportunityCount = OpportunityManager.loadLocalStarterLibrary();
            App.showToast(
                partnerCount || opportunityCount
                    ? `${partnerCount} organizations and ${opportunityCount} opportunity leads added.`
                    : "The Lompoc starter community is already loaded."
            );
            showTab("partners");
            return;
        }

        if (action === "open-community-partner") {
            showTab("partners");
            PartnerUI.focusOrganization(
                button.dataset.partnerId || "",
                button.dataset.organization || ""
            );
        }
    }

    function initialize() {
        root = document.getElementById("communityView");
        document.addEventListener("click", handleClick);
        showTab(activeTab);
    }

    return Object.freeze({
        initialize,
        showTab,
        getActiveTab() {
            return activeTab;
        }
    });
})();
