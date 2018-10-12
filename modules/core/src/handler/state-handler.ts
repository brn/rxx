/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import { Subscription } from 'rxjs';
import {
  Handler,
  StreamStore,
  HandlerResponse,
  CutPoints,
  Advices,
} from './handler';
import { Advice, AdviceFunction, MethodInvocation } from './advice';
import { mapValues, forIn, isArray, omit, every } from '../utils';
import { IntentHandler } from '../intent/intent-handler';
import { SubjectTree } from '../subject';

/**
 * Typedef for State handler map.
 */
export type StateHandlerMap = { [key: string]: Handler };

/**
 * StateHandler Registry.
 */
let stateHandlerRegistry: StateHandlerMap = {};

/**
 * Get registered stateHandlerRegistry.
 */
export function getHandlers(): StateHandlerMap {
  return stateHandlerRegistry;
}

/**
 * Register StateHandler to handler map.
 * @param newHandlers Handler map.
 */
export function registerHandlers(
  newHandlers: StateHandlerMap,
): { [key: string]: HandlerResponse } {
  let invalidTargetKey = '';

  if (
    !every(newHandlers, (h, k: string) => {
      const result = h instanceof StateHandler;
      if (!result) {
        invalidTargetKey = k;
      }

      return result;
    })
  ) {
    throw new Error(`${invalidTargetKey} is not valid state handler.`);
  }
  const sources = (stateHandlerRegistry = {
    ...stateHandlerRegistry,
    ...newHandlers,
  });

  return mapValues(sources, (v, k) => v.response);
}

/**
 * Remove specified handler from registry.
 * @param key Key or keys of target handler.
 */
export function removeHandler(key: string | string[]) {
  stateHandlerRegistry = omit(stateHandlerRegistry, key);
}

export abstract class StateHandler implements Handler {
  /**
   * Subject for exported stream.
   */
  protected readonly store = new StreamStore();

  /**
   * Response of streams.
   */
  private readonly handlerResponse!: HandlerResponse;

  private intentHandler!: IntentHandler;

  protected state: any;

  protected subject!: SubjectTree;

  protected advices: Advices;
  protected cutPoints: CutPoints;

  public setState(state: any) {
    this.state = state;
  }

  public setIntent(intent: IntentHandler): void {
    this.intentHandler = intent;
  }

  public setSubject(subject: SubjectTree) {
    this.subject = subject;
  }

  public get intent() {
    return this.intentHandler;
  }

  public constructor(advices: Advices = {}, cutPoints: CutPoints = {}) {
    this.advices = advices;
    this.cutPoints = cutPoints;

    this.handlerResponse = new HandlerResponse(this.store);
    forIn(advices, (advice, name) => {
      let cutPoint = cutPoints[name];
      cutPoint = isArray(cutPoint) ? cutPoint : [cutPoint];
      if (!cutPoint) {
        throw new Error(`Cut point ${name} does not exists`);
      }
      cutPoint.forEach(name => {
        if (typeof this[name] !== 'function') {
          throw new Error('Advice only applyable to Function.');
        }
        const method = this[name];
        this[name] = (...args) => {
          const proceed = () => method.apply(this, args);
          const mi = new MethodInvocation(
            proceed,
            this,
            args,
            (this.constructor as any).displayName || this.constructor.name,
            name,
          );

          /*tslint:disable:no-string-literal*/
          return advice['invoke']
            ? (advice as Advice).invoke(mi, this.intent)
            : (advice as AdviceFunction)(mi, this.intent);
          /*tslint:enable:no-string-literal*/
        };
      });
    });
  }

  /**
   * @inheritDocs
   */
  public abstract subscribe(props: { [key: string]: any }): Subscription;

  /**
   * @inheritDocs
   */
  public abstract clone<T = Handler>(...args: any[]): Handler;

  /**
   * Return response representation of stream.
   * @return Representation of stream response.
   */
  public get response() {
    return this.handlerResponse;
  }

  /**
   * @inheritDocs
   */
  public abstract push(key: string, args?: any);

  /**
   * @inheritDocs
   */
  public callback<Args = any, ReturnType = any>(
    key: string,
    value?: any,
  ): (args?: Args) => Promise<ReturnType> {
    return (args?: any) => this.push(key, value !== undefined ? value : args);
  }
}
