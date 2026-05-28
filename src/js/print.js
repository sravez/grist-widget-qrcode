import { getAttachmentURL } from "./files.mjs";
import {options} from "./index.js";

const sheets = document.getElementById("print-sheets")
/**
 * Actualise la feuille d'impression
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
        n = (n+1) % sheet_capacity
        if(n==1) {
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

export async function build_sheets(a_recs,a_number=1, a_offset=0) {

}
export function clear_sheets() {
    sheets.innerHTML = ""
}