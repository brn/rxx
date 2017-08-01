/**
 * @fileoverview react-mvi generated store TEST.
 */


import {
  Prepared,
  prepareTest
} from '@react-mvi/testing';
import {
  Observable
} from 'rxjs/Rx';
import {
  AppStore
} from '../store';
import {
  AppIntent
} from '../../intents/intent';
import {
  expect
} from 'chai';


describe('AppStore', () => {
  let prepared: Prepared<{view: {greeting: Observable<string>}}>;
  beforeEach(() => {
    prepared = prepareTest(AppIntent, AppStore);
  });

  describe('initialize().view.greeting', () => {
    it('should send greet to stream.', done => {
      const { store, mock } = prepared;
      const { greeting } = store.initialize().view;
      greeting.skip(1).subscribe(v => {
        expect(v).to.be.eq('Hello World!');
        done();
      });
      mock.send('onMounted', {});
    });
  });
});
