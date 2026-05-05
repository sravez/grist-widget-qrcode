import mapping from "./columns.mjs"
import { options, initOptions, onEditOptions } from "./options.mjs"
import { apply_record } from "./card.mjs"


async function init() {
	
	grist.ready({
		requiredAccess: 'full',
		columns: mapping,
		onEditOptions: onEditOptions
	});
	
	await initOptions();
	
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
