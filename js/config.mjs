/**
 * # Gestion du questionnaire de configuration
 *
 * ## Structure du formulaire
 *
 * Une option de configuration `domain.option` (par exemple `qrccode.size`) est gérée
 * par un contrôle _input_ du formulaire dont les attributs `id` et `name` sont
 * `domain_option`.
 *
 * Toutes les données étant fournies au format texte, on utilise le type de contrôle
 * pour déterminer leur type ; il est donc **primordial** que les options booléennes
 * soient représentées par une _checkbox_ et les données numériques entières par un
 * `input[type=number]`.
 *
 * **NB :** la valeur d'une _checkbox_ n'est remontée que si elle est cochée, il faut
 * donc traîtées les données booléenes absentes comme _false_.
 *
 * @author Serge RAVEZ
 */

/** Générateur d'étiquette */
import getQRLabel  from "./qrlabel.mjs"
/** Options par défaut */
import default_options from "./widget_options.default.mjs"

/** @type {WidgetOptions} options en cours */
let options = default_options;
let form_initialized = false;

/** @type {string} Séparateur domaine/option dans les `id` et `name` des contrôles */
const sep = "_"

/** @type {HTMLFormElement} Formulaire de configuration */
const form = document.getElementById("config_form")

/** @type {HTMLImageElement} Image de visualisation de la configuration */
const preview_img = document.getElementById("preview_img")

/** @type {HTMLImageElement} Image de visualisation dans le pop up */
const preview_popover_img = document.getElementById("preview_popover_img")


/**
 * ### Demande l'étiquette basée sur les données du formulaire et l'affiche.
 *
 * On supprime également la classe `empty` dont l'absence ou présence détermine
 * la réaction à un clic sur l'image :
 * * si présente : un clic provoque l'appel de `getPreviewImage()`
 * * si absente : affichage dans un pop-up
 */
function getPreviewImage() {
	const data = {
		val: "https://test.com",
		top: "HAUT",
		right: "DROITE",
		bottom: "BAS",
		left: "GAUCHE",
	}
	const o = getFormData()
	preview_img.src = getQRLabel(data, o.qrcode)
	preview_img.classList.remove("empty")
}

/**
 * ### Réaction à un changement de valeur dans le formulaire.
 *
 * Si `autoPreview` on charge l'image de prévisuation, sinon on la
 * supprime et on met la classe `empty` pour indiquer qu'il faut cliquer
 * pour la charger.
 *
 * @param {Event} e Événement
 */
function onFormChange(e) {
	if(form['autoPreview'].checked) {
		getPreviewImage()
	} else {
		preview_img.src = "./img/click.png"
		preview_img.classList.add("empty")
	}
}

/**
 * ### Réaction à un clic sur l'image de prévisualisation.
 *
 * Le comportement est déterminé par la présence ou absence de la classe `empty` :
 * - présente : on charge l'image,
 * - absente : on affiche le pop-up après y avoir assigné l'image.
 * @param {Event} e Événement
 */
function onImgClick(e) {
	if(preview_img.classList.contains("empty")) {
		getPreviewImage()
	} else {
		preview_popover_img.src = preview_img.src
		document.getElementById("preview_popover").showPopover()
	}
}

/**
 * ### Initialise le formulaire
 *
 * * Assigne les comportements aux éléments lors de la première initialisation
 * * Applique les options
 *
 * @param {WidgetOptions} a_options
 */
function init_form(a_options) {
	if(!form_initialized) {
		preview_img.onclick = onImgClick
		for(const o in options.qrcode) {
			form["qrcode"+sep+o].onchange = onFormChange
		}
		form_initialized = true;
	}
	setFormData(a_options)
}


/**
 * Déclenchement de l'initialisation du formulaire une fois
 * que la page a fini de charger.
 */
window.onload = () => {
	init_form(options)
}

/**
 * Détermine si une variable est un objet JavaScript.
 * @param obj
 * @returns {boolean}
 */
function isObject(obj) {
	return typeof obj === 'object'
		&& obj !== null
		&& ! Array.isArray(obj)
};