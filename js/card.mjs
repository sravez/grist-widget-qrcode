
/** Image stockée (élément DOM) */
const existing_qrcode_div = document.getElementById("existing_qrcode")
const existing_qrcode_img = existing_qrcode_div.querySelector("img")

/** Image calculée */
const computed_qrcode_div = document.getElementById("existing_qrcode")
const computed_qrcode_img = computed_qrcode_div.querySelector("img")


export function apply_options(a_options) {
	apply_options_to_qrcode(existing_qrcode_div, a_options.show_existing, a_options.existing_size)
	apply_options_to_qrcode(computed_qrcode_div, a_options.show_computed, a_options.computed_size)	
}

function apply_options_to_qrcode(a_div, a_show, a_size) {
	if (a_show) {
		a_div.classList.remove("masked")
		const img = a_div.querySelector("img")
		if (size > 0) {
			img.width = size
		} else {
			img.removeAttribute("width")
		}
	} else {
		a_div.classList.add("masked")
	}
}

export async function apply_record(record, a_options) {
	console.log("RVZ", record?.label.length ?? "no label")
	console.log(record.label)
	if( (record.label?.length ?? 0) > 0) {
		const current_qrcode = (record.label).at(a_options.current_qrcode);
		const tokenInfo = await grist.docApi.getAccessToken({ readOnly: false });
		let url = `${tokenInfo.baseUrl}/attachments/${current_qrcode}/download?auth=${tokenInfo.token}`
		existing_qrcode_img.src = url;
	} else {
		existing_qrcode_img.src = "";
	}	
}
