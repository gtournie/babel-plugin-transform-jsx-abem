# babel-plugin-transform-jsx-abem

[![Build Status](https://travis-ci.org/gtournie/babel-plugin-transform-jsx-abem.svg?branch=master)](https://travis-ci.org/gtournie/babel-plugin-transform-jsx-abem)
[![Coverage Status](https://coveralls.io/repos/github/gtournie/babel-plugin-transform-jsx-abem/badge.svg?branch=master)](https://coveralls.io/github/gtournie/babel-plugin-transform-jsx-abem?branch=master)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm downloads](https://img.shields.io/npm/dm/babel-plugin-transform-jsx-abem.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-transform-jsx-abem)

[Babel](https://babeljs.io/) plugin for [ABEM](https://css-tricks.com/abem-useful-adaptation-bem/) class names generation in [JSX](https://facebook.github.io/react/docs/introducing-jsx.html).

## Install

Require it as any other babel plugin and add the `abem` package to your `dependencies` (so Webpack/Rollbar/etc. can use it in the frontend).

```bash
$ npm install babel-plugin-transform-jsx-abem --save-dev
$ npm install abem --save
```

```js
{
  plugins: ['transform-jsx-abem']
}
```

## Usage

Add ABEM properties in your tags and the plugin will generate the `className` for you.

The plugin will try to resolve the className during the compilation (`className="block"`) and fallback to runtime if not possible (`className={_abem("block")}` - helper will be included automatically)

**If the tag already have a className, then it'll be skipped.**

### Properties

| name  | type                                     |
| :---- | :--------------------------------------- |
| block | string                                   |
| elem  | string                                   |
| mods  | string \| array \| object \| expression* |
| mix   | string \| array \| object \| expression* |

\* must return a string, an array or an object

### Scopes

The `block` property creates a scope and should only be used at the top-level of the JSX tag. It will be automatically generated if it's inside a class or a named function (if the class/function name is prefixed by a A, O or M, then it'll add the prefix 'a-', 'o-', or 'm-')

### Examples

**Input**
```js
<div block="m-main" mix="panel" mods={{ warning: true }}>
  <div elem="header" mods="header">Title</div>
  <div elem="body">Text</div>
</div>
```
**Output**
```js
<div className="m-main -warning panel">
  <div className="m-main__header -header">Title</div>
  <div className="m-main__body">Text</div>
</div>
```

**Input**
```js
const Message = ({ title, text}) => {
  return <div>
    <div elem="header">{ title }</div>
    <div elem="body">{ text }</div>
  </div>
}
```
**Output**
```js
const Message = ({ title, text }) => {
  return <div className="message">
    <div className="message__header">{title}</div>
    <div className="message__body">{text}</div>
  </div>;
};
```

**Input**
```js
class OMessage extends Component {
  ...
  render() {
    ...
    return <div mods={this.getMods()}>
      <div elem="header">{ title }</div>
      <div elem="body">{ text }</div>
    </div>
  }
}
```
**Output**
```js
class OMessage extends Component {
  ...
  render() {
    ...
    return <div className={_abem("o-message", null, this.getMods())}>
      <div className="o-message__header">{title}</div>
      <div className="o-message__body">{text}</div>
    </div>;
  }
}
```

## Options

### properties

Set custom naming properties. Default values:
```js
properties: {
  block: 'block',
  element: 'elem',
  modifiers: 'mods',
  mixin: 'mix'
}
```

### separators

Set custom abem separators. Default values:
```js
separators: {
  element: '__',
  modifier: '-',
}
```
