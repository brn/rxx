/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import { Intent } from './intent';
import { SubjectTree } from '../subject';

/**
 * Intent dispatcher interface.
 */
export interface IntentHandler {
  (key: string, args?: any): void;
  callback<Args = any>(
    key: string,
    args?: Args,
    fix?: boolean,
  ): (e?: Args) => void;
}

/**
 * Create intent handler from Intent StateHandler.
 * @param intent Intent StateHandler instance.
 * @returns IntentHandler implementation.
 */
export function generateIntentHandler(
  intent: Intent,
  subject: SubjectTree,
): IntentHandler {
  const intentCallable: any = (key: string, args: any) => {
    intent.push(key, args);
    subject.notify({ type: key, payload: args });
  };
  intentCallable.callback = (k, v, fix = false) => {
    return nv => intentCallable(k, !fix ? (nv !== undefined ? nv : v) : v);
  };

  return intentCallable;
}
