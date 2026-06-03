/**
 * ## Communication avec l'iFrame de configuration
 *
 * Les options sont stockées dans l'export `options` de `index.js` ; il ne faut pas la modifier
 * directement, mais utiliser `grist.setOption()` qui déclenchera le gestionnaire définit via
 * `grist.onOptions()` dans `index.js` où s'effectue la mise à jour de `options`.
 *
 * Afin de rendre le code modulaire, le formulaire de configuration est chargé dans un _iframe_
 * qui n'a pas accès au contexte de la vue principale. Les deux vues peuvent cependant dialoguer
 * via des messages.
 *
 * La propriété `data.action` de l'événement message définit sa nature.
 *
 * | **↔** | **action**          | **Description**                                            |
 * |:-----:|---------------------|------------------------------------------------------------|
 * | C → I | `getExistingConfig` | Demande d'envoi de la configuration existante              |
 * | ? → I | `sendExistingConfig`| Demande d'envoi de la configuration existante              |
 * | I → C | `setExistingConfig` | Envoi de la configuration existante au formulaire          |
 * | I → C | `getModifiedConfig` | Demande au formulaire d'envoi de la configuration modifiée |
 * | C → I | `getConfigResp`     | Réponse à `getModifiedConfig`                              |
 *
 */

import { options } from "./index.js"
import default_widget_options from "./widget_options.default.mjs";

/**
 * Boîte de dialogue de configuration
 * @type {HTMLDialogElement}
 */
let config_dialog = null

/**
 * ## Initialisation des gestionnaires d'événement au chargement du widget
 *
 * @returns {Promise<void>}
 */
export function init() {
	/**
	 * Boîte de dialogue
	 * @type {HTMLDialogElement}
	 */
	config_dialog = document.getElementById("config_dialog");
	/**
	 * _Window_ de l'iframe du formulaire (≠ de l'élément <iframe>)
	 *
	 * On l'initialise lors de la requête `getExistingConfig` mais on pourrait
	 * aussi le faire via :
	 * * `config_iframe = document.getElementById("configuration")`
	 * * `config_window = config_iframe.contentWindow`
	 *
	 * @type {Window}
	 */
	let config_window = null
	window.addEventListener("message", async (e) => {
		if(e.origin === window.location.origin) {
			switch(e.data.action) {
				case "getExistingConfig":
					config_window = e.source;
				case "sendConfig":
					config_window?.postMessage({
						action: "setExistingConfig",
						config: options
					});
					break
				case "getConfigResp":
					// Réception et enregistrement de la configuration modifiée
					await grist.setOptions(e.data.config ?? {});
					config_dialog.close()
					break;
			}
		}
	})

	/**
	 * Demande d'enregistrement de la configuration modifiée, envoi du message `getModifiedConfig`
	 * @param {Event} e
	 */
	document.getElementById("save_options_btn").onclick = (e) => {
		config_window.postMessage({
			action: "getModifiedConfig",
		});
	}
	/**
	 * Demande de retour aux options par défaut
	 * @param {event} e
	 * @returns {Promise<void>}
	 */
	document.getElementById("default_options_btn").onclick = async (e) => {
		await grist.setOptions(default_widget_options);
		config_dialog.close()
	}
	/**
	 * Demande de retour à la configuration existante, envoi à `index.html` du message `sendExistingConfig`
	 * qui provoquera l'envoi d'un message `setExistingConfig` à `config.html`
	 * @param {event} e
	 */
	document.getElementById("reset_options_btn").onclick = (e) => {
		window.postMessage({ action:"sendExistingConfig" })
	}
	/**
	 * Annulation des modifications, fermeture de la boîte de dialogue
	 * @param {Event} e
	 */
	document.getElementById("cancel_options_btn").onclick = (e) => {
		config_dialog.close();
	}
}

/**
 * Fonction appelée lorsque l'utilisateur accède à la configuration du widget.
 */
export function onEditOptions() {
	// Si on _lazy load_ l'iframe, il faut attendre le chargement avant d'envoyer
	// la configuration ou laisser l'iframe la demander.
	window.postMessage({ action:"sendExistingConfig" })
	config_dialog.showModal();
}
