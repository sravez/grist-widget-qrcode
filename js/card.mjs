import { getLabel } from "./label.mjs"
import { getAttachmentURL } from "./files.mjs"

/** Image stockée (élément DOM) */
const existing_qrcode_div = document.getElementById("existing_qrcode")
const existing_qrcode_img = existing_qrcode_div.querySelector("img")

/** Image calculée */
const computed_qrcode_div = document.getElementById("computed_qrcode")
const computed_qrcode_img = computed_qrcode_div.querySelector("img")


export function apply_options(a_options) {
	apply_options_to_qrcode(existing_qrcode_div, a_options.show_existing, a_options.existing_size)
	apply_options_to_qrcode(computed_qrcode_div, a_options.show_computed, a_options.computed_size)	
}

function apply_options_to_qrcode(a_div, a_show, a_size) {
	if (a_show) {
		a_div.classList.remove("masked")
		const img = a_div.querySelector("img")
		if (a_size > 0) {
			img.width = a_size
		} else {
			img.removeAttribute("width")
		}
	} else {
		a_div.classList.add("masked")
	}
}

export async function apply_record(record, a_options) {
	if( (record.label?.length ?? 0) > 0) {
		const current_qrcode = (record.label).at(a_options.current_qrcode);
		existing_qrcode_img.src = await getAttachmentURL(current_qrcode);
	} else {
		existing_qrcode_img.src = "./img/no_label.png"
	}
	
	const canvas = getLabel({
		val   : record.val,
		top   : record.top ?? null,
		bottom: record.bottom ?? null,
		left  : record.left ?? null,
		right : record.top ?? null,
	}, a_options)
	computed_qrcode_img.src = canvas.toDataURL()
	
}

/*
saveBtn.addEventListener('click', async () => {
	let blob = await fetch(image.src).then(r => r.blob());
  await upload_label(currentRecord, blob, false, currentRecord.filename+"."+fileext)
 */
 