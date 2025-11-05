

// https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // Register MQEngine as an AMD module
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Export MQEngine as a CommonJS module
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
    let MQEngine = {};

    MQEngine.QuizEngine = class {

    }

    return MQEngine;
}));