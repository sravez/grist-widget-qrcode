const default_options = {
	img_type: "png",
	qrc_size: 256,
	foreground_color: "black",
	background_color: "white",
	padding: 26,
	text_size: 18,
	text_color: "gray"
}

/**
 * Génère un QR Code et renvoie un objet Image
 * @param {string}  a_val  Chaîne à encoder dans le QR Code
 * @param {integer} a_size Taille en pixels de l'image (le QR Code peut être plus petit)
 * @returns {Image} Objet Image
 */
function generate_qrcode (a_val, options) {
	
	const qr = new QRious ({
		background: options.background_color,
		foreground: options.foreground_color,
		level: options.resilience,
		size: options.qrc_size,
		value: a_val
	});
	const image = new Image()
	image.src = qr.toDataURL()
	return image
}

/**
 * Génère une étiquette contenant le QR Code éventuellement
 * entouré d'information textuelle.
 * @param {object} content Valeur à encoder et textes à afficher
 * @param {object} options
 */
export function getLabel(content, options) {
	const o = { ...default_options, ...options }
	const canvas = document.createElement("canvas")
	const ctx = canvas.getContext("2d");
	canvas.width = o.qrc_size + 2 * o.padding
	canvas.height = canvas.width
	const middle = Math.floor(canvas.width/2)
	const offset = Math.floor((o.padding - o.text_size)/2)
	
	// Fond blanc à coins arrondis
	if(o.padding) {
		ctx.fillStyle = o.background_color;
		ctx.roundRect(0, 0, canvas.width, canvas.height, Math.floor(o.padding/2));
		ctx.fill()		
	}
	
	ctx.textAlign = "center"
	ctx.font = `${o.text_size}px monospace`;
	ctx.fillStyle = o.text_color;
	
	// QR Code, positionné au centre
	ctx.drawImage(generate_qrcode(content.val, o), o.padding, o.padding)

	// Bas
	if (content.bottom) {
		ctx.textBaseline = "hanging"
		ctx.fillText(content.bottom, middle, canvas.height-o.padding);
	}
	ctx.textBaseline = "alphabetic"
	// Haut
	if (content.top) {
		ctx.fillText(content.top, middle, o.padding-offset);		
	}
	// Gauche
	if(content.left) {
		ctx.translate(o.padding-offset, middle)
		ctx.rotate(-Math.PI/2)
		ctx.fillText(content.left, 0, 0)
	}
	// Droite
	if(content.right) {
		ctx.setTransform(1,0,0,1,0,0)
		ctx.translate(canvas.width - o.padding + offset, middle)
		ctx.rotate(+Math.PI/2)
		ctx.fillText(content.right, 0, 0);
	}
	ctx.setTransform(1,0,0,1,0,0)
	return canvas	
}