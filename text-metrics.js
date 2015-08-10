(function() {
  'use strict';

  var PR = window.devicePixelRatio || 1;
  var cc;

  function drawBoxes(ctx, metrics) {
    var lw = 1.5;

    ctx.strokeStyle ='red';
    ctx.lineWidth = lw;

    ctx.strokeRect(
      metrics.left - lw,
      metrics.top - lw,
      metrics.width + lw * 2,
      metrics.height + lw * 2
    );
  }

  function MetricCanvas() {
    this.cvs = document.createElement('canvas');
    this.ctx = this.cvs.getContext('2d');
    
    this.x = this.measure(new TextMetrix('x'));
  }

  MetricCanvas.prototype = Object.create({
    font: null,
    content: null,

    /**
     * Resize the canvas to the appropriate size based on current font
     * and content
     */
    _resize: function() {
      this.height = this.cvs.height = this.font.lineHeight * 2;
      this.width = this.cvs.width   = this.font.size * (this.content.length || 1) * 2;
    },

    /**
     * Set or get the current font settings for the text to be measured.
     * @param  {String} family     Font family to be used for measured text
     * @param  {String} size       A relevant pixel value for text size
     * @param  {String} lineHeight A relevant factor or absolute line height (px)
     */
    _format: function(family, size, lineHeight) {
      size = size || parseFloat(getComputedStyle(document.body, null).fontSize);
      family = family || getComputedStyle(document.body, null).fontFamily;
      lineHeight = lineHeight || parseFloat(getComputedStyle(document.body, null).lineHeight);

      this.font = {
        size: size,
        family: family,
        lineHeight: lineHeight || size
      };
    },

    /**
     * Reset the canvas contents, and prepare for a new render cycle.
     */
    _refresh: function() {
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
      this.ctx.fillStyle = 'black';

      this._format();
      this._resize();
    },

    /**
     * Renders the current `content` value for measurement.
     * @param  {Boolean} debug - If true, border boxes will be rendered around
     *                           text
     */
    render: function(debug) {
      this._refresh();

      if(debug) drawBoxes(this.ctx, this.metrics);

      this.ctx.font = getComputedStyle(document.body, null).font;
      this.ctx.fillText(this.content, PR, this.font.lineHeight);
    },

    /**
     * Measures a given a set of TextMetrix. 
     * @param  {TextMetrix} metrics - The metrics object to be updated
     * @return {TextMetrix} - the newly measured values
     */
    measure: function(metrics) {

      if(!metrics && !this.metrics) return metrics;
      
      if(typeof metrics === 'string') metrics = new TextMetrix(metrics);
      metrics = (this.metrics = metrics || this.metrics);
      
      if(!metrics) return metrics;

      this.content = metrics._val;

      this.render();

      metrics.left = this.width;
      metrics.top = this.height;

      var pixels = this.ctx.getImageData(0, 0, this.width, this.height);
      var data = pixels.data;
      var x, y, yi, i, c;

      for(y = 0; y < this.height; y++) {
        yi = y * this.width * 4;
        for(x = 0; x < this.width; x++) {
          i = (yi + x * 4);
          c = data[i];

          if(c < 10 && data[i+1] < 10 && data[i+2] < 10 && data[i+3] >= 200) {
            if(x < metrics.left) metrics.left = x;
            if(x > metrics.right) metrics.right = x;
            if(y < metrics.top) metrics.top = y;
            if(y > metrics.bottom) metrics.bottom = y;
          }
        }
      }

      metrics.height = metrics.bottom - metrics.top;
      metrics.width  = metrics.right - metrics.left;

      if(this.x) metrics.depth = this.x.bottom - metrics.bottom;

      this.render(true);

      return metrics;
    },

    /**
     * Get an image of the current canvas
     * @param  {Boolean} debug - returns the image with character bounds
     * @return {String}  - the base64 image data
     */
    getImgSrc: function(debug) {
      if(debug) this.render(true);
      return this.cvs.toDataURL('image/png', 1);
    }
  });

  function TextMetrix(text) {
    this._val = text;
    this.measure = this.measure.bind(this);
  }

  TextMetrix.prototype = Object.create({
    bottom: 0,
    top: 0,
    right: 0,
    left: 0,
    depth: 0,   // beneath baseline
    height: 0,  // from ascent to baseline
    width: 0,   // left to right

    measure: function(cvs) {
      if(!cvs) cvs = new MetricCanvas();
      this.left = cvs.width;
      this.top = cvs.height;
      return cvs.measure(this);
    }
  });

  // MetricCanvas used for measurements
  cc = new MetricCanvas();
  
  (this || window).TextMetrix = {
    //  General `measure`, given an HTMLElement with text, or String
    measure: function(item) {
      if(item instanceof HTMLElement) {
        return cc.measure(new TextMetrix(item.textContent));
      }
      else if(typeof item === 'string') {
        return cc.measure(new TextMetrix(item));
      }
    },

    // Given a string, returns an inline HTMLElement with the bounds of the 
    // content rendered as a background image
    debugText: function(text) {
      var span = document.createElement('span');
      span.innerHTML = text;
      return this.debugElement(span);
    },

    //  Given an HTMLElement, renders the character bounds as a background image
    debugElement: function(htmlElement) {
      var text = htmlElement.textContent;
      var span = document.createElement('span');

      span.style.backgroundRepeat = 'no-repeat';
      span.style.backgroundPosition = '-2px 2px';
      span.style.display = 'inline-block';

      htmlElement.innerHTML = '';
      
      text.split('')
        .map(function(ch) {
          var metrics = cc.measure(new TextMetrix(ch));
          metrics._img = cc.getImgSrc(true);
          return metrics;
        })
        .map(function(metrics) {
          var el = span.cloneNode();
          el.appendChild(document.createTextNode(metrics._val));
          el.style.backgroundImage = 'url(' + metrics._img + ')';
          htmlElement.appendChild(el);
        });

      return htmlElement;
    }
  };
})();
