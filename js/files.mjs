import { options } from "./index.mjs"
import { mapping } from "./index.mjs"
/**
 * ### Enregistre un fichier / blob
 *
 * L'enregistrement se fait en trois étapes :
 * 1. Obtention d'un jeton à durée limitée pour les deux appels
 *    API suivants (_upload_ et _update_) ;
 * 2. upload du fichier et réception en retour d'un identifiant ;
 * 3. Mise à jour de l'enregistrement en insérant l'identifiant
 *    précédent dans le champ correspondant.
 *
 * @param {MappedRecord} rec      Enregistrement à modifier
 * @param {string}       col      Nom mappé du champ à modifier
 * @param {Blob}         blob     Blob à _uploader_
 * @param {string}       filename Nom du fichier
 */
export async function upload_blob(rec, col, blob,  filename = "generic") {
	try {
		/* *** 1. Obtention du jeton *** */
		const tokenInfo = await grist.docApi.getAccessToken({ readOnly: false });

		/* *** 2. Upload du fichier *** */
		const formData = new FormData();
		formData.append('upload', blob, filename ?? blob.name ?? "generic");
		const response = await fetch(`${tokenInfo.baseUrl}/attachments?auth=${tokenInfo.token}`, {
			method: 'POST',
			body: formData,
			headers: { "X-Requested-With": "XMLHttpRequest" },
		});
		if (!response.ok) {
			throw new Error(`Upload échoué: ${response.status} ${response.statusText}`);
		}
		// result[0] : ID de l'image chargée sur le serveur
		const result = await response.json();

		/* *** 3. Mise à jour de l'enregistrement *** */
		const attachmentList = options.data.save_mode  === "replace" ? [] : rec[col] ?? []
		if (options.data.position === -1) {
			attachmentList.push(result[0])
		} else {
			attachmentList.unshift(result[0])
		}

		const d = {}
		d[mapping[col]] = [ 'L', ...attachmentList]

		const t = grist.getTable()
		await t.update({
			id: rec.id,
			fields: d
		});
	} catch (err) {
		console.error(err.message);
	}
}

/**
 * ### Construction de l'URL d'une pièce jointe.
 *
 * Le type _Attachments_ est un tableau constitué des ID des fichiers que l'on peut
 * ensuite télécharger via un appel à `fetch()` sur la base d'une URL contenant
 * un jeton temporaire obtenu par `getAccessToken()`.
 *
 * @param {number} a_id ID de la pièce jointe dont
 * @returns {Promise<string>} URL de téléchargement
 */
export async function getAttachmentURL(a_id) {
	const tokenInfo = await grist.docApi.getAccessToken({ readOnly: false });
	return `${tokenInfo.baseUrl}/attachments/${a_id}/download?auth=${tokenInfo.token}`
}

/**
 * ### Enregistrement d'une image
 *
 * @param {MappedRecord}     rec      Enregistrement à modifier
 * @param {string}           col      Nom mappé du champ à modifier
 * @param {HTMLImageElement} img      Image à sauvegarder
 * @param {string}           filename Nom du fichier
 * @returns {Promise<void>}
 */
export async function save_image(rec, col, img, filename) {
	const blob = await fetch(img.src).then(r => r.blob());
	await upload_blob(rec, col, blob, filename)
}
