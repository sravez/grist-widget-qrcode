import { options } from "./index.mjs"

/**
 * Gestion des fichiers
 *
 * @see https://forum.grist.libre.sh/t/tutoriel-importer-des-pieces-jointes-dans-une-table-grist/3479
 */
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
		formData.append('upload', blob, filename ?? blob.name ?? "generic.png");
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
 * @param {string}           w_col    Colonne du widget à modifier
 * @param {string}           g_col    Colonne Grist destination mappée avec w_col
 * @param {string}           url      Image à sauvegarder
 * @param {string}           filename Nom du fichier
 * @returns {Promise<void>}
 */
export async function save_image(rec, w_col, g_col, url, filename) {
	let blob = null
	try {
		blob = await fetch(url).then(r => r.blob());
	} catch (e) {
		throw new Error(`[FETCH_ERROR] ${e.message}`);
	}
	await upload_blob(rec, w_col, g_col, blob, filename)
}

