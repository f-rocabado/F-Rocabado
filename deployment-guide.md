# Francisco Rocabado · Academic Portfolio

The English and Spanish editions are static pages. The research archive, CV downloads, projects, and contact information work independently of the geographic map. The English entry point is `dist/index.html` and the Spanish edition is `dist/es.html`.

## Edit the Excel map

Download **science-connections.xlsx** from the Connections section. Open the **Instructions** sheet for the bilingual field guide and ISO country codes.

- On **Collaborations**, enter one row per coauthor, paper, and institution as credited at publication. Include the institution’s country, city, coordinates, paper title, paper link and affiliation source. A coauthor with two credited affiliations can appear twice for one paper. A country is an affiliation location, not nationality.
- On **Joy**, enter a person’s chosen public name, country code, city, latitude, longitude, and the profile URL that their name should open. Several people can share the same city. The initial sheet is empty for Francisco to fill.
- Save the workbook under the same filename. Replace `dist/assets/science-connections.xlsx` and redeploy. The interactive map reads the workbook when the map section loads. No JavaScript or geographic data editing is needed.
- To refresh the static accessibility fallback too, run `python3 refresh-map.py` followed by `node build.mjs`. The Python script uses openpyxl.

In the map, select a country or city using the geographic view or the selection lists. Under **Joy through science**, zooming into a populated area reveals people’s names and profile links. **World view** restores the overview. The workbook ships with the website, so enter information intended for its visitors.

## Edit the publications and profile

**publications.json** contains all 24 publication records from section C.1 of the supplied CV. The archive distinguishes journal articles, conference proceedings and book chapters. Each record has a persistent ID, original title and language, coauthors, publication or book, research topics, bilingual study details and available sources. The bilingual introduction uses four records marked `featured`. Editing an existing record updates the archive, its detail view, and any featured display after a rebuild.

The pharmacy study retains its in-press status as recorded in the author’s CV. The clinical-training article uses the final Psicothema citation. The clouded-judgments study records both its 2024 online publication and its 2025 issue. Chapter records link to institutional entries. Follow individual DOI or source links for publication metadata and study details.

**career.json** contains public academic appointments, education, presentations, additional projects, teaching, supervision and knowledge transfer. The ten talks and posters are listed separately from the published proceedings paper.

**content.mjs** contains the bilingual introduction, research areas, featured projects, profile links, technical methods, and academic highlights. The confirmed GitHub account is `f-rocabado`. The About section uses `dist/assets/profile_FR.jpeg` in both languages. The delivered file is the square crop of the supplied photograph also published on Francisco’s institutional profile. To change it, replace that file and rebuild.

**build.mjs**, **academic-sections.mjs**, and **map-section.mjs** generate both language pages. The academic timeline, accessible non-script map list and publication entries are present in the generated HTML. Local assets include the optimized architectural illustration, research displays, self-hosted fonts, map libraries, world boundaries and English and Spanish CV PDFs. **dist/app.js** implements navigation, topic and publication-type filters, the projection carousel and reading mode. **dist/connections.js** reads Excel and draws the interactive map.

After changing source content, run the following from the project folder with Node 22.12 or newer.

```sh
node build.mjs
```

To refresh the CV PDFs after a source edit, install Python’s ReportLab package and run `python3 make-cv.py`. The PDF generator uses only the academic content selected for the website.

## Deploy on GitHub Pages

1. Extract the source archive. Set `settings.canonical` and `settings.socialImage` in **content.mjs** to the intended deployment origin and sharing image. Rebuild both pages.
2. Copy the contents of `dist/`, including `.nojekyll`, to the root of a GitHub repository. Keep `assets/` and its subdirectories together.
3. Commit and push to `main`. Under **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/(root)**, and save.
4. Open the URL GitHub provides. The two language pages, PDFs, workbook, scripts and geographic assets use relative paths and also work under a repository subdirectory.

Alternatively, keep the full source in the repository, copy `dist/` into `docs/`, and select **/docs** in Pages settings. For local inspection, run `python3 -m http.server 8000 --directory dist` and open `http://localhost:8000/`.

## Sources and asset credits

- The published lexical-decision trial figure is by Rocabado, Muntini, Jubran, Lachmann and Duñabeitia (2025). [Published figure](https://www.nature.com/articles/s41598-025-08319-1/figures/2) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- The sunny and rainy reading environments are Figure 2 by Rocabado, Muntini, González Alonso and Duñabeitia (2024). [Published study](https://doi.org/10.3389/fpsyg.2024.1433781) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- The portrait is the supplied photograph as cropped for the [Universidad Nebrija profile](https://portalinvestigacion.nebrija.com/investigadores/644116/detalle).
- The other project and research illustrations are labeled in both languages. The Lectura Vial image illustrates reading from a driver’s viewpoint.
- Country boundaries are simplified Natural Earth 1:110m Admin 0 polygons, in the public domain. The map uses locally served Leaflet 1.9.4 and read-excel-file 5.8.8. Library licenses are in `dist/assets/map/vendor/`. [Natural Earth](https://www.naturalearthdata.com/) · [Leaflet](https://leafletjs.com/)
- The workbook records a publication-specific evidence link for each coauthor affiliation. Coordinates denote approximate city or institutional locations.
- Inter, Plus Jakarta Sans and JetBrains Mono are self-hosted. Their licenses are in `dist/assets/fonts/licenses/`.

## Actualización en español

Descarga el Excel desde **Conexiones**. En **Collaborations**, registra cada coautor, publicación y afiliación. En **Joy**, añade un nombre, el código de país, la ciudad, las coordenadas y el enlace que quieres asociar a esa persona. La hoja **Instructions** contiene la guía en español. Guarda el archivo como `science-connections.xlsx`, sustituye la copia de `dist/assets/` y vuelve a publicar. El mapa interactivo leerá el archivo actualizado.

Para actualizar las publicaciones, edita **publications.json** y ejecuta `node build.mjs`. Para regenerar también la versión estática del mapa, ejecuta primero `python3 refresh-map.py`. La foto de perfil se carga desde `dist/assets/profile_FR.jpeg` al regenerar las páginas.

