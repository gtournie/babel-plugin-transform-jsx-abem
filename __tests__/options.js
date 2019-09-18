'use strict'

const c = require('./common')
const assert = require('assert')

describe('options', function () {
  it('should generate the className with custom separators', function () {
    assert.strictEqual(
      c.getCode('<div block="block" elem="element" mods="mod" />;', {
        separators: { element: '___' }
      }),
      '<div className="block___element -mod" />;'
    )
    assert.strictEqual(
      c.getBody('<div block="block" elem="element" mods={ mod() } />;', {
        separators: { element: '___' }
      }),
      '<div className={_abem("block", "element", mod())} />;'
    )
  })

  it('should target custom property names', function () {
    assert.strictEqual(
      c.getCode('<div block="block" element="element" modifiers="mod" />;', {
        properties: { element: 'element', modifiers: 'modifiers' }
      }),
      '<div className="block__element -mod" />;'
    )
  })
})
