/**
 * Calcule du contraste entre deux couleurs
 */

/**
 * @typedef ArrayColor
 * Tableau [r, g, b, a] contenant 3 chiffres entre 0 et 255
 * @type {number[]}
 */

/**
 * @typedef HexColor
 * Chaîne hexadécimale telle que 0FC, x0FC, 00FFCC, x00FFCC, 00FFCCFF
 * @type {string}
 */

/**
 * @typedef ObjColor
 * @type {object}
 * @property {number} [r =   0] Composante rouge (0 ... 255)
 * @property {number} [g =   0] Composante verte (0 ... 255)
 * @property {number} [b =   0] Composante bleue (0 ... 255)
 * @property {number} [a = 255] Couche alpha (0 ... 255)
 */

/**
 * Convertit une couleur objet
 * @param {ObjColor} a_oc
 * @returns {ArrayColor}
 */
function ObjColor_to_ArrayColor(a_oc) {
    return [a_oc.r ?? 0, a_oc.g ?? 0, a_oc.b ?? 0, a_oc.a ?? 255];
}

/**
 * Convertit une couleur hexadécimale
 * @param {HexColor} a_hc
 * @returns {ArrayColor}
 */
function HexColor_to_ArrayColor(a_hc) {
    const r = []
    const offset = (a_hc[0] === '#') ? 1 : 0;
    const len = (a_hc.length - offset < 5) ? 1 : 2

    let s = offset
    for (let i = 0 ; i < (a_hc.length - offset)/len ; i++) {
        const c = a_hc.substring(s, s+ len).repeat(3 - len);
        r.push(parseInt(c, 16));
        s += len
    }
    return r
}

/**
 * Convertit une couleur en ArrayColor
 * @param {ArrayColor, HexColor, ObjColor} a_color
 * @returns {ArrayColor}
 */
function getArrayColor(a_color) {
    let r ;
    if (Array.isArray(a_color)) {
        r = a_color
    } else if (typeof a_color === 'string') {
        r = HexColor_to_ArrayColor(a_color)
    } else {
        r = ObjColor_to_ArrayColor(color)
    }
    r[4] ??= 255
    return r;
}

/** Luminance des composantes rouge, verte et bleue */
const RGB_LUM = [0.2126, 0.7152, 0.0722]
const GAMMA = 2.4

/**
 * Calcule la luminance d'une couleur
 * @param {ArrayColor} a_color
 * @returns {number}
 */
function luminance(a_color) {
    let r = 0
    for (let i = 0; i < 3; i++) {
        const v = a_color[i] / 255
        r += RGB_LUM[i] * ( v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055)/1.055, GAMMA))
    }
    return r
}

/**
 * Calcule le contraste entre 2 couleurs
 * @param {ArrayColor, HexColor, ObjColor} a_color1
 * @param {ArrayColor, HexColor, ObjColor} a_color2
 * @returns {number}
 */
export function contrast(a_color1, a_color2) {
    const c = (luminance(getArrayColor(a_color1)) + 0.05)
                     / (luminance(getArrayColor(a_color2)) + 0.05);
    return c >= 1 ? c : 1/c
}

export default contrast
