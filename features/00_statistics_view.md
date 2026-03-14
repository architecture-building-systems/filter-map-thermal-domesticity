# Municipality Modal Changes
- Add a view like "Context" to the modal called "Snapshot"
- This will utilise the graphics outlined below and the new swiss_stats module
- Keep it lightweight, but interactive.

## Graphic Statistical Summary

Each graphic representation should be the same size and can be explored using arrows in a gallery or a hybrid dropdown/search bar. Some will be charts, some might just be text.

For a clicked on municipality we want to see a few key statistics in figures:
- Ratio of Swiss born to non-Swiss born (Ratio in large text "3.2:1")
- Percentage of origin (pie chart)
- Age distribution (bar stack genders)
- Building construction period comparison (pie chart) [percentage]
- Heat source comparison (pie chart) [percentage]
- Heat generator comparison (pie chart) [percentage]
- Land use 10 class comparison (bar chart) [absolute]
- Area statistics 17 class comparison (bar chart) [absolute]

## Addition to "Overview" View 
- For all of the requested stats, just state them plainly in a table
- Should be its own table like "Benchmark Snapshot"
- compare to Canton mean (build these in dev and cache them before deploy)
- compare to Swiss mean (build these in dev and cache them before deploy)

