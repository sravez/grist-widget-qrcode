import { getLabel } from "./label.mjs"
import { apply_options } from "./card.mjs"


const default_options = {
	/** 0 -> "first", -1 -> "last" */
	current_qrcode: 0,
// Options d'affichage
	/** Affichage de l'image stockée */
	show_existing: true,
	/** Taille de l'image (0 pour taille réelle) */
	existing_size: 128,
	
	show_computed: false,
	computed_size: 128,
	
	img_type: "png",
	qrc_size: 256,
	resilience: "Q",
	foreground_color: "#000000",
	background_color: "#FFFFFF",
	padding: 26,
	text_size: 18,
	text_color: "#808080",
	test_val_length: 256,
	display_size: 128,
	auto_show: false,
	btn_replace: true,
	btn_save_first: false,
	btn_save_last: false,
	btn_refresh: true,
	btn_refresh_all: true,
	btn_refresh_unvalid: true,
	save: "replace",
	refresh_val: "",
	validity_test: "filename"
}

const options_types = {
	current_qrcode: "Int",
	existing_size: "Int",
	qrc_size: "Int",
	padding: "Int",
	text_size: "Int",
	test_val_length: "Int",
	display_size: "Int",
	auto_show: "Boolean",
}

export let options = null

/** Boîte de dialogue */
const settings_dialog = document.getElementById("settings")
/** Formulaire de saisie des options */
const settings_form = document.getElementById("settings_form")

export async function initOptions() {
	if (!options) {
		const o = await grist.getOption("options")
		options = { ...default_options, ...(o ?? {}) }
		if (!o) {
			await setOptions(options)
		}
	}
	setSettingsFormData(options)
}

async function setOptions(a_options) {
	await grist.setOption("options", options)
	apply_options(a_options)
}

function setSettingsFormData(a_options) {
	for (const n in a_options) {
		try {
			settings_form[n].value = a_options[n]
		} catch(e) {
			
		}
	}
}

function resetSettingsFormData() {
	setSettingsFormData(options)
}

/** Obtention des données du formulaire */
function getSettingsFormData() {
	const integers = ["qrc_size", "padding", "text_size"]
	const form_data = {}
	const formData = new FormData(settings_form);
	for(let pair of formData.entries()) {
		form_data[pair[0]] = integers.includes(pair[0])? parseInt(pair[1]) : pair[1]
	}
	return form_data	
}

function closeDialog() {
	example.src = ""
	settings_dialog.close()
}
/**
 * Réglages du widget
 * 
 * Fonction appelée lorsque l'utilisateur accède à la configuration du widget.
 */
export function onEditOptions() {
	settings_dialog.showModal();
	
	const test_content = {
		val   : "https://www.apple.com",
		top   : "EN HAUT",
		bottom: "EN BAS",
		left  : "À GAUCHE",
		right : "À DROITE"
	}
	
	const example = document.getElementById("example")
	
	const btnTest = document.getElementById("settings_test");
	btnTest.onclick = () => {
		const formOptions = getSettingsFormData();
		const qrc = getLabel(test_content, formOptions);
		example.src = qrc.toDataURL();
	}
	
	const btnSave = document.getElementById("settings_save");
	btnSave.onclick = async () => {
		closeDialog();
		options = {...options, ...getSettingsFormData() }
		await setOptions(options)  
	}
	
	const btnCancel = document.getElementById("settings_cancel");
	btnCancel.onclick = () => {
		resetSettingsFormData();
		closeDialog();
	}	 	  
}
