/**
 * Production de QR Code à l'aide de la bibliothèque QRCode.JS
 *
 * La bibliothèque est chargée dans une balise <script> et met
 * à disposition la variable globale QRCode (<=> window.QRCode).
 *
 * @see https://davidshimjs.github.io/qrcodejs/
 * @see https://github.com/davidshimjs/qrcodejs
 */

/**
 * @typedef {object} QRCodeOptions Options de production de QR Codes
 * @property {number}          size            Taille du QR Code (carré)
 * @property {string}          foregroundColor Couleur des blocs du QR Code
 * @property {string}          backgroundColor Couleur de fond du QR Code
 * @property {"L"|"M"|"Q"|"H"} redundancy      Niveau de correction du QR Code
 */

/** @type {QRCodeOptions} Options par défaut */
const default_options = {
    size: 128,
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    redundancy: "Q"
};

/** @type {HTMLDivElement} Zone de travail pour la production du QR Code */
const working_div = document.createElement("div");

/** @type {QRCode|null} Générateur de QR Code */
let factory = null;

/**
 * ### Génère un QR Code dans un élément canvas
 *
 * Si la `factory` n'existe pas ou si l'on fournit des options, une nouvelle est créée.
 * Celle-ci crée un élément `canvas` et un élement `img`dans le `working_div` ; on
 * renvoie le premier.
 *
 * Il est alors possible d'assigner `canvas.toDataURL()` à l'attribut `src` d'un élément `img`.
 *
 * @param {string}               a_text    Texte à encoder
 * @param {QRCodeOptions | null} a_options Options du QR Code
 * @returns {HTMLCanvasElement}
 */
export default function getQRCode(a_text, a_options = null) {
    if(!factory || a_options) {
        const o =  { ...default_options, ...a_options }
        factory = new QRCode(working_div, {
            text: a_text,
            width: o.size,
            height: o.size,
            colorDark: o.foregroundColor,
            colorLight: o.backgroundColor,
            correctLevel: QRCode.CorrectLevel[o.redundancy]
        });
    } else {
        factory.clear();
        factory.makeCode(a_text);
    }
    return working_div.querySelector("canvas");
}
