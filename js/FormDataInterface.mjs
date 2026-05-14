/**
 * Classe d'interaction avec un formulaire
 *
 * Permet d'assigner et de récupérer sous formes d'objet les valeurs d'un formulaire,
 * à condition que les `name` et `id` des contrôles du formulaire correspondent aux
 * _chemins_ de l'objet de valeur.
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
     * @type {object} Valeur à restaurer */
    reset_data = {}

    /**
     * Types des options fournies indexées par leur chemin
     * @type {Object.<string, string>}
     */
    types = {}

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
     * Assigne les données et les applique au formulaire
     * @param {object} a_data
     */
    setData(a_data) {
        this.reset_data = structuredClone(a_data);
        this.resetForm();
    }

    /**
     * Extrait les données du formulaire
     * @returns {object} Données _dépliées_
     */
    getData() {
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
            /** @type {any} */
            let v;
            switch(this.types[name]) {
                case "boolean":
                    v = !(!value || parseFloat(value) === 0 || value.toString().toLowerCase() === "false");
                    break;
                case "number":
                    v = parseFloat(value);
                    break;
                case "string":
                default:
                    v = value;
            }
            insert(result, p, v)
        }
        return result;
    }

    /**
     * Réapplique les données initiales au formulaire
     */
    resetForm() {
        this.setFormData(this.reset_data);
    }

    /**
     * Applique des données au formulaire
     * @param {object} a_data
     */
    setFormData(a_data = this.reset_data) {
        const self = this;
        this.types = {}

        /** Fonction récursive d'assignation d'un sous-arbre de Data */
        function setSubData(obj, path = "") {
            for (const key in obj) {
                const p = path + (path ? self.sep : "") + key;
                if (FormDataInterface.isObject(obj[key])) {
                    setSubData(obj[key], p)
                } else {
                    self.types[p] = typeof obj[key];
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
        setSubData(a_data)
    }

    /**
     * Vérifie si un _objet_ est un Objet JavaScript
     * @param {any} obj _Objet_ à vérifier
     * @returns {boolean}
     * @static
     */
    static isObject(obj) {
        return typeof obj === 'object'
            && obj !== null
            && ! Array.isArray(obj)
    }
}