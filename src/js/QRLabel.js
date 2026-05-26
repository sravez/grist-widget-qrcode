/**
 * # Production d'étiquettes organisées autour d'un QR code.
 *
 * En partant du centre l'étiquette est constituée de :
 * * un QR code,
 * * une marge ou _Quiet zone_ de même couleur que le fond autour du QR code,
 * * une bordure pouvant accueillir du texte.
 *
 * Le résultat est fourni sous forme d'une image Data URL.
 */

/**
 * @typedef QRLabelContent Textes (QR code et bordure) de l'étiquette
 * @type {object}
 * @property {string}   val     Texte à encoder dans le QR code
 * @property {?string} [top]    Texte positionné au-dessus du QR code
 * @property {?string} [right]  Texte positionné à droite du QR code
 * @property {?string} [bottom] Texte positionné sous le QR code
 * @property {?string} [left]   Texte positionné à gauche du QR code
 */

/**
 * @typedef LabelOptions
 * @type {object} Options de production de QRLabel ajoutées à QRCodeOptions
 * @property {number}  border       Espace de même couleur que le fond accueillant le texte
 * @property {number}  text_size    Taille du texte
 * @property {number}  text_options Orientation du texte
 */

/**
 * @typedef {QRCodeOptions & LabelOptions} QRLabelOptions
 */

/**
 * @typedef {string} DataURL URL pouvant contenir des données comme des petites images.
 * @see https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data
 */

import QRCodeFactory from "../lib/QRCodeFactory.class.js"

/**
 * Options par défaut
 * @type {QRLabelOptions} */
const default_options = {
	size: 256,
	border: 24,
	text_size: 18,
	redundancy: "Q",
	fgColor: "#000000",
	bgColor: "#FFFFFF",
	text_options: 0b00010100
}

/**
 * Type MIME de l'image générée
 * @type {string}
 */
const mime = "image/png";

/**
 * Police des textes
 * @type {string}
 */
const font = "monospace"

/**
 * Options en cours
 * @type {QRLabelOptions}
 */
let options = default_options

/**
 * @type {QRCodeFactory}
 */
let factory = null

/**
 * Initialise la factory
 * @param {QRLabelOptions | {}} [a_options = {}]
 */
export function init(a_options = {}) {
	options = { ...default_options, ...(a_options ?? {})}
	factory = new QRCodeFactory(options);
}

/**
 * Génère une étiquette contenant le QR code éventuellement
 * entouré d'informations textuelles.
 *
 * @param {QRLabelContent}   content         Valeur à encoder et textes à afficher
 * @param {?QRLabelOptions | {}} [a_options=null] Paramètres : tailles et couleurs ({} : par défaut)
 * @returns {DataURL}
 */
export default function getQRLabel(content, a_options = null) {
	if (a_options || !factory) {
		init(a_options)
	}
	const qrCanvas = factory.getQRCanvas(content.val)
	const canvas = document.createElement("canvas")
	const size = qrCanvas.size + options.border
	canvas.width = size
	canvas.height = size
	const ctx = canvas.getContext("2d");
	if(options.border) {
		ctx.fillStyle = options.bgColor;
		ctx.roundRect(0, 0, canvas.width, canvas.height, Math.min(10, Math.floor(options.border/2)));
		ctx.fill()
	}
	ctx.drawImage(qrCanvas, options.border, options.border)
	if(options.text_size > 0) {
		drawText(canvas, content)
	}
	return canvas.toDataURL(mime)
}

/**
 * Écrit les textes
 * @param {HTMLCanvasElement} canvas
 * @param {QRLabelContent}    content
 * @param {QRLabelOptions}    o
 */
function drawText(canvas, content, o = options) {
	const middle_x = Math.floor(canvas.width/2)
	const middle_y = Math.floor(canvas.height/2)
	// Distance du milieu du texte par rapport au bord extérieur de l'étiquette
	const text_offset = Math.ceil(o.border/2)

	const ctx = canvas.getContext("2d");

	const rot_mask = 0b01
	const text_options_bits = 2

	ctx.textAlign = "center"
	ctx.font = `${o.text_size}px ${font}`;
	ctx.fillStyle = o.fgColor;
	ctx.textBaseline = "middle";
	const text_positions = {
		top   : { r: 0, x: middle_x                  , y: text_offset                },
		right : { r: 1, x: canvas.width - text_offset, y: middle_y                   },
		bottom: { r: 2, x: middle_x                  , y: canvas.height - text_offset},
		left  : { r: 3, x: text_offset               , y: middle_y                   }
	}
	for(const pos in text_positions ) {
		if(content[pos]) {
			const s = text_positions[pos].r * text_options_bits
			const r = text_positions[pos].r + 2 * ( (o.text_options >> s) & rot_mask )
			ctx.setTransform(1,0,0,1,0,0)
			ctx.translate(text_positions[pos].x, text_positions[pos].y)
			ctx.rotate(r * Math.PI/2)
			ctx.fillText(content[pos], 0, 0);
		}
	}
}