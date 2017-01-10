const RequireCSSEvaluator = require('./evaluator');

module.exports = function (ast, options) {
    if (this.options && this.options.Evaluator) this.options.Evaluator = RequireCSSEvaluator;
    return new RequireCSSEvaluator(ast, options);
};
