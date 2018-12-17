/**
 * @fileoverview
 * @author Taketoshi Aono
 */


import * as React from 'react';
import {
  Observable
} from 'rxjs/Rx';
import {
  store,
  intent,
  connect,
  registerHandlers
} from '@react-mvi/core';
import {
  HttpHandler,
  HttpMethod,
  ResponseType
} from '@react-mvi/http';


@intent
class Intent {
  plus() {
    return this.intent.for('counter::plus').share();
  }

  minus() {
    return this.intent.for('counter::minus').share();
  }

  saved() {
    return this.http.for('counter::save').share();
  }
}


@store
class HttpStore {
  initialize() {
    return {
      http: {
        'counter::save': this.intent.counterStream.map(counterValue => ({
          url: '/count',
          method: HttpMethod.POST,
          json: true,
          responseType: ResponseType.JSON,
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            count: counterValue
          }
        }))
      }
    };
  }
}


class ViewStore {
  initialize() {
    return {
      view: {
        counter: this.intent.for('counter::plus').mapTo(1)
          .merge(this.intent.for('counter::minus').mapTo(-1))
          .scan((acc, e) => {
            return acc + e;
          }, 0)
      }
    };
  }
}


registerHandlers({
  http: new HttpHandler()
});


@connect({
  mapIntentToProps(intent) {
    return {
      onPlus: intent.callback('counter::plus'),
      onMinus: intent.callback('counter::minus'),
    }
  }
})
class View extends React.Component {
  render() {
    return (
      <div>
        <button onClick={this.props.onPlus}>Plus</button>
        <button onClick={this.props.onMinus}>Minus</button>
        <T.Div>conter value is {this.props.counter}</T.Div>
      </div>
    );
  }
}

render(
  <Provider intent={Intent} store={[HttpStore, ViewStore]}><View /></Provider>,
  document.querySelector('#app')
);
