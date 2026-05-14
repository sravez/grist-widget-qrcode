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

import FormDataInterface from "./FormDataInterface.mjs";

/** Générateur d'étiquette */
import getQRLabel from "./qrlabel.mjs"

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
		if(sample_img.classList.contains("empty")) {
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


/**
 * Synchronisation des couleurs
 */
function setSyncListeners() {
	// Gestion de la synchronisation (à injecter avant onQROptionsChange)
	document.querySelectorAll(".SyncBtn").forEach(syncBtn => {

		syncBtn.addEventListener("click", (e) => {
			syncBtn.classList.toggle("on")
			if (syncBtn.classList.contains("on")) {
				form[syncBtn.dataset.src]?.dispatchEvent(new Event('change'))
			}
		})

		if (form[syncBtn.dataset.src] && form[syncBtn.dataset.dest]) {
			form[syncBtn.dataset.src].addEventListener("change", (e) => {
				// les arrow functions mémorise le syncBtn au moment de leur création
				if (syncBtn.classList.contains("on")) {
					form[syncBtn.dataset.dest].value = e.target.value
				}
			})
		}
	})
}

function setSizeListeners() {

	function multiply(x) {
		const ctrls = ["qrcode.size", "qrcode.margin", "qrcode.border", "qrcode.text_size"]
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
	document.querySelectorAll(".help_btn").forEach(helpBtn => {
		const target = document.getElementById(helpBtn.dataset.target)
		helpBtn.onclick = (e) => {
			target.showPopover()
		}
	})
}

function setData(a_options = {}) {
	const o = {...default_options, ...a_options};
	formDataInterface.setData(o);
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
	setSyncListeners()
	sample_management()
	setSizeListeners()
	setHelpListeners()
	setMessageListeners()
	// Assignation des données
	setData()
}

/**
 * Déclenchement de l'initialisation du formulaire une fois
 * que la page a fini de charger.
 */
window.onload = () => {
	init_form()
}