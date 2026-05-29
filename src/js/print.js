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

/** Élément contenant les feuilles d'impression */
const sheets = document.getElementById("print-sheets")
/**
 * Feuille de style
 * @type {CSSStyleSheet}
 */
let css

/**
 * Nombre d'étiquettes sur une feuille
 */
let labelsPerSheet
/**
 * Actualise les feuilles d'impressions
 * @param {object[]} a_recs        Enregistrements non mappés
 * @param {number}  [a_number = 1] Nombre d'exemplaires de chaque étiquette
 * @param {number}  [a_offset = 0] Nombre d'étiquettes vides au début
 * @returns {Promise<void>}
 */
export async function update_sheet(a_recs,a_number=1, a_offset=0) {
    clear_sheets()
    const sheet_capacity = 16
    let n = 0
    let current_sheet = null

    function incN() {
        if(labelsPerSheet) {
            n = (n+1) % labelsPerSheet
        } else {
            n++
        }
        if(n === 1) {
            current_sheet = document.createElement("div")
            current_sheet.classList.add("print-sheet")
            sheets.appendChild(current_sheet)
        }
    }

    for(let i = 1 ; i <= a_offset ; i++) {
        incN()
        current_sheet.innerHTML += `<div class="blank"></div>`
    }
    //const rows = await grist.docApi.fetchSelectedTable({format:"rows", includeColumns:"shown"})
    for (const rec of a_recs) {
        const mapped_rec = grist.mapColumnNames(rec);
        if( (mapped_rec.label?.length ?? 0) > 0) {
            const attachmentId = (mapped_rec.label).at(options.data.position);
            const url = await getAttachmentURL(attachmentId);
            for(let i = 1; i <= a_number; i++) {
                incN()
                current_sheet.innerHTML += `<img class="print-label" src="${url}"/>`
            }
        }
    }
}

/**
 * Supprime les feuilles d'impression
 */
export function clear_sheets() {
    sheets.innerHTML = ""
}

/**
 *
 * @param {Layout} a_layout
 * @returns {string}
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

export function apply_layout(a_layout) {
    if(!css) {
        css = new CSSStyleSheet()
        document.adoptedStyleSheets.push(css)
    }
    labelsPerSheet = a_layout.rows * a_layout.cols;
    css.replaceSync(getStyleString(a_layout))
}