(function(NR, $) {
    NR.form = (function() {
        var formSeletor = 'form';
        
        var getFormOptions = function($form) {
            var opt = {
                location: $form.attr('action'),
                data: $form.serialize()
            };

            if (typeof $form.attr('callback') !== 'undefined') 
                opt['callback'] = $form.attr('callback');
            if (typeof $form.attr('reload') !== 'undefined') 
                opt['reload'] = $form.attr('reload') === 'true';
            if (typeof $form.attr('method') !== 'undefined') 
                opt['type'] = $form.attr('method');
            if (typeof $form.attr('question') !== 'undefined') 
                opt['question'] = $form.attr('question');

            return opt;
        };
        
        var __export__ = {
            bind: function(seletor){
                $(document).off('submit', formSeletor);
                
                formSeletor = NR.utils.defaultValue(seletor, formSeletor);
                
                $(document).on('submit', formSeletor, function(e) {
                    e.preventDefault();

                    var formOpt = getFormOptions($(this));

                    if (typeof formOpt.question !== 'undefined') {
                        NR.prompt.showQuestion(formOpt.question, function() {
                            NR.send(formOpt);
                        });
                    }
                    else {
                        NR.send(formOpt);
                    }
                });
            },
            unbind: function(){
                $(document).off('submit', formSeletor);
            }
        };
        __export__.bind();
        
        return __export__;
    })();
})(NoReload, jQuery);
