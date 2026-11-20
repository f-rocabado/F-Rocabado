# Francisco Rocabado’s research pavilion

A bilingual, static academic portfolio with a perspective-mapped publication wall, four research exhibits, and a conventional reading view. Open `dist/index.html` in a browser or serve the directory locally. The English and Spanish pages contain the full academic text as semantic HTML.

## Deploy on GitHub Pages

1. Extract the source archive. Create or select a GitHub repository for the portfolio.
2. Copy everything inside `dist/` to the root of the repository, keeping `assets/` and its subfolders together. Include `.nojekyll`. The repository root should contain `index.html`, `es.html`, `style.css`, `fonts.css`, `app.js`, and `assets/`.
3. Commit and push those files to `main`.
4. Open the repository’s **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then **main** and **/(root)**. Save.
5. Open the deployment URL shown by GitHub. The language pages, scripts, stylesheets, images and PDFs use relative paths, including when the repository is served from a project subdirectory.

To keep the editable source and hosted files together in one repository, commit this project, copy the contents of `dist/` into `docs/`, and select **main** and **/docs** in step 4. A Node installation is only needed to regenerate pages after editing the source data.

## Edit the content

- **content.mjs** contains publications, research areas, projects, the toolkit, teaching, institutions, service, academic profiles, translations and media paths. English and Spanish values are paired. Formal scholarly titles, author names, journal names and institution names retain their published spelling.
- **build.mjs** renders both complete language pages from those objects. Its localized interface strings and figure-credit records are adjacent to the markup they describe.
- **icons.mjs** contains the inline interface icons.
- **dist/app.js** implements the carousel, keyboard and touch controls, filters, modal, navigation, language preferences, reading view and input-driven parallax.
- **dist/style.css** contains the responsive architectural surfaces, projection placement, typography and motion rules.
- **dist/assets/** contains local images, fonts, figure credits through the page captions, and both prepared CV files.

After editing, run the following from the project directory.

```sh
node build.mjs
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000/`. The static site has no runtime dependencies, network font requests, account requirements or backend.

Before deploying to a new origin, set `settings.canonical` to the full site URL, including the final slash and any repository path. Set `settings.socialImage` to an absolute publicly accessible image URL for that deployment. The delivered settings use the initial Site deployment.

## Publications and assets

Edit the `publications` array once to update both the wall and the publication archive. Keep each `id` stable for incoming links. Research areas reference publication IDs. Each record includes its year, complete author list, journal, DOI, data link, topics, wall title, bilingual image descriptions and local image path. Set `materials` to a verified link when one becomes available.

The portrait field initially contains `[INSERT_PROFILE_PHOTO_URL]`. The page renders a framed monogram with a pending-portrait caption until a portrait path or URL is supplied. The GitHub field `[URL_GITHUB]` renders as a pending profile. The third project retains `[PROJECT_TITLE]`, `[PROJECT_DESCRIPTION]`, `[PROJECT_IMAGE]` and `[PROJECT_URL]` inside the additional-research disclosure. Replace it with a bilingual project record using the two completed records as examples, and remove the placeholder flag.

The pavilion is a generated architectural illustration. The weather-study slide uses the published Figure 2 with attribution in the study detail. Illustrative publication and project photographs are labeled in both languages. The hero combines separate near-wall, distant-corridor, pedestal and projection layers. Mouse and scroll input move these layers at different depths. Reduced motion switches off the camera effects. Reading view replaces the spatial entrance with a linear introduction and projection display.

The two downloadable PDFs are selected academic CVs compiled from the supplied profile and verified publication information. Replace them with researcher-approved PDFs at the paths in `settings.cv`. To regenerate the supplied versions after a data edit, install Python’s ReportLab package and run `python3 make-cv.py`.

## Academic sources and credits

- The four publication records link to the publisher DOI pages. [Scientific Reports, 2025](https://doi.org/10.1038/s41598-025-08319-1) · [Frontiers in Psychology, 2024](https://doi.org/10.3389/fpsyg.2024.1433781) · [Computers in Human Behavior, 2023](https://doi.org/10.1016/j.chb.2022.107563) · [Behavioral Sciences, 2022](https://doi.org/10.3390/bs12110444)
- Author identification and academic profile links were checked against the institutional research profile and linked records. [Universidad Nebrija](https://portalinvestigacion.nebrija.com/investigadores/644116/detalle) · [ORCID](https://orcid.org/0000-0002-4845-6950)
- The language study detail reproduces Figure 2 by Rocabado, Muntini, Jubran, Lachmann and Duñabeitia (2025), unchanged. [Published figure](https://www.nature.com/articles/s41598-025-08319-1/figures/2) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- The weather study detail reproduces Figure 2 by Rocabado, Muntini, González Alonso and Duñabeitia (2024), unchanged. [Published article](https://doi.org/10.3389/fpsyg.2024.1433781) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Inter, Plus Jakarta Sans and JetBrains Mono are self-hosted Latin subsets. License texts are included in `dist/assets/fonts/licenses/`.

## Controles en español

El selector **EN / ES** conserva el idioma y la sección visitada. En el muro de publicaciones, las flechas, los indicadores y los gestos horizontales cambian de obra. Con el teclado se pueden usar las flechas izquierda y derecha, Inicio y Fin. La imagen abre la ficha de la publicación. Escape cierra la ficha. **Vista de lectura** ofrece una presentación lineal.

Para publicar en GitHub Pages, copia el contenido de `dist/` a la raíz del repositorio y selecciona **Settings → Pages → Deploy from a branch → main → /(root)**. Para actualizar el contenido, edita `content.mjs` y ejecuta `node build.mjs` antes de copiar los archivos.

