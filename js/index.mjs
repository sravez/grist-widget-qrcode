import mapping from "./columns.mjs"
import { optionsInit, onEditOptions } from "./options.mjs"
import { init as cardInit, apply_record, apply_options } from "./card.mjs"
import { init as init_factory } from "./qrlabel.mjs"
import default_widget_options from "./widget_options.default.mjs";
import e from "./widget_options.default.mjs";

/**
 * Options en cours
 * @type {?WidgetOptions}
 */
export let options = null

/**
 * Initialisation
 *
 * @returns {Promise<void>}
 */
async function init() {

	grist.ready({
		requiredAccess: 'full',
		columns: mapping,
		onEditOptions: onEditOptions
	});

	await optionsInit();
	cardInit();

	grist.onOptions(async (a_options) => {

		if(!a_options) {
			options = default_widget_options
			await grist.setOptions(options)
		} else {
			options = a_options;
			init_factory(a_options.qrcode)
			apply_options(a_options)
		}
	})

	/**
	* Changement d'enregistrement
	*/
	grist.onRecord(async (record) => {
		const mappedRecord = grist.mapColumnNames(record) || {};
		await apply_record(mappedRecord, options)
	});
	
	/**
	* Actualisation après modification des données
	*/
	grist.onRecords((table) => {})
}

window.onload = async () => {
	await init()
}
