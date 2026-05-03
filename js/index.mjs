import mapping from "./columns.mjs"
import { getLabel } from "./label.mjs"
import { options, initOptions, onEditOptions } from "./options.mjs"


/**
 * Gestion des QR Code
 */
grist.ready({
	requiredAccess: 'full',
	columns: mapping,
	onEditOptions: onEditOptions
});

initOptions()

/** @constant {string} Extension des fichiers d'images générées */
const fileext = "png"
/** @constant {string} Type MIME des images générées */
const mime = "image/"+"fileext"

/** Image stockée (élément DOM) */
const img = document.getElementById("label")
/** Image générée */
const image = document.getElementById("qrcode")
/** Bouton d'enregistrement (élément DOM) */
const saveBtn = document.getElementById('saveBtn');
/** Information technique */
const log = document.getElementById("log")

/** Enregistrement sélectionné */
let currentRecord = null;
let tableId = null;

saveBtn.addEventListener('click', async () => {
	let blob = await fetch(image.src).then(r => r.blob());
  await upload_label(currentRecord, blob, false, currentRecord.filename+"."+fileext)
});


/**
 * Enregistre l'image
 * @param record   Enregistrement à modifier
 * @param file     Blob à uploader
 * @param add      Ajouter ou remplacer les PJ existantes
 * @param filename Nom du fichier
 */
async function upload_label(record, file, add=false, filename = null) {
	try {
		const tokenInfo = await grist.docApi.getAccessToken({ readOnly: false });
		const formData = new FormData();
		formData.append('upload', file, filename ?? file.name);
		const response = await fetch(`${tokenInfo.baseUrl}/attachments?auth=${tokenInfo.token}`, {
			method: 'POST',
			body: formData,
			headers: { "X-Requested-With": "XMLHttpRequest" },
		});
		if (!response.ok) {
			throw new Error(`Upload échoué: ${response.status} ${response.statusText}`);
		}
		const result = response.json();
		// Liste de PJ (result[0] : ID de l'image chargée sur le serveur)
		let attachmentList = [result[0], ...(add ? record.qrcodes ?? [] : [])]
		// On met à jour le champs des PJ 
		const table = grist.getTable();
		await table.update({
			id: record.id,
			fields: { images: ['L', ...attachmentList] }
		});
	} catch (err) {
		log.textContent += `\n❌ Erreur: ${err.message}`;
		console.error(err);
	}
}		
	
/**
 * Changement d'enregistrement
 */
grist.onRecord(async (record) => {
	currentRecord = grist.mapColumnNames(record) || {};;
	const tokenInfo = await grist.docApi.getAccessToken({ readOnly: false });
	let url = `${tokenInfo.baseUrl}/attachments/${currentRecord.label[0]}/download?auth=${tokenInfo.token}`
	img.src = url;
	const canvas = getLabel({
		val   : currentRecord.val,
		top   : currentRecord.top ?? null,
		bottom: currentRecord.bottom ?? null,
		left  : currentRecord.left ?? null,
		right : currentRecord.top ?? null,
	}, options)
	image.src = canvas.toDataURL()
});

/**
 * Actualisation après modification des données
 */
grist.onRecords((table) => {})
