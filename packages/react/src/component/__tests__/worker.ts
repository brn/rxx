/**
 * @fileoverview
 * @author Taketoshi Aono
 */

export const workerCodes = `
  function post(type, payload) {
    postMessage({ type, payload });
  }

let parentState = {};
  onmessage = event => {
    const { type, payload } = event.data;
    switch (type) {
      case 'DISPATCH':
        if (payload.type === 'test') {
          post('UPDATE', {test: 2, test2: 2, ...parentState});
        } else {
          post('UPDATE', {test: 3, test2: 3, ...parentState});
        }
        break;
      case 'INITIALIZE':
        parentState = payload;
        post('INITIALIZED', { parentState: true, ...parentState });
        post('UPDATE', { test: 1, test2: 1, ...parentState });
        break;
      case 'EXIT':
        post('EXITED', {});
        break;
      default:
        return;
    }
  };
`;
