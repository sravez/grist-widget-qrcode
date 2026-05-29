

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
