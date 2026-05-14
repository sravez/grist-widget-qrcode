import getQRLabel from "./qrlabel.mjs"
import { getAttachmentURL } from "./files.mjs"

const label_img = document.querySelector("#label img")

/**
 * Application des options
 * @param {WidgetOptions} a_options
 */
export function apply_options(a_options) {
	const preview_img = document.querySelector("#preview img")

	label_img.style.width = a_options.display.size+"px"
	preview_img.style.width = a_options.display.size+"px"

	//apply_options_to_qrcode(existing_qrcode_div, a_options.show_existing, a_options.existing_size)
	//apply_options_to_qrcode(computed_qrcode_div, a_options.show_computed, a_options.computed_size)
}



export async function apply_record(record, a_options) {
	if( (record.label?.length ?? 0) > 0) {
		const current_label = (record.label).at(a_options.data.position);
		label_img.src = await getAttachmentURL(current_label);
	} else {
		label_img.src = "./img/no_label.png"
	}
	//const canvas = getQRLabel(record)
	//computed_qrcode_img.src = canvas.toDataURL()

}

/*
saveBtn.addEventListener('click', async () => {
	let blob = await fetch(image.src).then(r => r.blob());
  await upload_label(currentRecord, blob, false, currentRecord.filename+"."+fileext)
 */
 