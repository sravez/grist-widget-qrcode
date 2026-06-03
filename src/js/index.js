/**
 * # Widget Grist QRLabel
 *
 * Point d'entrée, chargé via une balise <script> par `index.html`.
 *
 * Définit une fonction d'initialisation exécutée au chargement de la fenêtre (`onload`) qui :
 *
 * * initialise Grist : demande l'accès complet à la table, définit le mappage et
 *   assigne la fonction exécutée lors de l'accès à la configuration ;
 *
 * * initialise la page principale (principalement les gestionnaires d'événéments) ;
 *
 * * initialise la communication avec la boîte de dialogue de configuration ;
 *
 * * assigne les gestionnaires d'événéments `onRecord` et `onRecords`.
 *
 * * définit (via `grist.onOptions()`) la fonction de prise en comptes des options qui :
 * 	* assigne le cas échéant les options par défaut,
 * 	* (ré)initialise la fabrique d'étiquettes ;
 *  * (ré)applique les options à la vue principale.
 *
 * NB : la fonction de prise en compte des options est automatiquement exécutée lors du
 *      chargement du widget.
 *
 * @author Serge RAVEZ (2026)
 */
import columnsToMap from "./columns.mjs"
import * as Options from "./options.mjs"
import * as Label from "./card.mjs"
import { init as init_factory } from "./QRLabel.js"
import default_widget_options from "./widget_options.default.mjs";

/**
 * Options/configuration du widget en cours
 * @type {?WidgetOptions}
 */
export let options = null

/**
 * Initialisation
 * @returns {Promise<void>}
 */
async function init() {
	grist.ready({
		requiredAccess: 'full',
		columns: columnsToMap,
		onEditOptions: Options.onEditOptions
	});

	/**
	 * Exécuter lors de la modification des options
	 *
	 * Les options sont automatiquement chargées au chargement
	 * du widget avec le déclenchement de cette fonction.
	 * → Nul besoin de les initialiser avec `grist.getOptions()`
	 *
	 * @type {?WidgetOptions}
	 */
	grist.onOptions(async (a_options) => {
		if(!a_options) {
			options = default_widget_options
			await grist.setOptions(options)
		} else {
			// ATTENTION :
			// Ne pas combiner avec les options par défaut pour ne pas
			// écraser les options booléennes représentées par des
			// checkbox qui seront absentes en cas de valeur négative.
			options = a_options;
			init_factory(a_options.qrcode)
			await Label.onOptions(a_options)
		}
	})

	const mappings = await grist.sectionApi.mappings()
	/** Initialisation des échanges avec l'iFrame de configuration */
	await Options.init();
	/** Définition des gestionnaires d'événements de la vue principale */
	await Label.init(mappings);

	/** Changement d'enregistrement */
	grist.onRecord(Label.onRecord);
	/** Après modification des données */
	grist.onRecords(Label.onRecords)
}

window.onload = async () => {
	await init()
}