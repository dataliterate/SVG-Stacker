(function($) {

  // Setup
  // ----------

  // The fix is for webkit browsers only
  // [https://bugs.webkit.org/show_bug.cgi?id=91790]()

  if(!$.browser.webkit) {
    // return functions that do nothing but support chaining
    $.fn.fixSVGStack = function() { return this; };
    $.fn.fixSVGStackBackground = function() { return this; };
    return;
  }

  // Enabled / disable support for a dirty CSS-Hack
  // if `USE_DIRTY_CSS_CONTENT_HACK` is true the following CSS enables the fix
  // – otherwise only inline styles can be fixed
  //
  // ```
  // .classname {
  //   background: transparent url('stack.svg#SVG') no-repeat top left;
  //   content: 'stack.svg#SVG'; /* use content to pass url to webkit fixSVGStackBackground */
  // }
  // ```
  //
  var USE_DIRTY_CSS_CONTENT_HACK = true;

  // The Fix
  // ----------

  // Reads SVG Stack via Ajax and returns one element as base64 encoded data-uri.
  function getdataURIFromStack(url, cb) {

    // `url` must be in the form filename.svg#id
    var parts = url.split('#');
    if(parts.length !== 2) {
      cb(null);
    }
    // Ajax request should get data from browser cache
    // (needs to be verified)
    $.ajax({
        // `parts[0]` contains filename.svg
        url: parts[0],
        // Read SVG as 'text', jQuerys XML Parsing is broken with SVGs
        dataType: 'text'
      })
      .done(function(xmlText, status, res) {
        var xml = (new window.DOMParser()).parseFromString(xmlText, "text/xml")
        // `parts[1]` contains id
        var svg = xml.getElementById(parts[1]);
        var svgString = (new XMLSerializer()).serializeToString(svg);
        var dataURI = 'data:image/svg+xml;charset=utf-8;base64,' + Base64.encode(svgString);
        cb(dataURI);
      });
  }

  // Fix for SVG Stacks in background

  $.fn.fixSVGStackBackground = function() {
    
    this.each(function() {
      
      var $el = $(this);
      
      // At the heart of the bug:
      // Both jquery's `$el.css('background-image')` and `getComputedStyle($el[0], null).backgroundImage`
      // return and url without the #target part;

      var url = $el[0].style.backgroundImage.slice(4, (- 1)).replace(/["']/g, '');

      // Here is the quick and dirty hack, if enabled

      if(USE_DIRTY_CSS_CONTENT_HACK) {
        // Read url form `style.content`, the css content property is used to transport the information
        var style = getComputedStyle($el[0], null);
        if(style.backgroundImage.indexOf('.svg') !== -1 && style.content.indexOf('.svg#') !== -1) {
          url = style.content.replace(/["']/g, '');
        }
      }

      if(url.indexOf('.svg#') === -1) {
        return;
      }

      getdataURIFromStack(url, function(dataURI) {
        // Replace background-image url with dataURI
        $el.css('background-image', 'url(' + dataURI + ')');
      });

    });
    return this;
  };

  // Fix for SVG Stacks in img Tags

  $.fn.fixSVGStack = function() {
    this.each(function() {
      
      var $el = $(this);
      var url = $el.attr('src');

      if(url.indexOf('.svg#') === -1) {
        return;
      }
      getdataURIFromStack(url, function(dataURI) {
        // Replace src with dataURI
        $el.attr('src', dataURI);
      });
    });
    return this;
  };

  // Helpers
  // ----------

  // Base64 module is used to create data urls
  // 
  // taken from
  // http://www.webtoolkit.info/javascript-base64.html
  var Base64 = {

    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    }
  }

})(jQuery);