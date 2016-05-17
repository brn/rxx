// -*- mode: typescript -*-
/**
 * @fileoverview
 * @author Taketoshi Aono
 */

/// <reference path="typings/browser.d.ts"/>


declare namespace Cookies {
  export interface CookiesStatic {
    withConverter(converter: {read(value: string, name: string): string, wirte(value: string, name: string): string}): CookiesStatic;
  }
}


declare module 'es6-symbol' {
  export default Symbol;
}
