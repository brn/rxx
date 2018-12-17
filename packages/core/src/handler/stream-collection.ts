/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import { Subject } from 'rxjs';

export interface StreamCollection {
  /**
   * Check whether Subject was defined with specific key that except global key or not.
   * @param key Subject name.
   * @return True if Subject was defined.
   */
  hasWithoutGlobal(key: string): boolean;

  /**
   * Check whether Subject was defined with specific key or not.
   * @param key Subject name.
   * @return True if Subject was defined.
   */
  has(key: string): boolean;

  /**
   * Get Subject by specific key that except global key.
   * @param key Subject name.
   * @returns Registered Subject.
   */
  getWithoutGlobal(key: string): Subject<any>;

  /**
   * Get Subject by specific key.
   * @param key Subject name.
   * @param create Create stream if not exists.
   * @returns Registered Subject.
   */
  get(key: string, create?: boolean): Subject<any>[];

  /**
   * Append new Subject.
   * @param key Subject name.
   * @returns Registered Subject.
   */
  add<T>(key: string): Subject<T>;
}
