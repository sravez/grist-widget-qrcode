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
export function init() {
	config_dialog = document.getElementById("config_dialog");
	/** iframe contenant le formulaire */
	//const config = document.getElementById("configuration");
	/**
	 * iframe du formulaire
	 * @type {Window}
	 */
	let config_window = null
	window.addEventListener("message", async (e) => {
		if(e.origin === window.location.origin) {
			switch(e.data.action) {
				case "getConfig":
					config_window = e.source;
				case "sendConfig":
					config_window?.postMessage({
						action: "setConfig",
						config: options
					});
					break
				case "getConfigResp":
					await grist.setOptions({...default_widget_options, ...e.data.config ?? {}});
					config_dialog.close()
					break;
			}
		}
	})

	document.getElementById("save_options_btn").onclick = (e) => {
		// Ou : document.getElementById("configuration").contentWindow.postMessage({...})
		config_window.postMessage({
			action: "getConfig",
		});
	}

	document.getElementById("reset_options_btn").onclick = (e) => {
		window.postMessage({ action:"sendConfig" })
	}

	document.getElementById("cancel_options_btn").onclick = (e) => {
		config_dialog.close();
	}
}

/**
 * Fonction appelée lorsque l'utilisateur accède à la configuration du widget.
 */
export function onEditOptions() {
	// Si on _lazy load_ l'iframe, il faut attendre le chargement avant d'envoyer
	// la configuration.
	window.postMessage({ action:"sendConfig" })
	config_dialog.showModal();

}
