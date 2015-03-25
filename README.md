# No-Reload
Full AJAX javascript framework

## Prerequisites

* JQuery http://jquery.com/
* Ractive.js http://www.ractivejs.org/

## Usage example

#### Server/sample.json
```json
{
  "hello": "world"
}
```

#### Templates/home.html
```html
<div>
{{hello}}
</div>
```

#### app.js
```javascript
(function($, NR){
  // configure json server
  NR.setServerAddress('Server/');
  
  // folder containing the templates
  NR.template.setTemplatePath('Templates/');
  
  // create a new route
  NR.registerRoute('sample.json', function(response){
    // when this route has be loaded, an ajax request will be sent to the server
    // the response object is the server response
    
    // compile is a Wrapper from Ractive
    NR.template.compile({
      template: 'home',
      el: 'body',
      data: response
    });
  });
  
  // load the Route 
  NR.load('sample.js');
  
  // bind loadstate on hash change
  $(window).on('hashchange', function() {
    var name = location.hash.replace( /^#/, '' );
    NR.load(name);
  });
})(jQuery, NoReload);

```

#### index.html
```html
<!DOCTYPE html>
<html>
<head>
  <title>No-Reload Sample</title>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
  
  <script type="text/javascript" src="JS/jquery.js"></script>
  <script type="text/javascript" src="JS/ractive.min.js"></script>
  <script type="text/javascript" src="JS/no-reload/no-reload.min.js"></script>
  <script type="text/javascript" src="app.js"></script>
</head>
<body>
</body>
</html>
```
