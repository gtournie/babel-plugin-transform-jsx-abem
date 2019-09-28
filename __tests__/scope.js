'use strict'

const c = require('./common')
const assert = require('assert')

describe('scope', function () {
  it('should automatically use Element name as block name', function () {
    assert.strictEqual(
      c.getBody(
        `class Message extends React.Component {
  render() {
    const { title, message, error } = this.props;
    return <div>
      <h1 elem="title">{ title }</h1>
      <div elem="msg" mods={{ error }}>{ message }</div>
    </div>;
  }
}`
      ),
      `class Message extends React.Component {
  render() {
    const { title, message, error } = this.props;
    return <div className="message">
      <h1 className="message__title">{title}</h1>
      <div className={_abem("message", "msg", { error })}>{message}</div>
    </div>;
  }
}`
    )

    assert.strictEqual(
      c.getBody(
        `const Message = ({ title, message, error }) => {
  return <div>
    <h1 elem="title">{ title }</h1>
    <div elem="msg" mods={{ error }}>{ message }</div>
  </div>;
};`
      ),
      `const Message = ({ title, message, error }) => {
  return <div className="message">
    <h1 className="message__title">{title}</h1>
    <div className={_abem("message", "msg", { error })}>{message}</div>
  </div>;
};`
    )

    assert.strictEqual(
      c.getBody(
        `function Message({ title, message, error }) {
  return <div>
    <h1 elem="title">{ title }</h1>
    <div elem="msg" mods={{ error }}>{ message }</div>
  </div>;
};`
      ),
      `function Message({ title, message, error }) {
  return <div className="message">
    <h1 className="message__title">{title}</h1>
    <div className={_abem("message", "msg", { error })}>{message}</div>
  </div>;
};`
    )

    assert.strictEqual(
      c.getBody(
        `const Wrapper = () => <div></div>;
const Message = ({ title, message, error }) => {
  return <Wrapper>
    <div>
      <h1 elem="title">{ title }</h1>
      <div elem="msg" mods={{ error }}>{ message }</div>
    </div>
  </Wrapper>;
};`
      ),
      `const Wrapper = () => <div className="wrapper"></div>;
const Message = ({ title, message, error }) => {
  return <Wrapper>
    <div className="message">
      <h1 className="message__title">{title}</h1>
      <div className={_abem("message", "msg", { error })}>{message}</div>
    </div>
  </Wrapper>;
};`
    )

    assert.strictEqual(
      c.getCode(
        `const Time = ({ time }) => {
  return <div>
    <span></span>
    {time}
  </div>;
};`
      ),
      `const Time = ({ time }) => {
  return <div className="time">
    <span></span>
    {time}
  </div>;
};`
    )

    assert.strictEqual(
      c.getCode('const OTest = ({ test }) => <div>{test}</div>;'),
      'const OTest = ({ test }) => <div className="o-test">{test}</div>;'
    )
    assert.strictEqual(
      c.getCode('const ATest = ({ test }) => <div>{test}</div>;'),
      'const ATest = ({ test }) => <div className="a-test">{test}</div>;'
    )
    assert.strictEqual(
      c.getCode('const MTest = ({ test }) => <div>{test}</div>;'),
      'const MTest = ({ test }) => <div className="m-test">{test}</div>;'
    )
  })
})
