(function($) {

  // only for webkit
  // see 

  if(!$.browser.webkit) {
    $.fn.fixSVGStack = function() { return this; };
    $.fn.fixSVGStackBackground = function() { return this; };
    return;
  }

  var USE_DIRTY_CSS_CONTENT_HACK = true;

  
  var Base64 = {

  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  // public method for encoding
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

  // private method for UTF-8 encoding
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

  function getDataUriFromStack(url, cb) {
    var parts = url.split('#');
    if(parts.length !== 2) {
      cb(null);
    }
    $.ajax({
        url: parts[0],
        dataType: 'text'
      })
      .done(function(xmlText, status, res) {
        var xml = (new window.DOMParser()).parseFromString(xmlText, "text/xml")
        var svg = xml.getElementById(parts[1]);
        var svgString = (new XMLSerializer()).serializeToString(svg);
        var dataURI = 'data:image/svg+xml;charset=utf-8;base64,' + Base64.encode(svgString);
        cb(dataURI);
      });
  }

  $.fn.fixSVGStackBackground = function() {
    // only works for inline style definitions
    this.each(function() {
      
      var $el = $(this);
      
      //
      // strange:
      // jquery $el.css('background-image') returns url without #target
      // getComputedStyle($el[0], null).backgroundImage also without #target;
      // only inline styles work
      //
      var url = $el[0].style.backgroundImage.slice(4, (- 1)).replace(/["']/g, '');

      //
      // therefore I created a dirty css hack
      // .classname {
      //   background: transparent url('stack.svg#SVG') no-repeat top left;
      //   content: 'stack.svg#SVG'; /* use content to pass url to webkit fixSVGStackBackground */
      // }
      //
      if(USE_DIRTY_CSS_CONTENT_HACK) {
        // dirty: read url form content
        var style = getComputedStyle($el[0], null);
        if(style.backgroundImage.indexOf('.svg') !== -1 && style.content.indexOf('.svg#') !== -1) {
          url = style.content.replace(/["']/g, '');
        }
      }

      if(url.indexOf('.svg#') === -1) {
        return;
      }

      getDataUriFromStack(url, function(dataUri) {
        $el.css('background-image', 'url(' + dataUri + ')');
      });

    });
    return this;
  };

  $.fn.fixSVGStack = function() {
    this.each(function() {
      
      var $el = $(this);
      var url = $el.attr('src');

      if(url.indexOf('.svg#') === -1) {
        return;
      }
      getDataUriFromStack(url, function(dataUri) {
        $el.attr('src', dataUri);
      });
    });
    return this;
  };

})(jQuery);