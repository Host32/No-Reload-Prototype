(function(NR, $, Handlebars){
	NR.prompt = (function(){
		var promptPrefix = 'jqismooth';
		var promptQuestionPrefix = 'jqismooth';
		
		return {
			show: function(message){
				$.prompt(message,{prefix: promptPrefix});
			},
			showQuestion: function(question, callback){
				$.prompt(question,{
					buttons: {Sim: true, Não: false},
					prefix: promptQuestionPrefix,
					callback: function (e,v,m,f){
						if(v){ callback(); }
					}
				});
			},
			getPromptPrefix: function(){
				return promptPrefix;
			},
			setPromptPrefix: function(prefix){
				promptPrefix = prefix;
			},
			
			getPromptQuestionPrefix: function(){
				return promptQuestionPrefix;
			},
			setPromptQuestionPrefix: function(prefix){
				promptQuestionPrefix = prefix;
			}
		};
	})();
})(NoReload, jQuery, Handlebars);
