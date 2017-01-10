# stylus-require-css-evaluator
## What it does
Adds support for requiring css files into stylus files. Example:
```
@import 'some/other/folder/file.css';
@require 'some/other/folder/file.css';
```
will yield
```
@import 'some/other/folder/file.css';
.selector-from-some-other-folder-file.css{
    content: 'the css was imported';
}

```

## How to use
```
stylus(str)
    .use(require('stylus-require-css-evaluator'))
    .render(function(err, css){
        // handle output
    });
```

## Installation
from NPM: 

`npm i stylus-require-css-evaluator`

from GitHub:

`npm i git+https://github.com/khalidhoffman/stylus-require-css-evaluator.git`
