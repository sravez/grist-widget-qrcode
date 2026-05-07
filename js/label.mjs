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
 * Génère un QR Code et renvoie un objet Canvas
 * @param   {string} a_val     Chaîne à encoder dans le QR Code
 * @param   {object} a_options Options
 * @returns {Canvas}           Objet Canvas
 */
function getQRCodeCanvas (a_val, a_options) {
	
	const div = document.createElement('div')
	// QRCode.CorrectLevel = {L: 1, M: 0, Q: 3, H: 2}
	// Crée un <canvas> et une <img> dans <div>
	new QRCode(div, {
		text: a_val,
		width: a_options.size,
		height: a_options.size,
		colorDark : a_options.foreground_color,
		colorLight : a_options.background_color,
		correctLevel : QRCode.CorrectLevel[a_options.redundancy]
	});
	return div.querySelector('canvas');
}

/**
 * Génère une étiquette contenant le QR Code éventuellement
 * entouré d'information textuelle.
 * @param {object} content Valeur à encoder et textes à afficher
 * @param {object} a_options
 * @param {canvas}
 */
export function getLabel(content, a_options) {
	const o = { ...default_options, ...a_options }
	const canvas = document.createElement("canvas")
	canvas.width = o.size + 2 * (o.margin + o.border)
	canvas.height = canvas.width
	const ctx = canvas.getContext("2d");

	const middle = Math.floor(canvas.width/2)
	
	// Fond blanc à coins arrondis
	if(o.border) {
		ctx.fillStyle = o.border_color;
		ctx.roundRect(0, 0, canvas.width, canvas.height, Math.floor(o.border/2));
		ctx.fill()		
	}
	if(o.margin) {
		ctx.fillStyle = o.background_color;
		ctx.fillRect(o.border, o.border, o.size + 2 * o.margin, o.size + 2 * o.margin);
	}
	// QR Code, positionné au centre
	ctx.drawImage(getQRCodeCanvas(content.val, o), o.border + o.margin, o.border + o.margin)

	ctx.textAlign = "center"
	ctx.font = `${o.text_size}px monospace`;
	ctx.fillStyle = o.text_color;

	// Distance du texte par rapport à la bordure extérieure
	const text_pos = Math.max(2, Math.ceil((o.border - 0.8 * o.text_size)/2))
	// Bas
	if (content.bottom) {
		ctx.textBaseline = "alphabetic"
		ctx.fillText(content.bottom, middle, canvas.height-text_pos);
	}
	ctx.textBaseline = "hanging"
	// Haut
	if (content.top) {
		ctx.fillText(content.top, middle, text_pos);
	}
	// Gauche
	if(content.left) {
		ctx.translate(text_pos, middle)
		ctx.rotate(-Math.PI/2)
		ctx.fillText(content.left, 0, 0)
	}
	// Droite
	if(content.right) {
		ctx.setTransform(1,0,0,1,0,0)
		ctx.translate(canvas.width - text_pos, middle)
		ctx.rotate(+Math.PI/2)
		ctx.fillText(content.right, 0, 0);
	}
	ctx.setTransform(1,0,0,1,0,0)
	return canvas.toDataURL("image/png")
}