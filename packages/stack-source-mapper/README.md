# stack-source-mapper

nodejs library to parse stack trace and map it with source maps to get meaningful error stack.

## what it does
Any typescript web applications e.g. Angular is/should not deployed in production with source maps.  Hence the exception stack in producton is unreadable and makes no sense.


we have two options in that case
### Hidden Source maps
Angular applications you can build with "hidden" source maps where source maps are generated along with build but not visible to browser.

### Source maps generated separately
Source maps are generated separately, hence the source map files names may not match with the prod build file names.

### Offline processing
In both these cases we need an an offline processing to convert the production stack to a meaningful development stack by mapping it to source maps.

This library does exactly that!!

## How to use

```
import { mapStackTrace, parseStackTrace } from 'stack-source-mapper';

const stackStr = `
  TypeError: {}.helloWorld is not a function
    at a.throwError (main.15600dbb30d4c3c4c884.js:1:196320)
    at main.15600dbb30d4c3c4c884.js:1:213496
    at nD (main.15600dbb30d4c3c4c884.js:1:59586)
    at d (main.15600dbb30d4c3c4c884.js:1:59748)
  ..........
  ..........

`;

const sourceMapLocation = `.../location/...`;

  const result: string = await mapStackTrace(stackStr, sourceLocation, {
    strict: false, sourceSnippet: true
    });
  console.log(result);

```
OR
```
  const parsed = await parseStackTrace(stackStr);
  const r = await mapStackTrace(parsed, sourceLocation, {strict: true, sourceSnippet: false});
  console.log(r);

```

Library has two overloaded signatures
```
export async function mapStackTrace(
  stackTrace: string,
  sourceMapLocation: string,
  options: MapStackOptions): Promise<string>;

export async function mapStackTrace(
  stackTrace: StackTraceFrame[],
  sourceMapLocation: string,
  options: MapStackOptions): Promise<StackTraceFrame[]>;

```

It returns a serialized dev stack mapped with sourcemaps if mapStackTrace is invoked with string.  If you dont want a string and want to log the error the way you like, you can get the parsed stack back.

### Options
```
export interface MapStackOptions {
  strict: boolean;
  sourceSnippet: boolean;
  sourceLines?: number;
}

```
#### strict: true
to control the file name matching logic.  If true library will try to find the source map file name which match exactly with the exception stack trace file name.  Works when "Hidden" source maps are generated along with prod build.
#### strict: false
If false, libraries tries best effort to find the matching source map file.  This is required in case the source maps are not generated with the prod build.  Hence the source map file name may not be exactly same as prod build file names.

#### sourceSnippet
Try to add exception source code from source map.

#### sourceLines
how many source code lines to add.  If number is 3, it adds 3 lines from top and 3 lines from bottom of the line where exception occured.

## Example
```
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


  const result = await mapStackTrace(stackStr, sourceLocation, {strict: false, sourceSnippet: true});
  console.log(result);

```
Result:
```
helloWorld -> (  webpack:///src/app/app.component.ts [14:6]  )
--------------------source code -----------------
12:    throwError() {
13:      const x: any = {};
14:      x.helloWorld();
15:    }
16:  }
  
ctx -> (  webpack:///src/app/app.component.html [491:19]  )
--------------------source code -----------------
489:    </svg>
490:  
491:    <button (click)="throwError()">Throw Error</button>
492:  
493:  </div>
494:  
  
listenerFn -> (  webpack:///node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js [15327:15]  )
--------------------source code -----------------
15325:          profiler(6 /* OutputStart */, context, listenerFn);
15326:          // Only explicitly returning false from a listener should preventDefault
15327:          return listenerFn(e) !== false;
15328:      }
15329:      catch (error) {
15330:          handleError(lView, error);
  
executeListenerWithErrorHandling -> (  webpack:///node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js [15365:21]  )
--------------------source code -----------------
15363:              markViewDirty(startView);
15364:          }
15365:          let result = executeListenerWithErrorHandling(lView, context, listenerFn, e);
15366:          // A just-invoked listener function might have coalesced listeners so we need to check for
15367:          // their presence and invoke as needed.
15368:          let nextListenerFn = wrapListenerIn_markDirtyAndPreventDefault.__ngNextListenerFn__;
  
eventHandler -> (  webpack:///node_modules/@angular/platform-browser/__ivy_ngcc__/fesm2015/platform-browser.js [561:37]  )
--------------------source code -----------------
559:              return eventHandler;
560:          }
561:          const allowDefaultBehavior = eventHandler(event);
562:          if (allowDefaultBehavior === false) {
563:              // TODO(tbosch): move preventDefault into event plugins...
564:              event.preventDefault();
  
apply -> (  webpack:///node_modules/zone.js/fesm2015/zone.js [406:30]  )
--------------------source code -----------------
404:          invokeTask(targetZone, task, applyThis, applyArgs) {
405:              return this._invokeTaskZS ? this._invokeTaskZS.onInvokeTask(this._invokeTaskDlgt, this._invokeTaskCurrZone, targetZone, task, applyThis, applyArgs) :
406:                  task.callback.apply(applyThis, applyArgs);
407:          }
408:          cancelTask(targetZone, task) {
409:              let value;
  
invokeTask -> (  webpack:///node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js [28679:32]  )
--------------------source code -----------------
28677:              try {
28678:                  onEnter(zone);
28679:                  return delegate.invokeTask(target, task, applyThis, applyArgs);
28680:              }
28681:              finally {
28682:                  if ((zone.shouldCoalesceEventChangeDetection && task.type === 'eventTask') ||
  
onInvokeTask -> (  webpack:///node_modules/zone.js/fesm2015/zone.js [405:59]  )
--------------------source code -----------------
403:          }
404:          invokeTask(targetZone, task, applyThis, applyArgs) {
405:              return this._invokeTaskZS ? this._invokeTaskZS.onInvokeTask(this._invokeTaskDlgt, this._invokeTaskCurrZone, targetZone, task, applyThis, applyArgs) :
406:                  task.callback.apply(applyThis, applyArgs);
407:          }
408:          cancelTask(targetZone, task) {
  
invokeTask -> (  webpack:///node_modules/zone.js/fesm2015/zone.js [178:46]  )
--------------------source code -----------------
176:                  }
177:                  try {
178:                      return this._zoneDelegate.invokeTask(this, task, applyThis, applyArgs);
179:                  }
180:                  catch (error) {
181:                      if (this._zoneDelegate.handleError(this, error)) {
  
runTask -> (  webpack:///node_modules/zone.js/fesm2015/zone.js [487:33]  )
--------------------source code -----------------
485:              try {
486:                  task.runCount++;
487:                  return task.zone.runTask(task, target, args);
488:              }
489:              finally {
490:                  if (_numberOfNestedTaskFrames == 1) {

```