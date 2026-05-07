import getQRLabel from "./qrlabel.mjs"
import { apply_options } from "./card.mjs"


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
		} else {
			apply_options(options)
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
		const qrc = getQRLabel(test_content, formOptions);
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
