'use strict'

const c = require('./common')
const assert = require('assert')

describe('nested', function () {
  it('should generate the className in nested blocks', function () {
    assert.strictEqual(
      c.getBody(
        `<div block="message">
  <h1 elem="title">{ title }</h1>
  <div elem="message" mods={{ error }}>{ message }</div>
</div>;`
      ),
      `<div className="message">
  <h1 className="message__title">{title}</h1>
  <div className={_abem("message", "message", { error })}>{message}</div>
</div>;`
    )

    assert.strictEqual(
      c.getCode(
        `<div block="time">
  <span></span>
  { time }
</div>;`
      ),
      `<div className="time">
  <span></span>
  {time}
</div>;`
    )
  })
})
