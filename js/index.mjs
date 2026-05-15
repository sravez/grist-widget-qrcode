import columnsToMap from "./columns.mjs"
import * as Options from "./options.mjs"
import * as Label from "./card.mjs"
import { init as init_factory } from "./qrlabel.mjs"
import default_widget_options from "./widget_options.default.mjs";

/**
 * Options en cours
 * @type {?WidgetOptions}
 */
export let options = null
/**
 * Correspondance Widget => Grist
 *
 * Car on n'arrive pas à restreindre  mapToColumnNamesBack
 *
 * @type {Object.<string, string>}
 */
export let mapping

/**
 * Initialisation
 *
 * @returns {Promise<void>}
 */
async function init() {

	grist.ready({
		requiredAccess: 'full',
		columns: columnsToMap,
		onEditOptions: Options.onEditOptions
	});

	mapping = await grist.sectionApi.mappings()

	await Options.init();
	await Label.init();

	/** Exécuter lors de la modification des options */
	grist.onOptions(async (a_options) => {

		if(!a_options) {
			options = default_widget_options
			await grist.setOptions(options)
		} else {
			options = a_options;
			init_factory(a_options.qrcode)
			Label.onOptions(a_options)
		}
	})

	/** Changement d'enregistrement */
	grist.onRecord(Label.onRecord);
	
	/** Après modification des données */
	//grist.onRecords(Label.onRecords)
}


window.onload = async () => {
	await init()
}

//await init()
