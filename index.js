'use strict'

const abem = require('abem')

const PRIMITIVE_TYPES = ['NullLiteral', 'BooleanLiteral', 'NumericLiteral', 'StringLiteral']

module.exports = function (base) {
  const t = base.types

  const ast = obj => {
    switch (typeof obj) {
      case 'string':
        return t.StringLiteral(obj)
      case 'object':
        return t.ObjectExpression(
          Object.keys(obj)
            .filter(k => obj[k] !== undefined)
            .map(k => t.ObjectProperty(t.Identifier(k), ast(obj[k])))
        )
    }
  }

  const requireAbem = (abemFunc, abemSpecifier, opts) => {
    opts = ast(opts || {})

    return [
      t.ImportDeclaration([t.ImportDefaultSpecifier(abemSpecifier)], t.StringLiteral('abem')),
      t.VariableDeclaration('const', [t.VariableDeclarator(abemFunc, t.CallExpression(abemSpecifier, [opts]))])
    ]
  }

  const extractArgs = attrs => {
    let onRuntime = false
    const args = attrs.map(attr => {
      switch (attr.type) {
        case 'NullLiteral':
          return null
        case 'StringLiteral':
          return attr.value
        case 'ArrayExpression':
          return attr.elements.map(e => (PRIMITIVE_TYPES.includes(e.type) ? e.value : (onRuntime = true)))
        case 'ObjectExpression':
          return attr.properties.reduce((h, prop) => {
            if (prop.type === 'ObjectProperty' && prop.key && prop.value && PRIMITIVE_TYPES.includes(prop.value.type)) {
              h[prop.key.name] = prop.value.value
            } else {
              onRuntime = true
            }
            return h
          }, {})
      }
      onRuntime = true
    })
    return onRuntime ? { onRuntime } : { onRuntime, args }
  }

  const callAbem = (abemFunc, attrs, _abem, use) => {
    for (let i = 0; i < attrs.length; i++) {
      if (attrs[i] === undefined) {
        attrs[i] = t.NullLiteral()
      }
    }

    const values = extractArgs(attrs)
    if (values.onRuntime) {
      use.flag = true
      return t.JSXAttribute(t.JSXIdentifier('className'), t.JSXExpressionContainer(t.CallExpression(abemFunc, attrs)))
    }
    return t.JSXAttribute(t.JSXIdentifier('className'), t.stringLiteral(_abem.apply(null, values.args)))
  }

  const getScopeName = scope => {
    let name
    if (
      scope.block &&
      scope.block.type === 'ArrowFunctionExpression' &&
      scope.parentBlock &&
      scope.parentBlock.type === 'VariableDeclarator'
    ) {
      name = scope.parentBlock.id.name
    } else if (scope.parent && scope.parent.block && scope.parent.block.type === 'ClassDeclaration') {
      name = scope.parent.block.id.name
    } else {
      return null
    }
    return name.length > 1 &&
      'AMO'.includes(name.charAt(0).toUpperCase()) &&
      name.charAt(1).toUpperCase() === name.charAt(1)
      ? (name.charAt(0) + '-' + name.charAt(1)).toLowerCase() + name.slice(2)
      : name.charAt(0).toLowerCase() + name.slice(1)
  }

  const readAttributes = (path, properties) => {
    const paths = []
    const attrs = []
    const attributes = path.node.openingElement.attributes
    let classPresent = false

    const readAttribute = (name, value, p) => {
      switch (name) {
        case properties.block:
        case properties.element:
          if (!t.isStringLiteral(value)) {
            throw p.buildCodeFrameError('Attribute value must be a string')
          }
          paths.push(p)
          attrs[+(name === properties.element)] = value
          break
        case properties.modifiers:
        case properties.mixin:
          if (t.isJSXExpressionContainer(value)) {
            value = value.expression
          }
          paths.push(p)
          attrs[2 + (name === properties.mixin)] = value
          break
        case 'className':
          return false
      }
      return true
    }

    for (let i = 0, len = attributes.length; i < len; i++) {
      if (attributes[i].type === 'JSXSpreadAttribute') {
        path.get('openingElement.attributes.' + i).traverse({
          ObjectProperty (propPath) {
            const prop = propPath.node
            if (!readAttribute(prop.key.name, prop.value, propPath)) classPresent = true
          }
        })
        continue
      }

      const name = attributes[i].name.name
      const value = attributes[i].value
      const p = path.get('openingElement.attributes.' + i)

      if (!readAttribute(name, value, p)) classPresent = true
    }
    return classPresent ? null : { paths, attrs }
  }

  const mutateAttributes = (path, attributes, abemFunc, _abem, use) => {
    path.get('openingElement').pushContainer('attributes', callAbem(abemFunc, attributes.attrs, _abem, use))
    attributes.paths.forEach(path => path.remove())
  }

  const JSXChildElementVisitor = {
    JSXElement (path) {
      const properties = this.properties
      const attributes = readAttributes(path, properties)
      if (attributes === null || !attributes.attrs.length) return

      const attrs = attributes.attrs
      if (attrs[0]) {
        throw path.buildCodeFrameError('Block definition must be in the root JSXElement')
      }
      if (!attrs[1]) {
        throw path.buildCodeFrameError('Element must be specified')
      }
      attrs[0] = this.block
      mutateAttributes(path, attributes, this.abemFunc, this._abem, this.use)
    }
  }

  const JSXRootElementVisitor = {
    JSXElement (path) {
      if (t.isJSXElement(path.parent)) return

      const properties = this.properties
      const attributes = readAttributes(path, properties)
      if (attributes === null) return

      const attrs = attributes.attrs
      if (!attrs[0]) {
        const sname = getScopeName(path.scope)
        if (sname) {
          attrs[0] = t.StringLiteral(sname)
        } else {
          if (attrs.length) {
            throw path.buildCodeFrameError('Block must be specified')
          }
          return
        }
      }

      const abemFunc = this.abemFunc
      const _abem = this._abem
      const use = this.use

      mutateAttributes(path, attributes, abemFunc, _abem, use)
      path.traverse(JSXChildElementVisitor, { abemFunc, properties, block: attrs[0], _abem, use })
    }
  }

  return {
    visitor: {
      Program (path, state) {
        const abemFunc = path.scope.generateUidIdentifier('_abem')
        const abemSpecifier = path.scope.generateUidIdentifier('abem')
        const abemOpts = state.opts.separators ? { separators: state.opts.separators } : null
        const properties = Object.assign(
          {
            block: 'block',
            element: 'elem',
            modifiers: 'mods',
            mixin: 'mix'
          },
          state.opts.properties || {}
        )
        const use = { flag: false }
        const _abem = abem(abemOpts)
        path.traverse(JSXRootElementVisitor, { abemFunc, properties, use, _abem })
        if (use.flag) {
          path.unshiftContainer('body', requireAbem(abemFunc, abemSpecifier, abemOpts))
        }
      }
    },
    inherits: require('babel-plugin-syntax-jsx')
  }
}
