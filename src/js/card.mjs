import getQRLabel from "./QRLabel.js"
import { getAttachmentURL, save_image, trigger_update } from "./files.mjs"
import { options } from "./index.js";
import { update_sheet } from "./print.js";

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
 * @param {Object.<string, string>} mappings Correspondance widget => Grist
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
	/* Bouton d'enregistrement */
	document.getElementById("save_label_btn").onclick = async (e) => {
		const fn = (current_mapped_record.filename
			     ?? "L_"+current_mapped_record.id+".png")
		try {
			await save_image(current_mapped_record, "label", mappings.label, preview_img.src, fn)
		} catch (e) {
			console.error("WIDGET_QRLABEL:SAVE " + e.message)
		}
	}

	document.getElementById("update_labels_btn").onclick = async (e) => {
		let i = 0
		for(const rec of unmapped_records) {
			const m = grist.mapColumnNames(rec);
			const qrc_DataUrl = getQRLabel(m)
			try {
				await save_image(m, "label", mappings.label, qrc_DataUrl, m.filename)
				i++
			} catch (e) {
				console.error("WIDGET_QRLABEL:CHANGE " + e.message)
			}
		}
		const s = i > 1 ? "s" : ""
		alert(`${i} enregistrement${s} modifié${s} sur ${filtered.length}`)
	}

	const trigger_btn = document.getElementById("trigger_url_update_btn")
	// Masquage/affichage du bouton en fonction de l'existence d'un champ trigger
	trigger_btn.style.visibility = mappings.trigger ? "visible":"hidden"

	trigger_btn.onclick = async (e) => {
		if(confirm("ATTENTION : les étiquettes existantes seront potentiellement inopérantes.\nConfirmez-vous la modification ?")) {
			const t = await table.getTableId()
			console.debug("TABLE ", t)
			const u = {}
			u[mappings.trigger] = true

			let i = 0
			for(const rec of unmapped_records) {
				await grist.docApi.applyUserActions([
					["UpdateRecord",t, rec.id, u]
				])
				const m = grist.mapColumnNames(rec);
				const qrc_DataUrl = getQRLabel(m)
				try {
					await save_image(m, "label", mappings.label, qrc_DataUrl, m.filename)
					i++
				} catch (e) {
					console.error("WIDGET_QRLABEL:CHANGE " + e.message)
				}
			}
			const s = i > 1 ? "s" : ""
			alert(`${i} enregistrement${s} modifié${s} sur ${filtered.length}`)
		}
	}

	document.getElementById("print-number").onchange = async (e) => {
		await update_print_sheet()
	}

	document.getElementById("print-offset").onchange = async (e) => {
		await update_print_sheet()
	}
	document.getElementById("print-btn").onclick = (e) => {
		window.print()
	}

}

/**
 * Met à jour la feuille d'impression
 * @returns {Promise<void>}
 */
async function update_print_sheet() {
	await update_sheet(
		unmapped_records,
		document.getElementById("print-number").value,
		document.getElementById("print-offset").value
	)
}

/**
 * Application des options
 * @param {WidgetOptions} a_options
 */
export async function onOptions(a_options) {
	label_img.style.height   = a_options.display.size+"px"
	preview_img.style.height = a_options.display.size+"px"
	build_preview(false)
	// TODO : gérer l'affichage des boutons
}

/**
 * Transition vers un nouvel enregistrement
 * @param {object} record Enregistrement non mappé
 * @param {object} mappings Correspondance { Widget:Grist }
 * @returns {Promise<void>}
 */
export async function onRecord(record, mappings) {
	current_mapped_record = grist.mapColumnNames(record) || {};
	label_img.classList.remove("valid", "invalid", "empty")

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
 *
 * @param {object[]} records Enregistrement NON MAPPÉS
 * @returns {Promise<void>}
 *
 * @see https://bureautique-libre.strasbourg.eu/Templates/inspect/api.html
 */
export async function onRecords(records) {
	unmapped_records = records ?? []
	document.querySelectorAll(".label_count").forEach(el => {
		el.innerHTML = `${records.length}`
	})
	await update_print_sheet()
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
