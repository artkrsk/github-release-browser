/*!
 * github-release-browser v1.0.2
 * © 2025 Artem Semkin
 * License: GPL-3.0-or-later
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("ReactDOM"), require("React"));
	else if(typeof define === 'function' && define.amd)
		define(["ReactDOM", "React"], factory);
	else if(typeof exports === 'object')
		exports["ArtsGitHubReleaseBrowser"] = factory(require("ReactDOM"), require("React"));
	else
		root["ArtsGitHubReleaseBrowser"] = factory(root["ReactDOM"], root["React"]);
})(this, (__WEBPACK_EXTERNAL_MODULE_react_dom__, __WEBPACK_EXTERNAL_MODULE_react__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var m = __webpack_require__(/*! react-dom */ "react-dom");
if (false) // removed by dead control flow
{} else {
  var i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  exports.createRoot = function(c, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.createRoot(c, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
  exports.hydrateRoot = function(c, h, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.hydrateRoot(c, h, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
}


/***/ }),

/***/ "./node_modules/.pnpm/react@18.3.1/node_modules/react/cjs/react-jsx-runtime.development.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/.pnpm/react@18.3.1/node_modules/react/cjs/react-jsx-runtime.development.js ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



if (true) {
  (function() {
'use strict';

var React = __webpack_require__(/*! react */ "react");

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
// The Symbol used to tag the ReactElement-like types.
var REACT_ELEMENT_TYPE = Symbol.for('react.element');
var REACT_PORTAL_TYPE = Symbol.for('react.portal');
var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
var REACT_CONTEXT_TYPE = Symbol.for('react.context');
var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
var REACT_MEMO_TYPE = Symbol.for('react.memo');
var REACT_LAZY_TYPE = Symbol.for('react.lazy');
var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';
function getIteratorFn(maybeIterable) {
  if (maybeIterable === null || typeof maybeIterable !== 'object') {
    return null;
  }

  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

  if (typeof maybeIterator === 'function') {
    return maybeIterator;
  }

  return null;
}

var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

function error(format) {
  {
    {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      printWarning('error', format, args);
    }
  }
}

function printWarning(level, format, args) {
  // When changing this logic, you might want to also
  // update consoleWithStackDev.www.js as well.
  {
    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
    var stack = ReactDebugCurrentFrame.getStackAddendum();

    if (stack !== '') {
      format += '%s';
      args = args.concat([stack]);
    } // eslint-disable-next-line react-internal/safe-string-coercion


    var argsWithFormat = args.map(function (item) {
      return String(item);
    }); // Careful: RN currently depends on this prefix

    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
    // breaks IE9: https://github.com/facebook/react/issues/13610
    // eslint-disable-next-line react-internal/no-production-logging

    Function.prototype.apply.call(console[level], console, argsWithFormat);
  }
}

// -----------------------------------------------------------------------------

var enableScopeAPI = false; // Experimental Create Event Handle API.
var enableCacheElement = false;
var enableTransitionTracing = false; // No known bugs, but needs performance testing

var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
// stuff. Intended to enable React core members to more easily debug scheduling
// issues in DEV builds.

var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

var REACT_MODULE_REFERENCE;

{
  REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
}

function isValidElementType(type) {
  if (typeof type === 'string' || typeof type === 'function') {
    return true;
  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing  || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden  || type === REACT_OFFSCREEN_TYPE || enableScopeAPI  || enableCacheElement  || enableTransitionTracing ) {
    return true;
  }

  if (typeof type === 'object' && type !== null) {
    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
    // types supported by any Flight configuration anywhere since
    // we don't know which Flight build this will end up being used
    // with.
    type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
      return true;
    }
  }

  return false;
}

function getWrappedName(outerType, innerType, wrapperName) {
  var displayName = outerType.displayName;

  if (displayName) {
    return displayName;
  }

  var functionName = innerType.displayName || innerType.name || '';
  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
} // Keep in sync with react-reconciler/getComponentNameFromFiber


function getContextName(type) {
  return type.displayName || 'Context';
} // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.


function getComponentNameFromType(type) {
  if (type == null) {
    // Host root, text node or just invalid type.
    return null;
  }

  {
    if (typeof type.tag === 'number') {
      error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
    }
  }

  if (typeof type === 'function') {
    return type.displayName || type.name || null;
  }

  if (typeof type === 'string') {
    return type;
  }

  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return 'Fragment';

    case REACT_PORTAL_TYPE:
      return 'Portal';

    case REACT_PROFILER_TYPE:
      return 'Profiler';

    case REACT_STRICT_MODE_TYPE:
      return 'StrictMode';

    case REACT_SUSPENSE_TYPE:
      return 'Suspense';

    case REACT_SUSPENSE_LIST_TYPE:
      return 'SuspenseList';

  }

  if (typeof type === 'object') {
    switch (type.$$typeof) {
      case REACT_CONTEXT_TYPE:
        var context = type;
        return getContextName(context) + '.Consumer';

      case REACT_PROVIDER_TYPE:
        var provider = type;
        return getContextName(provider._context) + '.Provider';

      case REACT_FORWARD_REF_TYPE:
        return getWrappedName(type, type.render, 'ForwardRef');

      case REACT_MEMO_TYPE:
        var outerName = type.displayName || null;

        if (outerName !== null) {
          return outerName;
        }

        return getComponentNameFromType(type.type) || 'Memo';

      case REACT_LAZY_TYPE:
        {
          var lazyComponent = type;
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;

          try {
            return getComponentNameFromType(init(payload));
          } catch (x) {
            return null;
          }
        }

      // eslint-disable-next-line no-fallthrough
    }
  }

  return null;
}

var assign = Object.assign;

// Helpers to patch console.logs to avoid logging during side-effect free
// replaying on render function. This currently only patches the object
// lazily which won't cover if the log function was extracted eagerly.
// We could also eagerly patch the method.
var disabledDepth = 0;
var prevLog;
var prevInfo;
var prevWarn;
var prevError;
var prevGroup;
var prevGroupCollapsed;
var prevGroupEnd;

function disabledLog() {}

disabledLog.__reactDisabledLog = true;
function disableLogs() {
  {
    if (disabledDepth === 0) {
      /* eslint-disable react-internal/no-production-logging */
      prevLog = console.log;
      prevInfo = console.info;
      prevWarn = console.warn;
      prevError = console.error;
      prevGroup = console.group;
      prevGroupCollapsed = console.groupCollapsed;
      prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

      var props = {
        configurable: true,
        enumerable: true,
        value: disabledLog,
        writable: true
      }; // $FlowFixMe Flow thinks console is immutable.

      Object.defineProperties(console, {
        info: props,
        log: props,
        warn: props,
        error: props,
        group: props,
        groupCollapsed: props,
        groupEnd: props
      });
      /* eslint-enable react-internal/no-production-logging */
    }

    disabledDepth++;
  }
}
function reenableLogs() {
  {
    disabledDepth--;

    if (disabledDepth === 0) {
      /* eslint-disable react-internal/no-production-logging */
      var props = {
        configurable: true,
        enumerable: true,
        writable: true
      }; // $FlowFixMe Flow thinks console is immutable.

      Object.defineProperties(console, {
        log: assign({}, props, {
          value: prevLog
        }),
        info: assign({}, props, {
          value: prevInfo
        }),
        warn: assign({}, props, {
          value: prevWarn
        }),
        error: assign({}, props, {
          value: prevError
        }),
        group: assign({}, props, {
          value: prevGroup
        }),
        groupCollapsed: assign({}, props, {
          value: prevGroupCollapsed
        }),
        groupEnd: assign({}, props, {
          value: prevGroupEnd
        })
      });
      /* eslint-enable react-internal/no-production-logging */
    }

    if (disabledDepth < 0) {
      error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
    }
  }
}

var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
var prefix;
function describeBuiltInComponentFrame(name, source, ownerFn) {
  {
    if (prefix === undefined) {
      // Extract the VM specific prefix used by each line.
      try {
        throw Error();
      } catch (x) {
        var match = x.stack.trim().match(/\n( *(at )?)/);
        prefix = match && match[1] || '';
      }
    } // We use the prefix to ensure our stacks line up with native stack frames.


    return '\n' + prefix + name;
  }
}
var reentry = false;
var componentFrameCache;

{
  var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
  componentFrameCache = new PossiblyWeakMap();
}

function describeNativeComponentFrame(fn, construct) {
  // If something asked for a stack inside a fake render, it should get ignored.
  if ( !fn || reentry) {
    return '';
  }

  {
    var frame = componentFrameCache.get(fn);

    if (frame !== undefined) {
      return frame;
    }
  }

  var control;
  reentry = true;
  var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

  Error.prepareStackTrace = undefined;
  var previousDispatcher;

  {
    previousDispatcher = ReactCurrentDispatcher.current; // Set the dispatcher in DEV because this might be call in the render function
    // for warnings.

    ReactCurrentDispatcher.current = null;
    disableLogs();
  }

  try {
    // This should throw.
    if (construct) {
      // Something should be setting the props in the constructor.
      var Fake = function () {
        throw Error();
      }; // $FlowFixMe


      Object.defineProperty(Fake.prototype, 'props', {
        set: function () {
          // We use a throwing setter instead of frozen or non-writable props
          // because that won't throw in a non-strict mode function.
          throw Error();
        }
      });

      if (typeof Reflect === 'object' && Reflect.construct) {
        // We construct a different control for this case to include any extra
        // frames added by the construct call.
        try {
          Reflect.construct(Fake, []);
        } catch (x) {
          control = x;
        }

        Reflect.construct(fn, [], Fake);
      } else {
        try {
          Fake.call();
        } catch (x) {
          control = x;
        }

        fn.call(Fake.prototype);
      }
    } else {
      try {
        throw Error();
      } catch (x) {
        control = x;
      }

      fn();
    }
  } catch (sample) {
    // This is inlined manually because closure doesn't do it for us.
    if (sample && control && typeof sample.stack === 'string') {
      // This extracts the first frame from the sample that isn't also in the control.
      // Skipping one frame that we assume is the frame that calls the two.
      var sampleLines = sample.stack.split('\n');
      var controlLines = control.stack.split('\n');
      var s = sampleLines.length - 1;
      var c = controlLines.length - 1;

      while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
        // We expect at least one stack frame to be shared.
        // Typically this will be the root most one. However, stack frames may be
        // cut off due to maximum stack limits. In this case, one maybe cut off
        // earlier than the other. We assume that the sample is longer or the same
        // and there for cut off earlier. So we should find the root most frame in
        // the sample somewhere in the control.
        c--;
      }

      for (; s >= 1 && c >= 0; s--, c--) {
        // Next we find the first one that isn't the same which should be the
        // frame that called our sample function and the control.
        if (sampleLines[s] !== controlLines[c]) {
          // In V8, the first line is describing the message but other VMs don't.
          // If we're about to return the first line, and the control is also on the same
          // line, that's a pretty good indicator that our sample threw at same line as
          // the control. I.e. before we entered the sample frame. So we ignore this result.
          // This can happen if you passed a class to function component, or non-function.
          if (s !== 1 || c !== 1) {
            do {
              s--;
              c--; // We may still have similar intermediate frames from the construct call.
              // The next one that isn't the same should be our match though.

              if (c < 0 || sampleLines[s] !== controlLines[c]) {
                // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
                var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
                // but we have a user-provided "displayName"
                // splice it in to make the stack more readable.


                if (fn.displayName && _frame.includes('<anonymous>')) {
                  _frame = _frame.replace('<anonymous>', fn.displayName);
                }

                {
                  if (typeof fn === 'function') {
                    componentFrameCache.set(fn, _frame);
                  }
                } // Return the line we found.


                return _frame;
              }
            } while (s >= 1 && c >= 0);
          }

          break;
        }
      }
    }
  } finally {
    reentry = false;

    {
      ReactCurrentDispatcher.current = previousDispatcher;
      reenableLogs();
    }

    Error.prepareStackTrace = previousPrepareStackTrace;
  } // Fallback to just using the name if we couldn't make it throw.


  var name = fn ? fn.displayName || fn.name : '';
  var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

  {
    if (typeof fn === 'function') {
      componentFrameCache.set(fn, syntheticFrame);
    }
  }

  return syntheticFrame;
}
function describeFunctionComponentFrame(fn, source, ownerFn) {
  {
    return describeNativeComponentFrame(fn, false);
  }
}

function shouldConstruct(Component) {
  var prototype = Component.prototype;
  return !!(prototype && prototype.isReactComponent);
}

function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

  if (type == null) {
    return '';
  }

  if (typeof type === 'function') {
    {
      return describeNativeComponentFrame(type, shouldConstruct(type));
    }
  }

  if (typeof type === 'string') {
    return describeBuiltInComponentFrame(type);
  }

  switch (type) {
    case REACT_SUSPENSE_TYPE:
      return describeBuiltInComponentFrame('Suspense');

    case REACT_SUSPENSE_LIST_TYPE:
      return describeBuiltInComponentFrame('SuspenseList');
  }

  if (typeof type === 'object') {
    switch (type.$$typeof) {
      case REACT_FORWARD_REF_TYPE:
        return describeFunctionComponentFrame(type.render);

      case REACT_MEMO_TYPE:
        // Memo may contain any component type so we recursively resolve it.
        return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

      case REACT_LAZY_TYPE:
        {
          var lazyComponent = type;
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;

          try {
            // Lazy may contain any component type so we recursively resolve it.
            return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
          } catch (x) {}
        }
    }
  }

  return '';
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

var loggedTypeFailures = {};
var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;

function setCurrentlyValidatingElement(element) {
  {
    if (element) {
      var owner = element._owner;
      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
      ReactDebugCurrentFrame.setExtraStackFrame(stack);
    } else {
      ReactDebugCurrentFrame.setExtraStackFrame(null);
    }
  }
}

function checkPropTypes(typeSpecs, values, location, componentName, element) {
  {
    // $FlowFixMe This is okay but Flow doesn't know it.
    var has = Function.call.bind(hasOwnProperty);

    for (var typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.

        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            // eslint-disable-next-line react-internal/prod-error-codes
            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
            err.name = 'Invariant Violation';
            throw err;
          }

          error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
        } catch (ex) {
          error$1 = ex;
        }

        if (error$1 && !(error$1 instanceof Error)) {
          setCurrentlyValidatingElement(element);

          error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

          setCurrentlyValidatingElement(null);
        }

        if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error$1.message] = true;
          setCurrentlyValidatingElement(element);

          error('Failed %s type: %s', location, error$1.message);

          setCurrentlyValidatingElement(null);
        }
      }
    }
  }
}

var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

function isArray(a) {
  return isArrayImpl(a);
}

/*
 * The `'' + value` pattern (used in in perf-sensitive code) throws for Symbol
 * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
 *
 * The functions in this module will throw an easier-to-understand,
 * easier-to-debug exception with a clear errors message message explaining the
 * problem. (Instead of a confusing exception thrown inside the implementation
 * of the `value` object).
 */
// $FlowFixMe only called in DEV, so void return is not possible.
function typeName(value) {
  {
    // toStringTag is needed for namespaced types like Temporal.Instant
    var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
    var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
    return type;
  }
} // $FlowFixMe only called in DEV, so void return is not possible.


function willCoercionThrow(value) {
  {
    try {
      testStringCoercion(value);
      return false;
    } catch (e) {
      return true;
    }
  }
}

function testStringCoercion(value) {
  // If you ended up here by following an exception call stack, here's what's
  // happened: you supplied an object or symbol value to React (as a prop, key,
  // DOM attribute, CSS property, string ref, etc.) and when React tried to
  // coerce it to a string using `'' + value`, an exception was thrown.
  //
  // The most common types that will cause this exception are `Symbol` instances
  // and Temporal objects like `Temporal.Instant`. But any object that has a
  // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
  // exception. (Library authors do this to prevent users from using built-in
  // numeric operators like `+` or comparison operators like `>=` because custom
  // methods are needed to perform accurate arithmetic or comparison.)
  //
  // To fix the problem, coerce this object or symbol value to a string before
  // passing it to React. The most reliable way is usually `String(value)`.
  //
  // To find which value is throwing, check the browser or debugger console.
  // Before this exception was thrown, there should be `console.error` output
  // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
  // problem and how that type was used: key, atrribute, input value prop, etc.
  // In most cases, this console output also shows the component and its
  // ancestor components where the exception happened.
  //
  // eslint-disable-next-line react-internal/safe-string-coercion
  return '' + value;
}
function checkKeyStringCoercion(value) {
  {
    if (willCoercionThrow(value)) {
      error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
    }
  }
}

var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
var RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
};
var specialPropKeyWarningShown;
var specialPropRefWarningShown;
var didWarnAboutStringRefs;

{
  didWarnAboutStringRefs = {};
}

function hasValidRef(config) {
  {
    if (hasOwnProperty.call(config, 'ref')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }

  return config.ref !== undefined;
}

function hasValidKey(config) {
  {
    if (hasOwnProperty.call(config, 'key')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }

  return config.key !== undefined;
}

function warnIfStringRefCannotBeAutoConverted(config, self) {
  {
    if (typeof config.ref === 'string' && ReactCurrentOwner.current && self && ReactCurrentOwner.current.stateNode !== self) {
      var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);

      if (!didWarnAboutStringRefs[componentName]) {
        error('Component "%s" contains the string ref "%s". ' + 'Support for string refs will be removed in a future major release. ' + 'This case cannot be automatically converted to an arrow function. ' + 'We ask you to manually fix this case by using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://reactjs.org/link/strict-mode-string-ref', getComponentNameFromType(ReactCurrentOwner.current.type), config.ref);

        didWarnAboutStringRefs[componentName] = true;
      }
    }
  }
}

function defineKeyPropWarningGetter(props, displayName) {
  {
    var warnAboutAccessingKey = function () {
      if (!specialPropKeyWarningShown) {
        specialPropKeyWarningShown = true;

        error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
      }
    };

    warnAboutAccessingKey.isReactWarning = true;
    Object.defineProperty(props, 'key', {
      get: warnAboutAccessingKey,
      configurable: true
    });
  }
}

function defineRefPropWarningGetter(props, displayName) {
  {
    var warnAboutAccessingRef = function () {
      if (!specialPropRefWarningShown) {
        specialPropRefWarningShown = true;

        error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
      }
    };

    warnAboutAccessingRef.isReactWarning = true;
    Object.defineProperty(props, 'ref', {
      get: warnAboutAccessingRef,
      configurable: true
    });
  }
}
/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, instanceof check
 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
 * if something is a React Element.
 *
 * @param {*} type
 * @param {*} props
 * @param {*} key
 * @param {string|object} ref
 * @param {*} owner
 * @param {*} self A *temporary* helper to detect places where `this` is
 * different from the `owner` when React.createElement is called, so that we
 * can warn. We want to get rid of owner and replace string `ref`s with arrow
 * functions, and as long as `this` and owner are the same, there will be no
 * change in behavior.
 * @param {*} source An annotation object (added by a transpiler or otherwise)
 * indicating filename, line number, and/or other information.
 * @internal
 */


var ReactElement = function (type, key, ref, self, source, owner, props) {
  var element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,
    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,
    // Record the component responsible for creating this element.
    _owner: owner
  };

  {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.

    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false
    }); // self and source are DEV only properties.

    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self
    }); // Two elements created in two different places should be considered
    // equal for testing purposes and therefore we hide it from enumeration.

    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source
    });

    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
};
/**
 * https://github.com/reactjs/rfcs/pull/107
 * @param {*} type
 * @param {object} props
 * @param {string} key
 */

function jsxDEV(type, config, maybeKey, source, self) {
  {
    var propName; // Reserved names are extracted

    var props = {};
    var key = null;
    var ref = null; // Currently, key can be spread in as a prop. This causes a potential
    // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
    // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
    // but as an intermediary step, we will use jsxDEV for everything except
    // <div {...props} key="Hi" />, because we aren't currently able to tell if
    // key is explicitly declared to be undefined or not.

    if (maybeKey !== undefined) {
      {
        checkKeyStringCoercion(maybeKey);
      }

      key = '' + maybeKey;
    }

    if (hasValidKey(config)) {
      {
        checkKeyStringCoercion(config.key);
      }

      key = '' + config.key;
    }

    if (hasValidRef(config)) {
      ref = config.ref;
      warnIfStringRefCannotBeAutoConverted(config, self);
    } // Remaining properties are added to a new props object


    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    } // Resolve default props


    if (type && type.defaultProps) {
      var defaultProps = type.defaultProps;

      for (propName in defaultProps) {
        if (props[propName] === undefined) {
          props[propName] = defaultProps[propName];
        }
      }
    }

    if (key || ref) {
      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

      if (key) {
        defineKeyPropWarningGetter(props, displayName);
      }

      if (ref) {
        defineRefPropWarningGetter(props, displayName);
      }
    }

    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
  }
}

var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

function setCurrentlyValidatingElement$1(element) {
  {
    if (element) {
      var owner = element._owner;
      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
      ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
    } else {
      ReactDebugCurrentFrame$1.setExtraStackFrame(null);
    }
  }
}

var propTypesMisspellWarningShown;

{
  propTypesMisspellWarningShown = false;
}
/**
 * Verifies the object is a ReactElement.
 * See https://reactjs.org/docs/react-api.html#isvalidelement
 * @param {?object} object
 * @return {boolean} True if `object` is a ReactElement.
 * @final
 */


function isValidElement(object) {
  {
    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  }
}

function getDeclarationErrorAddendum() {
  {
    if (ReactCurrentOwner$1.current) {
      var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);

      if (name) {
        return '\n\nCheck the render method of `' + name + '`.';
      }
    }

    return '';
  }
}

function getSourceInfoErrorAddendum(source) {
  {
    if (source !== undefined) {
      var fileName = source.fileName.replace(/^.*[\\\/]/, '');
      var lineNumber = source.lineNumber;
      return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
    }

    return '';
  }
}
/**
 * Warn if there's no key explicitly set on dynamic arrays of children or
 * object keys are not valid. This allows us to keep track of children between
 * updates.
 */


var ownerHasKeyUseWarning = {};

function getCurrentComponentErrorInfo(parentType) {
  {
    var info = getDeclarationErrorAddendum();

    if (!info) {
      var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

      if (parentName) {
        info = "\n\nCheck the top-level render call using <" + parentName + ">.";
      }
    }

    return info;
  }
}
/**
 * Warn if the element doesn't have an explicit key assigned to it.
 * This element is in an array. The array could grow and shrink or be
 * reordered. All children that haven't already been validated are required to
 * have a "key" property assigned to it. Error statuses are cached so a warning
 * will only be shown once.
 *
 * @internal
 * @param {ReactElement} element Element that requires a key.
 * @param {*} parentType element's parent's type.
 */


function validateExplicitKey(element, parentType) {
  {
    if (!element._store || element._store.validated || element.key != null) {
      return;
    }

    element._store.validated = true;
    var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

    if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
      return;
    }

    ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
    // property, it may be the creator of the child that's responsible for
    // assigning it a key.

    var childOwner = '';

    if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
      // Give the component that originally created this child.
      childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
    }

    setCurrentlyValidatingElement$1(element);

    error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);

    setCurrentlyValidatingElement$1(null);
  }
}
/**
 * Ensure that every element either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {ReactNode} node Statically passed child of any type.
 * @param {*} parentType node's parent's type.
 */


function validateChildKeys(node, parentType) {
  {
    if (typeof node !== 'object') {
      return;
    }

    if (isArray(node)) {
      for (var i = 0; i < node.length; i++) {
        var child = node[i];

        if (isValidElement(child)) {
          validateExplicitKey(child, parentType);
        }
      }
    } else if (isValidElement(node)) {
      // This element was passed in a valid location.
      if (node._store) {
        node._store.validated = true;
      }
    } else if (node) {
      var iteratorFn = getIteratorFn(node);

      if (typeof iteratorFn === 'function') {
        // Entry iterators used to provide implicit keys,
        // but now we print a separate warning for them later.
        if (iteratorFn !== node.entries) {
          var iterator = iteratorFn.call(node);
          var step;

          while (!(step = iterator.next()).done) {
            if (isValidElement(step.value)) {
              validateExplicitKey(step.value, parentType);
            }
          }
        }
      }
    }
  }
}
/**
 * Given an element, validate that its props follow the propTypes definition,
 * provided by the type.
 *
 * @param {ReactElement} element
 */


function validatePropTypes(element) {
  {
    var type = element.type;

    if (type === null || type === undefined || typeof type === 'string') {
      return;
    }

    var propTypes;

    if (typeof type === 'function') {
      propTypes = type.propTypes;
    } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
    // Inner props are checked in the reconciler.
    type.$$typeof === REACT_MEMO_TYPE)) {
      propTypes = type.propTypes;
    } else {
      return;
    }

    if (propTypes) {
      // Intentionally inside to avoid triggering lazy initializers:
      var name = getComponentNameFromType(type);
      checkPropTypes(propTypes, element.props, 'prop', name, element);
    } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
      propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

      var _name = getComponentNameFromType(type);

      error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
    }

    if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
      error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
    }
  }
}
/**
 * Given a fragment, validate that it can only be provided with fragment props
 * @param {ReactElement} fragment
 */


function validateFragmentProps(fragment) {
  {
    var keys = Object.keys(fragment.props);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];

      if (key !== 'children' && key !== 'key') {
        setCurrentlyValidatingElement$1(fragment);

        error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

        setCurrentlyValidatingElement$1(null);
        break;
      }
    }

    if (fragment.ref !== null) {
      setCurrentlyValidatingElement$1(fragment);

      error('Invalid attribute `ref` supplied to `React.Fragment`.');

      setCurrentlyValidatingElement$1(null);
    }
  }
}

var didWarnAboutKeySpread = {};
function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
  {
    var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
    // succeed and there will likely be errors in render.

    if (!validType) {
      var info = '';

      if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
        info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
      }

      var sourceInfo = getSourceInfoErrorAddendum(source);

      if (sourceInfo) {
        info += sourceInfo;
      } else {
        info += getDeclarationErrorAddendum();
      }

      var typeString;

      if (type === null) {
        typeString = 'null';
      } else if (isArray(type)) {
        typeString = 'array';
      } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
        typeString = "<" + (getComponentNameFromType(type.type) || 'Unknown') + " />";
        info = ' Did you accidentally export a JSX literal instead of a component?';
      } else {
        typeString = typeof type;
      }

      error('React.jsx: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
    }

    var element = jsxDEV(type, props, key, source, self); // The result can be nullish if a mock or a custom function is used.
    // TODO: Drop this when these are no longer allowed as the type argument.

    if (element == null) {
      return element;
    } // Skip key warning if the type isn't valid since our key validation logic
    // doesn't expect a non-string/function type and can throw confusing errors.
    // We don't want exception behavior to differ between dev and prod.
    // (Rendering will throw with a helpful message and as soon as the type is
    // fixed, the key warnings will appear.)


    if (validType) {
      var children = props.children;

      if (children !== undefined) {
        if (isStaticChildren) {
          if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
              validateChildKeys(children[i], type);
            }

            if (Object.freeze) {
              Object.freeze(children);
            }
          } else {
            error('React.jsx: Static children should always be an array. ' + 'You are likely explicitly calling React.jsxs or React.jsxDEV. ' + 'Use the Babel transform instead.');
          }
        } else {
          validateChildKeys(children, type);
        }
      }
    }

    {
      if (hasOwnProperty.call(props, 'key')) {
        var componentName = getComponentNameFromType(type);
        var keys = Object.keys(props).filter(function (k) {
          return k !== 'key';
        });
        var beforeExample = keys.length > 0 ? '{key: someKey, ' + keys.join(': ..., ') + ': ...}' : '{key: someKey}';

        if (!didWarnAboutKeySpread[componentName + beforeExample]) {
          var afterExample = keys.length > 0 ? '{' + keys.join(': ..., ') + ': ...}' : '{}';

          error('A props object containing a "key" prop is being spread into JSX:\n' + '  let props = %s;\n' + '  <%s {...props} />\n' + 'React keys must be passed directly to JSX without using spread:\n' + '  let props = %s;\n' + '  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);

          didWarnAboutKeySpread[componentName + beforeExample] = true;
        }
      }
    }

    if (type === REACT_FRAGMENT_TYPE) {
      validateFragmentProps(element);
    } else {
      validatePropTypes(element);
    }

    return element;
  }
} // These two functions exist to still get child warnings in dev
// even with the prod transform. This means that jsxDEV is purely
// opt-in behavior for better messages but that we won't stop
// giving you warnings if you use production apis.

function jsxWithValidationStatic(type, props, key) {
  {
    return jsxWithValidation(type, props, key, true);
  }
}
function jsxWithValidationDynamic(type, props, key) {
  {
    return jsxWithValidation(type, props, key, false);
  }
}

var jsx =  jsxWithValidationDynamic ; // we may want to special case jsxs internally to take advantage of static children.
// for now we can ship identical prod functions

var jsxs =  jsxWithValidationStatic ;

exports.Fragment = REACT_FRAGMENT_TYPE;
exports.jsx = jsx;
exports.jsxs = jsxs;
  })();
}


/***/ }),

/***/ "./node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js":
/*!***************************************************************************!*\
  !*** ./node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js ***!
  \***************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



if (false) // removed by dead control flow
{} else {
  module.exports = __webpack_require__(/*! ./cjs/react-jsx-runtime.development.js */ "./node_modules/.pnpm/react@18.3.1/node_modules/react/cjs/react-jsx-runtime.development.js");
}


/***/ }),

/***/ "./src/ts/components/AppFooter.tsx":
/*!*****************************************!*\
  !*** ./src/ts/components/AppFooter.tsx ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AppFooter: () => (/* binding */ AppFooter)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js");
/* harmony import */ var _utils_getString__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/getString */ "./src/ts/utils/getString.ts");


const { Button } = wp.components;
/**
 * Footer component with primary action and upgrade link
 */
const AppFooter = ({ primaryButton, config, disabled = false }) => {
    var _a;
    const features = config.features || {};
    const hasAllProFeatures = features.useLatestRelease;
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-browser__footer", children: [primaryButton, !hasAllProFeatures && config.upgradeUrl && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Button, { variant: "link", onClick: () => window.open(config.upgradeUrl, '_blank'), className: "github-release-browser-browser__upgrade-link", children: ((_a = config.strings) === null || _a === void 0 ? void 0 : _a.upgradeToPro) || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('common.upgradeToPro') }))] }));
};


/***/ }),

/***/ "./src/ts/components/AssetList.tsx":
/*!*****************************************!*\
  !*** ./src/ts/components/AssetList.tsx ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssetList: () => (/* binding */ AssetList)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js");
/* harmony import */ var _utils_format__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/format */ "./src/ts/utils/format.ts");
/* harmony import */ var _utils_getString__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/getString */ "./src/ts/utils/getString.ts");



const { Card, CardBody } = wp.components;
const AssetList = ({ assets, repository, releaseTag, isLatest, selectedAsset, onSelectAsset, strings = {} }) => {
    const handleCardClick = (asset) => {
        if ((selectedAsset === null || selectedAsset === void 0 ? void 0 : selectedAsset.id) === asset.id) {
            onSelectAsset(null);
        }
        else {
            onSelectAsset(asset);
        }
    };
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-asset-list", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "github-release-browser-asset-list__heading", children: isLatest
                    ? `${strings.assetsIn || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_2__.getString)('assets.assetsIn')} ${repository} (${strings.latest || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_2__.getString)('assets.latest')})`
                    : `${strings.assetsIn || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_2__.getString)('assets.assetsIn')} ${repository} (${releaseTag})` }), assets.length === 0 && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "github-release-browser-asset-list__empty", children: strings.noAssetsInRelease || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_2__.getString)('assets.noAssets') })), assets.map((asset) => {
                const isSelected = (selectedAsset === null || selectedAsset === void 0 ? void 0 : selectedAsset.id) === asset.id;
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Card, { className: `github-release-browser-asset-card ${isSelected ? 'github-release-browser-card_selected' : ''}`, onClick: () => handleCardClick(asset), children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(CardBody, { className: "github-release-browser-card__body", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-card__content", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-card__info", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "github-release-browser-card__title", children: asset.name }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-card__meta", children: [(0,_utils_format__WEBPACK_IMPORTED_MODULE_1__.formatFileSize)(asset.size), " \u2022 ", asset.content_type] })] }), isSelected && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "github-release-browser-card__check", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "dashicons dashicons-yes" }) }))] }) }) }, asset.id));
            })] }));
};


/***/ }),

/***/ "./src/ts/components/AssetsView.tsx":
/*!******************************************!*\
  !*** ./src/ts/components/AssetsView.tsx ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssetsView: () => (/* binding */ AssetsView)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js");
/* harmony import */ var _AssetList__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AssetList */ "./src/ts/components/AssetList.tsx");
/* harmony import */ var _utils_getString__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/getString */ "./src/ts/utils/getString.ts");



const { Button } = wp.components;
/**
 * Assets management view component
 */
const AssetsView = ({ selectedRepo, selectedRelease, selectedAsset, repoReleases, onSelectAsset, onBack, config }) => {
    var _a, _b;
    const releases = selectedRelease === 'latest' ? repoReleases[selectedRepo] : null;
    const assets = selectedRelease === 'latest' ? ((_a = releases === null || releases === void 0 ? void 0 : releases[0]) === null || _a === void 0 ? void 0 : _a.assets) || [] : selectedRelease.assets;
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-browser__main", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(Button, { variant: "tertiary", onClick: onBack, className: "github-release-browser-browser__back-button", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "github-release-browser-icon_back" }), ((_b = config.strings) === null || _b === void 0 ? void 0 : _b.back) || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_2__.getString)('assets.backToRepos')] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_AssetList__WEBPACK_IMPORTED_MODULE_1__.AssetList, { assets: assets, repository: selectedRepo, releaseTag: selectedRelease === 'latest' ? 'latest' : selectedRelease.tag_name, isLatest: selectedRelease === 'latest', selectedAsset: selectedAsset, onSelectAsset: onSelectAsset, strings: config.strings })] }));
};


/***/ }),

/***/ "./src/ts/components/BrowserApp.tsx":
/*!******************************************!*\
  !*** ./src/ts/components/BrowserApp.tsx ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BrowserApp: () => (/* binding */ BrowserApp)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _services_GitHubService__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../services/GitHubService */ "./src/ts/services/GitHubService.ts");
/* harmony import */ var _hooks_useBrowserState__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../hooks/useBrowserState */ "./src/ts/hooks/useBrowserState.ts");
/* harmony import */ var _hooks_useGitHubData__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../hooks/useGitHubData */ "./src/ts/hooks/useGitHubData.ts");
/* harmony import */ var _hooks_useRepositoryActions__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../hooks/useRepositoryActions */ "./src/ts/hooks/useRepositoryActions.ts");
/* harmony import */ var _hooks_useAssetConfirmation__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../hooks/useAssetConfirmation */ "./src/ts/hooks/useAssetConfirmation.ts");
/* harmony import */ var _LoadingState__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./LoadingState */ "./src/ts/components/LoadingState.tsx");
/* harmony import */ var _ErrorState__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ErrorState */ "./src/ts/components/ErrorState.tsx");
/* harmony import */ var _RepositorySearch__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./RepositorySearch */ "./src/ts/components/RepositorySearch.tsx");
/* harmony import */ var _RepositoryList__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./RepositoryList */ "./src/ts/components/RepositoryList.tsx");
/* harmony import */ var _AssetsView__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./AssetsView */ "./src/ts/components/AssetsView.tsx");
/* harmony import */ var _AppFooter__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./AppFooter */ "./src/ts/components/AppFooter.tsx");
/* harmony import */ var _utils_getString__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../utils/getString */ "./src/ts/utils/getString.ts");














const { Button } = wp.components;
/**
 * Complete GitHub Release Browser with repository browsing - refactored for better testability
 */
const BrowserApp = ({ config }) => {
    var _a, _b, _c, _d, _e;
    // Initialize GitHub service
    const [service] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => new _services_GitHubService__WEBPACK_IMPORTED_MODULE_2__.GitHubService({
        apiUrl: config.apiUrl,
        nonce: config.nonce,
        actionPrefix: config.actionPrefix
    }));
    // State management via custom hooks
    const browserState = (0,_hooks_useBrowserState__WEBPACK_IMPORTED_MODULE_3__.useBrowserState)();
    const { view, setView, repos, setRepos, searchQuery, setSearchQuery, expandedRepo, setExpandedRepo, repoReleases, setRepoReleases, releaseErrors, setReleaseErrors, loadingRepos, setLoadingRepos, loadingRepo, setLoadingRepo, selectedRepo, setSelectedRepo, selectedReleaseTag, setSelectedReleaseTag, selectedRelease, setSelectedRelease, selectedAssetObj, setSelectedAssetObj, error, setError, isMountedRef } = browserState;
    // Data fetching via custom hook
    const { fetchRepos, fetchReleasesForRepo, refreshRepos } = (0,_hooks_useGitHubData__WEBPACK_IMPORTED_MODULE_4__.useGitHubData)(service, isMountedRef, setRepos, repoReleases, setRepoReleases, releaseErrors, setReleaseErrors, setLoadingRepos, setLoadingRepo, setError);
    // Repository actions via custom hook
    const { handleRepoToggle, handleSelectRelease, handleBackToRepos } = (0,_hooks_useRepositoryActions__WEBPACK_IMPORTED_MODULE_5__.useRepositoryActions)(setView, setExpandedRepo, setSelectedRepo, setSelectedRelease, setSelectedReleaseTag, fetchReleasesForRepo);
    // Asset confirmation via custom hook
    const { handleConfirmAsset, canConfirmAsset } = (0,_hooks_useAssetConfirmation__WEBPACK_IMPORTED_MODULE_6__.useAssetConfirmation)(selectedRepo, selectedRelease, selectedAssetObj, config);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        isMountedRef.current = true;
        fetchRepos();
        return () => {
            isMountedRef.current = false;
        };
    }, [fetchRepos, isMountedRef]);
    // Render loading state
    if (loadingRepos) {
        return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_LoadingState__WEBPACK_IMPORTED_MODULE_7__.LoadingState, { message: ((_a = config.strings) === null || _a === void 0 ? void 0 : _a['loading.repositories']) || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_13__.getString)('loading.repositories') }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_AppFooter__WEBPACK_IMPORTED_MODULE_12__.AppFooter, { primaryButton: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Button, { variant: "primary", disabled: true, children: ((_b = config.strings) === null || _b === void 0 ? void 0 : _b.insertIntoDownload) || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_13__.getString)('actions.insertIntoDownload') }), config: config })] }));
    }
    // Render error state
    if (error) {
        return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_ErrorState__WEBPACK_IMPORTED_MODULE_8__.ErrorState, { error: error, onRetry: fetchRepos }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_AppFooter__WEBPACK_IMPORTED_MODULE_12__.AppFooter, { primaryButton: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Button, { variant: "primary", disabled: true, children: ((_c = config.strings) === null || _c === void 0 ? void 0 : _c.insertIntoDownload) || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_13__.getString)('actions.insertIntoDownload') }), config: config })] }));
    }
    // Render assets view
    if (view === 'assets' && selectedRepo && selectedRelease) {
        return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_AssetsView__WEBPACK_IMPORTED_MODULE_11__.AssetsView, { selectedRepo: selectedRepo, selectedRelease: selectedRelease, selectedAsset: selectedAssetObj, repoReleases: repoReleases, onSelectAsset: setSelectedAssetObj, onBack: handleBackToRepos, config: config }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_AppFooter__WEBPACK_IMPORTED_MODULE_12__.AppFooter, { primaryButton: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Button, { variant: "primary", onClick: handleConfirmAsset, disabled: !canConfirmAsset, children: ((_d = config.strings) === null || _d === void 0 ? void 0 : _d.insertIntoDownload) || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_13__.getString)('actions.insertIntoDownload') }), config: config })] }));
    }
    // Render repositories view
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-browser__main", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_RepositorySearch__WEBPACK_IMPORTED_MODULE_9__.RepositorySearch, { searchQuery: searchQuery, onSearchChange: setSearchQuery, onRefresh: refreshRepos, refreshDisabled: loadingRepos, strings: config.strings }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_RepositoryList__WEBPACK_IMPORTED_MODULE_10__.RepositoryList, { repos: repos, searchQuery: searchQuery, expandedRepo: expandedRepo, selectedRepo: selectedRepo, repoReleases: repoReleases, releaseErrors: releaseErrors, loadingRepo: loadingRepo, selectedReleaseTag: selectedReleaseTag, onRepoToggle: handleRepoToggle, onSelectRelease: handleSelectRelease, fetchReleasesForRepo: fetchReleasesForRepo, config: config })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_AppFooter__WEBPACK_IMPORTED_MODULE_12__.AppFooter, { primaryButton: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Button, { variant: "primary", onClick: handleConfirmAsset, disabled: !canConfirmAsset, children: ((_e = config.strings) === null || _e === void 0 ? void 0 : _e.insertIntoDownload) || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_13__.getString)('actions.insertIntoDownload') }), config: config })] }));
};


/***/ }),

/***/ "./src/ts/components/ErrorState.tsx":
/*!******************************************!*\
  !*** ./src/ts/components/ErrorState.tsx ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ErrorState: () => (/* binding */ ErrorState),
/* harmony export */   detectErrorType: () => (/* binding */ detectErrorType)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js");
/* harmony import */ var _utils_getString__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/getString */ "./src/ts/utils/getString.ts");


const { Button } = wp.components;
/**
 * Detect error type using explicit string matching
 */
function detectErrorType(error) {
    // Remove any leading numbers and clean the error message
    const cleanError = error.replace(/^\d+/, '').trim();
    const lowerError = cleanError.toLowerCase();
    // Token missing errors
    if (lowerError.includes('not configured') ||
        lowerError.includes('token not configured') ||
        lowerError.includes('missing') ||
        lowerError.includes('required') ||
        lowerError.includes('configure your github personal access token') ||
        lowerError.includes('personal access token') ||
        (lowerError.includes('configure') && lowerError.includes('token'))) {
        return 'token_missing';
    }
    // Token invalid errors
    if (lowerError.includes('invalid') &&
        lowerError.includes('token')) {
        return 'token_invalid';
    }
    return 'general';
}
/**
 * Error state component with retry functionality
 */
const ErrorState = ({ error, onRetry, className = '', children }) => {
    var _a;
    // Use configurable error detection from global config
    const errorType = detectErrorType(error);
    // Get settings URL from global config
    const settingsUrl = (_a = window.githubReleaseBrowserConfig) === null || _a === void 0 ? void 0 : _a.settingsUrl;
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: `github-release-browser-browser__error ${className}`, children: children || ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: errorType === 'token_missing' ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "github-release-browser-browser__setup-title", children: (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('error.welcome.title') }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "github-release-browser-browser__setup-message", children: (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('error.welcome.description') }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-browser__setup-actions", children: [settingsUrl && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Button, { variant: "primary", onClick: () => window.open(settingsUrl, '_blank'), children: (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('error.goToSettings') })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Button, { variant: "secondary", onClick: onRetry, children: (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('common.tryAgain') })] })] })) : errorType === 'token_invalid' ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "github-release-browser-browser__setup-title", children: (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('error.title.invalidToken') }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "github-release-browser-browser__setup-message", children: (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('error.desc.invalidToken') }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-browser__setup-actions", children: [settingsUrl && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Button, { variant: "primary", onClick: () => window.open(settingsUrl, '_blank'), children: (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('error.goToSettings') })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Button, { variant: "secondary", onClick: onRetry, children: (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('common.tryAgain') })] })] })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-browser__error-message", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "github-release-browser-icon_error" }), error] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Button, { variant: "secondary", onClick: onRetry, children: (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('common.tryAgain') })] })) })) }));
};


/***/ }),

/***/ "./src/ts/components/FeatureBadge.tsx":
/*!********************************************!*\
  !*** ./src/ts/components/FeatureBadge.tsx ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FeatureBadge: () => (/* binding */ FeatureBadge)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js");

/**
 * Feature/Pro badge - matches original EDD ProBadge styling
 */
const FeatureBadge = ({ feature, className = '' }) => {
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: className ? `github-release-browser-pro-badge ${className}` : 'github-release-browser-pro-badge', children: feature }));
};


/***/ }),

/***/ "./src/ts/components/LoadingState.tsx":
/*!********************************************!*\
  !*** ./src/ts/components/LoadingState.tsx ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LoadingState: () => (/* binding */ LoadingState)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js");
/* harmony import */ var _utils_getString__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/getString */ "./src/ts/utils/getString.ts");


const { Spinner } = wp.components;
/**
 * Loading state component with spinner and message
 */
const LoadingState = ({ message, className = '' }) => {
    const defaultMessage = message || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('loading.repositories');
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: className ? `github-release-browser-browser__loading ${className}` : 'github-release-browser-browser__loading', children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Spinner, {}), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: defaultMessage })] }));
};


/***/ }),

/***/ "./src/ts/components/ReleaseList.tsx":
/*!*******************************************!*\
  !*** ./src/ts/components/ReleaseList.tsx ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReleaseList: () => (/* binding */ ReleaseList)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js");
/* harmony import */ var _FeatureBadge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./FeatureBadge */ "./src/ts/components/FeatureBadge.tsx");
/* harmony import */ var _utils_format__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/format */ "./src/ts/utils/format.ts");
/* harmony import */ var _utils_getString__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/getString */ "./src/ts/utils/getString.ts");




const { Card, CardBody } = wp.components;
const ReleaseList = ({ releases, selectedRelease, onSelectRelease, repository, strings = {}, features, upgradeUrl, error, onRetry }) => {
    const isLatestSelected = selectedRelease === 'latest';
    const isLatestProFeature = features && !features.useLatestRelease;
    if (error) {
        return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { className: "github-release-browser-release-list__empty github-release-browser-release-list__error", children: [error, ' ', onRetry && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("a", { href: "#", onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRetry();
                    }, children: strings.retry || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_3__.getString)('common.retry') }))] }));
    }
    if (releases.length === 0) {
        return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { className: "github-release-browser-release-list__empty", children: [strings.noReleases || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_3__.getString)('releases.noReleases'), ' ', repository && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("a", { href: `https://github.com/${repository}/releases/new`, target: "_blank", rel: "noopener noreferrer", onClick: (e) => e.stopPropagation(), children: strings.createOne || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_3__.getString)('releases.createOne') }))] }));
    }
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-release-list", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Card, { className: `github-release-browser-release-card github-release-browser-release-card_latest ${isLatestProFeature
                    ? 'github-release-browser-release-card_pro'
                    : isLatestSelected
                        ? 'github-release-browser-card_selected'
                        : ''}`, onClick: () => {
                    if (isLatestProFeature && upgradeUrl) {
                        window.open(upgradeUrl, '_blank');
                    }
                    else {
                        onSelectRelease('latest');
                    }
                }, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(CardBody, { className: "github-release-browser-card__body", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-card__content", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-card__star-title", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "dashicons dashicons-star-filled" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("strong", { children: strings.useLatestRelease || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_3__.getString)('releases.useLatest') })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "github-release-browser-card__meta", children: strings.useLatestReleaseDesc || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_3__.getString)('releases.latestDescription') })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "github-release-browser-card__check", children: isLatestProFeature ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_FeatureBadge__WEBPACK_IMPORTED_MODULE_1__.FeatureBadge, { feature: strings.getPro || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_3__.getString)('common.getPro') })) : isLatestSelected ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "dashicons dashicons-yes" })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "dashicons dashicons-ellipsis" })) })] }) }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "github-release-browser-release-list__heading", children: strings.releases || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_3__.getString)('releases.title') }), releases.map((release) => {
                const isSelected = selectedRelease === release.tag_name;
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Card, { className: `github-release-browser-release-card ${isSelected ? 'github-release-browser-card_selected' : ''}`, onClick: () => onSelectRelease(release), children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(CardBody, { className: "github-release-browser-card__body", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-card__content", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-card__info", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-card__title", children: [release.tag_name, release.name && release.name !== release.tag_name && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "github-release-browser-card__subtitle", children: [" - ", release.name] }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-card__meta", children: [(0,_utils_format__WEBPACK_IMPORTED_MODULE_2__.formatDate)(release.published_at), " \u2022 ", release.assets.length, ' ', release.assets.length === 1 ? strings.asset || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_3__.getString)('assets.asset') : strings.assets || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_3__.getString)('assets.assets')] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "github-release-browser-card__dots", children: isSelected ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "dashicons dashicons-yes" })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "dashicons dashicons-ellipsis" })) })] }) }) }, release.id));
            })] }));
};


/***/ }),

/***/ "./src/ts/components/RepositoryList.tsx":
/*!**********************************************!*\
  !*** ./src/ts/components/RepositoryList.tsx ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RepositoryList: () => (/* binding */ RepositoryList)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js");
/* harmony import */ var _ReleaseList__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ReleaseList */ "./src/ts/components/ReleaseList.tsx");
/* harmony import */ var _utils_getString__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/getString */ "./src/ts/utils/getString.ts");



const { Panel, PanelBody, Spinner } = wp.components;
/**
 * Repository list component with expansion and release selection
 */
const RepositoryList = ({ repos, searchQuery, expandedRepo, selectedRepo, repoReleases, releaseErrors, loadingRepo, selectedReleaseTag, onRepoToggle, onSelectRelease, fetchReleasesForRepo, config }) => {
    var _a, _b;
    const filteredRepos = repos.filter((repo) => { var _a; return (_a = repo.full_name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes((searchQuery === null || searchQuery === void 0 ? void 0 : searchQuery.toLowerCase()) || ''); });
    if (filteredRepos.length === 0) {
        return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "github-release-browser-browser__no-results", children: searchQuery
                ? ((_a = config.strings) === null || _a === void 0 ? void 0 : _a['repositories.noResults']) || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_2__.getString)('repositories.noResults')
                : ((_b = config.strings) === null || _b === void 0 ? void 0 : _b['repositories.noneFound']) || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_2__.getString)('repositories.noneFound') }));
    }
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Panel, { children: filteredRepos.map((repo) => {
            const isSelected = selectedRepo === repo.full_name;
            const selectedPrefix = isSelected ? '✓ ' : '';
            const lockSuffix = repo.private ? ' *' : '';
            const title = selectedPrefix + repo.full_name + lockSuffix;
            return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(PanelBody, { title: title, opened: repo.full_name ? expandedRepo === repo.full_name : false, onToggle: () => {
                    if (repo && repo.full_name) {
                        onRepoToggle(repo.full_name);
                    }
                }, children: [repo.full_name && loadingRepo === repo.full_name && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "github-release-browser-repo-panel__loading", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Spinner, {}) })), !loadingRepo && repo.full_name && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_ReleaseList__WEBPACK_IMPORTED_MODULE_1__.ReleaseList, { releases: repoReleases[repo.full_name] || [], selectedRelease: repo.full_name && selectedRepo === repo.full_name ? selectedReleaseTag : null, onSelectRelease: (release) => onSelectRelease(repo.full_name, release), repository: repo.full_name, strings: config.strings, features: config.features, upgradeUrl: config.upgradeUrl, error: releaseErrors[repo.full_name], onRetry: () => fetchReleasesForRepo(repo.full_name) }))] }, repo.id));
        }) }));
};


/***/ }),

/***/ "./src/ts/components/RepositorySearch.tsx":
/*!************************************************!*\
  !*** ./src/ts/components/RepositorySearch.tsx ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RepositorySearch: () => (/* binding */ RepositorySearch)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js");
/* harmony import */ var _utils_getString__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/getString */ "./src/ts/utils/getString.ts");


const { Button, SearchControl } = wp.components;
/**
 * Repository search and controls component
 */
const RepositorySearch = ({ searchQuery, onSearchChange, onRefresh, refreshDisabled = false, strings = {} }) => {
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-browser__header", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "github-release-browser-browser__controls", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", { children: strings.selectRepo || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('repositories.select') }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Button, { variant: "tertiary", icon: "update", onClick: onRefresh, disabled: refreshDisabled, label: strings.refresh || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('repositories.refresh'), className: "github-release-browser-browser__refresh-button" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(SearchControl, { value: searchQuery, onChange: onSearchChange, placeholder: strings.search || (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('repositories.searchPlaceholder'), className: "github-release-browser-browser__search" })] }));
};


/***/ }),

/***/ "./src/ts/constants/API.ts":
/*!*********************************!*\
  !*** ./src/ts/constants/API.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   API_ACTIONS: () => (/* binding */ API_ACTIONS),
/* harmony export */   DEFAULT_PROTOCOL: () => (/* binding */ DEFAULT_PROTOCOL),
/* harmony export */   SIZE_UNITS: () => (/* binding */ SIZE_UNITS)
/* harmony export */ });
const DEFAULT_PROTOCOL = 'github-release://';
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
const API_ACTIONS = {
    GET_RELEASES: 'get_releases',
    GET_RATE_LIMIT: 'get_rate_limit',
    GET_USER_REPOS: 'get_user_repos',
    CLEAR_CACHE: 'clear_cache',
    PARSE_URI: 'parse_uri',
    GET_DOWNLOAD_URL: 'get_download_url',
};


/***/ }),

/***/ "./src/ts/constants/TRANSLATION_FALLBACKS.ts":
/*!***************************************************!*\
  !*** ./src/ts/constants/TRANSLATION_FALLBACKS.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TRANSLATION_FALLBACKS: () => (/* binding */ TRANSLATION_FALLBACKS)
/* harmony export */ });
/**
 * Default fallback translations for development and testing
 * These are used when translation keys are not found in the backend configuration
 */
const TRANSLATION_FALLBACKS = {
    // Repository related
    'repositories.noResults': 'No repositories match your search',
    'repositories.noneFound': 'No repositories found',
    'repositories.select': 'Select Repository',
    'repositories.refresh': 'Refresh repositories',
    'repositories.searchPlaceholder': 'Search repositories...',
    // Common UI strings
    'common.tryAgain': 'Try Again',
    'common.retry': 'Retry →',
    'common.getPro': 'Get Pro',
    'common.upgradeToPro': 'Upgrade to Pro',
    // Actions
    'actions.insertIntoDownload': 'Insert into download',
    // Loading states
    'loading.repositories': 'Loading repositories...',
    // Error states
    'error.welcome.title': 'Welcome to Release Browser',
    'error.welcome.description': 'To browse and insert files from your GitHub releases, you need to configure your GitHub Personal Access Token.',
    'error.title.invalidToken': 'Invalid GitHub Token',
    'error.desc.invalidToken': 'Your GitHub Personal Access Token is invalid or has been revoked. Please update your token in the settings.',
    'error.failedToFetchReleases': 'Failed to fetch releases.',
    // Time formatting for format utility
    'time.today': 'today',
    'time.yesterday': 'yesterday',
    'time.daysAgo': '%d days ago',
    'time.weeksAgo': '%d weeks ago',
    'time.monthsAgo': '%d months ago',
    'time.yearsAgo': '%d years ago',
    // Assets
    'assets.backToRepos': 'Back to repositories',
    'assets.assetsIn': 'Assets in',
    'assets.latest': 'latest',
    'assets.noAssets': 'No assets found in this release',
    'assets.asset': 'asset',
    'assets.assets': 'assets',
    // Releases
    'releases.noReleases': 'No releases found.',
    'releases.createOne': 'Create one →',
    'releases.useLatest': 'Use Latest Release',
    'releases.latestDescription': 'Automatically serve the latest published release',
    'releases.title': 'Releases'
};


/***/ }),

/***/ "./src/ts/hooks/useAssetConfirmation.ts":
/*!**********************************************!*\
  !*** ./src/ts/hooks/useAssetConfirmation.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useAssetConfirmation: () => (/* binding */ useAssetConfirmation)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

/**
 * Hook to handle asset confirmation and selection workflow
 * Manages asset validation and callback execution
 */
const useAssetConfirmation = (selectedRepo, selectedRelease, selectedAssetObj, config) => {
    const handleConfirmAsset = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        if (!selectedAssetObj || !selectedRepo || !selectedRelease) {
            return;
        }
        const releaseTag = selectedRelease === 'latest' ? 'latest' : selectedRelease.tag_name;
        if (config.onSelectAsset) {
            config.onSelectAsset({
                repo: selectedRepo,
                release: releaseTag,
                asset: selectedAssetObj,
                downloadUrl: selectedAssetObj.browser_download_url
            });
        }
    }, [selectedAssetObj, selectedRepo, selectedRelease, config]);
    const canConfirmAsset = Boolean(selectedAssetObj &&
        selectedRepo &&
        selectedRelease);
    return {
        handleConfirmAsset,
        canConfirmAsset
    };
};


/***/ }),

/***/ "./src/ts/hooks/useBrowserState.ts":
/*!*****************************************!*\
  !*** ./src/ts/hooks/useBrowserState.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useBrowserState: () => (/* binding */ useBrowserState)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

/**
 * Hook to manage all browser state
 * Centralizes state initialization and provides utilities for state management
 */
const useBrowserState = () => {
    // View state
    const [view, setView] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('repos');
    // Repository state
    const [repos, setRepos] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [searchQuery, setSearchQuery] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
    const [expandedRepo, setExpandedRepo] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [repoReleases, setRepoReleases] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({});
    const [releaseErrors, setReleaseErrors] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({});
    const [loadingRepos, setLoadingRepos] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
    const [loadingRepo, setLoadingRepo] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    // Selection state
    const [selectedRepo, setSelectedRepo] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [selectedReleaseTag, setSelectedReleaseTag] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [selectedRelease, setSelectedRelease] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [selectedAssetObj, setSelectedAssetObj] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    // Error state
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    // Ref for component mount status
    const isMountedRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(true);
    return {
        // View state
        view,
        setView,
        // Repository state
        repos,
        setRepos,
        searchQuery,
        setSearchQuery,
        expandedRepo,
        setExpandedRepo,
        repoReleases,
        setRepoReleases,
        releaseErrors,
        setReleaseErrors,
        loadingRepos,
        setLoadingRepos,
        loadingRepo,
        setLoadingRepo,
        // Selection state
        selectedRepo,
        setSelectedRepo,
        selectedReleaseTag,
        setSelectedReleaseTag,
        selectedRelease,
        setSelectedRelease,
        selectedAssetObj,
        setSelectedAssetObj,
        // Error state
        error,
        setError,
        // Refs
        isMountedRef
    };
};


/***/ }),

/***/ "./src/ts/hooks/useGitHubData.ts":
/*!***************************************!*\
  !*** ./src/ts/hooks/useGitHubData.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useGitHubData: () => (/* binding */ useGitHubData)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_getString__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/getString */ "./src/ts/utils/getString.ts");


/**
 * Hook to handle GitHub data fetching operations
 * Manages API calls, loading states, and error handling
 */
const useGitHubData = (service, isMountedRef, setRepos, repoReleases, setRepoReleases, releaseErrors, setReleaseErrors, setLoadingRepos, setLoadingRepo, setError) => {
    const fetchRepos = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        setLoadingRepos(true);
        setError(null);
        try {
            const repos = await service.getUserRepos();
            if (isMountedRef.current) {
                setRepos(repos);
            }
        }
        catch (error) {
            if (isMountedRef.current) {
                setError(error instanceof Error
                    ? error.message
                    : 'Network error occurred');
            }
        }
        finally {
            if (isMountedRef.current) {
                setLoadingRepos(false);
            }
        }
    }, [service, isMountedRef, setRepos, setLoadingRepos, setError]);
    const fetchReleasesForRepo = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (repoFullName) => {
        if (!repoFullName || repoReleases[repoFullName]) {
            return;
        }
        setLoadingRepo(repoFullName);
        try {
            const releases = await service.getReleases(repoFullName, 1);
            if (isMountedRef.current) {
                setRepoReleases((prev) => ({
                    ...prev,
                    [repoFullName]: releases
                }));
                setReleaseErrors((prev) => ({
                    ...prev,
                    [repoFullName]: null
                }));
            }
        }
        catch (error) {
            if (isMountedRef.current) {
                setReleaseErrors((prev) => ({
                    ...prev,
                    [repoFullName]: error instanceof Error ? error.message : (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('error.failedToFetchReleases')
                }));
            }
        }
        finally {
            if (isMountedRef.current) {
                setLoadingRepo(null);
            }
        }
    }, [service, isMountedRef, repoReleases, setRepoReleases, releaseErrors, setReleaseErrors, setLoadingRepo]);
    const refreshRepos = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        try {
            await service.clearCache();
        }
        catch (e) {
            // Continue anyway
        }
        await fetchRepos();
    }, [service, fetchRepos]);
    return {
        fetchRepos,
        fetchReleasesForRepo,
        refreshRepos
    };
};


/***/ }),

/***/ "./src/ts/hooks/useRepositoryActions.ts":
/*!**********************************************!*\
  !*** ./src/ts/hooks/useRepositoryActions.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useRepositoryActions: () => (/* binding */ useRepositoryActions)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

/**
 * Hook to handle repository-related actions and view transitions
 * Manages repository selection, release selection, and view state changes
 */
const useRepositoryActions = (setView, setExpandedRepo, setSelectedRepo, setSelectedRelease, setSelectedReleaseTag, fetchReleasesForRepo) => {
    const handleRepoToggle = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((repoFullName) => {
        if (!repoFullName)
            return; // Early return for undefined values
        setExpandedRepo((prev) => {
            if (prev === repoFullName) {
                return null;
            }
            else {
                fetchReleasesForRepo(repoFullName);
                return repoFullName;
            }
        });
    }, [setExpandedRepo, fetchReleasesForRepo]);
    const handleSelectRelease = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((repo, release) => {
        setSelectedRepo(repo);
        setSelectedRelease(release);
        if (release !== 'latest') {
            setSelectedReleaseTag(release.tag_name);
        }
        else {
            setSelectedReleaseTag(null);
        }
        setView('assets');
    }, [setSelectedRepo, setSelectedRelease, setSelectedReleaseTag, setView]);
    const handleBackToRepos = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        setView('repos');
    }, [setView]);
    return {
        handleRepoToggle,
        handleSelectRelease,
        handleBackToRepos
    };
};


/***/ }),

/***/ "./src/ts/services/GitHubService.ts":
/*!******************************************!*\
  !*** ./src/ts/services/GitHubService.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GitHubService: () => (/* binding */ GitHubService)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "./src/ts/constants/API.ts");
/* harmony import */ var _utils_getString__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/getString */ "./src/ts/utils/getString.ts");


class GitHubService {
    constructor(config) {
        this.apiUrl = config.apiUrl;
        this.nonce = config.nonce;
        this.actionPrefix = config.actionPrefix;
    }
    getAction(action) {
        return `${this.actionPrefix}_${action}`;
    }
    async makeRequest(action, data = {}) {
        var _a;
        const formData = new FormData();
        // Add nonce
        formData.append('nonce', this.nonce);
        // Add action
        formData.append('action', this.getAction(action));
        // Add data
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                formData.append(key, String(data[key]));
            }
        }
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(((_a = result.data) === null || _a === void 0 ? void 0 : _a.message) || 'Unknown error occurred');
        }
        return result;
    }
    async getReleases(repo, page = 1) {
        const result = await this.makeRequest(_constants__WEBPACK_IMPORTED_MODULE_0__.API_ACTIONS.GET_RELEASES, { repo, page });
        return result.data.releases || [];
    }
    async getRateLimit() {
        const result = await this.makeRequest(_constants__WEBPACK_IMPORTED_MODULE_0__.API_ACTIONS.GET_RATE_LIMIT);
        return result.data.rate_limit;
    }
    async parseUri(uri) {
        const result = await this.makeRequest('parse_uri', { uri });
        return result.data;
    }
    async getDownloadUrl(assetUrl) {
        const result = await this.makeRequest('get_download_url', { asset_url: assetUrl });
        return result.data.download_url;
    }
    async getUserRepos() {
        const result = await this.makeRequest('get_user_repos');
        // Check if backend returned an error structure
        if (result.data.repos && 'error' in result.data.repos) {
            const error = result.data.repos;
            let errorMessage = error.message || 'Unknown error occurred';
            // Use more user-friendly messages for specific error codes
            if (error.error_code === 'token_missing') {
                errorMessage = (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('error.welcome.description');
            }
            else if (error.error_code === 'token_invalid') {
                errorMessage = (0,_utils_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('error.desc.invalidToken');
            }
            throw new Error(errorMessage);
        }
        return result.data.repos || [];
    }
    async clearCache() {
        await this.makeRequest('clear_cache');
    }
}


/***/ }),

/***/ "./src/ts/utils/format.ts":
/*!********************************!*\
  !*** ./src/ts/utils/format.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatDate: () => (/* binding */ formatDate),
/* harmony export */   formatFileSize: () => (/* binding */ formatFileSize),
/* harmony export */   formatRelativeTime: () => (/* binding */ formatRelativeTime)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "./src/ts/constants/API.ts");
/* harmony import */ var _getString__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./getString */ "./src/ts/utils/getString.ts");


/**
 * Format file size in human-readable format
 */
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 B';
    const units = [..._constants__WEBPACK_IMPORTED_MODULE_0__.SIZE_UNITS];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
};
/**
 * Format date in a readable format
 */
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
};
/**
 * Format relative time
 */
const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0)
        return (0,_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('time.today');
    if (diffDays === 1)
        return (0,_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('time.yesterday');
    if (diffDays < 7)
        return (0,_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('time.daysAgo').replace('%d', diffDays.toString());
    if (diffDays < 30)
        return (0,_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('time.weeksAgo').replace('%d', Math.floor(diffDays / 7).toString());
    if (diffDays < 365)
        return (0,_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('time.monthsAgo').replace('%d', Math.floor(diffDays / 30).toString());
    return (0,_getString__WEBPACK_IMPORTED_MODULE_1__.getString)('time.yearsAgo').replace('%d', Math.floor(diffDays / 365).toString());
};


/***/ }),

/***/ "./src/ts/utils/getString.ts":
/*!***********************************!*\
  !*** ./src/ts/utils/getString.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getString: () => (/* binding */ getString)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "./src/ts/constants/TRANSLATION_FALLBACKS.ts");

/**
 * Get translated string by key from backend configuration
 * Falls back to user-friendly defaults if translation is not found
 */
const getString = (key) => {
    var _a, _b;
    // Access global config passed from PHP backend
    if ((_b = (_a = window.githubReleaseBrowserConfig) === null || _a === void 0 ? void 0 : _a.strings) === null || _b === void 0 ? void 0 : _b[key]) {
        return window.githubReleaseBrowserConfig.strings[key];
    }
    // Fallback to user-friendly defaults for development/testing
    return _constants__WEBPACK_IMPORTED_MODULE_0__.TRANSLATION_FALLBACKS[key] || key;
};


/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_react__;

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_react_dom__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***************************!*\
  !*** ./src/ts/wp-init.ts ***!
  \***************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-dom/client */ "./node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_BrowserApp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/BrowserApp */ "./src/ts/components/BrowserApp.tsx");
/**
 * WordPress auto-initialization script
 * Automatically mounts BrowserApp when the root element is found
 */



// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrowser);
}
else {
    initBrowser();
}
function initBrowser() {
    const rootElement = document.getElementById('github-release-browser-root');
    const config = window.githubReleaseBrowserConfig;
    if (!rootElement || !config) {
        // No root element or config found; do not initialize
        return;
    }
    const root = (0,react_dom_client__WEBPACK_IMPORTED_MODULE_0__.createRoot)(rootElement);
    root.render((0,react__WEBPACK_IMPORTED_MODULE_1__.createElement)(_components_BrowserApp__WEBPACK_IMPORTED_MODULE_2__.BrowserApp, {
        config: {
            apiUrl: config.apiUrl,
            nonce: config.nonce,
            actionPrefix: config.actionPrefix,
            protocol: config.protocol,
            onSelectAsset: (asset) => {
                console.log('Asset selected:', asset);
                // TODO: Handle asset selection for WordPress modal
            },
            features: config.features,
            upgradeUrl: config.upgradeUrl,
            strings: config.strings,
            textDomain: config.textDomain,
        },
    }));
}

})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=index.umd.js.map