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
 * donc traiter les données booléennes absentes comme _false_.
 *
 * @author Serge RAVEZ
 */

import FormDataInterface from "./FormDataInterface.mjs";

/**
 * Interface avec le formulaire
 * @type {FormDataInterface}
 */
let formDataInterface;

/** Générateur d'étiquette */
import getQRLabel from "./qrlabel.mjs"

/** Options par défaut */
import default_options from "./widget_options.default.mjs"

/**
 * Options en cours
 * @type {WidgetOptions}
 */
let options = default_options;

/**
 * Formulaire de configuration
 * @type {HTMLFormElement}
 */
let form;

/**
 * Image de visualisation de la configuration
 * @type {HTMLImageElement}
 */
let preview_img

/**
 * Image de visualisation dans le pop-up
 * @type {HTMLImageElement}
 */
let preview_popover_img

/**
 * ### Demande l'étiquette basée sur les données du formulaire et l'affiche.
 *
 * On supprime également la classe `empty` dont l'absence ou présence détermine
 * la réaction à un clic sur l'image :
 * * si présente : un clic provoque l'appel de `getPreviewImage()` ;
 * * si absente : affichage dans un pop-up.
 */
function getPreviewImage() {
	const data = {
		val: "https://test.com",
		top: "HAUT",
		right: "DROITE",
		bottom: "BAS",
		left: "GAUCHE",
	}
	const o = formDataInterface.getFormData()
	preview_img.src = getQRLabel(data, o.qrcode)
	preview_img.classList.remove("empty")
}

/**
 * ### Réaction à un changement de valeur dans le formulaire.
 *
 * Si `autoPreview` on charge l'image de prévisualisation, sinon on la
 * supprime et on met la classe `empty` pour indiquer qu'il faut cliquer
 * pour la charger.
 *
 * @param {Event} e Événement
 */
function onQRCodeOptionsChange(e) {
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
 * * présente : on charge l'image,
 * * absente : on affiche le pop-up après y avoir assigné l'image.
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
 * * Définit les variables globales
 * * Assigne les comportements aux éléments lors de la première initialisation
 */
function init_form(a_options) {
	form = document.getElementById("config_form")
	formDataInterface = new FormDataInterface(form, ".");
	preview_img = document.getElementById("preview_img")
	preview_popover_img = document.getElementById("preview_popover_img")
	preview_img.onclick = onImgClick
	// Réaction au changement de prévisualisation
	form['autoPreview'].onchange = (e) => {
		if(e.target.checked) {
			getPreviewImage()
		}
	}
	// Gestion de la synchronisation (à injecter avant onQROptionsChange)
	document.querySelectorAll(".SyncBtn").forEach(syncBtn => {

		syncBtn.addEventListener("click", (e) => {
			syncBtn.classList.toggle("on")
			if(syncBtn.classList.contains("on")){
				//form[syncBtn.dataset.dest].disabled = true
				form[syncBtn.dataset.src]?.dispatchEvent(new Event('change'))
			} else {
				//form[syncBtn.dataset.dest].disabled = false
			}
		})

		if(form[syncBtn.dataset.src] && form[syncBtn.dataset.dest]) {
			form[syncBtn.dataset.src].addEventListener("change", (e) => {
				// les arrow functions mémorise le syncBtn au moment de leur création
				if(syncBtn.classList.contains("on")) {
					form[syncBtn.dataset.dest].value = e.target.value
				}
			})
		}
	})
	// Réactions aux changements de paramètres des codes QR
	for(const o in a_options.qrcode) {
		form["qrcode."+o].addEventListener('change', onQRCodeOptionsChange)
	}
	// Affichage des aides
	document.getElementById("display_qrcode_help").onclick = (e) => {
		document.getElementById('qrcode_help').showPopover()
	}
	// Assignation des données
	formDataInterface.setData(options)
}

/**
 * Déclenchement de l'initialisation du formulaire une fois
 * que la page a fini de charger.
 */
window.onload = () => {
	init_form(options)
}