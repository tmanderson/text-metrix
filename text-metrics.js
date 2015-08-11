(function() {
  'use strict';

  var ref = document.createElement('span');
  var cvs = document.createElement('canvas');
  var ctx = cvs.getContext('2d');
  var font = getComputedStyle(document.body, null).font;
  var defaultBox, X;
  
  ref.setAttribute('style', 'display:inline-block;opacity:0;position:absolute;');
  document.body.appendChild(ref);
  
  function drawBoxes(metrics) {
    var lw = 1;

    ctx.strokeStyle ='red';
    ctx.lineWidth = lw;

    ctx.strokeRect(
      metrics.left - lw,
      metrics.top - lw,
      metrics.width + lw * 2,
      metrics.height + lw * 2
    );
  }

  function getBoxSize(text) {
    var el = ref;

    if(text instanceof HTMLElement) {
      el = text;
    }
    else {
      el.innerHTML = text;  
    }

    return {
      height: el.offsetHeight,
      width: el.offsetWidth + 2
    };
  }

  function measureText(text, box) {
    var pixels, data, x, y, yi, i, c;
    var metrix = { left: 0, right: 0, bottom: 0, top: 0 };

    cvs.height  = box && box.height || defaultBox.height;
    cvs.width   = box && box.width  || defaultBox.width;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cvs.width * 2, cvs.height);
    ctx.fillStyle = 'black';

    ctx.font = font;
    ctx.textBasline = 'middle';
    ctx.fillText(text, 2, cvs.height/2);

    //  start high, slowly close in on our boundaries...
    metrix.left = cvs.width;
    metrix.top  = cvs.height;

    pixels = ctx.getImageData(0, 0, cvs.width, cvs.height);
    data = pixels.data;

    for(y = 0; y < cvs.height; y++) {
      yi = y * cvs.width * 4;
      for(x = 0; x < cvs.width; x++) {
        i = (yi + x * 4);
        c = data[i];

        if(c < 10 && data[i+1] < 10 && data[i+2] < 10 && data[i+3] >= 200) {
          if(x < metrix.left) metrix.left = x;
          if(x > metrix.right) metrix.right = x;
          if(y < metrix.top) metrix.top = y;
          if(y > metrix.bottom) metrix.bottom = y;
        }
      }
    }

    metrix.height = metrix.bottom - metrix.top;
    metrix.width  = metrix.right - metrix.left;

    if(X) metrix.depth = (X.bottom - metrix.bottom);

    return metrix;
  }

  // set reference sizes
  defaultBox = getBoxSize('M', font);
  X = measureText('x');
  
  (this || window).TextMetrix = {
    //  General `measure`, given an HTMLElement with text, or String
    measure: measureText,
    measureElement: function(el, debug) {
      var metrix = measureText(el.textContent, getBoxSize(el));
      font = getComputedStyle(el, null).font;

      if(debug) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        drawBoxes(metrix);

        el.style.backgroundImage = 'url(' + cvs.toDataURL('image/png', 1) + ')';
        el.style.backgroundPosition = [-2, 9].join('px ') + 'px';
        el.style.backgroundRepeat = 'no-repeat';
      }

      return metrix;
    }
  };
})();
