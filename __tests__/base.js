'use strict'

const c = require('./common')
const assert = require('assert')

describe('base', function () {
  it('should generate the className', function () {
    assert.strictEqual(c.getCode('<div />;'), '<div />;')
    assert.strictEqual(c.getCode('<div block="block" />;'), '<div className="block" />;')
    assert.strictEqual(c.getCode('<div block="block" className="name" />;'), '<div block="block" className="name" />;')
    assert.strictEqual(c.getCode('<div block="block" elem="element" />;'), '<div className="block__element" />;')
    assert.strictEqual(
      c.getCode('<div block="block" elem="element" mods="mod" />;'),
      '<div className="block__element -mod" />;'
    )
    assert.strictEqual(
      c.getBody('<div block="block" elem="element" mods={ cbmod() } />;'),
      '<div className={_abem("block", "element", cbmod())} />;'
    )
    assert.strictEqual(
      c.getCode('<div block="block" elem="element" mods={{ foo: true, bar: false }} />;'),
      '<div className="block__element -foo" />;'
    )
    assert.strictEqual(
      c.getCode('<div block="block" elem="element" {...{ mods: "mod", foo: "bar" }} />;'),
      '<div {...{ foo: "bar" }} className="block__element -mod" />;'
    )
    assert.strictEqual(
      c.getCode('<div block="block" elem="element" {...{ mods: "mod", className: "bar" }} />;'),
      '<div block="block" elem="element" {...{ mods: "mod", className: "bar" }} />;'
    )
    assert.strictEqual(
      c.getBody('<div block="block" elem="element" {...{ mods: cbmod(), foo: "bar" }} />;'),
      '<div {...{ foo: "bar" }} className={_abem("block", "element", cbmod())} />;'
    )
    assert.strictEqual(
      c.getBody('<div block="block" elem="element" {...{ mods: cbmod(), foo: "bar" }} {...{ mods: cbmod2() }} />;'),
      '<div {...{ foo: "bar" }} {...{}} className={_abem("block", "element", cbmod2())} />;'
    )
    assert.strictEqual(
      c.getCode('<div block="block" elem="element" mix="mix" />;'),
      '<div className="block__element mix" />;'
    )
    assert.strictEqual(
      c.getCode('<div block="block" mix={ ["mix1", "mix2"] } />;'),
      '<div className="block mix1 mix2" />;'
    )
    assert.strictEqual(
      c.getBody('<div block="block" mix={ ["mix1", cbmod()] } />;'),
      '<div className={_abem("block", null, null, ["mix1", cbmod()])} />;'
    )
  })
})
