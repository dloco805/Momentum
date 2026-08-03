/*
==========================================================
Momentum
Community Workspace UI
Build v21.0.0
File: js/communityUI.js
==========================================================
*/

"use strict";

const CommunityUI = (() => {
    const VALID_TABS = new Set(["opportunities", "partners", "college"]);
    let activeTab = "opportunities";
    let root = null;

    function showTab(tabName = activeTab) {
        const nextTab = VALID_TABS.has(tabName)
            ? tabName
            : "opportunities";

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
        const button = event.target.closest(
            '[data-action="switch-community-tab"]'
        );

        if (!button || !root || !root.contains(button)) {
            return;
        }

        showTab(button.dataset.communityTab);
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
