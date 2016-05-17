/**
 * @fileoverview
 * @author Taketoshi Aono
 */


export interface Filter {
  filter<T>(res: {err: any, res: Blob|FormData|string|ArrayBuffer|T}): any
}
