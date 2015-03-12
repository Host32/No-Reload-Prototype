(function(NR, $) {
    NR.form = (function() {
        var formSeletor = 'form';
        
        var __export__ = {
            bind: function(seletor){
                $(document).off('submit', formSeletor);
                
                formSeletor = NR.utils.defaultValue(seletor, formSeletor);
                
                $(document).on('submit', formSeletor, function(e) {
                    e.preventDefault();
                    
                    var location = $(this).attr('action');
                    var data = $(this).serialize();
                    
                    var reload = $(this).attr('reload');
                    reload = typeof reload === 'undefined' || reload.toLowerCase() === 'false' ? false : (reload.toLowerCase() === 'true' ? true : reload);
                    
                    var callback = NR.utils.defaultValue($(this).attr('callback'), false);
                    var method = NR.utils.defaultValue($(this).attr('method'), false);
                    var question = NR.utils.defaultValue($(this).attr('question'), false);
                    
                    if (question) {
                        NR.prompt.showQuestion(question, function() {
                            NR.send(method, location, data, callback, reload);
                        });
                    }
                    else {
                        NR.send(method, location, data, callback, reload);
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
