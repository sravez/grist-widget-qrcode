/**
 * Production de QR Code à l'aide de la bibliothèque QRCode.JS
 *
 * La bibliothèque est chargée dans une balise <script> et met
 * à disposition la variable globale QRCode (⇔ `window.QRCode`).
 *
 * @see https://davidshimjs.github.io/qrcodejs/
 * @see https://github.com/davidshimjs/qrcodejs
 */

/**
 * @typedef QRCodeOptions Options de production de codes QR
 * @type {object}
 * @property {number}          size             Taille du code QR (carré)
 * @property {string}          foreground_color Couleur des blocs du code QR
 * @property {string}          background_color Couleur de fond du code QR
 * @property {"L"|"M"|"Q"|"H"} redundancy       Niveau de correction du code QR
 */

/**
 * Options par défaut
 * @type {QRCodeOptions}
 */
const default_options = {
    size: 128,
    foreground_color: "#000000",
    background_color: "#ffffff",
    redundancy: "Q"
};

/**
 * Zone de travail pour la production du QR code
 * @type {HTMLDivElement}
 */
const working_div = document.createElement("div");

/**
 * Générateur de QR Code
 * @type {QRCode|null}
 */
let factory = null;

/**
 * ### Génère un QR code dans un élément canvas
 *
 * Si la `factory` n'existe pas ou si l'on fournit des options, une nouvelle est créée.
 * Celle-ci crée un élément `canvas` et un élement `img` dans le `working_div` ; on
 * renvoie le premier.
 *
 * Il est alors possible d'assigner `canvas.toDataURL()` à l'attribut `src` d'un élément `img`.
 *
 * @param {string}               a_text           Texte à encoder
 * @param {QRCodeOptions | null} [a_options=null] Options du QR Code
 * @returns {HTMLCanvasElement}
 */
export default function getQRCode(a_text, a_options = null) {

    if(!factory || a_options) {
        const o =  { ...default_options, ...(a_options ?? {}) }
        working_div.innerHTML = "";
        factory = new QRCode(working_div, {
            text: a_text,
            width: o.size,
            height: o.size,
            colorDark: o.foreground_color,
            colorLight: o.background_color,
            correctLevel: QRCode.CorrectLevel[o.redundancy]
        });
    } else {
        factory.clear();
        factory.makeCode(a_text);
    }
    return working_div.querySelector("canvas");
}
