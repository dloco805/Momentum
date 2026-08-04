/*
==========================================================
Momentum Resource Library UI
Build v22.0.1
==========================================================
*/
"use strict";

const ResourceUI = (() => {
    const state = {
        content: null,
        search: null,
        modalRoot: null,
        type: "topic",
        favoritesOnly: false,
        selectedId: ""
    };

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&","&amp;").replaceAll("<","&lt;")
            .replaceAll(">","&gt;").replaceAll('"',"&quot;")
            .replaceAll("'","&#039;");
    }

    function splitList(value) {
        return String(value || "").split(/\n|,/)
            .map((item) => item.trim()).filter(Boolean);
    }

    function typeLabel(type) {
        return {
            topic:"Circle Topics",
            question:"Question Banks",
            routine:"Thinking Routines",
            activity:"Discovery Activities"
        }[type] || "Resources";
    }

    function visibleResources() {
        const query = state.search?.value.trim().toLowerCase() || "";
        return ResourceManager.getResources()
            .filter((item) => item.type === state.type)
            .filter((item) => !state.favoritesOnly ||
                ResourceManager.isFavorite(item.id))
            .filter((item) => !query || [
                item.title,item.essentialQuestion,item.prompts.join(" "),
                item.reflection,item.activity,item.tags.join(" ")
            ].join(" ").toLowerCase().includes(query))
            .sort((a,b) =>
                Number(ResourceManager.isFavorite(b.id)) -
                Number(ResourceManager.isFavorite(a.id)) ||
                a.title.localeCompare(b.title)
            );
    }

    function renderCard(item) {
        const favorite = ResourceManager.isFavorite(item.id);
        return `
            <article class="resource-card ${state.selectedId === item.id ? "is-selected" : ""}">
                <button class="resource-card-main" type="button"
                    data-action="open-resource" data-resource-id="${escapeHtml(item.id)}">
                    <span>${escapeHtml(typeLabel(item.type))}</span>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.essentialQuestion || item.prompts[0] || "")}</p>
                </button>
                <button class="resource-favorite ${favorite ? "is-favorite" : ""}"
                    type="button" data-action="favorite-resource"
                    data-resource-id="${escapeHtml(item.id)}"
                    aria-label="${favorite ? "Remove favorite" : "Add favorite"}">
                    ${favorite ? "★" : "☆"}
                </button>
            </article>
        `;
    }

    function renderDetail(item) {
        if (!item) {
            return `<div class="resource-empty-detail">
                <p>Select a resource to review and use it.</p>
            </div>`;
        }

        return `
            <article class="resource-detail">
                <div class="resource-detail-heading">
                    <div>
                        <p class="eyebrow">${escapeHtml(typeLabel(item.type))}</p>
                        <h2>${escapeHtml(item.title)}</h2>
                    </div>
                    <button class="resource-favorite ${
                        ResourceManager.isFavorite(item.id) ? "is-favorite" : ""
                    }" type="button" data-action="favorite-resource"
                        data-resource-id="${escapeHtml(item.id)}">
                        ${ResourceManager.isFavorite(item.id) ? "★" : "☆"}
                    </button>
                </div>

                ${item.essentialQuestion ? `
                    <section class="resource-essential">
                        <span>Essential Question</span>
                        <blockquote>${escapeHtml(item.essentialQuestion)}</blockquote>
                    </section>
                ` : ""}

                ${item.prompts.length ? `
                    <section class="resource-detail-section">
                        <h3>Questions</h3>
                        <ol>${item.prompts.map((prompt) =>
                            `<li>${escapeHtml(prompt)}</li>`
                        ).join("")}</ol>
                    </section>
                ` : ""}

                ${item.reflection ? `
                    <section class="resource-detail-section">
                        <h3>Closing Reflection</h3>
                        <p>${escapeHtml(item.reflection)}</p>
                    </section>
                ` : ""}

                ${item.activity ? `
                    <section class="resource-detail-section">
                        <h3>Activity</h3>
                        <p>${escapeHtml(item.activity)}</p>
                    </section>
                ` : ""}

                <div class="tag-list">
                    ${item.tags.map((tag) =>
                        `<span class="tag">${escapeHtml(tag)}</span>`
                    ).join("")}
                </div>

                <div class="resource-detail-actions">
                    <button class="button button-primary" type="button"
                        data-action="use-resource-circle"
                        data-resource-id="${escapeHtml(item.id)}">
                        Use in Circle
                    </button>
                    <button class="button button-secondary" type="button"
                        data-action="copy-resource-question"
                        data-resource-id="${escapeHtml(item.id)}">
                        Copy Questions
                    </button>
                    ${item.custom ? `
                        <button class="button button-secondary" type="button"
                            data-action="edit-resource"
                            data-resource-id="${escapeHtml(item.id)}">Edit</button>
                        <button class="button button-danger" type="button"
                            data-action="delete-resource"
                            data-resource-id="${escapeHtml(item.id)}">Delete</button>
                    ` : ""}
                </div>
            </article>
        `;
    }

    function render() {
        if (!state.content) return;
        const weekly = ResourceManager.getWeeklyQuestion();
        const resources = visibleResources();
        const selected = ResourceManager.getResource(
            state.selectedId || resources[0]?.id
        );
        if (!state.selectedId && selected) state.selectedId = selected.id;

        state.content.innerHTML = `
            ${weekly ? `
                <section class="weekly-question-panel">
                    <div>
                        <p class="eyebrow">Question of the Week</p>
                        <blockquote>${escapeHtml(weekly.essentialQuestion)}</blockquote>
                        <span>${escapeHtml(weekly.title)}</span>
                    </div>
                    <button class="button button-secondary" type="button"
                        data-action="use-resource-circle"
                        data-resource-id="${escapeHtml(weekly.id)}">
                        Use in Circle
                    </button>
                </section>
            ` : ""}

            <div class="resource-toolbar">
                <div class="resource-type-tabs">
                    ${[
                        ["topic","Topics"],
                        ["question","Questions"],
                        ["routine","Routines"],
                        ["activity","Activities"]
                    ].map(([type,label]) => `
                        <button class="${state.type === type ? "is-active" : ""}"
                            type="button" data-action="resource-type"
                            data-resource-type="${type}">${label}</button>
                    `).join("")}
                </div>
                <div class="resource-toolbar-actions">
                    <button class="button button-secondary" type="button"
                        data-action="random-resource-question">
                        Give Me a Question
                    </button>
                    <button class="button button-secondary ${
                        state.favoritesOnly ? "is-active" : ""
                    }" type="button" data-action="toggle-resource-favorites">
                        ★ Favorites
                    </button>
                    <button class="button button-primary" type="button"
                        data-action="new-resource">+ New Resource</button>
                </div>
            </div>

            <div class="resource-library-layout">
                <section class="resource-list-panel">
                    <p class="resource-result-count">${resources.length} ${escapeHtml(
                        typeLabel(state.type).toLowerCase()
                    )}</p>
                    <div class="resource-list">
                        ${resources.length
                            ? resources.map(renderCard).join("")
                            : `<div class="empty-state"><h3>No resources found</h3>
                               <p>Try another search or category.</p></div>`
                        }
                    </div>
                </section>
                <section class="resource-detail-panel">
                    ${renderDetail(selected)}
                </section>
            </div>
        `;
    }

    function formTemplate(item = null) {
        const value = item || {
            id:"",type:state.type,title:"",essentialQuestion:"",
            prompts:[],reflection:"",activity:"",tags:[]
        };
        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal resource-modal" role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <h2>${item ? "Edit Resource" : "New Resource"}</h2>
                        <button class="icon-button" type="button"
                            data-action="close-resource-modal">×</button>
                    </div>
                    <form id="resourceForm">
                        <input type="hidden" name="resourceId"
                            value="${escapeHtml(value.id)}">
                        <div class="modal-body">
                            <div class="form-grid">
                                <div class="form-field">
                                    <label>Type</label>
                                    <select name="type">
                                        ${["topic","question","routine","activity"].map((type) =>
                                            `<option value="${type}" ${
                                                value.type === type ? "selected" : ""
                                            }>${escapeHtml(typeLabel(type))}</option>`
                                        ).join("")}
                                    </select>
                                </div>
                                <div class="form-field">
                                    <label>Title</label>
                                    <input name="title" required
                                        value="${escapeHtml(value.title)}">
                                </div>
                            </div>
                            <div class="form-field">
                                <label>Essential question</label>
                                <textarea name="essentialQuestion">${escapeHtml(
                                    value.essentialQuestion
                                )}</textarea>
                            </div>
                            <div class="form-field">
                                <label>Questions / prompts</label>
                                <textarea name="prompts"
                                    placeholder="One per line">${escapeHtml(
                                        value.prompts.join("\n")
                                    )}</textarea>
                            </div>
                            <div class="form-field">
                                <label>Closing reflection</label>
                                <textarea name="reflection">${escapeHtml(
                                    value.reflection
                                )}</textarea>
                            </div>
                            <div class="form-field">
                                <label>Activity or challenge</label>
                                <textarea name="activity">${escapeHtml(
                                    value.activity
                                )}</textarea>
                            </div>
                            <div class="form-field">
                                <label>Tags</label>
                                <input name="tags" value="${escapeHtml(
                                    value.tags.join(", ")
                                )}">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="button button-secondary" type="button"
                                data-action="close-resource-modal">Cancel</button>
                            <button class="button button-primary" type="submit">
                                Save Resource
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function closeModal() {
        state.modalRoot.innerHTML = "";
        document.body.style.overflow = "";
    }

    function useInCircle(item) {
        if (!item) return;
        if (typeof CircleUI !== "undefined" && CircleUI.openFromResource) {
            CircleUI.openFromResource(item);
        } else {
            document.dispatchEvent(new CustomEvent("openCircleFromResource", {
                detail:{resource:item}
            }));
        }
    }

    async function copyQuestions(item) {
        const text = [
            item.title,
            item.essentialQuestion,
            ...item.prompts,
            item.reflection,
            item.activity
        ].filter(Boolean).join("\n\n");
        try {
            await navigator.clipboard.writeText(text);
            App.showToast("Questions copied.");
        } catch {
            App.showToast("Copy was blocked by the browser.", "error");
        }
    }

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;
        const action = target.dataset.action;
        const id = target.dataset.resourceId;

        if (action === "resource-type") {
            state.type = target.dataset.resourceType || "topic";
            state.selectedId = "";
            render();
        } else if (action === "open-resource") {
            state.selectedId = id;
            render();
        } else if (action === "favorite-resource") {
            ResourceManager.toggleFavorite(id);
        } else if (action === "toggle-resource-favorites") {
            state.favoritesOnly = !state.favoritesOnly;
            state.selectedId = "";
            render();
        } else if (action === "new-resource") {
            state.modalRoot.innerHTML = formTemplate();
            document.body.style.overflow = "hidden";
        } else if (action === "edit-resource") {
            state.modalRoot.innerHTML = formTemplate(
                ResourceManager.getResource(id)
            );
            document.body.style.overflow = "hidden";
        } else if (action === "delete-resource") {
            if (window.confirm("Delete this custom resource?")) {
                ResourceManager.removeResource(id);
                state.selectedId = "";
            }
        } else if (action === "close-resource-modal") {
            closeModal();
        } else if (action === "use-resource-circle") {
            useInCircle(ResourceManager.getResource(id));
        } else if (action === "copy-resource-question") {
            copyQuestions(ResourceManager.getResource(id));
        } else if (action === "random-resource-question") {
            const question = ResourceManager.getRandomQuestion();
            if (question) {
                state.modalRoot.innerHTML = `
                    <div class="modal-backdrop" data-modal-backdrop>
                        <section class="modal modal-small" role="dialog" aria-modal="true">
                            <div class="modal-header">
                                <h2>Conversation Starter</h2>
                                <button class="icon-button" type="button"
                                    data-action="close-resource-modal">×</button>
                            </div>
                            <div class="modal-body random-question-modal">
                                <blockquote>${escapeHtml(question.prompt)}</blockquote>
                                <p>${escapeHtml(question.title)}</p>
                                <button class="button button-primary" type="button"
                                    data-action="random-resource-question">
                                    Another Question
                                </button>
                            </div>
                        </section>
                    </div>`;
                document.body.style.overflow = "hidden";
            }
        }
    }

    function handleSubmit(event) {
        if (event.target.id !== "resourceForm") return;
        event.preventDefault();
        const data = new FormData(event.target);
        const id = String(data.get("resourceId") || "");
        const payload = {
            type:data.get("type"),
            title:data.get("title"),
            essentialQuestion:data.get("essentialQuestion"),
            prompts:splitList(data.get("prompts")),
            reflection:data.get("reflection"),
            activity:data.get("activity"),
            tags:splitList(data.get("tags"))
        };
        const item = id
            ? ResourceManager.updateResource(id,payload)
            : ResourceManager.addResource(payload);
        state.type = item.type;
        state.selectedId = item.id;
        closeModal();
        render();
        App.showToast("Resource saved.");
    }

    function initialize() {
        state.content = document.getElementById("resourceLibraryContent");
        state.search = document.getElementById("resourceSearchInput");
        state.modalRoot = document.getElementById("modalRoot");
        if (!state.content) return;
        ResourceManager.initialize();
        state.search.addEventListener("input", render);
        document.addEventListener("click", handleClick);
        document.addEventListener("submit", handleSubmit);
        document.addEventListener(ResourceManager.DATA_CHANGED_EVENT, render);
        render();
    }

    return Object.freeze({initialize,render});
})();
