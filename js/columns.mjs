/**
 * Description des alias de champs que l'utilisateur désigne
 * + label    : image(s)
 * + val      : valeur à encoder dans le QR Code
 * - filename : nom du fichier à enregistrer (aléatoire si non défini)
 * - top      : texte situé au-dessus du QR Code
 * - bottom   : texte situé en-dessous du QR Code
 * - left     : texte situé à gauche du QR Code
 * - right    : texte situé à droite du QR Code
 * - validity : TRUE si le QR Code est valide
 * - refresh  : valeur à modifier pour provoquer une mise à jour de la valeur
 *
 * @type {Array}
 */
export const columns = [
	{ 
		name: 'label',
		title: 'Etiquette',
		description: "Image de l'étiquette",
		type: 'Attachments',
		optional: false
	},
	{
		name: 'val',
		title: "Contenu",
		description: "Valeur à encoder dans le QR Code",
		type: 'Text, Number, Int',
		optional: false
	},
	{
		name: 'filename' ,
		title: "Nom du fichier",
		type: 'Text',
		optional: false,
		description: "Nom du fichier sans extension"
	},
	{
		name: 'top',
		title: 'Texte en haut',
		type: 'Text',
		optional: true
	},
	{
		name: 'bottom',
		title: 'Texte en bas',
		type: 'Text',
		optional: true
	},
	{
		name: 'left',
		title: 'Texte à gauche',
		type: 'Text',
		optional: true
	},
	{
		name: 'right',
		title: 'Texte à droite',
		type: 'Text',
		optional: true
	},
	{
		name: 'validity',
		title: 'Validité du QR Code',
		type: 'Boolean',
		optional: true
	},
	{
		name: 'refresh',
		title: 'Mise à jour',
		type: 'Text',
		optional: true
	}
]

export default columns