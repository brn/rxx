// -*- mode: typescript -*-
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


import * as React from 'react';
import {
  Subscriber,
  SUBSCRIBER_MARK
} from './subscriber';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  assign,
  omit
} from '../utils';


/**
 * Convert string html tag to Subscriber.
 */
const toSubscribable = (name: string) => {
  const ret = class extends React.Component<any, any> {
    public render() {
      return (
        <Subscriber ignoreSubtree={this.props.ignoreSubtree}>
          {React.createElement(name, assign(omit(this.props, ['ref', 'ignoreSubtree']), { ref: 'element' }))}
        </Subscriber>
      );
    }

    public static displayName = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  };

  ret[SUBSCRIBER_MARK] = true;

  return ret;
};


export type Observablify<T> = {[P in keyof T]?: Observable<T[P]> | Subject<T[P]> | T[P]};
export type TagsAttr<T> = Observablify<T> & { ignoreSubtree?: boolean };

export type ElementConstructor<T> = new (p: TagsAttr<T>, c: any) => React.Component<TagsAttr<T>, {}>;


/**
 * All suppoertd subscriberified tag list.
 */
export interface Tags {
  A: ElementConstructor<JSX.IntrinsicElements['a']>;
  Abbr: ElementConstructor<JSX.IntrinsicElements['abbr']>;
  Address: ElementConstructor<JSX.IntrinsicElements['address']>;
  Area: ElementConstructor<JSX.IntrinsicElements['area']>;
  Article: ElementConstructor<JSX.IntrinsicElements['article']>;
  Aside: ElementConstructor<JSX.IntrinsicElements['aside']>;
  Audio: ElementConstructor<JSX.IntrinsicElements['audio']>;
  Base: ElementConstructor<JSX.IntrinsicElements['base']>;
  Bdi: ElementConstructor<JSX.IntrinsicElements['bdi']>;
  Bdo: ElementConstructor<JSX.IntrinsicElements['bdo']>;
  Big: ElementConstructor<JSX.IntrinsicElements['big']>;
  Blockquote: ElementConstructor<JSX.IntrinsicElements['blockquote']>;
  Body: ElementConstructor<JSX.IntrinsicElements['body']>;
  Br: ElementConstructor<JSX.IntrinsicElements['br']>;
  Button: ElementConstructor<JSX.IntrinsicElements['button']>;
  Canvas: ElementConstructor<JSX.IntrinsicElements['canvas']>;
  Caption: ElementConstructor<JSX.IntrinsicElements['caption']>;
  Cite: ElementConstructor<JSX.IntrinsicElements['cite']>;
  Code: ElementConstructor<JSX.IntrinsicElements['code']>;
  Col: ElementConstructor<JSX.IntrinsicElements['col']>;
  Colgroup: ElementConstructor<JSX.IntrinsicElements['colgroup']>;
  Data: ElementConstructor<JSX.IntrinsicElements['data']>;
  Datalist: ElementConstructor<JSX.IntrinsicElements['datalist']>;
  Dd: ElementConstructor<JSX.IntrinsicElements['dd']>;
  Del: ElementConstructor<JSX.IntrinsicElements['del']>;
  Details: ElementConstructor<JSX.IntrinsicElements['details']>;
  Dfn: ElementConstructor<JSX.IntrinsicElements['dfn']>;
  Dialog: ElementConstructor<JSX.IntrinsicElements['dialog']>;
  Div: ElementConstructor<JSX.IntrinsicElements['div']>;
  Dl: ElementConstructor<JSX.IntrinsicElements['dl']>;
  Dt: ElementConstructor<JSX.IntrinsicElements['dt']>;
  Em: ElementConstructor<JSX.IntrinsicElements['em']>;
  Embed: ElementConstructor<JSX.IntrinsicElements['embed']>;
  Fieldset: ElementConstructor<JSX.IntrinsicElements['fieldset']>;
  Figcaption: ElementConstructor<JSX.IntrinsicElements['figcaption']>;
  Figure: ElementConstructor<JSX.IntrinsicElements['figure']>;
  Footer: ElementConstructor<JSX.IntrinsicElements['footer']>;
  Form: ElementConstructor<JSX.IntrinsicElements['form']>;
  H1: ElementConstructor<JSX.IntrinsicElements['h1']>;
  H2: ElementConstructor<JSX.IntrinsicElements['h2']>;
  H3: ElementConstructor<JSX.IntrinsicElements['h3']>;
  H4: ElementConstructor<JSX.IntrinsicElements['h4']>;
  H5: ElementConstructor<JSX.IntrinsicElements['h5']>;
  H6: ElementConstructor<JSX.IntrinsicElements['h6']>;
  Head: ElementConstructor<JSX.IntrinsicElements['head']>;
  Header: ElementConstructor<JSX.IntrinsicElements['header']>;
  Hgroup: ElementConstructor<JSX.IntrinsicElements['hgroup']>;
  Hr: ElementConstructor<JSX.IntrinsicElements['hr']>;
  Html: ElementConstructor<JSX.IntrinsicElements['html']>;
  I: ElementConstructor<JSX.IntrinsicElements['i']>;
  Iframe: ElementConstructor<JSX.IntrinsicElements['iframe']>;
  Img: ElementConstructor<JSX.IntrinsicElements['img']>;
  Input: ElementConstructor<JSX.IntrinsicElements['input']>;
  Ins: ElementConstructor<JSX.IntrinsicElements['ins']>;
  Kbd: ElementConstructor<JSX.IntrinsicElements['kbd']>;
  Keygen: ElementConstructor<JSX.IntrinsicElements['keygen']>;
  Label: ElementConstructor<JSX.IntrinsicElements['label']>;
  Legend: ElementConstructor<JSX.IntrinsicElements['legend']>;
  Li: ElementConstructor<JSX.IntrinsicElements['li']>;
  Link: ElementConstructor<JSX.IntrinsicElements['link']>;
  Main: ElementConstructor<JSX.IntrinsicElements['main']>;
  Map: ElementConstructor<JSX.IntrinsicElements['map']>;
  Mark: ElementConstructor<JSX.IntrinsicElements['mark']>;
  Menu: ElementConstructor<JSX.IntrinsicElements['menu']>;
  Menuitem: ElementConstructor<JSX.IntrinsicElements['menuitem']>;
  Meta: ElementConstructor<JSX.IntrinsicElements['meta']>;
  Meter: ElementConstructor<JSX.IntrinsicElements['meter']>;
  Nav: ElementConstructor<JSX.IntrinsicElements['nav']>;
  Noscript: ElementConstructor<JSX.IntrinsicElements['noscript']>;
  Object: ElementConstructor<JSX.IntrinsicElements['object']>;
  Ol: ElementConstructor<JSX.IntrinsicElements['ol']>;
  Optgroup: ElementConstructor<JSX.IntrinsicElements['optgroup']>;
  Option: ElementConstructor<JSX.IntrinsicElements['option']>;
  Output: ElementConstructor<JSX.IntrinsicElements['output']>;
  P: ElementConstructor<JSX.IntrinsicElements['p']>;
  Param: ElementConstructor<JSX.IntrinsicElements['param']>;
  Picture: ElementConstructor<JSX.IntrinsicElements['picture']>;
  Pre: ElementConstructor<JSX.IntrinsicElements['pre']>;
  Progress: ElementConstructor<JSX.IntrinsicElements['progress']>;
  Q: ElementConstructor<JSX.IntrinsicElements['q']>;
  Rp: ElementConstructor<JSX.IntrinsicElements['rp']>;
  Rt: ElementConstructor<JSX.IntrinsicElements['rt']>;
  Ruby: ElementConstructor<JSX.IntrinsicElements['ruby']>;
  S: ElementConstructor<JSX.IntrinsicElements['s']>;
  Samp: ElementConstructor<JSX.IntrinsicElements['samp']>;
  Script: ElementConstructor<JSX.IntrinsicElements['script']>;
  Section: ElementConstructor<JSX.IntrinsicElements['section']>;
  Select: ElementConstructor<JSX.IntrinsicElements['select']>;
  Small: ElementConstructor<JSX.IntrinsicElements['small']>;
  Source: ElementConstructor<JSX.IntrinsicElements['source']>;
  Span: ElementConstructor<JSX.IntrinsicElements['span']>;
  Strong: ElementConstructor<JSX.IntrinsicElements['strong']>;
  Style: ElementConstructor<JSX.IntrinsicElements['style']>;
  Sub: ElementConstructor<JSX.IntrinsicElements['sub']>;
  Summary: ElementConstructor<JSX.IntrinsicElements['summary']>;
  Sup: ElementConstructor<JSX.IntrinsicElements['sup']>;
  Table: ElementConstructor<JSX.IntrinsicElements['table']>;
  Tbody: ElementConstructor<JSX.IntrinsicElements['tbody']>;
  Td: ElementConstructor<JSX.IntrinsicElements['td']>;
  Textarea: ElementConstructor<JSX.IntrinsicElements['textarea']>;
  Tfoot: ElementConstructor<JSX.IntrinsicElements['tfoot']>;
  Th: ElementConstructor<JSX.IntrinsicElements['th']>;
  Thead: ElementConstructor<JSX.IntrinsicElements['thead']>;
  Time: ElementConstructor<JSX.IntrinsicElements['time']>;
  Title: ElementConstructor<JSX.IntrinsicElements['title']>;
  Tr: ElementConstructor<JSX.IntrinsicElements['tr']>;
  Track: ElementConstructor<JSX.IntrinsicElements['track']>;
  U: ElementConstructor<JSX.IntrinsicElements['u']>;
  Ul: ElementConstructor<JSX.IntrinsicElements['ul']>;
  Var: ElementConstructor<JSX.IntrinsicElements['var']>;
  Video: ElementConstructor<JSX.IntrinsicElements['video']>;
  Wbr: ElementConstructor<JSX.IntrinsicElements['wbr']>;
}


export const Tags: Tags = {} as any;


`a abbr address area article aside audio b base bdi bdo big blockquote body br
button canvas caption cite code col colgroup data datalist dd del details dfn
dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5
h6 head header hgroup hr html i iframe img input ins kbd keygen label legend li
link main map mark menu menuitem meta meter nav noscript object ol optgroup
option output p param picture pre progress q rp rt ruby s samp script section
select small source span strong style sub summary sup table tbody td textarea
tfoot th thead time title tr track u ul var video wbr`.replace(/\n/g, ' ').split(' ').forEach(tag => {
    const exportName = `${tag.charAt(0).toUpperCase()}${tag.slice(1)}`;
    Tags[exportName] = toSubscribable(tag);
  });
