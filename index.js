"use strict";

const RequireCSSEvaluator = require('./evaluator');

module.exports = function (ast, options) {
    if (this.options && this.options.Evaluator) {
        Object.getOwnPropertyNames(RequireCSSEvaluator.prototype).forEach(name => {
            if (name !== 'constructor') {
                this.options.Evaluator.prototype[name] = RequireCSSEvaluator.prototype[name];
            }
        });
    }
    return new RequireCSSEvaluator(ast, options);
};
