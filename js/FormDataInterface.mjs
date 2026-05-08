/**
 * Classe d'interaction avec un formulaire
 *
 * Permet d'assigner et de récupérer sous formes d'objet les valeurs d'un formulaire,
 * à condition que :
 * * les `name` et `id` des contrôles du formulaire correspondent aux _chemins_ de
 *   l'objet de valeur ;
 * * les valeurs booléennes soient gérées par des `input[type=checkbox]` ;
 * * les valeurs entières soient gérées par des `input[type=number]` ;
 *
 * @author Serge RAVEZ
 */
export default class FormDataInterface {
    /**
      * Formulaire dont on gère les données
      * @type {HTMLFormElement}
      */
    form = null

    /**
     * Séparateur des `name` et `id` des contrôles.
     * Il ne doit pas être présent dans les noms de valeurs.
     * @type {string}
     * @default "."
     */
    sep = "."

    /**
     * Point de restauration : dernières valeurs assignées ou sauvegardées
     * @type {object} Valeur à restaurer (aplaties) */
    reset_data = {}

    /**
     * Constructeur
     * @param {HTMLFormElement} a_form
     * @param {string} a_sep
     */
    constructor(a_form, a_sep = ".") {
        this.form = a_form;
        this.sep = a_sep;
    }

    /**
     * Assigne les données et les appique au formulaire
     * @param {object} a_data
     */
    setData(a_data) {
        this.reset_data = structuredClone(a_data);
        this.reset()
    }

    /**
     * Applique les données au formulaire
     */
    reset() {
        this.setFormData(this.reset_data);
    }

    /**
     * Applique des données au formulaires
     * @param {object} a_data
     */
    setFormData(a_data) {
        const self = this;

        function setSubData(obj, path = "") {
            for (const key in obj) {
                const p = path + (path ? self.sep : "") + key;
                if (FormDataInterface.isObject(obj[key])) {
                    setSubData(obj[key], p)
                } else {
                    if (self.form[p]) {
                        if (self.form[p].type === "checkbox") {
                            self.form[p].checked = obj[key] ?? false
                        } else {
                            self.form[p].value = obj[key]
                        }
                    }
                }
            }
        }
        setSubData(this.reset_data)
    }

    /**
     * Extrait les données du formulaire
     * @returns {object} Données _dépliées_
     */
    getFormData() {
        const result = {}
        const form_data = new FormData(this.form)

        function insert(target, array_path, value) {
            if(array_path.length === 1) {
                target[array_path[0]] = value
            } else if (array_path.length > 1) {
                if(!FormDataInterface.isObject(target[array_path[0]])) {
                    target[array_path[0]] = {}
                }
                const key = array_path.shift()
                insert(target[key],array_path, value)
            }
        }

        for(let [name, value] of form_data) {
            const p = name.split(this.sep);
            switch(this.form[name].type) {
                case "checkbox":
                    value = true;
                    break;
                case "number":
                    value = parseInt(value);
                    break;
            }
            insert(result, p, value)
        }
        return result;
    }

    /**
     * Vérifie si un _objet_ est un Objet JavaScript
     * @param   obj _Objet_ à vérifier
     * @returns {boolean}
     */
    static isObject(obj) {
        return typeof obj === 'object'
            && obj !== null
            && ! Array.isArray(obj)
    }
}