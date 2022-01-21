import { mapStackTrace, parseStackTrace } from 'stack-source-mapper';


console.log('App to test exception stack trace mapping');


const stackStr = `
TypeError: Failed to set the 'currentNode' property on 'TreeWalker': Failed to convert value to 'Node'.
    at new fe (https://10.83.12.28/napp/intelligence-ui/main.b033d45fc5c9075af7a0.js:1:536926)
    at Object.templateFactory (https://10.83.12.28/napp/intelligence-ui/main.b033d45fc5c9075af7a0.js:1:548230)
    at Re.__commitTemplateResult (https://10.83.12.28/napp/intelligence-ui/main.b033d45fc5c9075af7a0.js:1:544266)
    at Re.commit (https://10.83.12.28/napp/intelligence-ui/main.b033d45fc5c9075af7a0.js:1:543709)
    at https://10.83.12.28/napp/intelligence-ui/main.b033d45fc5c9075af7a0.js:1:557802
    at Function.Oe.render (https://10.83.12.28/napp/intelligence-ui/main.b033d45fc5c9075af7a0.js:1:557812)
    at f.update (https://10.83.12.28/napp/intelligence-ui/main.b033d45fc5c9075af7a0.js:1:557094)
    at f.performUpdate (https://10.83.12.28/napp/intelligence-ui/main.b033d45fc5c9075af7a0.js:1:553163)
    at f.<anonymous> (https://10.83.12.28/napp/intelligence-ui/main.b033d45fc5c9075af7a0.js:1:552811)
    at Generator.next (<anonymous>)
    at G (https://10.83.12.28/napp/intelligence-ui/polyfills.fe89e5976386e4a5d9d9.js:1:15910)
    at https://10.83.12.28/napp/intelligence-ui/polyfills.fe89e5976386e4a5d9d9.js:1:14994
    at R (https://10.83.12.28/napp/intelligence-ui/main.b033d45fc5c9075af7a0.js:1:75)
    at T.invoke (https://10.83.12.28/napp/intelligence-ui/polyfills.fe89e5976386e4a5d9d9.js:1:6527)
    at Object.onInvoke (https://10.83.12.28/napp/intelligence-ui/main.b033d45fc5c9075af7a0.js:1:289880)
    at T.invoke (https://10.83.12.28/napp/intelligence-ui/polyfills.fe89e5976386e4a5d9d9.js:1:6467)
    at I.run (https://10.83.12.28/napp/intelligence-ui/polyfills.fe89e5976386e4a5d9d9.js:1:1923)
    at https://10.83.12.28/napp/intelligence-ui/polyfills.fe89e5976386e4a5d9d9.js:1:16720
    at T.invokeTask (https://10.83.12.28/napp/intelligence-ui/polyfills.fe89e5976386e4a5d9d9.js:1:7145)
    at Object.onInvokeTask (https://10.83.12.28/napp/intelligence-ui/main.b033d45fc5c9075af7a0.js:1:289696)
`;

const sourceLocation = `${__dirname}/../../../packages/stack-source-mapper-test-app/src/example/pace/`;

(async () => {
  // console.log(`Original Stack ${stackStr}\n\n\n`);
  const result = await mapStackTrace(stackStr, sourceLocation, { strict: true, sourceSnippet: true });
  console.log(result);

  // const parsed = await parseStackTrace(stackStr);
  // const r = await mapStackTrace(parsed, sourceLocation, { strict: true, sourceSnippet: false });
  // console.log(r);


})();




