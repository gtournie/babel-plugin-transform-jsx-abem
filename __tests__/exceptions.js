'use strict'

const c = require('./common')
const assert = require('assert')

describe('exceptions', function () {
  it('should throw an exception', function () {
    assert.throws(() => c.getCode('<div block={ block } />'), SyntaxError)
    assert.throws(() => c.getCode('<div elem="toto" />'), SyntaxError)
    assert.throws(() => c.getCode('<div block="block"><div mods="mod" /></div>'), SyntaxError)
    assert.throws(() => c.getCode('<div block="block"><div block="element"></div></div>'), SyntaxError)
  })
})
