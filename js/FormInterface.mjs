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
export default class FormInterface {
    /**
      * Formulaire dont on gère les données
      * @type {HTMLFormElement}
      */
    form = null

    /**
     * Séparateur des `name` et `id` des contrôles.
     * Ne doit pas être présent dans les noms de valeurs.
     * @type {string}
     * @default "."
     */
    sep = "."

    /**
     * Point de restauration : dernières valeurs assignées ou sauvegardées
     * @type {object} Valeur à restaurer (aplaties) */
    reset_values = null

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
     * Renvoie les données déployées du formulaire
     * @returns {object}
     */
    getValues() {
        const result = {
        }

        function getValue(formEl, value) {
            switch(formEl.type) {
                case "checkbox":
                    return true;
                case "number":
                    return parseInt(value);
                default:
                    return value
            }
        }

        /**
         * Positionne la valeur dans l'objet cible en suivant le chemin
         * @param path
         * @param target
         * @param value
         */
        function insertValue(path, target,  value) {
            if(path.length === 1) {
                target[path[0]] = value
            } else {
                if(!isObject(target[path[0]])) {
                    target[path[0]] = {}
                }
                insertValue(path.slice(1), target[path[0]], value)
            }
        }

        const formData = new FormData(form);
        for(let pair of formData.entries()) {
            insertValue(pair[0].split(this.sep), result, getValue(this.form[pair[0]], pair[1]))
        }
        return result
    }

    /**
     * Assigne des valeurs au formulaire
     * @param {object} a_values
     */
    setValues(a_values) {
        const values = {}

        /**
         * Assigne une valeur à un contrôle en fonction de son type
         * @param {FormInterface} self
         * @param name  Nom du contrôle
         * @param value Valeur à assigner
         */
        function assignValue(self, name, value) {
            if (self.form[name]) {
                if(self.form[name].type === "checkbox") {
                    self.form[name].checked = value ?? false
                } else {
                    self.form[name].value = value
                }
            }
        }

        /**
         * Affecte au formulaire une branche/sous-arbre de a_values
         * @param {FormInterface} self
         * @param {object} branch_root
         * @param {string} path
         */
        function setBranch(self, branch_root, path) {
            for(const node in branch_root) {
                if(isObject(root[node])) {
                    setBranch(self, branch_root[node], path + self.sep + node)
                } else {
                    const name = path + self.sep + node
                    assignValue(self, name, branch_root[node])
                    self.reset_values[name] = branch_root[node]
                }
            }
        }
        setBranch(this, a_values, "")
    }


}

function isObject(obj) {
    return typeof obj === 'object'
        && obj !== null
        && ! Array.isArray(obj)
};