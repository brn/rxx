import * as React from 'react';
import {
  Observable
} from 'rxjs/Rx';
import {
  createModule,
  component,
  IOResponse,
  Tags as T,
  run,
  service,
  HttpMethod,
  ResponseType
} from '@react-mvi/core'
import {
  EventDispatcher
} from '@react-mvi/event'
import {
  HttpRequest,
  HttpResponse
} from '@react-mvi/http'


class Repository {
  public getCounterRequest(counterStream: Observable<number>) {
    return counterStream.map(counterValue => ({
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
    }));
  }
}


class UseCase {
  public getCounterValue(event: IOResponse) {
    return event.for('counter::plus').mapTo(1)
      .merge(event.for('counter::minus').mapTo(-1))
      .scan((acc: number, e: number) => {
        return acc + e;
      }, 0)
  }
}


const Service = service(({http, event}: {[key: string]: IOResponse}, injector) => {
  const repository = injector.get('repository');
  const usecase = injector.get('usecase');
  const counterRequest = repository.getCounterRequest(usecase.getCounterValue(event));
  return {
    http: {
      'counter::mutate': counterRequest.publish()
    },
    view: {
      counter: http.for<HttpResponse<{count: number}, void>>('counter::mutate').map(e => e.response.count).startWith(0).publish()
    }
  }
});


const module = createModule(config => {
  config.bind('http').to(HttpRequest);
  config.bind('event').to(EventDispatcher);
  config.bind('usecase').to(UseCase);
  config.bind('repository').to(Repository);
  config.bind('aService').toInstance(Service);
});


const View = component((props: {counter: Observable<number>}, context) => {
  return (
    <div>
      <button onClick={context.io.event.asc('counter::plus')}>Plus</button>
      <button onClick={context.io.event.asc('counter::minus')}>Plus</button>
      <T.Div>conter value is {props.counter}</T.Div>
    </div>
  )
});

run({component: View, modules: [module]}, document.querySelector('#app'));
