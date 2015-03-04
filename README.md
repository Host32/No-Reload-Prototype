# No-Reload
Full AJAX javascript framework

## Prerequisites

* JQuery http://jquery.com/
* Impromptu http://trentrichardson.com/Impromptu/
* Handlebars http://handlebarsjs.com/

## Usage example

#### Server/index.php
```php
<?php echo json_encode(array("hello" => "world"));
```

#### Cliente/Templates/home.hbs
```html
<div>
{{hello}}
</div>
```

#### app.js
```javascript
(function($, NR){
  // configure json server
  NR.setServerAddress('Server/index.php');
  
  // folder containing the templates
  NR.template.setTemplatePath('Cliente/Templates/');
  
  // default Error message
  NR.setDefaultErrorFunction(function(){
    NR.prompt.show("ERROR");
  });
  
  // create a new state
  NR.registerState('home', function(response){
    // when this state has be loaded, an ajax request will be sent to the server
    // the response object is the server response
    
    // compile( 'target element', 'template name', 'template data' )
    NR.template.compile($('body'), 'home', response);
  });
  
  // set home as our initial state
  NR.setInitialState('home');
  
  // load the initial state 
  NR.loadState();
  
  // bind loadstate on hash change
  $(window).on('hashchange', function() {
    var name = location.hash.replace( /^#/, '' );
    NR.loadState(name);
  });
})(jQuery, NoReload);

```

#### index.html
```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title>No-Reload Sample</title>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
	
	<script type="text/javascript" src="JS/jquery.js"></script>
  <script type="text/javascript" src="JS/prompt.js"></script>
  <script type="text/javascript" src="JS/handlebars-v3.0.0.js"></script>
  <script type="text/javascript" src="JS/no-reload/no-reload-core.js"></script>
  <script type="text/javascript" src="JS/no-reload/no-reload-template.js"></script>
  <script type="text/javascript" src="JS/no-reload/no-reload-prompt.js"></script>
  <script type="text/javascript" src="JS/no-reload/no-reload-timeouts.js"></script>
  <script type="text/javascript" src="JS/no-reload/no-reload-intervals.js"></script>
  <script type="text/javascript" src="app.js"></script>
</head>
<body>
</body>
</html>
```
