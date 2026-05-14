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
 * @property {number}  margin       Espace de même couleur que le fond autour du QR code (_Quiet zone_)
 * @property {number}  border       Largeur de la zone extérieure accueillant l'éventuel texte
 * @property {string}  border_color Couleur de la bordure
 * @property {number}  text_size    Taille du texte
 * @property {string}  text_color   Couleur du texte
 * @property {number}  text_options Orientation du texte
 */

/**
 * @typedef {QRCodeOptions & LabelOptions} QRLabelOptions
 */

/**
 * @typedef {string} DataURL URL pouvant contenir des données comme des petites images.
 * @see https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data
 */

import getQRCode from "./qrcode.mjs"

/**
 * Options par défaut
 * @type {QRLabelOptions} */
const default_options = {
	size: 256,
	margin: 12,
	border: 30,
	text_size: 18,
	redundancy: "Q",
	foreground_color: "#000000",
	background_color: "#FFFFFF",
	border_color: "#FFFFFF",
	text_color: "#000000",
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
 * Image de fond
 * @type {HTMLCanvasElement | null}
 */
let background_canvas = null

/**
 * Options en cours
 * @type {QRLabelOptions}
 */
let options = default_options

/**
 * Génère une étiquette contenant le QR code éventuellement
 * entouré d'informations textuelles.
 *
 * @param {QRLabelContent}   content         Valeur à encoder et textes à afficher
 * @param {?QRLabelOptions} [a_options=null] Paramètres : tailles et couleurs ({} : par défaut)
 * @returns {DataURL}
 */
export default function getQRLabel(content, a_options = null) {
	const reset = !background_canvas || a_options
	if (reset) {
		options = { ...default_options, ...(a_options ?? {}) }
		background_canvas = getBackgroundCanvas();
	}
	const canvas = document.createElement("canvas")
	canvas.width = background_canvas.width
	canvas.height = background_canvas.height
	const ctx = canvas.getContext("2d");
	ctx.drawImage(background_canvas, 0, 0);
	const qrc_pos = options.border + options.margin
	ctx.drawImage(getQRCode(content.val, reset ? options : null), qrc_pos, qrc_pos)
	if(options.text_size > 0) {
		drawText(canvas, content)
	}
	return canvas.toDataURL(mime)
}

export function init(a_options) {
	getQRLabel({val: "test"}, a_options = {})
}

/**
 * Renvoie un canvas comportant le fond (bordure et marge)
 * @param {QRLabelOptions} [o] Paramètres : tailles et couleurs
 */
function getBackgroundCanvas(o = options) {
	const canvas = document.createElement("canvas")
	/** Taille de l'étiquette, en pixels */
	const size = o.size + 2 * (o.margin + o.border)
	canvas.width = size
	canvas.height = size
	const ctx = canvas.getContext("2d");
	// Bordure extérieure à coins arrondis
	if(o.border) {
		ctx.fillStyle = o.border_color;
		ctx.roundRect(0, 0, canvas.width, canvas.height, Math.floor(o.border/2));
		ctx.fill()
	}
	// Marge / Quiet zone de même couleur que le fond du QR code
	if(o.margin) {
		ctx.fillStyle = o.background_color;
		ctx.fillRect(o.border, o.border, o.size + 2 * o.margin, o.size + 2 * o.margin);
	}
	return canvas
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
	ctx.fillStyle = o.text_color;
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