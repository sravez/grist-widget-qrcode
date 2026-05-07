/**
 * # Gestion du questionnaire de configuration
 * @author Serge RAVEZ
 */

/** Générateur d'étiquette */
import getQRLabel  from "./qrlabel.mjs"
/** Options par défaut */
import default_options from "./widget_options.default.mjs"

let options = default_options;
let form_initialized = false;
let types = {}
const sep = "_"

const form = document.getElementById("settings_form")
const options_test_img = document.getElementById("options_test_img")
const full_size_img = document.getElementById("full_size_img")

const auto_test = document.getElementById("qrcode_auto_test")


function setFormData(a_options) {
	for(const d in a_options) {
		for(const o in a_options[d]) {
			const n = d + sep + o
			if (form[n]) {
				if(form[n].type == "checkbox") {
					form[n].checked = a_options[d][o] ?? false
				} else {
					form[n].value = a_options[d][o]
				}
			}
		}
	}
}

/**
 * Extrait les données du formulaire
 * @returns {{display: {}, qrcode: {}, data: {}}}
 */
function getFormData() {
	const form_data = {
		display: {},
		qrcode: {},
		data: {}
	}

	const formData = new FormData(form);
	for(let pair of formData.entries()) {
		const i = pair[0].indexOf(sep)
		const d = pair[0].substring(0, i)
		const n  = pair[0].substring(i + 1)
		switch(form[pair[0]].type) {
			case "checkbox":
				form_data[d][n] = true
				break;
			case "number":
				form_data[d][n] = parseInt(pair[1])
				break;
			default:
				form_data[d][n] = pair[1]
		}
	}
	return form_data
}


function getImage() {
	const data = {
		val: "https://test.com",
		top: "HAUT",
		right: "DROITE",
		bottom: "BAS",
		left: "GAUCHE",
	}
	const o = getFormData()
	options_test_img.src = getQRLabel(data, o.qrcode)
	options_test_img.classList.remove("empty")
}

function onFormChange(e) {
	if(form['qrcode_auto_test'].checked) {
		getImage()
	} else {
		options_test_img.src = "./img/click.png"
		options_test_img.classList.add("empty")
	}
}

function onImgClick(e) {
	if(options_test_img.classList.contains("empty")) {
		getImage()
	} else {
		full_size_img.src = options_test_img.src
		document.getElementById("full_size").showPopover()
	}

}

/**
 * Détermine le style de chaque option
 * et le stocke dans `types`
 *
 * @param {options} a_options
 */
function getOptionsType(a_options) {
	types = {
		number: [],
		boolean: [],
		string: []
	}

	for(const d in a_options) {
		for(const o in a_options[d]) {
			const n = d + sep + o;
			switch(typeof a_options[d][o]){
				case "number":
				case "bigint":
					types.number.push(n)
					break;
				case "boolean":
					types.boolean.push(n)
					break;
				default:
					types.string.push(n)			}
		}
	}
}

function init_form(a_options) {
	if(!form_initialized) {
		options_test_img.onclick = onImgClick
		for(const o in options.qrcode) {
			form["qrcode"+sep+o].onchange = onFormChange
		}
		form_initialized = true;
	}
	
	setFormData(a_options)
}

window.onload = () => {
	init_form(options)
}
