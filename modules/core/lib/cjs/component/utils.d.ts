import * as React from 'react';
/**
 * render関数の型
 */
export declare type Render<Props> = (props: Props, context?: any) => React.ReactElement<any>;
/**
 * stateless関数の引数型
 */
export declare type StatelessComponentConfig<Props> = {
    render: Render<Props>;
    componentWillMount?(): void;
    componentDidMount?(): void;
    componentWillUnmount?(): void;
    componentDidUpdate?(): void;
    shouldComponentUpdate?(props: Props): boolean;
};
/**
 * statelessなCompositeComponentを作成する
 * @param render render関数か、各種lifecycleメソッドが定義されたオブジェクト
 */
export declare function component<Props>(render: (StatelessComponentConfig<Props> | Render<Props>), componentName?: string): any;
