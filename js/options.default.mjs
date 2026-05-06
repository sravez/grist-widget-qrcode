/**
 * Description des options et options par défaut
 */
 
/**
 * @type {object} options
 *
 * @property {object}  display                    Configuration de l'affichage
 * @property {integer} display.display_size       Taille des QR Code à l'écran
 * @property {string}  display.auto_next          Génération automatique du QR Code(always|invalid|never)
 * @property {boolean} display.btn_update_all     Affichage du bouton de mise à jour de tous les QRC
 * @property {boolean} display.btn_update_invalid Affichage du bouton de mise à jour de tous les QRC invalides
 *
 * @property {object}  qrcode           Paramètre de génération des QR Codes
 * @property {integer} qrcode.size      Taille du QR Code (sans la quiet zone ?)
 * @property {integer} qrcode.margin    Taille de la quiet zone (même couleur que le fond du QRC)
 * @property {integer} qrccode.border   Taille du pourtour pouvant accueillir du texte
 * @property {integer} qrcode.text_size Taille du texte
 */ 
export const default_options = {
	display: {
		display_size: 64,
		auto_next: "invalid",
		btn_update_all: false,
		btn_update_invalid: true
	},
	qrcode: {
		size: 256,
		margin: 12,
		border: 30,
		text_size: 18,
		redundancy: "Q",
		foreground_color: "#0000FF",
		background_color: "#FFFFFF",
		border_color: "#FF0000",
		text_color: "#000000",
		auto_test: true,		
	},
	data: {
		position: 0,
		save_mode: "replace"
	}
}

export default default_options;