/**
 * ## Gestion des options du widget
 *
 * La variable exportée `options` contient les options en vigueur, elle ne doit pas être
 * modifiée directement pour rester synchrone avec la valeur stockée par `grist.setOption()`.
 *
 * 1. Au chargement du widget (`initOptions()`), on charge les éventuelles options enregistrées
 *    et on les combine avec les options par défaut.
 */


import { options } from "./index.mjs"
import default_widget_options from "./widget_options.default.mjs";

/**
 * Boîte de dialogue de configuration
 * @type {HTMLDialogElement}
 */
let config_dialog = null

/**
 * ## Initialisation des options au chargement du widget
 *
 * @returns {Promise<void>}
 */
export function optionsInit() {

	config_dialog = document.getElementById("config_dialog");
	/** iframe contenant le formulaire */
	const config = document.getElementById("configuration");

	window.addEventListener("message", async (e) => {
		if(e.origin === window.location.origin) {
			switch(e.data.action) {
				case "getConfigResp":
					await grist.setOptions({...default_widget_options, ...e.data.config ?? {}});
					config_dialog.close()
					break;
			}
		}
	})

	document.getElementById("save_options_btn").onclick = (e) => {
		config.contentWindow.postMessage({
			action: "getConfig",
		});
	}

	document.getElementById("cancel_btn").onclick = (e) => {
		config_dialog.close();
	}
}

/**
 * Fonction appelée lorsque l'utilisateur accède à la configuration du widget.
 */
export function onEditOptions() {
	config_dialog.showModal();
	const config = document.getElementById("configuration")
	config.contentWindow.postMessage({
		action: "setConfig",
		config: options
	});
}
