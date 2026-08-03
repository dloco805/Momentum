/*
==========================================================
Momentum
Print Manager
Build v21.0.0
File: js/printManager.js
==========================================================
*/

"use strict";

const PrintManager = (() => {
    let activePreview = null;

    function createWindow() {
        if (activePreview && !activePreview.closed) {
            try {
                activePreview.close();
            } catch (error) {
                console.warn("Momentum could not close the previous print preview.", error);
            }
        }

        const popup = window.open("", "momentumPrintPreview");

        if (!popup) {
            App.showToast(
                "The print preview was blocked. Allow pop-ups for Momentum and try again.",
                "error"
            );
            return null;
        }

        activePreview = popup;
        return popup;
    }

    function previewToolbar() {
        return `
            <div class="momentum-print-toolbar" role="region"
                aria-label="Print preview controls">
                <strong>Momentum Print Preview</strong>
                <div>
                    <button id="momentumPrintButton" type="button">
                        Print / Save as PDF
                    </button>
                    <button id="momentumClosePrintButton" type="button">
                        Close Preview
                    </button>
                </div>
            </div>
        `;
    }

    function previewScript() {
        return `
            <script>
                (() => {
                    const printButton = document.getElementById("momentumPrintButton");
                    const closeButton = document.getElementById("momentumClosePrintButton");

                    if (printButton) {
                        printButton.addEventListener("click", () => {
                            printButton.disabled = true;
                            window.setTimeout(() => {
                                try {
                                    window.print();
                                } finally {
                                    printButton.disabled = false;
                                }
                            }, 50);
                        });
                    }

                    if (closeButton) {
                        closeButton.addEventListener("click", () => window.close());
                    }
                })();
            <\/script>
        `;
    }

    function baseCss(orientation, customCss = "") {
        return `
            @page {
                size: ${orientation};
                margin: 0.5in;
            }

            :root {
                --ink: #172033;
                --muted: #667085;
                --line: #d7deea;
                --blue: #4057b7;
                --blue-soft: #eef1ff;
                --teal: #267c68;
                --teal-soft: #eaf7f2;
                --gold: #9b7100;
                --gold-soft: #fff7d8;
                --purple: #7653a6;
                --purple-soft: #f3edfb;
            }

            * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            html {
                background: #edf1f6;
            }

            body {
                max-width: 1050px;
                margin: 0 auto;
                padding: 78px 26px 36px;
                color: var(--ink);
                font-family: Inter, "Segoe UI", Arial, sans-serif;
                font-size: 11px;
                line-height: 1.5;
                background: #ffffff;
            }

            .momentum-print-toolbar {
                position: fixed;
                inset: 0 0 auto 0;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 12px 18px;
                border-bottom: 1px solid #ccd3e0;
                background: #ffffff;
            }

            .momentum-print-toolbar div {
                display: flex;
                gap: 8px;
            }

            .momentum-print-toolbar button {
                min-height: 38px;
                padding: 8px 13px;
                border: 1px solid #cfd6e3;
                border-radius: 8px;
                color: var(--ink);
                font: inherit;
                font-weight: 700;
                background: #ffffff;
                cursor: pointer;
            }

            .momentum-print-toolbar button:first-child {
                color: #ffffff;
                border-color: var(--blue);
                background: var(--blue);
            }

            header {
                margin-bottom: 22px;
                padding: 20px 22px;
                border: 1px solid #ced6e8;
                border-top: 6px solid var(--blue);
                border-radius: 14px;
                background: linear-gradient(135deg, var(--blue-soft), #ffffff 72%);
            }

            h1, h2, h3, h4, p {
                margin-top: 0;
            }

            h1 {
                margin-bottom: 5px;
                color: #263b8f;
                font-size: 26px;
            }

            h2 {
                margin: 24px 0 10px;
                padding-bottom: 7px;
                border-bottom: 2px solid var(--line);
                color: #29365d;
                font-size: 17px;
            }

            h3 {
                margin-bottom: 6px;
                color: #27324d;
                font-size: 14px;
            }

            h4 {
                margin-bottom: 5px;
                font-size: 12.5px;
            }

            .muted {
                color: var(--muted);
            }

            .grid {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 10px;
            }

            .card {
                break-inside: avoid;
                padding: 13px;
                border: 1px solid var(--line);
                border-top: 4px solid var(--blue);
                border-radius: 11px;
                background: var(--blue-soft);
            }

            .card:nth-child(4n + 2) {
                border-top-color: var(--purple);
                background: var(--purple-soft);
            }

            .card:nth-child(4n + 3) {
                border-top-color: var(--teal);
                background: var(--teal-soft);
            }

            .card:nth-child(4n + 4) {
                border-top-color: var(--gold);
                background: var(--gold-soft);
            }

            .card strong {
                display: block;
                margin-top: 3px;
                font-size: 17px;
            }

            .record {
                break-inside: avoid;
                margin: 9px 0;
                padding: 12px 13px;
                border: 1px solid var(--line);
                border-left: 5px solid var(--teal);
                border-radius: 10px;
                background: linear-gradient(90deg, var(--teal-soft), #ffffff 48%);
            }

            .report-section {
                margin: 22px 0;
                padding: 15px 16px;
                border: 1px solid var(--line);
                border-top: 5px solid var(--blue);
                border-radius: 12px;
                background: #ffffff;
            }

            table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                overflow: hidden;
                border: 1px solid var(--line);
                border-radius: 10px;
                font-size: 9.5px;
            }

            th, td {
                padding: 7px 8px;
                border-right: 1px solid var(--line);
                border-bottom: 1px solid var(--line);
                text-align: left;
                vertical-align: top;
            }

            th {
                color: #293a8f;
                font-weight: 800;
                background: var(--blue-soft);
            }

            th:last-child,
            td:last-child {
                border-right: 0;
            }

            tr:last-child td {
                border-bottom: 0;
            }

            tbody tr:nth-child(even) td {
                background: #fafbfe;
            }

            ul {
                margin: 7px 0 0;
                padding-left: 19px;
            }

            li {
                margin-bottom: 3px;
            }

            blockquote {
                margin: 12px 0;
                padding: 13px 15px;
                border-left: 5px solid var(--blue);
                border-radius: 0 10px 10px 0;
                color: #2e3f79;
                background: var(--blue-soft);
            }

            footer {
                margin-top: 28px;
                padding-top: 10px;
                border-top: 1px solid var(--line);
                color: var(--muted);
                font-size: 9.5px;
            }

            @media print {
                html,
                body {
                    background: #ffffff;
                }

                body {
                    max-width: none;
                    padding: 0;
                }

                .momentum-print-toolbar {
                    display: none !important;
                }

                .card,
                .record,
                tr {
                    break-inside: avoid;
                }

                .report-section {
                    break-inside: auto;
                }
            }

            ${customCss}
        `;
    }

    function printHtml(title, body, options = {}) {
        const popup = createWindow();
        if (!popup) return false;

        const orientation = options.orientation === "landscape"
            ? "landscape"
            : "portrait";

        popup.document.open();
        popup.document.write(`
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>${String(title || "Momentum Report")}</title>
                <style>${baseCss(orientation, options.css || "")}</style>
            </head>
            <body>
                ${previewToolbar()}
                ${body}
                ${previewScript()}
            </body>
            </html>
        `);
        popup.document.close();

        App.showToast("Print preview opened. Use Print / Save as PDF when ready.");
        return true;
    }

    function getPreviewToolbar() {
        return previewToolbar();
    }

    function getPreviewScript() {
        return previewScript();
    }

    return Object.freeze({
        createWindow,
        printHtml,
        getPreviewToolbar,
        getPreviewScript
    });
})();
