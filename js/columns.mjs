/**
 * @typedef MappedRecord
 * @type {object}
 * @property {number}   id         ID de l'enregistrement
 * @property {number[]} label      ID des pièces jointes
 * @property {string}   val        Chaîne à encoder
 * @property {?string}  [top]      Chaîne à afficher en haut
 * @property {?string}  [right]    Chaîne à afficher à droite
 * @property {?string}  [bottom]   Chaîne à afficher en bas
 * @property {?string}  [left]     Chaîne à afficher à gauche
 * @property {?string}  [filename] Nom du fichier à créer
 * @property {?boolean} [validity] Validité de l'étiquette existante
 * @property {?string}  [refresh]  Valeur à modifier pour provoquer une màj
 */

/**
 * Description des alias de champs que l'utilisateur désigne
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