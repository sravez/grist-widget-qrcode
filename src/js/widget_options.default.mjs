/**
 * Description des options du widget et options par défaut
 */

/**
 * @typedef WidgetOptions Options de configuration du widget
 * @type {object}
 * @property {object}                     display                    Configuration de l'affichage
 * @property {number}                     display.size               - Taille des QR codes à l'écran
 * @property {"always"|"invalid"|"never"} display.auto_next          - Génération automatique du QR code (always|invalid|never)
 * @property {boolean}                    display.btn_update_all     - Affichage du bouton de mise à jour de tous les QRC
 * @property {boolean}                    display.btn_update_invalid - Affichage du bouton de mise à jour de tous les QRC invalides
 * @property {QRLabelOptions}             qrcode                     Paramètre de génération des étiquettes QR codes
 * @property {object}                     data                       Configuration de la gestion des données
 * @property {0|-1}                       data.position              - Position de l'étiquette courante dans le champ (0 : première, -1 : dernière)
 * @property {"add"|"replace"}            data.save_mode             - Mode d'enregistrement des nouvelles étiquettes
 * @property {Layout}                     print                      Disposition des feuilles d'impression
 */

// TODO : Vérifier cette histoire d'enregistrement des options/configurations

/**
 * Configuration par défaut du widget
 *
 * Ce sont les options utilisées à chaque ouverture du document tant qu'il n'y a pas
 * de configuration sauvegardée (distinguer l'enregistrement dans le formulaire qui
 * stocke pour la session en cours et l'enregistrement dans Grist qui sauvegarde dans
 * le document).
 *
 * @type {WidgetOptions}
 */
const default_widget_options = {
	display: {
		size: 64,
		auto_next: "invalid",
		btn_update_all: false,
		btn_update_invalid: true
	},
	qrcode: {
		size: 256,
		border: 48,
		text_size: 18,
		fgColor: "#000000",
		bgColor: "#FFFFFF",
		errorCorrectionLevel: "Q",
	},
	data: {
		position: 0,
		save_mode: "replace",
	},
	print: {
		pageWidth: 210,
		pageHeight: 297,
		topMargin: 0,
		leftMargin: 0,
		cols: 4,
		rows: 5,
		labelWidth: 35,
		labelHeight: 35,
		hStep: 40,
		vStep: 40
	}
}

export default default_widget_options;