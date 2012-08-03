var fs = require('fs')
  , path = require('path')
  , easy = require('libxmljs-easy')
  /* -- internal */
  , stack = []
  /* -- user */
  , sourceDir = path.normalize('./')
  , targetDir = null
  ;

function addToStack(file) {

  var id = path.basename(file, '.svg');
  var svgXml = fs.readFileSync(file, 'utf-8');
  var svg = easy.parse(svgXml);

  // manipulate svg
  svg.$class = 'i';
  svg.$id = id;

  stack.push({
    id: id,
    svg: svg.$.toString().replace('xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"', ''),
    w: svg.$width,
    h: svg.$height
  });
}

function outputSvg() {
  
  var svg = [];
  svg.push('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">');

  // @ see http://xn--dahlstrm-t4a.net/tmp/sharp-icons/svg-icon-target.svg
  svg.push('<style type="text/css">');
  svg.push('<![CDATA[');
  svg.push('.i { display: none; fill: #010101; }');
  svg.push('.i:target { display: block; }');
  svg.push(']]>');
  svg.push('</style>');

  // need to make same ids from different files unique
  stack.forEach(function(icon) {
    svg.push(icon.svg);  
  });
  
  svg.push('</svg>');  

  var svgText = svg.join("\n");
  
  var filename = targetDir + '/stack.svg';
  fs.writeFile(filename, svgText, function(err) {
    if (err) throw err;
    console.log("SVG Stack saved: " + filename);
  });
  
}


function readSourceDir(cb) {

  console.log("Reading " + sourceDir);

  fs.readdir(sourceDir, function(err, list) {
    if (err) throw err;

    var i = 0;
    list.forEach(function(file) {
      if(path.extname(file) != '.svg') {
        return;
      }
      file = sourceDir + '/' + file;
      addToStack(file);
      i++;
    });
    if(i == 0) {
      console.log("No SVG Files found in " + sourceDir);
      console.log("svg-stacker SRC_DIR TARGET_DIR");
    } else {
      cb();
    }
  });
}

function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

function outputHTML(demo, name) {
  var html = [];
  html.push('<html><head><title>SVG Stack</title><style>body { font-family: Helvetica; } table { width: 100%; text-align: left; }</style></head>');
  html.push('<body>');
  html.push('<h1>SVG Stack</h1>');
  html.push('<p>created with an early demo of https://github.com/preciousforever/svg-stacker</p>');
  html.push('<table>');
  html.push('<thead><tr>');
  html.push('<th>Name</th>');
  if(demo.object) {
    html.push('<th>Object</th>');
    html.push('<th>Code</th>');
  }
  if(demo.embed) {
    html.push('<th>Embed</th>');
    html.push('<th>Code</th>');
  }
  if(demo.iframe) {
    html.push('<th>IFrame</th>');
    html.push('<th>Code</th>');
  }
  if(demo.img) {
    html.push('<th>Image</th>');
    html.push('<th>Code</th>');
  }
  if(demo.background) {
    html.push('<th>Background</th>');
    html.push('<th>Code</th>');
  }
  html.push('</tr></thead>');
  html.push('<tbody>');
  stack.forEach(function(icon) {
    
    var url = 'stack.svg#' + icon.id;
    var code = '';
    html.push('<tr>');
    html.push('<td>' + icon.id + '</td>');

    if(demo.object) {
      code = '<object type="image/svg+xml" data="' + url + '" width="' + icon.w + '" height="' + icon.h + '"></object>';
      html.push('<td>' + code + '</td>');
      html.push('<td><textarea cols="40" rows="3">' + htmlEscape(code) + '</textarea></td>');
    }
    if(demo.embed) {
      code = '<embed src="' + url + '" type="image/svg+xml">';
      html.push('<td>' + code + '</td>');
      html.push('<td><textarea cols="40" rows="3">' + htmlEscape(code) + '</textarea></td>');
    }
    if(demo.iframe) {
      code = '<iframe src="' + url + '" width="' + icon.w + '" height="' + icon.h + '"></iframe>';
      html.push('<td>' + code + '</td>');
      html.push('<td><textarea cols="40" rows="3">' + htmlEscape(code) + '</textarea></td>');
    }
    if(demo.img || demo.jsfix) {
      code = '<img src="' + url + '" width="' + icon.w + '" height="' + icon.h + '">';
      html.push('<td>' + code + '</td>');
      html.push('<td><textarea cols="40" rows="3">' + htmlEscape(code) + '</textarea></td>');
    }
    if(demo.background || demo.jsfix) {
      code = '<div style="background: transparent url(' + url + ') no-repeat top left; width: ' + icon.w + '; height: ' + icon.h + ';"></div>' 
      html.push('<td>' + code + '</td>');
      html.push('<td><textarea cols="40" rows="3">' + htmlEscape(code) + '</textarea></td>');
    }
    //html.push(icon.svg);
    html.push('</tr>');
    
  });
  html.push('</tbody>');
  html.push('</table>');

  if(demo.jsfix) {
    code = [];
    code.push('<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>');
    code.push('<script src="http://preciousforever.github.com/SVG-Stacker/fixsvgstack.jquery.js"></script>');
    code.push('<script>');
    code.push('(function($) {');
      code.push("\t" + '$(document).ready(function() {');
        code.push("\t\t" + "$('div').fixSVGStackBackground();");
        code.push("\t\t" + "$('img').fixSVGStack();");
      code.push("\t" + '});');
    code.push('})(jQuery);');
    code.push('</script>');
    var codeText = code.join("\n");
    html.push(codeText);
    html.push('<td><textarea cols="40" rows="3">' + htmlEscape(codeText) + '</textarea></td>');
  }

  html.push('</body>');
  html.push('</html>');
  
  var htmlText = html.join("\n");
  
  var filename = targetDir + '/stack-demo-' + name + '.html';
  fs.writeFile(targetDir + '/stack-demo-' + name + '.html', htmlText, function(err) {
    if (err) throw err;
    console.log("HTML-Demo saved: " + filename);
  });
}


// read command line arguments
if(process.argv.length == 4) {
  sourceDir = path.normalize(process.argv[2]);
  targetDir = path.normalize(process.argv[3]);
} else if (process.argv.length == 3) {
  sourceDir = path.normalize(process.argv[2]);
}

if(targetDir == null) {
  targetDir = sourceDir + '/stack';
}

// create target directory
if (!path.existsSync(targetDir)) {
  fs.mkdirSync(targetDir);
}

readSourceDir(function() {

  outputSvg();

  outputHTML({background: true}, 'background');
  outputHTML({object: true}, 'object');
  outputHTML({embed: true}, 'embed');
  outputHTML({iframe: true}, 'iframe');
  outputHTML({img: true}, 'img');
  outputHTML({jsfix: true}, 'jsfix');
  outputHTML({object: true, embed: true, iframe: true, background: true, img: true}, 'all');

});