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
 * @property {string}         val    Texte à encoder dans le QR code
 * @property {?string | null} top    Texte positionné au-dessus du QR code
 * @property {?string | null} right  Texte positionné à droite du QR code
 * @property {?string | null} bottom Texte positionné sous le QR code
 * @property {?string | null} left   Texte positionné à gauche du QR code
 */

/**
 * @typedef LabelOptions
 * @type {object} Options de production de QRLabel ajoutées à QRCodeOptions
 * @property {number}          margin           Espace de même couleur que le fond autour du QR code (_Quiet zone_)
 * @property {number}          border           Largeur de la zone extérieure accueillant l'éventuel texte
 * @property {string}          border_color     Couleur de la bordure
 * @property {number}          text_size        Taille du texte
 * @property {string}          text_color       Couleur du texte
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
}

/**
 * Type MIME de l'image générée
 * @type {string}
 */
const mime = "image/png";

/**
 * Image de fond
 * @type {HTMLCanvasElement | null}
 */
let background_canvas

/**
 * Options
 * @type {QRLabelOptions}
 */
let options

/**
 * Génère une étiquette contenant le QR code éventuellement
 * entouré d'informations textuelles.
 *
 * @param {QRLabelContent}         content         Valeur à encoder et textes à afficher
 * @param {QRLabelOptions | null} [a_options=null] Paramètres : tailles et couleurs
 * @returns {DataURL}
 */
export default function getQRLabel(content, a_options = null) {
	let reset = !background_canvas || a_options
	/** @type {QRLabelOptions} */
	options = { ...default_options, ...(a_options ?? {}) }

	if(reset) {
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
	// 0.8 est empirique
	const text_pos = Math.max(2, Math.ceil((o.border - 0.8 * o.text_size)/2))

	const ctx = canvas.getContext("2d");

	ctx.textAlign = "center"
	ctx.font = `${o.text_size}px monospace`;
	ctx.fillStyle = o.text_color;

	// Bas
	if (content.bottom) {
		ctx.textBaseline = "alphabetic"
		ctx.fillText(content.bottom, middle_x, canvas.height-text_pos);
	}
	ctx.textBaseline = "hanging"
	// Haut
	if (content.top) {
		ctx.fillText(content.top, middle_x, text_pos);
	}
	// Gauche
	if(content.left) {
		ctx.translate(text_pos, middle_y)
		ctx.rotate(-Math.PI/2)
		ctx.fillText(content.left, 0, 0)
	}
	// Droite
	if(content.right) {
		ctx.setTransform(1,0,0,1,0,0)
		ctx.translate(canvas.width - text_pos, middle_y)
		ctx.rotate(+Math.PI/2)
		ctx.fillText(content.right, 0, 0);
	}
}