#!/usr/bin/env node
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


import * as commander from 'commander';

const VALID_COMMANDS = {
  'init': {
    desc: 'Initialize react-mvi application with interaction.'
  },
  'new': {
    desc: 'Initialize react-mvi application with command line options.'
  },
  'update': {
    desc: 'Update react-mvi module.'
  },
  'build': {
    desc: 'Build your application.'
  },
  'test': {
    desc: 'Unit test your application.'
  },
  'dev': {
    desc: 'Start dev server.'
  },
  'install': {
    args: '<modules...>',
    desc: 'Install module with specified package maanger.',
    alias: 'i'
  }
};

function createCommand() {
  for (const cmdName in VALID_COMMANDS) {
    const { desc, args, alias } = VALID_COMMANDS[cmdName];
    const next = commander.command(`${cmdName}${args ? ` ${args}` : ''}`, desc);
    if (alias) {
      next.alias(alias);
    }
  }

  return commander;
}

commander
  .option('--no-color', 'Disable terminal color.');

createCommand()
  .allowUnknownOption(false)
  .action(name => {
    if (name !== 'help' && !VALID_COMMANDS[name]) {
      console.log(`\n${name} is not a valid rmvi command. See rmvi --help\n`);
    }
  })
  .parse(process.argv);
