import { options } from "./index.mjs"
/** @constant {string} Extension des fichiers d'images générées */
const fileext = "png"
/** @constant {string} Type MIME des images générées */
const mime = "image/png"

/**
 * Enregistre l'image
 * @param record   Enregistrement à modifier
 * @param file     Blob à uploader
 * @param filename Nom du fichier
 */
export async function upload_label(record, file,  filename = null) {
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
		const result = await response.json();

		// Liste de PJ (result[0] : ID de l'image chargée sur le serveur)
		const attachmentList = options.data.save_mode  === "replace" ? [] : record.label ?? []
		if (options.data.position === -1) {
			attachmentList.push(result[0])
		} else {
			attachmentList.unshift(result[0])
		}
		// On met à jour le champ des PJ
		const table = grist.getTable();
		await table.update({
			id: record.id,
			fields: grist.mapColumnNamesBack({ label: ['L', ...attachmentList] })
		});
	} catch (err) {
		//log.textContent += `\n❌ Erreur: ${err.message}`;
		console.error(err.message);
	}
}

export async function getAttachmentURL(a_id) {
	const tokenInfo = await grist.docApi.getAccessToken({ readOnly: false });
	return `${tokenInfo.baseUrl}/attachments/${a_id}/download?auth=${tokenInfo.token}`
}	