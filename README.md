# TextMetrix

TextMetrix analyzes any string (including `textContent`) and coughs up the
measurements for you to use at your disposal.

TextMetrix is **not** a polyfill for the `CanvasRenderingContext2d.TextMetrics`
API. TextMetrix API offers the most least specific measurements that allow for
measurement aware layouts.

## API

### `TextMetrix.measure`
Returns a `TextMetrix` instance.

```JavaScript
  var metrix = TextMetrix.measure('A');
  var metrix = TextMetrix.measure(document.querySelector('p'));
```

### `TextMetrix.debugText`
Debug a string.

```JavaScript
  TextMetrix.debugText('Hello World!');
```

### `TextMetrix.debugElement`
Debug the content within an `HTMLElement`.

```JavaScript
  TextMetrix.debugElement(document.querySelector('p'));
```

## TextMetrix
Contains the measurements of some character or string.

The following properties are available on a TextMetrix instance:
  
  | `height` | ascent to baseline          |
  | `width`  | bounding width              |
  | `descent`| from baseline to descent    |
  | `left`   | from left of character box  |
  | `right`  | from right of character box |
  | `top`    | from top of character box   |
  | `bottom` | from bottom of character box|
