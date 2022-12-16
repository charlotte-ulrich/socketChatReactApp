import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const client = new W3CWebSocket('wss://tso-take-home-chat-room.herokuapp.com');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      username: '',
      wordCount: {},
    };

    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.extractUsername = this.extractUsername.bind(this);
    this.countWords = this.countWords.bind(this);
  }

  extractUsername(data) {
    const username = data.substring(0, data.indexOf(':'));
    this.setState({ username: username });
  }

  scrollToBottom() {
    const scrollHeight = this.messageList.scrollHeight;
    const height = this.messageList.clientHeight;
    const maxScrollTop = scrollHeight - height;
    this.messageList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }

  countWords(message, username) {
    let name = message.data.substring(0, message.data.indexOf(':'));
    let array = message.data
      .substring(message.data.indexOf(': ') + 2, message.data.length - 1)
      .split(' ');

    let count = 0;
    if (this.state.wordCount[name]) {
      count = this.state.wordCount[name];
      this.setState((prevState) => {
        let wordCount = Object.assign({}, prevState.wordCount);
        wordCount[name] = count + array.length;
        return { wordCount };
      });
    } else {
      this.setState((prevState) => {
        let wordCount = Object.assign({}, prevState.wordCount);
        wordCount[name] = array.length;
        return { wordCount };
      });
    }
  }

  componentWillMount() {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      console.log(message);
      this.setState({ messages: [...this.state.messages, message.data] });
      this.extractUsername(message.data);
      this.countWords(message, this.state.username);
    };
  }

  render() {
    const wordCount = this.state.wordCount;
    let keys;
    let values;
    if (wordCount) {
      keys = Object.keys(this.state.wordCount);
      values = Object.values(this.state.wordCount);
    }
    return (
      <div>
        <h1>Practical Intro To WebSockets.</h1>
        <div>{/* add count here */}</div>
        <div
          className="chat-messages"
          ref={(div) => {
            this.messageList = div;
          }}
        >
          <div id="messages">
            {this.state.messages.map((rec, i) => (
              <p key={i}>{rec}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
