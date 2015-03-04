var NoReload = (function($){
	var serverAddress = '';
    var initialState = 'home';
    var currentState = initialState;
	
	var controllers = {};
	var navigationStates = {};
	var preLoadEvents = {};
	var posLoadEvents = {};
	
	var utils = {
		defaultValue: function(original, dft){
			return typeof original !== 'undefined' ? original : dft;
		},
		
		objectMerge: function(ob1, ob2){
			for(var key in ob2){
				ob1[key] = ob2[key];
			}
			return ob1;
		},
		
		convertResponse: function(response){
			if(typeof response === 'string')
				response = JSON.parse(response);

			return response;
		}
	};
	
	var formatUrl = function(location){
		var loc = location.split('/');
        var formatedLocation = 'c='+loc[0];
        if(loc.length > 1){
            formatedLocation += '&m='+loc[1];
        }
        return serverAddress+'?'+formatedLocation;
	};
	
	var preLoad = function(){
		for(var key in preLoadEvents){
			preLoadEvents[key]();
		}
	};
	var posLoad = function(){
		for(var key in posLoadEvents){
			posLoadEvents[key]();
		}
	};
	
	var defaultErrorFunction = function(){
		alert("error");
	};
	
	var defaultResponseProcessor = function(){return true;};
	
    var ajax = function(options){
        var defaultOptions = {
            url: serverAddress,
            cache: false,
			contentType: "application/json",
			dataType: "json",
            beforeSend: function(){
                preLoad();
            },
            complete: function(){
                posLoad();
            },
            error: function(params){
                defaultErrorFunction(params);
            }
        };
        
        $.ajax(utils.objectMerge(defaultOptions, options));
    };
	
	return {
		utils: utils,
		preLoad: preLoad,
		posLoad: posLoad,
		ajax: ajax,
		registerState: function(name, state, isAjax){
			isAjax = utils.defaultValue(isAjax, true);
			
            navigationStates[name] = {
                state: state,
                isAjax: isAjax
            };
		},
		
		isRegistredState: function(name){
			return typeof navigationStates[name] !== 'undefined';
		},
		
		registerController: function(name, controller){
			controllers[name] = controller;
		},
		
		registerPreLoadEvent: function(name, event){
			preLoadEvents[name] = event;
		},
		
		unregisterPreLoadEvent: function(name){
			delete preLoadEvents[name];
		},
		
		registerPosLoadEvent: function(name, event){
			posLoadEvents[name] = event;
		},
		
		unregisterPosLoadEvent: function(name){
			delete preLoadEvents[name];
		},
		
		loadState: function(name, param){
			if(typeof navigationStates[name] !== 'undefined' && typeof navigationStates[name].state === 'function'){
				if(navigationStates[name].isAjax && typeof param === 'undefined'){
					this.request(name, function(response){
						if(defaultResponseProcessor(response)){
							navigationStates[name].state(response);
						}
					});
				}
				else{
					if(defaultResponseProcessor(param)){
						navigationStates[name].state(param);
					}
				}
				currentState = name;
			}
			else if (typeof navigationStates[initialState] !== 'undefined' && typeof navigationStates[initialState].state === 'function'){
				this.loadState(initialState);
			}
		},
		
		request: function(location, callback){
			if(typeof callback === 'string')
				callback = this.getControllerFunc(callback);
			
			ajax({
				type: 'get',
				url: formatUrl(location),
				success: callback
			});
		},
		
		send: function(options){
			var defaultOptions = {
				location: '',
				data: '',
				callback: false,
				type: 'get',
				reload: false
			};
			options = utils.objectMerge(defaultOptions,options);
			
			var NR = this;
			ajax({
				type: options.type,
				url: formatUrl(options.location),
				data: options.data,
				success: function(response){
					if(defaultResponseProcessor(response)){
						if(options.callback){
							NR.call(options.callback, response);
						};
						if(options.reload){
							NR.loadState(currentState, response);
						};
					}
				}
			});
		},
		
		call: function(controllerFunc, params){
			if(typeof controllerFunc === 'string')
				controllerFunc = this.getControllerFunc(controllerFunc);
			
			controllerFunc(params);
		},
		
		getControllerFunc: function(name){
			return function(params){
				var names = name.split(';');
				for(var key in names){
					name = names[key].split('.');
					var controllerName = name[0];
					var funcName = name[1];

					if(typeof controllers[controllerName] !== 'undefined' && typeof controllers[controllerName][funcName] !== 'undefined'){
						controllers[controllerName][funcName](params);
					}
				}
			};
		},
		
		getCurrentState: function(){
			return currentState;
		},
		
		setDefaultErrorFunction: function(func){
			defaultErrorFunction = func;
		},
		
		setDefaultResponseProcessor: function(func){
			defaultResponseProcessor = func;
		},
		
		getServerAddress: function(){
			return serverAddress;
		},
		
		setServerAddress: function(address){
			serverAddress = address;
		},
		
		getInitialState: function(){
			return initialState;
		},
		
		setInitialState: function(state){
			initialState = state;
		}
	};
})(jQuery);
