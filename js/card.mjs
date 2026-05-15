import getQRLabel from "./qrlabel.mjs"
import { getAttachmentURL, upload_label } from "./files.mjs"

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
 * Enregistrement courant _mappé_
 * @type {object}
 */
let current_mapped_record = null;


export function init() {
	label_img = document.querySelector("#label img")
	preview_img = document.querySelector("#preview img")
	zoom_dlg = document.querySelector("#zoom_dialog")
	zoom_img = document.getElementById("zoom")

	label_img.onclick = (e) => {
		if(e.target.classList.contains("empty")){
			zoom_in(e.target)
		}
	}

	preview_img.onclick = (e) => {
		if(e.target.classList.contains("empty")) {
			// Affichage de l'échantillon
			build_preview()
		} else {
			zoom_in(e.target)
		}
	}

	document.getElementById("save_btn").onclick = async (e) => {
		let blob = await fetch(preview_img.src).then(r => r.blob());
		alert("id : " + current_mapped_record.id)
		await upload_label(
			current_mapped_record,
			blob,
			(current_mapped_record.filename ?? "generic")+".png")
	}

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

function zoom_in(a_img) {
	zoom_img.src = a_img.src
	zoom_dlg.showModal()
}

/**
 * Application des options
 * @param {WidgetOptions} a_options
 */
export function apply_options(a_options) {
	label_img.style.width = a_options.display.size+"px"
	preview_img.style.width = a_options.display.size+"px"
}


export async function apply_record(record, a_options) {
	current_mapped_record = record
	if( (record.label?.length ?? 0) > 0) {
		const current_label = (record.label).at(a_options.data.position);
		label_img.src = await getAttachmentURL(current_label);
		preview_img.classList.remove("empty")
	} else {
		label_img.src = "./img/no_label.png"
		preview_img.classList.add("empty")

	}
	build_preview(false)
}


 