import options from "./js/options.default.mjs"

let form_initialized = false;

const form = document.getElementById("settings_form")
const options_test_img = document.getElementById("options_test_img")
const auto_test = document.getElementById("auto_test")


function setFormData(a_options) {
	for(const d in a_options) {
		for(const o in a_options[d]) {
			if (form[o]) {
				if(form[o].type == "checkbox") {
					form[o].checked = a_options[d][o]
				} else {
					form[o].value = a_options[d][o]
				}
			}
		}
	}
}

function onFormChange(e) {
	console.debug("onFormChange", e.target.id, e.target.value)
}

function onImgClick(e) {
	console.debug("onImgClick")
}

function getOptionsType(a_options) {
	const types = {}
	for(const d in a_options) {
		for(const o in a_options[d]) {
			switch(typeof a_options[d][o]){
				case "number":
				case "bigint":
					types[d+'_'+o] = "number"
					break;
				case "boolean":
					types[d+'_'+o] = "boolean"
					break;
				default:
					types[d+'_'+o] = "string"
			}
		
		}
	}
	return types
}

function init_form(a_options) {
	if(!form_initialized) {
		options_test_img.onclick = onImgClick
		for(const o in options.qrcode) {
			form[o].onchange = onFormChange
		}
		const t = getOptionsType(a_options)
		console.log(t)
		form_initialized = true;
	}
	
	setFormData(a_options)
}

window.onload = () => {
	init_form(options)
}
