import { HttpRequest } from './http-request';
/**
 * Config for HttpRequestMock.
 * If when undefined property was passed, return sended parameter as is.
 */
export declare type HttpMockArgs = {
    /**
     * Specify get method return value.
     */
    get?: (uri: string, req: RequestInit) => Response;
    /**
     * Specify post method return value.
     */
    post?: (uri: string, req: RequestInit) => Response;
    /**
     * Specify put method return value.
     */
    put?: (uri: string, req: RequestInit) => Response;
    /**
     * Specify delete method return value.
     */
    delete?: (uri: string, req: RequestInit) => Response;
};
/**
 * Mock class for HttpRequest.
 */
export declare class HttpRequestMock extends HttpRequest {
    private methods;
    private fetchFunction;
    /**
     * @param methods Definitions of each method return value.
     */
    constructor(methods: HttpMockArgs);
    /**
     * Return whatwgFetch function mock.
     */
    protected readonly fetch: any;
}
