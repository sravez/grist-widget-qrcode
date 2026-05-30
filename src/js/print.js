import { getAttachmentURL } from "./files.mjs";
import {options} from "./index.js";

/**
 * @typedef Layout Disposition d'une feuille d'impression
 * @type {object}
 * @property {number} pageWidth   Largeur de page (en mm)
 * @property {number} pageHeight  Hauteur de page (en mm)
 * @property {number} topMargin   Marge haute (en mm)
 * @property {number} leftMargin  Marge gauche (en mm)
 * @property {number} cols        Nombre de colonnes
 * @property {number} rows        Nombre de lignes
 * @property {number} labelWidth  Largeur d'une étiquette (en mm)
 * @property {number} labelHeight Hauteur d'une étiquette (en mm)
 * @property {number} hStep       Période horizontale (en mm)
 * @property {number} vStep       Période verticale (en mm)
 */

/**
 * Élément contenant les feuilles à imprimer
 * @type {HTMLDivElement}
 */
const sheets = document.getElementById("print-sheets")
/**
 * Feuille de style gérant la disposition :
 * * Ajoutée à _document.adoptedStyleSheets_ (tableau de _CSSStyleSheet_) ;
 * * Définit la page et la grille des feuilles.
 * @type {CSSStyleSheet}
 */
let css

/**
 * Nombre d'étiquettes sur une feuille
 * * Mis à jour à chaque application d'un _layout_
 * * `= rows x cols`
 * @type {number}
 */
let labelsPerSheet

/**
 * ### Crée les feuilles d'impressions
 * @param {object[]} a_recs        Enregistrements non mappés
 * @param {number}  [a_number = 1] Nombre d'exemplaires de chaque étiquette
 * @param {number}  [a_offset = 0] Nombre d'étiquettes vides au début
 * @returns {Promise<{labels: number, pages: number}>} Nombre d'étiquettes et de pages à imprimer
 */
export async function create_sheets(a_recs, a_number= 1, a_offset= 0) {
    /**
     * Page courante
     * @type {?HTMLDivElement}
     */
    let current_sheet = null
    /**
     * Nombre d'emplacements occupés sur la page courante
     * (géré par `incSlotCount()`)
     * @type {number}
     */
    let slots = 0
    /**
     * Nombre de pages
     * @type {number}
     */
    let pages = 0

    /**
     * Nombre d'étiquettes
     * @type {number}
     */
    let labels = 0

    /**
     * Gestion du nombre d'étiquettes de la page courante
     * et création éventuelle d'une nouvelle page.
     */
    function incSlotCount() {
        slots = labelsPerSheet? (slots+1) % labelsPerSheet : slots+1
        if(slots === 1) {
            pages++
            current_sheet = document.createElement("div")
            current_sheet.classList.add("print-sheet")
            sheets.appendChild(current_sheet)
        }
    }
    // Effacement
    clear_sheets()
    // Emplacements vides
    for(let i = 1 ; i <= a_offset ; i++) {
        incSlotCount()
        current_sheet.innerHTML += `<div class="blank"></div>`
    }
    // Étiquettes
    for (const rec of a_recs) {
        const mapped_rec = grist.mapColumnNames(rec);
        if( (mapped_rec.label?.length ?? 0) > 0) {
            const attachmentId = (mapped_rec.label).at(options.data.position);
            const url = await getAttachmentURL(attachmentId);
            for(let i = 1; i <= a_number; i++) {
                incSlotCount()
                labels++
                current_sheet.innerHTML += `<img class="print-label" src="${url}"/>`
            }
        }
    }

    return {
        labels: labels,
        pages: pages
    }
}

/**
 * Supprime les feuilles d'impression
 */
export function clear_sheets() {
    sheets.innerHTML = ""
}

/**
 * ### Renvoie les styles correspondant à la disposition.
 * @param {Layout} a_layout Disposition
 * @returns {string} Styles `@page` et `.print-sheet`
 */
function getStyleString(a_layout) {
    return `@page {
        size: ${a_layout.pageWidth}mm ${a_layout.pageHeight}mm;
        margin-top: ${a_layout.topMargin}mm;
        margin-left: ${a_layout.leftMargin}mm;
    }

   .print-sheet {
        break-after: page;
        display: grid;
        grid-template-columns: repeat(${a_layout.cols}, ${a_layout.labelWidth}mm);
        grid-auto-rows: ${a_layout.labelHeight}mm;
        column-gap: ${a_layout.hStep - a_layout.labelWidth}mm;
        row-gap: ${a_layout.vStep - a_layout.labelHeight}mm;
    }`
}

/**
 * ### Applique une disposition
 * * Crée la feuille de style si elle n'existe pas et l'ajoute à
 *   _document.adoptedStyleSheet_.
 * * Remplace son contenu avec les nouveaux styles de page et de grille.
 *
 * @param {Layout} a_layout Disposition des étiquettes sur les feuilles à imprimer
 */
export function apply_layout(a_layout) {
    if(!css) {
        css = new CSSStyleSheet()
        document.adoptedStyleSheets.push(css)
    }
    labelsPerSheet = a_layout.rows * a_layout.cols;
    css.replaceSync(getStyleString(a_layout))
}