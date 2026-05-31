/**
 * # Gestion du questionnaire de configuration
 *
 * ## Structure du formulaire
 *
 * Une option de configuration `domain.option` (par exemple `qrccode.size`) est gérée
 * par un contrôle _input_ du formulaire dont les attributs `id` et `name` sont
 * `domain.option`.
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

import FormDataInterface from "../lib/FormDataInterface.js";
import getContrast from "../lib/contrast.js"

/** Générateur d'étiquette */
import getQRLabel from "./QRLabel.js"

/** Options par défaut */
import default_options from "./widget_options.default.mjs"

/**
 * Formulaire de configuration
 * @type {HTMLFormElement}
 */
let form;
/**
 * Interface avec le formulaire
 * @type {FormDataInterface}
 */
let formDataInterface;

function updateSampleImage(on = true) {
	const sample_img = document.getElementById("preview_img")
	const preview_popover_img = document.getElementById("preview_popover_img")

	const sample_data = {
		val: "https://test.com",
		top: "HAUT",
		right: "droite",
		bottom: "Exemple",
		left: "gauche",
	}
	const o = formDataInterface.getData()
	if(on || form['autoPreview'].checked) {
		sample_img.src = getQRLabel(sample_data, o.qrcode)
		sample_img.classList.remove("empty")
	} else {
		sample_img.src = "./img/click.png"
		sample_img.classList.add("empty")
	}
	preview_popover_img.src = sample_img.src
}

/**
 * ### Gestion de l'échantillon
 *
 * Le comportement est déterminé par la présence ou absence de la classe `empty` :
 * * présente : on charge l'image,
 * * absente : on affiche le pop-up après y avoir assigné l'image.
 */
function sample_management() {
	const sample_img = document.getElementById("preview_img")
	const preview_popover = document.getElementById("preview_popover")

	// Gestion des clics sur l'échantillon
	sample_img.onclick = (e) => {
		if(e.target.classList.contains("empty")) {
			// Affichage de l'échantillon
			updateSampleImage()
		} else {
			// Zoom sur l'échantillon
			preview_popover.showPopover()
		}
	}
	// Gestion des changements de configuration
	for(const o in default_options.qrcode) {
		form["qrcode."+o].addEventListener('change', (e) => {
			updateSampleImage(form['autoPreview'].checked)
		})
	}
	// Affichage de l'échantillon quand activation
	form['autoPreview'].onchange = (e) => {
		if(e.target.checked) {
			updateSampleImage()
		}
	}
}



function setSizeListeners() {

	function multiply(x) {
		const ctrls = ["qrcode.size", "qrcode.border", "qrcode.text_size"]
		for(const c of ctrls) {
			form[c].value = Math.ceil(x * form[c].value);
		}
		form[ctrls[0]]?.dispatchEvent(new Event('change'))
	}

	document.getElementById("multiply").onclick = (e) => {
		multiply(2)
	}
	document.getElementById("divide").onclick = (e) => {
		multiply(0.5)
	}
}

function setHelpListeners() {
	// Affichage des aides
	/** @type {HTMLDialogElement} */
	const dialog = document.getElementById("help_dialog")
	/** @type {HTMLIFrameElement} */
	const iframe = document.getElementById("help_iframe")

	document.querySelectorAll(".help_btn").forEach(helpBtn => {
		helpBtn.onclick = (e) => {
			iframe.src = `./help_${helpBtn.dataset.target}.html`
			dialog.showModal()
		}
	})
}


const fgColor = document.getElementById("qrcode.fgColor")
const bgColor = document.getElementById("qrcode.bgColor")
const danger = document.getElementById("contrast_check")

function contrast_check() {
	danger.classList.remove("warn", "error")
	const c = getContrast(fgColor.value, bgColor.value)
	if (c < 4.5) {
		danger.classList.add("error")
	} else if (c < 12) {
		danger.classList.add("warn")
	}
}

function setColorListeners() {
	fgColor.addEventListener("change", contrast_check)
	bgColor.addEventListener("change", contrast_check)
}

function setData(a_options = {}) {
	const o = {...default_options, ...a_options};
	formDataInterface.setData(o);
	contrast_check()
	updateSampleImage(false)

}

function setMessageListeners() {
	// Réponses aux messages
	window.addEventListener("message", (e) => {
		if(e.origin === window.location.origin) {
			switch(e.data.action) {
				case "setConfig":
					setData(e.data.config)
					break
				case "getConfig":
					e.source.postMessage({
						action: "getConfigResp",
						config: formDataInterface.getData()
					})
					break;
			}
		}
	})
}

/**
 * ### Initialise le formulaire
 *
 * * Définit les variables globales
 * * Assigne les comportements aux éléments lors de la première initialisation
 */
function init_form() {
	form = document.getElementById("config_form")
	formDataInterface = new FormDataInterface(form, ".");
	// Doit être exécuté avant sample_management() qui assigne des onchange
	sample_management()
	setSizeListeners()
	setColorListeners()
	setHelpListeners()
	setMessageListeners()
	// Assignation des données
	setData()
	window.parent.postMessage({action: "getConfig"})
}

/**
 * Déclenchement de l'initialisation du formulaire une fois
 * que la page a fini de charger.
 */
/*
window.onload = () => {
	init_form()
}
*/
init_form()
