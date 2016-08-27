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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
import * as React from 'react';
/**
 * Attributes of the Subscriber that passed through html tag.
 */
export interface Attr extends React.HTMLAttributes, React.DOMAttributes, React.ClassAttributes<Element> {
    ignoreSubtree?: boolean;
}
/**
 * All suppoertd subscriberified tag list.
 */
export interface Tags {
    A: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Abbr: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Address: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Area: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Article: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Aside: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Audio: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Base: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Bdi: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Bdo: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Big: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Blockquote: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Body: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Br: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Button: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Canvas: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Caption: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Cite: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Code: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Col: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Colgroup: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Data: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Datalist: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Dd: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Del: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Details: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Dfn: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Dialog: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Div: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Dl: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Dt: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Em: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Embed: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Fieldset: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Figcaption: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Figure: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Footer: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Form: new (p: Attr, c: any) => React.Component<Attr, {}>;
    H1: new (p: Attr, c: any) => React.Component<Attr, {}>;
    H2: new (p: Attr, c: any) => React.Component<Attr, {}>;
    H3: new (p: Attr, c: any) => React.Component<Attr, {}>;
    H4: new (p: Attr, c: any) => React.Component<Attr, {}>;
    H5: new (p: Attr, c: any) => React.Component<Attr, {}>;
    H6: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Head: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Header: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Hgroup: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Hr: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Html: new (p: Attr, c: any) => React.Component<Attr, {}>;
    I: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Iframe: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Img: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Input: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Ins: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Kbd: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Keygen: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Label: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Legend: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Li: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Link: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Main: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Map: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Mark: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Menu: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Menuitem: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Meta: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Meter: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Nav: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Noscript: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Object: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Ol: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Optgroup: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Option: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Output: new (p: Attr, c: any) => React.Component<Attr, {}>;
    P: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Param: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Picture: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Pre: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Progress: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Q: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Rp: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Rt: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Ruby: new (p: Attr, c: any) => React.Component<Attr, {}>;
    S: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Samp: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Script: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Section: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Select: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Small: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Source: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Span: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Strong: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Style: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Sub: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Summary: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Sup: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Table: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Tbody: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Td: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Textarea: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Tfoot: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Th: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Thead: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Time: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Title: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Tr: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Track: new (p: Attr, c: any) => React.Component<Attr, {}>;
    U: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Ul: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Var: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Video: new (p: Attr, c: any) => React.Component<Attr, {}>;
    Wbr: new (p: Attr, c: any) => React.Component<Attr, {}>;
}
export declare const Tags: Tags;
