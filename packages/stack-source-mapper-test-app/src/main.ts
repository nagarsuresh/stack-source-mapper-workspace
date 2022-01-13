import { mapStackTrace, parseStackTrace } from 'stack-source-mapper';


console.log('App to test exception stack trace mapping');


const stackStr = `
TypeError: {}.helloWorld is not a function
    at a.throwError (main.15600dbb30d4c3c4c884.js:1:196320)
    at main.15600dbb30d4c3c4c884.js:1:213496
    at nD (main.15600dbb30d4c3c4c884.js:1:59586)
    at d (main.15600dbb30d4c3c4c884.js:1:59748)
    at HTMLButtonElement.<anonymous> (main.15600dbb30d4c3c4c884.js:1:117054)
    at T.invokeTask (polyfills.bfdd93de4f99fb5503f5.js:1:7138)
    at Object.onInvokeTask (main.15600dbb30d4c3c4c884.js:1:88522)
    at T.invokeTask (polyfills.bfdd93de4f99fb5503f5.js:1:7059)
    at I.runTask (polyfills.bfdd93de4f99fb5503f5.js:1:2533)
    at m.invokeTask [as invoke] (polyfills.bfdd93de4f99fb5503f5.js:1:8189)
`;

const sourceLocation = `${__dirname}/../../../packages/stack-source-mapper-test-app/src/example/app-source-maps/`;

(async () => {
  console.log(`Original Stack ${stackStr}\n\n\n`);
  const result = await mapStackTrace(stackStr, sourceLocation, { strict: false, sourceSnippet: true });
  console.log(result);

  const parsed = await parseStackTrace(stackStr);
  const r = await mapStackTrace(parsed, sourceLocation, { strict: true, sourceSnippet: false });
  console.log(r);


})();




