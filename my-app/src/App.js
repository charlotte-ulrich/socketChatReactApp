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

    this.extractUsername = this.extractUsername.bind(this);
    this.countWords = this.countWords.bind(this);
  }

  extractUsername(data) {
    const username = data.substring(0, data.indexOf(':'));
    this.setState({ username: username });
  }

  countWords(message) {
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
      this.countWords(message);
    };
  }

  render() {
    const { wordCount } = this.state;
    const sorted = Object.fromEntries(
      Object.entries(wordCount).sort(([, a], [, b]) => b - a)
    );

    return (
      <div>
        <h1>Chat Counter</h1>
        <h2>Word Count</h2>
        <div>
          {wordCount ? (
            Object.keys(sorted).map((key, i) => (
              <p key={i}>
                <span>{key} </span>
                <span>{sorted[key]}</span>
              </p>
            ))
          ) : (
            <div></div>
          )}
        </div>
        <h2>Chat Messages</h2>
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
