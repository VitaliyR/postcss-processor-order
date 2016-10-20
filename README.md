# PostCSS Processor Order [![Build Status][ci-img]][ci]

[PostCSS] plugin for sorting processors passed to postcss.

Because you really want to forget about plugins priority and add processors in any order.
You want to write CSS but not think how to built your preprocessor from the bricks.
The only requirement that this plugin should be first processor passed to PostCSS.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/VitaliyR/postcss-processor-order.svg
[ci]:      https://travis-ci.org/VitaliyR/postcss-processor-order

```js
/* Input example */
require('postcss-processor-order')(),
require('postcss-each')(),
require('postcss-inline-svg')(),
require('stylelint')(),
require('postcss-nested')(),
require('postcss-partial-import')(),
require('postcss-svgo')(),
```

```js
/* Output example */
require('postcss-processor-order')(),
require('postcss-partial-import')(),
require('postcss-each')(),
require('postcss-nested')(),
require('postcss-inline-svg')(),
require('postcss-svgo')(),
require('stylelint')()

```

## Install
```bash
npm i postcss-processor-order --save
```

## Usage

```js
postcss([ require('postcss-processor-order')(opts) ])
```

See [PostCSS] docs for examples for your environment.

## Options

* `order` *{Array}* priority of plugins. By default it uses params from `config.js`

## Contributing

There are a lot of PostCSS plugins and, I'm sure, you even not aware about half of them.
I'm extending this priority list with plugins when I reach them in my code.

So, if you faster than me, please, send me your PR with modified version of `config.js` where you add new plugins.

Don't forget to run `npm test` before commit.
