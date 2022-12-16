import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

// access the websocket server
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
    // to store the username in the state
    const username = data.substring(0, data.indexOf(':'));
    this.setState({ username: username });
  }

  countWords(message) {
    // first, separate the username from the message
    let name = message.data.substring(0, message.data.indexOf(':'));
    // use the split() method to breack the string into an array
    let array = message.data
      .substring(message.data.indexOf(': ') + 2, message.data.length - 1)
      .split(' ');

    // start a running count of number of words send by each user
    let count = 0;
    // if the wordCount for this user has already been added to the wordCount object, add the new message to the existing number
    if (this.state.wordCount[name]) {
      count = this.state.wordCount[name];
      this.setState((prevState) => {
        let wordCount = Object.assign({}, prevState.wordCount);
        wordCount[name] = count + array.length;
        return { wordCount };
      });
      // otherwise, create a new key on the object and begin that user's word count
    } else {
      this.setState((prevState) => {
        let wordCount = Object.assign({}, prevState.wordCount);
        wordCount[name] = array.length;
        return { wordCount };
      });
    }
    // by using this method, the users are scalable, rather than hardcoding the existing users
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
    // this will sort the wordCount object by highest number of words
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
