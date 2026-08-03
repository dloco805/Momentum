/*
==========================================================
Momentum
Activity Notepad UI
Build v21.0.0
File: js/activityUI.js
==========================================================
*/
"use strict";

const ActivityUI = (() => {
    const state = {
        root: null,
        modalRoot: null,
        query: "",
        filter: "all"
    };

    function esc(value) {
        return String(value ?? "")
            .replaceAll("&","&amp;").replaceAll("<","&lt;")
            .replaceAll(">","&gt;").replaceAll('"',"&quot;")
            .replaceAll("'","&#039;");
    }

    function statusLabel(status) {
        return { idea: "Idea", ready: "Ready", used: "Used" }[status] || "Idea";
    }

    function splitTags(value) {
        return String(value || "")
            .split(/[\n,;]+/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function filtered() {
        const query = state.query.toLowerCase();
        return ActivityManager.getActivities()
            .filter((item) => state.filter === "all" || item.status === state.filter)
            .filter((item) => !query || [
                item.title, item.category, item.notes, item.howItWent,
                item.nextTime, ...item.tags
            ].join(" ").toLowerCase().includes(query))
            .sort((a,b) => {
                if (a.status === "used" && b.status !== "used") return 1;
                if (b.status === "used" && a.status !== "used") return -1;
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });
    }

    function renderNotes(notes) {
        const lines = String(notes || "").split(/\n/).map((x)=>x.trim()).filter(Boolean);
        if (!lines.length) return `<p class="empty-copy">No notes yet.</p>`;
        return `<ul class="activity-note-list">${lines.map((line) =>
            `<li>${esc(line.replace(/^[-*•]\s*/, ""))}</li>`
        ).join("")}</ul>`;
    }

    function renderCard(item) {
        return `
            <article class="activity-bank-card activity-status-${esc(item.status)}">
                <div class="activity-card-heading">
                    <div>
                        <span>${esc(item.category)}</span>
                        <h3>${esc(item.title)}</h3>
                    </div>
                    <span class="activity-status-badge">${esc(statusLabel(item.status))}</span>
                </div>

                ${renderNotes(item.notes)}

                ${item.tags.length ? `
                    <div class="tag-list">
                        ${item.tags.map((tag)=>`<span class="tag">${esc(tag)}</span>`).join("")}
                    </div>
                ` : ""}

                ${item.status === "used" ? `
                    <section class="activity-used-summary">
                        <div>
                            <span>Used ${item.uses?.length || 1} time${(item.uses?.length || 1) === 1 ? "" : "s"}</span>
                            <strong>${esc(DateUtils.formatLongDate(item.usedDate))}</strong>
                        </div>
                        ${item.howItWent ? `
                            <div>
                                <span>How it went</span>
                                <p>${esc(item.howItWent)}</p>
                            </div>
                        ` : ""}
                        ${item.nextTime ? `
                            <div>
                                <span>Next time</span>
                                <p>${esc(item.nextTime)}</p>
                            </div>
                        ` : ""}
                    </section>
                ` : ""}

                <div class="activity-card-actions">
                    ${item.status !== "used" ? `
                        <button class="button button-primary button-small" type="button"
                            data-action="use-activity" data-activity-id="${esc(item.id)}">
                            Mark Used
                        </button>
                    ` : `
                        <button class="button button-primary button-small" type="button"
                            data-action="use-activity" data-activity-id="${esc(item.id)}">
                            Add Another Use
                        </button>
                    `}
                    <button class="button button-secondary button-small" type="button"
                        data-action="edit-activity" data-activity-id="${esc(item.id)}">
                        Edit
                    </button>
                    <button class="button button-ghost button-small" type="button"
                        data-action="duplicate-activity" data-activity-id="${esc(item.id)}">
                        Duplicate
                    </button>
                    <button class="button button-danger button-small" type="button"
                        data-action="delete-activity" data-activity-id="${esc(item.id)}">
                        Delete
                    </button>
                </div>
            </article>
        `;
    }

    function render() {
        if (!state.root) return;
        const items = filtered();
        const all = ActivityManager.getActivities();
        const counts = {
            ideas: all.filter((x)=>x.status==="idea").length,
            ready: all.filter((x)=>x.status==="ready").length,
            used: all.filter((x)=>x.status==="used").length
        };

        state.root.innerHTML = `
            <section class="activity-quick-notepad">
                <div class="activity-notepad-heading">
                    <div>
                        <p class="eyebrow">Quick notes</p>
                        <h3>Activity Notepad</h3>
                    </div>
                    <div class="activity-notepad-actions">
                        <span id="activityNotepadStatus">Not changed</span>
                        <button class="button button-primary button-small" type="button"
                            data-action="save-activity-notepad">
                            Save Notes
                        </button>
                    </div>
                </div>
                <textarea id="activityQuickNotepad"
                    placeholder="Jot down an activity idea, lesson thought, material to remember, question, link, or anything else.">${esc(ActivityManager.getNotepad())}</textarea>
            </section>

            <div class="activity-bank-toolbar">
                <label class="search-field">
                    <span aria-hidden="true">⌕</span>
                    <input type="search" data-activity-search
                        value="${esc(state.query)}"
                        placeholder="Search activities, lessons, or notes">
                </label>
                <select data-activity-filter>
                    <option value="all" ${state.filter==="all"?"selected":""}>All activities</option>
                    <option value="idea" ${state.filter==="idea"?"selected":""}>Ideas</option>
                    <option value="ready" ${state.filter==="ready"?"selected":""}>Ready</option>
                    <option value="used" ${state.filter==="used"?"selected":""}>Used</option>
                </select>
                <button class="button button-primary" type="button" data-action="new-activity">
                    + New Activity
                </button>
            </div>

            <div class="activity-bank-counts">
                <span>${counts.ideas} ideas</span>
                <span>${counts.ready} ready</span>
                <span>${counts.used} used</span>
            </div>

            ${items.length ? `
                <div class="activity-bank-list">${items.map(renderCard).join("")}</div>
            ` : `
                <div class="empty-state">
                    <h3>${state.query || state.filter !== "all"
                        ? "No matching activities"
                        : "Your activity list is empty"
                    }</h3>
                    <p>Save lessons, class activities, conversation ideas, and notes for later.</p>
                    <button class="button button-primary" type="button" data-action="new-activity">
                        + Add the first activity
                    </button>
                </div>
            `}
        `;
    }

    function activityForm(item = null) {
        const activity = item || {
            id: "", title: "", category: "Activity", status: "idea",
            notes: "", tags: []
        };
        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal activity-modal" role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <h2>${item ? "Edit Activity" : "New Activity"}</h2>
                        <button class="icon-button" type="button" data-action="close-activity-modal">×</button>
                    </div>
                    <form id="activityForm">
                        <input type="hidden" name="activityId" value="${esc(activity.id)}">
                        <div class="modal-body">
                            <div class="form-field">
                                <label>Activity title</label>
                                <input name="title" required value="${esc(activity.title)}"
                                    placeholder="Example: Identity Map">
                            </div>
                            <div class="form-grid">
                                <div class="form-field">
                                    <label>Type</label>
                                    <select name="category">
                                        ${["Activity","Lesson","Circle Idea","Project Idea","Community Activity","Other"]
                                            .map((value)=>`<option value="${esc(value)}"
                                                ${activity.category===value?"selected":""}>${esc(value)}</option>`)
                                            .join("")}
                                    </select>
                                </div>
                                <div class="form-field">
                                    <label>Status</label>
                                    <select name="status">
                                        <option value="idea" ${activity.status==="idea"?"selected":""}>Idea</option>
                                        <option value="ready" ${activity.status==="ready"?"selected":""}>Ready to use</option>
                                        <option value="used" ${activity.status==="used"?"selected":""}>Used</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-field">
                                <label>Notes and ideas</label>
                                <textarea name="notes" class="activity-notes-input"
                                    placeholder="Add bullet-point notes, materials, prompts, steps, links, or reminders.">${esc(activity.notes)}</textarea>
                                <p class="field-help">Put each bullet or idea on its own line.</p>
                            </div>
                            <div class="form-field">
                                <label>Tags</label>
                                <input name="tags" value="${esc(activity.tags.join(", "))}"
                                    placeholder="community, identity, teamwork">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="button button-secondary" type="button"
                                data-action="close-activity-modal">Cancel</button>
                            <button class="button button-primary" type="submit">Save Activity</button>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    function useForm(item) {
        return `
            <div class="modal-backdrop" data-modal-backdrop>
                <section class="modal activity-use-modal" role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <div>
                            <p class="eyebrow">Add to Calendar</p>
                            <h2>${esc(item.title)}</h2>
                        </div>
                        <button class="icon-button" type="button" data-action="close-activity-modal">×</button>
                    </div>
                    <form id="activityUseForm">
                        <input type="hidden" name="activityId" value="${esc(item.id)}">
                        <div class="modal-body">
                            <div class="form-grid">
                                <div class="form-field">
                                    <label>Date used</label>
                                    <input type="date" name="usedDate" required value="${DateUtils.today()}">
                                </div>
                                <div class="form-field">
                                    <label>Time (optional)</label>
                                    <input type="time" name="usedTime" value="${DateUtils.nowTime()}">
                                </div>
                            </div>
                            <div class="form-field">
                                <label>How did it go?</label>
                                <textarea name="howItWent"
                                    placeholder="What worked, how students responded, or what stood out?"></textarea>
                            </div>
                            <div class="form-field">
                                <label>Next time</label>
                                <textarea name="nextTime"
                                    placeholder="What would you repeat, change, or add next time?"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="button button-secondary" type="button"
                                data-action="close-activity-modal">Cancel</button>
                            <button class="button button-primary" type="submit">
                                Mark Used & Add to Calendar
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

    function handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;
        const action = target.dataset.action;
        const id = target.dataset.activityId || "";

        if (action === "save-activity-notepad") {
            const notepad = document.getElementById("activityQuickNotepad");
            if (notepad) {
                ActivityManager.saveNotepad(notepad.value);
                const status = document.getElementById("activityNotepadStatus");
                if (status) status.textContent = "Saved locally";
                App.showToast("Activity notes saved.");
            }
        } else if (action === "new-activity") {
            state.modalRoot.innerHTML = activityForm();
            document.body.style.overflow = "hidden";
        } else if (action === "edit-activity") {
            const item = ActivityManager.getActivity(id);
            if (item) state.modalRoot.innerHTML = activityForm(item);
            document.body.style.overflow = "hidden";
        } else if (action === "use-activity") {
            const item = ActivityManager.getActivity(id);
            if (item) state.modalRoot.innerHTML = useForm(item);
            document.body.style.overflow = "hidden";
        } else if (action === "duplicate-activity") {
            ActivityManager.duplicateActivity(id);
            App.showToast("Activity duplicated.");
        } else if (action === "delete-activity") {
            const item = ActivityManager.getActivity(id);
            if (item && window.confirm(`Delete “${item.title}”?`)) {
                ActivityManager.removeActivity(id);
                App.showToast("Activity deleted.");
            }
        } else if (action === "close-activity-modal") {
            closeModal();
        }
    }

    function handleSubmit(event) {
        if (event.target.id === "activityForm") {
            event.preventDefault();
            const data = new FormData(event.target);
            const id = String(data.get("activityId") || "");
            const payload = {
                title: data.get("title"),
                category: data.get("category"),
                status: data.get("status"),
                notes: data.get("notes"),
                tags: splitTags(data.get("tags"))
            };
            id ? ActivityManager.updateActivity(id,payload) : ActivityManager.addActivity(payload);
            App.showToast(id ? "Activity updated." : "Activity added.");
            closeModal();
        } else if (event.target.id === "activityUseForm") {
            event.preventDefault();
            const data = new FormData(event.target);
            ActivityManager.markUsed(String(data.get("activityId") || ""), {
                usedDate: data.get("usedDate"),
                usedTime: data.get("usedTime"),
                howItWent: data.get("howItWent"),
                nextTime: data.get("nextTime")
            });
            App.showToast("Activity added to the Calendar.");
            closeModal();
        }
    }

    function initialize() {
        state.root = document.getElementById("activityBankContent");
        state.modalRoot = document.getElementById("modalRoot");
        if (!state.root) return;

        document.addEventListener("click", handleClick);
        document.addEventListener("submit", handleSubmit);
        document.addEventListener(ActivityManager.DATA_CHANGED_EVENT, render);
        document.addEventListener("input", (event) => {
            if (event.target.id === "activityQuickNotepad") {
                const status = document.getElementById("activityNotepadStatus");
                if (status) status.textContent = "Unsaved changes";
                return;
            }

            if (!event.target.matches("[data-activity-search]")) return;
            state.query = event.target.value;
            render();
            const input = state.root.querySelector("[data-activity-search]");
            input?.focus();
            input?.setSelectionRange(state.query.length,state.query.length);
        });
        document.addEventListener("change", (event) => {
            if (!event.target.matches("[data-activity-filter]")) return;
            state.filter = event.target.value;
            render();
        });
        render();
    }

    return Object.freeze({ initialize, render });
})();
