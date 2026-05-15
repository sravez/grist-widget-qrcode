import getQRLabel from "./qrlabel.mjs"
import { getAttachmentURL, save_image } from "./files.mjs"
import {options} from "./index.mjs";

/**
 * Table Grist
 * @type {Grist.Table}
 */
let table
/**
 * Enregistrement courant _mappé_
 * @type {object}
 */
let current_mapped_record = null;
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

export async function init() {
	// TODO: Vérifier l'utilité et l'asynchronisme
	table = await grist.getTable()

	label_img = document.querySelector("#label img")
	preview_img = document.querySelector("#preview img")
	zoom_dlg = document.querySelector("#zoom_dialog")
	zoom_img = document.getElementById("zoom")


	label_img.onclick = (e) => {
		if(e.target.classList.contains("empty")){
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
	document.getElementById("save_btn").onclick = async (e) => {
		const fn = (current_mapped_record.filename ?? "label")+".png"
		await save_image(current_mapped_record, "label", preview_img, fn)
	}
}

/**
 * Application des options
 * @param {WidgetOptions} a_options
 */
export function onOptions(a_options) {
	label_img.style.height   = a_options.display.size+"px"
	preview_img.style.height = a_options.display.size+"px"
}

/**
 * Transition vers un nouvel enregistrement
 * @param {object} record Enregistrement non mappé
 * @returns {Promise<void>}
 */
export async function onRecord(record) {
	current_mapped_record = grist.mapColumnNames(record) || {};

	if( (current_mapped_record.label?.length ?? 0) > 0) {
		const current_label = (current_mapped_record.label).at(options.data.position);
		label_img.src = await getAttachmentURL(current_label);
		preview_img.classList.remove("empty")
	} else {
		label_img.src = "./img/no_label.png"
		preview_img.classList.add("empty")

	}
	build_preview(false)
}

export async function onRecords(records) {
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
