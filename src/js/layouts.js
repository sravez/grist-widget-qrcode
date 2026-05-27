/**
 * @typedef Layout Disposition d'une feuille d'impression
 * @type {object}
 * @property {number} pageWidth   Largeur de page (en mm)
 * @property {number} pageHeight  Hauteur de page (en mm)
 * @property {number} topMargin   Marge haute (en mm)
 * @property {number} leftMargin  Marge gauche (en mm)
 * @property {number} cols        Nombre de colonnes
 * @property {rows}   rows        Nombre de lignes
 * @property {number} labelWidth  Largeur d'une étiquette (en mm)
 * @property {number} labelHeight Hauteur d'une étiquette (en mm)
 * @property {number} colGap      Espace horizontal entre deux étiquettes (en mm)
 * @property {number} rowGap      Espace vertical entre deux étiquettes (en mm)
 */

/**
 * Vérifie la cohérence d'une disposition
 * @param {Layout} a_layout
 * @returns {boolean}
 */
function check(a_layout) {
    return (a_layout.leftMargin + a_layout.cols * (a_layout.labelWidth + a_layout.colGap) - a_layout.colGap) < a_layout.pageWidth
        && (a_layout.topMargin + a_layout.rows * (a_layout.labelHeight + a_layout.rowGap) - a_layout.rowGap) < a_layout.pageHeight
}

function getStyle(a_layout) {
const style = `
.labels {
    display: grid;
    grid-template-columns: repeat(${a_layout.cols}, ${a_layout.labelWidth}mm);
    grid-template-rows: repeat(${a_layout.rows}, ${a_layout.labelHeight}mm);
    column-gap: ${a_layout.colGap}mm;
    row-gap: ${a_layout.rowGap}mm;
`;
}
