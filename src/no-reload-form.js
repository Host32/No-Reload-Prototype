(function(NR, $) {
    NR.form = (function() {
        var formSeletor = 'form';
        
        var defaultLanguage = 'en';
        
        var ALPHA_EXP = /^[a-z]+$/i;
        var NATURAL_EXP = /^[0-9]+$/i;
        var NUMBER_EXP = /^([-]?[0-9]*[\.]?[0-9]*)$/i;
        var ALPHA_NUMERIC_EXP = /^[a-z0-9]+$/i;
        var ALPHA_DASH_EXP = /^[a-z0-9_-]+$/i;
        var EMAIL_EXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var EMAILS_EXP = /^((([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))([,]?))+$/;
        var IP_EXP = /^[\d]{1,3}(\.([\d]{1,3})){3}$/;
        
        var RULE_PARAM_EXP = /(\[(.*)\])/;
        
        var validations = {
            required: function(value){
                if(typeof value === 'string'){
                    if(value.toLowerCase() === 'true') value = true;
                    else if(value.toLowerCase() === 'false') value = false;
                    else return value.length > 0;
                }
                
                return typeof value !== 'undefined' && value !== false && value !== null;
            },
            matches: function(value, seletor){
                return value == $(seletor).val();
            },
            min_length: function(value, length){
                return value.length >= length;
            },
            max_length: function(value, length){
                return value.length <= length;
            },
            exact_length: function(value, length){
                return value.length == length;
            },
            greater_than: function(value, number){
                return NUMBER_EXP.test(value) && parseInt(value, 10) >= number;
            },
            less_than: function(value, number){
                return NUMBER_EXP.test(value) && parseInt(value, 10) <= number;
            },
            alpha: function(value){
                return ALPHA_EXP.test(value);
            },
            alpha_numeric: function(value){
                return ALPHA_NUMERIC_EXP.test(value);
            },
            alpha_dash: function(value){
                return ALPHA_DASH_EXP.test(value);
            },
            numeric: function(value){
                return (value - parseFloat( value ) + 1) >= 0;
            },
            is_natural: function(value){
                return NATURAL_EXP.test(value);
            },
            valid_email: function(value){
                return EMAIL_EXP.test(value);
            },
            valid_emails: function(value){
                return EMAILS_EXP.test(value);
            },
            valid_ip: function(value){
                return IP_EXP.test(value);
            }
        };
        var validationErrors = {
            en: {
                required: '',
                matches: '',
                min_length: '',
                max_length: '',
                exact_length: '',
                greater_than: '',
                less_than: '',
                alpha: '',
                alpha_numeric: '',
                alpha_dash: '',
                numeric: '',
                is_natural: '',
                valid_email: '',
                valid_emails: '',
                valid_ip: ''
            },
            ptbr: {
                required: 'O campo $1 é obrigatório.',
                matches: 'O campo valor no campo $1 não é idêntico ao valor de outro campo.',
                min_length: 'O campo $1 precisa de no mínimo $2 characteres.',
                max_length: 'O campo $1 pode ter no máximo $2 characteres.',
                exact_length: 'O campo $1 precisa de exatamente $2 characteres.',
                greater_than: 'O valor do campo $1 pode ser de no máximo $2.',
                less_than: 'O valor do campo $1 pode ser de no mínimo $2.',
                alpha: 'O campo $1 aceita somente letras.',
                alpha_numeric: 'O campo $1 aceita somente letras e números',
                alpha_dash: 'O campo $1 aceita somente letras, números, underlines e traços.',
                numeric: 'O campo $1 só aceita valores numéricos',
                is_natural: 'O campo $1 só aceita numeros naturais.',
                valid_email: 'O campo $1 precisa de um email válido.',
                valid_emails: 'O campo $1 só aceita uma lista de emails válidos separados por vírgula.',
                valid_ip: 'O campo $1 só aceita endereços de IP válidos.'
            }
        };
        
        var validationErrorMessage = '';
        
        var __export__ = {
            registerValidation: function(name, func, messages){
                validations[name] = func;
                
                messages = messages || [];
                
                for(var key in messages){
                    this.registerLang(messages[key].lang);
                    validationErrors[messages[key].lang][name] = messages[key].message;
                }
            },
            registerValidationMessage: function(name, lang, message){
                this.registerLang(lang);
                validationErrors[lang][name] = message;
            },
            registerLang: function(lang){
                if(typeof validationErrors[lang] === 'undefined'){
                    validationErrors[lang] = {};
                }
            },
            validate: function(rule, value, param){
                return(typeof validations[rule] === 'function') ? validations[rule](value, param) : true;
            },
            printErrorValidation: function($field, errorMessage){
                var errorDest = $field.attr('error-field') || false;
                if(errorDest){
                    $(errorDest).html(errorMessage);
                }
            },
            validateField: function($field){
                var rules = $field.attr('rules') || '';
                
                if(rules.length > 0){
                    var aRules = rules.split('|');

                    for(var key in aRules){
                        var params = aRules[key].match(RULE_PARAM_EXP);
                        var param = params !== null ? params[0].replace('[','').replace(']','') : null;
                        var rule = aRules[key].replace(RULE_PARAM_EXP, '');
                        
                        var value = $field.attr('type') === 'checkbox' ? $field.prop('checked') : $field.val();

                        if(!this.validate(rule, value, param)){
                            validationErrorMessage = validationErrors[defaultLanguage][rule]
                                    .replace('$1', $field.attr('validation-name'))
                                    .replace('$2', param);
                            
                            this.printErrorValidation($field, validationErrorMessage);
                            
                            return false;
                        }
                    }
                }
                return true;
            },
            validateForm: function($form, showPopup){
                var t = this;
                var errorMessage = '';
                var foundError = false;
                $form.find(':input').each(function(){
                    if(!t.validateField($(this))){
                        foundError = true;
                        errorMessage += validationErrorMessage+'\n';
                    }
                });
                
                if(foundError && showPopup){
                    if(typeof NR.prompt !== 'undefined'){
                        NR.prompt.show(errorMessage.replace(/\n/g, "<br />"));
                    }
                    else{
                        alert(errorMessage);
                    }
                }
                
                return !foundError;
            },
            submit: function($form){
                
                var location = $form.attr('action');
                var data = $form.serialize();

                var reload = $form.attr('reload') || 'false';
                reload = reload.toLowerCase() === 'false' ? false : (reload.toLowerCase() === 'true' ? true : reload);

                var callback = $form.attr('callback') || false;
                var method = $form.attr('method') || false;
                var question = $form.attr('question') || false;
                
                var showPopup = $form.attr('show-error-popup') || 'true';
                showPopup = showPopup.toLowerCase() === 'false' ? false : true;
                
                if(this.validateForm($form, showPopup)){
                    if (question) {
                        NR.prompt.showQuestion(question, function() {
                            NR.send(method, location, data, callback, reload);
                        });
                    }
                    else {
                        NR.send(method, location, data, callback, reload);
                    }
                }
            },
            bind: function(seletor){
                this.unbind();
                
                formSeletor = seletor || formSeletor;
                
                $(document).on('submit', formSeletor, function(e) {
                    e.preventDefault();
                    
                    NR.form.submit($(this));
                });
            },
            unbind: function(){
                $(document).off('submit', formSeletor);
            },
            setLanguage: function(lang){
                defaultLanguage = lang;
            }
        };
        __export__.bind();
        
        return __export__;
    })();
})(NoReload, jQuery);
