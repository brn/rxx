/**
 * @fileoverview
 * @author Taketoshi Aono
 */


import * as React from 'react';
import {
  render
} from 'react-dom';
import {
  Observable
} from 'rxjs/Rx';
import {
  connect,
  HandlerResponse,
  intent,
  registerHandlers,
  Provider,
  Store,
  store,
  Tags as T
} from '@react-mvi/core';
import {
  HttpHandler,
  HttpResponse,
  HttpMethod,
  HttpConfig,
  ResponseType
} from '@react-mvi/http';


interface ViewState {
  view: {
    counter: number;
  };
}

interface HttpState {
  http: { [key: string]: HttpConfig };
}

type ObservableViewState = {
  view: {[P in keyof ViewState['view']]: Observable<ViewState['view'][P]> };
};

type ObservableHttpState = {
  http: { [key: string]: Observable<HttpConfig> };
};


type State = ViewState & HttpState;
type ObservableState = ObservableViewState & ObservableHttpState;


@intent
class Intent {
  private http: HandlerResponse;

  private intent: HandlerResponse;

  public plus() {
    return this.intent.for<number, State>('counter::plus').share();
  }

  public minus() {
    return this.intent.for<number, State>('counter::minus').share();
  }

  public saved(): Observable<{ count: number }> {
    return this.http.for<HttpResponse<{ count: number }, void>, State>('counter::save')
      .filter(({ data }) => data.ok)
      .map(({ data }) => data.response)
      .share();
  }
}


@store
class HttpStore implements Store<ObservableHttpState> {
  private intent: Intent;

  public initialize() {
    const stream = this.intent.plus().mapTo(1)
      .merge(this.intent.minus().mapTo(-1))
      .scan((acc, next) => acc + next, 0);

    return {
      http: {
        'counter::save': stream.map(count => ({
          url: '/count',
          method: HttpMethod.POST,
          json: true,
          responseType: ResponseType.JSON,
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            count
          }
        }))
      }
    };
  }
}


@store
class ViewStore implements Store<ObservableViewState> {
  private intent: Intent;

  public initialize(): ObservableViewState {
    return {
      view: {
        counter: this.intent.saved().map(({ count }) => count)
      }
    };
  }
}

registerHandlers({ http: new HttpHandler() });


type ViewProps = {
  onPlus(): void;
  onMinus(): void;
} & ObservableViewState['view'];


const View = connect({
  mapIntentToProps(intent) {
    return {
      onPlus: intent.callback('counter::plus'),
      onMinus: intent.callback('counter::minus'),
    };
  }
})(class View extends React.Component<ViewProps, {}> {
  public render() {
    return (
      <div>
        <button onClick={this.props.onPlus}>Plus</button>
        <button onClick={this.props.onMinus}>Minus</button>
        <T.Div>conter value is {this.props.counter}</T.Div>
      </div>
    );
  }
});

render(
  <Provider intent={Intent} store={[ViewStore, HttpStore]}>
    <View />
  </Provider>, document.querySelector('#app'));
