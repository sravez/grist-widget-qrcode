import { getLabel } from "./label.mjs"

export let options = {
	img_type: "png",
	qrc_size: 256,
	foreground_color: "#000000",
	background_color: "#FFFFFF",
	padding: 26,
	text_size: 18,
	text_color: "#0F0F0F"
}

/** Boîte de dialogue */
const settings_dialog = document.getElementById("settings")
/** Formulaire de saisie des options */
const settings_form = document.getElementById("settings_form")

/** Obtention des données du formulaire */
function getSettingsFormData() {
	const integers = ["qrc_size", "padding", "text_size"]
	const form_data = {}
	const formData = new FormData(settings_form);
	for(let pair of formData.entries()) {
		form_data[pair[0]] = integers.includes(pair[0])? parseInt(pair[1]) : pair[1]
	}
	/*
	for (const i of integers) {
		form_data[i] = parseInt(form_data[i])
	}
	*/
	return form_data	
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
		const qrc = getLabel(test_content, {...options, ...formOptions });
		example.src = qrc.toDataURL();
	}
	
	const btnSave = document.getElementById("settings_save");
	btnSave.onclick = async () => {
		settings_dialog.close();
		options = {...options, ...getSettingsFormData() }
		await grist.setOption("options", options)  
	}
	
	const btnCancel = document.getElementById("settings_cancel");
	btnCancel.onclick = () => {
		settings_dialog.close();
	}	 	  
}
