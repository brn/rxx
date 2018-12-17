/**
 * The MIT License (MIT)
 * Copyright (c) Taketoshi Aono
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 *  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview 
 * @author Taketoshi Aono
 */


import {
  spawn,
  ChildProcess
} from 'child_process';

export type ProcessOut = { stderr: string; stdout: string };

export class Process {
  public static async run(cmd: string, args: string[], pipe = false): Promise<ProcessOut> {
    return new Promise<ProcessOut>((resolve, reject) => {
      /*tslint:disable:no-magic-numbers*/
      const proc = spawn(cmd, args, { stdio: pipe ? 'pipe' : 'inherit' });
      /*tslint:enable:no-magic-numbers*/
      let stdout = '';
      let stderr = '';
      if (pipe) {
        ['stdout', 'stderr'].forEach(stdio => proc[stdio].on('data', d => {
          if (stdio === 'stderr') {
            console.error(d);
            if (d) {
              stderr += d.toString('utf8');
            }
          } else if (stdio === 'stdout') {
            console.log(d);
            if (d) {
              stdout += d.toString('utf8');
            }
          }
        }));
      }
      proc.on('exit', () => {
        resolve({ stdout, stderr });
      });
      proc.on('error', e => {
        reject(e);
      });
    });
  }
}
