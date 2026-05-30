import getQRLabel from "./QRLabel.js"
import { getAttachmentURL, attach_file_from_url, trigger_update } from "./files.mjs"
import { options } from "./index.js";
import { apply_layout, create_sheets } from "./print.js";

/**
 * Table Grist
 * TODO: Vérifier l'utilité
 * @type {Grist.Table}
 */
let table
/**
 * Enregistrement courant _mappé_
 * @type {object}
 */
let current_mapped_record = null;
/**
 * Enregistrements filtrés non mappés
 * @type {object[]}
 */
let unmapped_records = []
/**
 * Objet Image contenant l'étiquette courante
 * @type {HTMLImageElement}
 */
let label_img
/**
 * Objet Image contenant la prévisualisation
 * @type {HTMLImageElement}
 */
let preview_img
/**
 * Boîte de dialogue zoom
 * @type {HTMLDialogElement}
 */
let zoom_dlg
/**
 * Objet Image du zoom
 * @type {HTMLImageElement}
 */
let zoom_img

/**
 * Initialisation de la vue du widget
 * * Variables du module
 * * Gestionnaires d'événements
 * @param {Object.<string, string>} mappings Correspondance widget → Grist
 * @returns {Promise<void>}
 */
export async function init(mappings) {
	// TODO: Vérifier l'utilité et l'asynchronisme
	table = await grist.getTable()

	label_img = document.querySelector("#label img")
	preview_img = document.querySelector("#preview img")
	zoom_dlg = document.querySelector("#zoom_dialog")
	zoom_img = document.getElementById("zoomed")

	label_img.onclick = (e) => {
		if(!e.target.classList.contains("empty")){
			zoom_in(e.target)
		}
	}
	/* Génération/Zoom */
	preview_img.onclick = (e) => {
		if(e.target.classList.contains("empty")) {
			// Affichage de l'échantillon
			build_preview()
		} else {
			zoom_in(e.target)
		}
	}
	/* ******** ENREGISTREMENT ******** */
	// Enregistrement de la preview
	document.getElementById("save_label_btn").onclick = async (e) => {
		await save_label(current_mapped_record, preview_img.src, mappings)
	}
	// Mise à jour de tous les visuels
	document.getElementById("update_labels_btn").onclick = async (e) => {
		await facelift(mappings)
	}


	const trigger_btn = document.getElementById("trigger_url_update_btn")
	// Masquage/affichage du bouton en fonction de l'existence d'un champ trigger
	trigger_btn.style.visibility = mappings.trigger ? "visible":"hidden"

	trigger_btn.onclick = async (e) => {
		if(confirm("ATTENTION : les étiquettes existantes seront potentiellement inopérantes.\nConfirmez-vous la modification ?")) {
			await refresh(mappings)
			await facelift(mappings)
		}
	}

	/* ******** IMPRESSION ******** */
	// Modification du nombre d'étiquettes à imprimer
	document.getElementById("print-number").onchange = async (e) => {
		await update_print_sheets()
	}
	// Modification du décalage d'impression
	document.getElementById("print-offset").onchange = async (e) => {
		await update_print_sheets()
	}
	// Impression
	document.getElementById("print-btn").onclick = (e) => {
		window.print()
	}

}

/**
 * Enregistre une étiquette (sous la forme de DataURL)
 *
 * @param {MappedRecord} a_mapped_rec Enregistrement destination (mappé)
 * @param {string}       a_DataUrl    URL à téléverser
 * @param {object}       mappings     Correspondance des noms de colonnes (widget -> grist)
 * @returns {Promise<number>}
 */
async function save_label(a_mapped_rec, a_DataUrl, mappings) {
	const fn = (a_mapped_rec.filename ?? "L_"+a_mapped_rec.id) + ".png"
	try {
		await attach_file_from_url(a_mapped_rec, "label", mappings.label, a_DataUrl, fn)
		return 1
	} catch (e) {
		console.error("WIDGET_QRLABEL:SAVE " + e.message)
		return 0
	}
}

/**
 * Génère et sauvegarde les étiquettes sans modifier l'alias
 * @param {Object.<string, string>} mappings Correspondance widget => Grist
 * @returns {Promise<void>}
 */
async function facelift(mappings) {
	const rows = await grist.docApi.fetchSelectedTable({format:"rows", includeColumns:"shown"})
	let i = 0
	for(const rec of rows) {
		const m = grist.mapColumnNames(rec);
		const qrc_DataUrl = getQRLabel(m);
		i += await save_label(m, qrc_DataUrl, mappings)
	}
	const s = i > 1 ? "s" : ""
	alert(`${i} enregistrement${s} modifié${s} sur ${unmapped_records.length}`)
}

/**
 * Active si disponible la génération d'un nouveau contenu (sans mettre à jour les étiquettes)
 * @param mappings
 * @returns {Promise<void>}
 */
async function refresh(mappings) {
	const t = await table.getTableId()
	const u = {}
	u[mappings.trigger] = true
	/*
	// BulkUpdateRecord semble ne pas fonctionner
	const data = await grist.docApi.fetchSelectedTable({includeColumns:"shown"})
	await grist.docApi.applyUserActions([
		["BulkUpdateRecord", t, data.id, u]
	])
	*/
	for(const rec of unmapped_records) {
		await grist.docApi.applyUserActions([
			["UpdateRecord", t, rec.id, u]
		])
	}
}

/**
 * ### Crée les pages d'impression
 * @returns {Promise<void>}
 */
async function update_print_sheets() {
	const r = await create_sheets(
		unmapped_records,
		document.getElementById("print-number").value,
		document.getElementById("print-offset").value
	)
	document.getElementById("label-count").innerHTML = " "
		+ r.labels + " étiquette" + (r.labels > 1 ? "s" : "")
	    + " (" + r.pages + " page" + (r.pages > 1 ? "s" : "") + ")"
}

/**
 * ### Application des options
 * * Taille des étiquettes
 * * Réinitialise la prévisualisation
 * * Feuilles d'impression
 * * Affichage des boutons
 *
 * @param {WidgetOptions} a_options Options à appliquer
 */
export async function onOptions(a_options) {
	label_img.style.height   = a_options.display.size+"px"
	preview_img.style.height = a_options.display.size+"px"
	build_preview(false)
	apply_layout(a_options.print)
	// TODO : gérer l'affichage des boutons
}

/**
 * ### Transition vers un nouvel enregistrement
 * * Stocke l'enregistrement courant mappé.
 * * Met à jour le titre de la fiche.
 * * Affiche l'éventuelle étiquette courante.
 * * Gère la prévisualisation.
 *
 * @param {object} record   Enregistrement non mappé
 * @param {object} mapping Correspondance { Widget:Grist }
 * @returns {Promise<void>}
 */
export async function onRecord(record, mapping) {
	current_mapped_record = grist.mapColumnNames(record) || {};
	label_img.classList.remove("valid", "invalid", "empty")
	document.getElementById("card_title").innerHTML = current_mapped_record.title ?? "Sélection"
	if( (current_mapped_record.label?.length ?? 0) > 0) {
		const current_label = (current_mapped_record.label).at(options.data.position);
		label_img.src = await getAttachmentURL(current_label);
		// Adaptation à la validité
		switch(current_mapped_record.validity) {
			case true:
				label_img.classList.add("valid");
				break;
			case false:
				label_img.classList.add("invalid");
				break
		}

	} else {
		label_img.src = "./img/no_label.png"
		label_img.classList.add("empty")
	}
	build_preview(options.display.auto_next === "always"
		          || label_img.classList.contains("empty")
		          || (options.display.auto_next === "invalid" && current_mapped_record.validity === false))
}

/**
 * ### Fonction exécutée à chaque modification des données
 * * Stocke les données mappées.
 * * Affiche le nombre d'enregistrements dans les boutons d'actions globales.
 * * Met à jour les feuilles d'impression.
 *
 * @param {object[]} records Enregistrements NON MAPPÉS
 * @returns {Promise<void>}
 *
 * @see https://bureautique-libre.strasbourg.eu/Templates/inspect/api.html
 */
export async function onRecords(records) {
	unmapped_records = records ?? []
	document.querySelectorAll(".label_count").forEach(el => {
		el.innerHTML = `${records.length}`
	})
	await update_print_sheets()
}

/**
 * Génère et affiche la prévisualisation de l'étiquette
 */
function build_preview(on = true) {
	if(on && current_mapped_record) {
		preview_img.src = getQRLabel(current_mapped_record)
		preview_img.classList.remove("empty")
	} else {
		preview_img.classList.add("empty")
		preview_img.src = "./img/click.png"
	}
}

/**
 * Zoom sur une image
 * @param {HTMLImageElement} a_img
 */
function zoom_in(a_img) {
	zoom_img.src = a_img.src
	zoom_dlg.showModal()
}
