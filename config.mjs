const form = document.getElementById("settings_form")

const options = {
	existing_size: 0,
	computed_size: 128,
	compute: "invalid",
	auto_save: "invalid",
	qrc_size: 256,
	resilience: "Q",
	foreground_color: "#FF0000",
	background_color: "#FFFFFF",
	margin: 12,
	border: 30,
	text_size: 18,
	text_color: "#808080",
	position: 0,
	save_mode: "replace"
}


function init(a_options) {
	for(const o in a_options) {
		form[o].value = a_options[o]
	}
}

init(options)
