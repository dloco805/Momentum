Momentum Community Map — v23.7.0

WHAT THIS IS
A standalone, GitHub Pages-ready community map that uses the Momentum v23.6.0 directory export.
It is intentionally separate from the Community page and can be embedded in Google Sites by URL.

GITHUB URL
After uploading the complete Momentum-v23.7.0 folder to the existing repository, the map URL will be:
https://YOUR-USERNAME.github.io/Momentum/community-map/

TEST WORKFLOW
1. Open community-map/index.html through GitHub Pages.
2. Pick a category or search term.
3. Choose “Locate visible places.”
4. The page looks up locations one at a time and saves verified results in that browser.
5. Choose “Export coordinates” when ready.
6. Keep the exported Momentum-Community-Map-Coordinates.json file. It can be imported back into the test map.

IMPORTANT
This test build does not guess coordinates. Public Nominatim use is user-triggered, single-threaded, rate-limited, and cached.
Before broad public embedding, freeze the exported coordinate file into the map so visitors do not repeat geocoding.

GOOGLE SITES
Insert > Embed > By URL, then paste the GitHub Pages community-map URL.
