/**
 * ## Module de manipulation des pièces jointes
 *
 * Les colonnes de type _Attachement / pièce jointe_ référence par leur _id_ dans un tableau
 * des fichiers enregistrées sur le serveur ; le premier élément de ce tableau est la chaîne
 * "L" (qui est cependant ignorée lors de l'accès dans les formules ou l'objet passé en argument
 * à `onRecord()`.
 *
 * @see https://forum.grist.libre.sh/t/tutoriel-importer-des-pieces-jointes-dans-une-table-grist/3479
 */

import { options } from "../js/index.js"

/**
 * ### Enregistre un fichier / blob
 *
 * L'enregistrement se fait en trois étapes :
 * 1. Obtention d'un jeton à durée limitée pour les deux appels
 *    API suivants (_upload_ et _update_) ;
 * 2. Téléversement du fichier et réception en retour d'un identifiant ;
 * 3. Mise à jour de l'enregistrement en insérant l'identifiant
 *    précédent dans le champ correspondant.
 *
 * @see https://developer.mozilla.org/fr/docs/Web/API/Blob
 *
 * @param {MappedRecord} rec      Enregistrement à modifier
 * @param {string}       w_col    Colonne du widget à modifier
 * @param {string}       g_col    Colonne Grist destination mappée avec w_col
 * @param {Blob}         blob     Blob à _uploader_
 * @param {string}       filename Nom du fichier
 * @returns {Promise<void>}
 * @throws {Error}
 */
export async function upload_blob(rec, w_col, g_col, blob,  filename = "generic") {
		/* *** 1. Obtention du jeton *** */
		const tokenInfo = await grist.docApi.getAccessToken({ readOnly: false });

		/* *** 2. Upload du fichier *** */
		const formData = new FormData();
		formData.append('upload', blob, filename ?? "generic");
		const response = await fetch(`${tokenInfo.baseUrl}/attachments?auth=${tokenInfo.token}`, {
			method: 'POST',
			body: formData,
			headers: { "X-Requested-With": "XMLHttpRequest" }
		});
		if (!response.ok) {
			throw new Error(`[UPLOAD_ERROR:${response.status}] ${response.statusText}`);
		}
		// result[0] : ID de l'image chargée sur le serveur
		const result = await response.json();

		/* *** 3. Mise à jour de l'enregistrement *** */
		const attachmentList = options.data.save_mode  === "replace" ? [] : rec[w_col] ?? []
		if (options.data.position === -1) {
			attachmentList.push(result[0])
		} else {
			attachmentList.unshift(result[0])
		}

		const d = {}
		d[g_col] = [ 'L', ...attachmentList]

		const t = grist.getTable()
		await t.update({
			id: rec.id,
			fields: d
		});
}

/**
 * ### Construction de l'URL d'une pièce jointe.
 *
 * Le type _Attachment_ est un tableau constitué des ID des fichiers que l'on peut
 * ensuite télécharger via un appel à `fetch()` sur la base d'une URL contenant
 * un jeton temporaire obtenu par `getAccessToken()`.
 *
 * @param {number} a_id ID de la pièce jointe dont on souhaite l'URL
 * @returns {Promise<string>} URL de téléchargement
 */
export async function getAttachmentURL(a_id) {
	const tokenInfo = await grist.docApi.getAccessToken({ readOnly: false });
	return `${tokenInfo.baseUrl}/attachments/${a_id}/download?auth=${tokenInfo.token}`
}

/**
 * ### Enregistrement d'un fichier identifié par son URL
 *
 * @see https://developer.mozilla.org/fr/docs/Web/API/Fetch_API
 *
 * @param {MappedRecord}     rec      Enregistrement à modifier
 * @param {string}           w_col    Colonne du widget à modifier
 * @param {string}           g_col    Colonne Grist destination mappée avec w_col
 * @param {string}           url      URL du fichier à sauvegarder
 * @param {string}           filename Nom sous lequel enregistrer le fichier
 * @returns {Promise<void>}
 */
export async function attach_file_from_url(rec, w_col, g_col, url, filename) {
	/** @type {Blob} */
	let blob = null
	try {
		blob = await fetch(url).then(r => r.blob());
	} catch (e) {
		throw new Error(`[FETCH_ERROR] ${e.message}`);
	}
	await upload_blob(rec, w_col, g_col, blob, filename)
}
