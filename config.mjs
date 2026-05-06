const form = document.getElementById("settings_form")

const options = {
	type: "png", 
	display_size: 64,
	auto_next: "invalid",
	btn_update_all: false,
	btn_update_invalid: true,
	qrc_size: 256,
	margin: 12,
	border: 30,
	text_size: 18,
	redundancy: "Q",
	foreground_color: "#0000FF",
	background_color: "#FFFFFF",
	border_color: "#FF0000",
	text_color: "#000000",
	auto_test: true,
	position: 0,
	save_mode: "replace"
}


function init_form(a_options) {
	for(const o in a_options) {
		if (form[o]) {
			if(form[o].type == "checkbox") {
				form[o].checked = a_options[o]
			} else {
				form[o].value = a_options[o]
			}
		}
	}
}

init_form(options)
