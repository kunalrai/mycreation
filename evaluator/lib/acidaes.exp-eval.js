/// <reference path="../typings/jsep/jsep.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
//WARNING: **** This code is qunit covered. ***
// 
//No change is allowed in this code without a unit test
//Please see the tests in QUnitTests / Evaluator before making changes.
// Contact - Dr. Manoj for review of your tests
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
// Module
var Acidaes;
(function (Acidaes) {
    var Evaluator;
    (function (Evaluator) {
        var ObjectBinderBase = (function () {
            function ObjectBinderBase(name, o) {
                this.Name = name;
                this.objects = o;
            }
            ObjectBinderBase.prototype.GetValue = function (o, property) {
                if (o == null)
                    return null;
                var v = o[property];
                if (v == null || v == undefined)
                    return v;
                if (typeof v === "function") {
                    return v();
                }
                else {
                    return v;
                }
            };
            ObjectBinderBase.prototype.SetValue = function (o, property, value) {
                var v = o[property];
                if (v == null || v == undefined)
                    return;
                if (typeof v === "function") {
                    v(value);
                }
                else {
                    o[property] = value;
                }
            };
            ObjectBinderBase.prototype.GetBoundObject = function (objectName) {
                var v = this.objects[objectName];
                if (v == null || v == undefined)
                    return;
                if (typeof v === "function") {
                    return v();
                }
                return v;
            };
            ObjectBinderBase.prototype.Bind = function (objectName, value) {
                this.objects[objectName] = value;
            };
            ObjectBinderBase.prototype.Unbind = function (objectName) {
                delete this.objects[objectName];
            };
            return ObjectBinderBase;
        })();
        Evaluator.ObjectBinderBase = ObjectBinderBase;
        var Expression = (function () {
            function Expression() {
                this.Type = "";
            }
            Expression.prototype.Accept = function (visitor) {
            };
            return Expression;
        })();
        Evaluator.Expression = Expression;
        var BinaryExpression = (function (_super) {
            __extends(BinaryExpression, _super);
            function BinaryExpression() {
                _super.call(this);
                this.Type = "BinaryExpression";
            }
            BinaryExpression.prototype.Accept = function (visitor) {
                visitor.VisitBinaryExpression(this);
            };
            return BinaryExpression;
        })(Expression);
        Evaluator.BinaryExpression = BinaryExpression;
        var Literal = (function (_super) {
            __extends(Literal, _super);
            function Literal() {
                _super.call(this);
                this.Type = "Literal";
            }
            Literal.prototype.Accept = function (visitor) {
                visitor.VisitLiteral(this);
            };
            return Literal;
        })(Expression);
        Evaluator.Literal = Literal;
        var Identifier = (function (_super) {
            __extends(Identifier, _super);
            function Identifier() {
                _super.call(this);
                this.Type = "Identifier";
            }
            Identifier.prototype.Accept = function (visitor) {
                visitor.VisitIdentifier(this);
            };
            return Identifier;
        })(Expression);
        Evaluator.Identifier = Identifier;
        var ThisExpression = (function (_super) {
            __extends(ThisExpression, _super);
            function ThisExpression() {
                _super.call(this);
                this.Type = "ThisExpression";
            }
            ThisExpression.prototype.Accept = function (visitor) {
                visitor.VisitThisExpression(this);
            };
            return ThisExpression;
        })(Expression);
        Evaluator.ThisExpression = ThisExpression;
        var CallExpression = (function (_super) {
            __extends(CallExpression, _super);
            function CallExpression() {
                _super.call(this);
                this.Type = "CallExpression";
            }
            CallExpression.prototype.Accept = function (visitor) {
                visitor.VisitCallExpression(this);
            };
            return CallExpression;
        })(Expression);
        Evaluator.CallExpression = CallExpression;
        var LogicalExpression = (function (_super) {
            __extends(LogicalExpression, _super);
            function LogicalExpression() {
                _super.call(this);
                this.Type = "LogicalExpression";
            }
            LogicalExpression.prototype.Accept = function (visitor) {
                visitor.VisitLogicalExpression(this);
            };
            return LogicalExpression;
        })(Expression);
        Evaluator.LogicalExpression = LogicalExpression;
        var MemberExpression = (function (_super) {
            __extends(MemberExpression, _super);
            function MemberExpression() {
                _super.call(this);
                this.Type = "MemberExpression";
            }
            MemberExpression.prototype.Accept = function (visitor) {
                visitor.VisitMemberExpression(this);
            };
            return MemberExpression;
        })(Expression);
        Evaluator.MemberExpression = MemberExpression;
        var UnaryExpression = (function (_super) {
            __extends(UnaryExpression, _super);
            function UnaryExpression() {
                _super.call(this);
                this.Type = "UnaryExpression";
            }
            UnaryExpression.prototype.Accept = function (visitor) {
                visitor.VisitUnaryExpression(this);
            };
            return UnaryExpression;
        })(Expression);
        Evaluator.UnaryExpression = UnaryExpression;
        var PageModelBinder = (function (_super) {
            __extends(PageModelBinder, _super);
            function PageModelBinder() {
                _super.apply(this, arguments);
            }
            return PageModelBinder;
        })(ObjectBinderBase);
        Evaluator.PageModelBinder = PageModelBinder;
        var ExpressionParser = (function () {
            function ExpressionParser() {
            }
            ExpressionParser.prototype.CreateBinaryExpression = function (exp) {
                var expression = new BinaryExpression();
                expression.Operator = exp.operator;
                expression.Left = this.CreateExpression(exp.left);
                expression.Right = this.CreateExpression(exp.right);
                return expression;
            };
            ExpressionParser.prototype.CreateLiteral = function (exp) {
                var expression = new Literal();
                expression.Value = exp.value;
                return expression;
            };
            ExpressionParser.prototype.CreateIdentifier = function (exp) {
                var expression = new Identifier();
                expression.Identifier = exp.name;
                return expression;
            };
            ExpressionParser.prototype.CreateLogicalExpression = function (exp) {
                var expression = new LogicalExpression();
                expression.Operator = exp.operator;
                expression.Left = this.CreateExpression(exp.left);
                expression.Right = this.CreateExpression(exp.right);
                return expression;
            };
            ExpressionParser.prototype.CreateCallExpression = function (exp) {
                var self = this;
                var expression = new CallExpression();
                expression.Callee = self.CreateExpression(exp.callee);
                var args = new Array();
                //exp.arguments.forEach((v, i, a) => {
                $.each(exp.arguments, function (i, v) {
                    var arg = self.CreateExpression(v);
                    args.push(arg);
                });
                expression.Arguments = args;
                return expression;
            };
            ExpressionParser.prototype.CreateThisExpression = function (exp) {
                var expression = new ThisExpression();
                return expression;
            };
            ExpressionParser.prototype.CreateMemberExpression = function (exp) {
                var expression = new MemberExpression();
                expression.IsComputed = exp.computed;
                expression.Object = this.CreateExpression(exp.object);
                expression.Property = this.CreateExpression(exp.property);
                return expression;
            };
            ExpressionParser.prototype.CreateUnaryExpression = function (exp) {
                var expression = new UnaryExpression();
                expression.Operator = exp.operator;
                expression.Argument = this.CreateExpression(exp.argument);
                expression.Prefix = exp.prefix;
                return expression;
            };
            ExpressionParser.prototype.CreateExpression = function (exp) {
                switch (exp.type) {
                    case "BinaryExpression":
                        return this.CreateBinaryExpression(exp);
                    case "Identifier":
                        return this.CreateIdentifier(exp);
                    case "Literal":
                        return this.CreateLiteral(exp);
                    case "LogicalExpression":
                        return this.CreateLogicalExpression(exp);
                    case "CallExpression":
                        return this.CreateCallExpression(exp);
                    case "UnaryExpression":
                        return this.CreateUnaryExpression(exp);
                    case "MemberExpression":
                        return this.CreateMemberExpression(exp);
                    case "ThisExpression":
                        return this.CreateThisExpression(exp);
                }
                return null;
            };
            ExpressionParser.prototype.Build = function (exp) {
                return this.CreateExpression(exp);
            };
            ExpressionParser.prototype.Parse = function (expression) {
                var parsedExpression = window.jsep(expression);
                var expressionTree = this.Build(parsedExpression);
                return expressionTree;
            };
            return ExpressionParser;
        })();
        Evaluator.ExpressionParser = ExpressionParser;
        var EvaluatorVisitor = (function () {
            function EvaluatorVisitor(binder, globalBinder) {
                this.Binder = binder;
                this.GlobalBinder = (globalBinder != null) ? globalBinder : binder;
            }
            EvaluatorVisitor.prototype.isIterator = function (propertyName) {
                if (!this.isCall)
                    return false;
                if (propertyName == "select" || propertyName == "where" || propertyName == "avg" || propertyName == "max" || propertyName == "min" || propertyName == "sum" || propertyName == "count" || propertyName == "roundup" || propertyName == "in")
                    return true;
                return false;
            };
            EvaluatorVisitor.prototype.VisitThisExpression = function (expression) {
            };
            EvaluatorVisitor.prototype.InvokeSystemFunction = function (functionName, args) {
                var done = false;
                var result = null;
                switch (functionName.toLowerCase()) {
                    case "roundup":
                        var d = (args.length == 1) ? 1 : Math.pow(10, args[1]);
                        result = Math.round(args[0] * d) / d;
                        done = true;
                        break;
                }
                this.Result = result;
                return done;
            };
            EvaluatorVisitor.prototype.EvaluateExpression = function (expression) {
                var old = this.Result;
                expression.Accept(this);
                var result = this.Result;
                this.Result = old;
                return result;
            };
            EvaluatorVisitor.prototype.VisitIfExpression = function (expression) {
                var functionName = expression.Callee;
                if (expression.Arguments.length != 3)
                    return;
                var result = null;
                this.Result = null;
                var condition = this.EvaluateExpression(expression.Arguments[0]);
                if (condition) {
                    result = this.EvaluateExpression(expression.Arguments[1]);
                }
                else {
                    result = this.EvaluateExpression(expression.Arguments[2]);
                }
                this.Result = result;
            };
            EvaluatorVisitor.prototype.getFunctionName = function (callee) {
                if (!(callee instanceof Identifier))
                    return null;
                var functionName = callee.Identifier;
                return functionName;
            };
            EvaluatorVisitor.prototype.EvaluateArguments = function (arguments) {
                var self = this;
                var args = new Array();
                var result = self.Result;
                //arguments.forEach((v, i, a) => {
                $.each(arguments, function (i, v) {
                    v.Accept(self);
                    var r = self.Result;
                    args.push(r);
                });
                self.Result = result;
                return args;
            };
            EvaluatorVisitor.prototype.InvokeUserFunction = function (o, functionName, args) {
                var f = this.Binder.GetValue(o, functionName);
                if (f != null)
                    this.Result = f(args);
            };
            EvaluatorVisitor.prototype.VisitGeneralCallExpression = function (expression) {
                var functionName = this.getFunctionName(expression.Callee);
                var args = this.EvaluateArguments(expression.Arguments);
                if (!this.InvokeSystemFunction(functionName, args)) {
                    this.InvokeUserFunction(null, functionName, args);
                }
            };
            EvaluatorVisitor.prototype.GetIterFunction = function (functionName) {
                switch (functionName.toLowerCase()) {
                    case "select":
                        return this.SelectFunction;
                        break;
                    case "sum":
                        return this.SumFunction;
                        break;
                    case "min":
                        return this.MinFunction;
                        break;
                    case "max":
                        return this.MaxFunction;
                        break;
                    case "count":
                        return this.CountFunction;
                        break;
                    case "where":
                        return this.WhereFunction;
                        break;
                    case "roundup":
                        return this.RoundUpFunction;
                        break;
                    case "in":
                        return this.InFunction;
                        break;
                }
                return null;
            };
            EvaluatorVisitor.prototype.VisitIterItems = function (v, arguments, previous, newCallback, computeCallback, accumulateCallback) {
                var items;
                if (previous == null)
                    items = newCallback();
                else
                    items = previous;
                var oldBinder = this.Binder;
                var oldBoundObject = this.BoundObject;
                var oldParentBinder = this.ParentBinder;
                this.ParentBinder = this.Binder;
                if (v.GetBoundObject) {
                    this.Binder = v;
                    this.BoundObject = null;
                }
                else
                    this.BoundObject = v;
                var args = this.EvaluateArguments(arguments);
                var value = computeCallback(args);
                var result = accumulateCallback(items, value);
                this.ParentBinder = oldParentBinder;
                this.Binder = oldBinder;
                this.BoundObject = oldBoundObject;
                return result;
            };
            EvaluatorVisitor.prototype.SelectFunction = function (self, v, arguments, previous) {
                return self.VisitIterItems(v, arguments, previous, function () {
                    return new Array();
                }, function (args) {
                    if (args.length == 1)
                        return args[0];
                    return v;
                }, function (accumulator, result) {
                    accumulator.push(result);
                    return accumulator;
                });
            };
            EvaluatorVisitor.prototype.WhereFunction = function (self, v, arguments, previous) {
                return self.VisitIterItems(v, arguments, previous, function () {
                    return new Array();
                }, function (args) {
                    if (args.length == 1)
                        return (args[0]) ? v : null;
                    return v;
                }, function (accumulator, result) {
                    if (result != null)
                        accumulator.push(result);
                    return accumulator;
                });
            };
            EvaluatorVisitor.prototype.AggregateFunction = function (v, arguments, previous, aggregateCallback) {
                return this.VisitIterItems(v, arguments, previous, function () {
                    return null;
                }, function (args) {
                    if (args.length == 1)
                        return args[0];
                    return v;
                }, aggregateCallback);
            };
            EvaluatorVisitor.prototype.SumFunction = function (self, v, arguments, previous) {
                return self.AggregateFunction(v, arguments, previous, function (aggregate, value) {
                    if (aggregate == null)
                        return value;
                    return aggregate + value;
                });
            };
            EvaluatorVisitor.prototype.RoundUpFunction = function (self, v, arguments, previous) {
                return self.AggregateFunction(v, arguments, previous, function (aggregate, value) {
                    if (value == null)
                        value = 0;
                    var arr = new Array();
                    arr[0] = v;
                    arr[1] = value;
                    return self.InvokeSystemFunction("roundup", arr);
                });
            };
            EvaluatorVisitor.prototype.InFunction = function (self, v, arguments, previous) {
                return self.AggregateFunction(v, arguments, previous, function (aggregate, value) {
                    if (value === "" || value == 0)
                        return 1;
                    if (value == null) {
                        value = 1;
                    }
                    if (aggregate == 1)
                        return 1;
                    if (v.toLowerCase() == value.toLowerCase()) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                });
            };
            EvaluatorVisitor.prototype.CountFunction = function (self, v, arguments, previous) {
                return self.AggregateFunction(v, arguments, previous, function (aggregate, value) {
                    if (aggregate == null)
                        return 1;
                    return aggregate + 1;
                });
            };
            EvaluatorVisitor.prototype.MinFunction = function (self, v, arguments, previous) {
                return self.AggregateFunction(v, arguments, previous, function (aggregate, value) {
                    if (aggregate == null)
                        return value;
                    return (value < aggregate) ? value : aggregate;
                });
            };
            EvaluatorVisitor.prototype.MaxFunction = function (self, v, arguments, previous) {
                return self.AggregateFunction(v, arguments, previous, function (aggregate, value) {
                    if (aggregate == null)
                        return value;
                    return (value > aggregate) ? value : aggregate;
                });
            };
            EvaluatorVisitor.prototype.VisitIteratorFunction = function (expression) {
                var functionName = this.iteratorName;
                var o = this.Result;
                var self = this;
                if (o == null || typeof (o) === "undefined") {
                    self.Result = null;
                    return;
                }
                var iterFunc = this.GetIterFunction(functionName);
                if (iterFunc == null) {
                    self.Result = null;
                    return;
                }
                var result = null;
                if (o instanceof Array) {
                    var items = o;
                    //items.forEach((v, i, a) => {
                    $.each(items, function (i, v) {
                        result = iterFunc(self, v, expression.Arguments, result);
                    });
                }
                else if (o != undefined && $.isNumeric(o) && functionName == "roundup") {
                    iterFunc(self, o, expression.Arguments, result);
                    return;
                }
                //else {
                //    result = iterFunc(o, expression.Arguments, result);
                //}
                this.Result = result;
            };
            EvaluatorVisitor.prototype.VisitMemberExpression = function (expression) {
                expression.Object.Accept(this);
                var o = this.Result;
                if (o == null) {
                    this.Result = undefined;
                    return;
                }
                if (o == undefined) {
                    this.Result = undefined;
                    return;
                }
                this.BoundObject = o;
                var property = null;
                if (expression.IsComputed) {
                    expression.Property.Accept(this);
                    property = this.Result;
                }
                else {
                    property = expression.Property.Identifier;
                    if (this.isIterator(property)) {
                        this.iteratorName = property;
                        this.Result = o;
                        return;
                    }
                }
                this.Result = this.GetValue(property);
                this.BoundObject = null;
            };
            EvaluatorVisitor.prototype.VisitCallExpression = function (expression) {
                var oldCall = this.isCall;
                var oldIterName = this.iteratorName;
                var contextSwitch = false;
                this.isCall = true;
                this.iteratorName = null;
                expression.Callee.Accept(this);
                this.isCall = oldCall;
                var functionName = this.getFunctionName(expression.Callee);
                if (functionName == null) {
                    this.VisitIteratorFunction(expression);
                    return;
                }
                if (functionName.toLowerCase() === "if") {
                    this.VisitIfExpression(expression);
                }
                else
                    this.VisitGeneralCallExpression(expression);
                this.iteratorName = oldIterName;
            };
            EvaluatorVisitor.prototype.VisitUnaryExpression = function (expression) {
                expression.Argument.Accept(this);
                var left = this.Result;
                if (left == null) {
                    this.Result = null;
                    return;
                }
                if (left == undefined) {
                    this.Result = undefined;
                    return;
                }
                var result = null;
                switch (expression.Operator) {
                    case "-":
                        result = -left;
                        break;
                    case "!":
                        result = !left;
                        break;
                    case "~":
                        result = ~left;
                        break;
                    case "+":
                        result = +left;
                        break;
                }
                this.Result = result;
            };
            EvaluatorVisitor.prototype.VisitLogicalExpression = function (expression) {
                expression.Left.Accept(this);
                var left = this.Result;
                if (left == null) {
                    this.Result = null;
                    return;
                }
                if (left == undefined) {
                    this.Result = undefined;
                    return;
                }
                expression.Right.Accept(this);
                var right = this.Result;
                if (right == null) {
                    this.Result = null;
                    return;
                }
                if (right == undefined) {
                    this.Result = undefined;
                    return;
                }
                var result;
                switch (expression.Operator) {
                    case "||":
                        result = left || right;
                        break;
                    case "&&":
                        result = left && right;
                        break;
                }
                this.Result = result;
            };
            EvaluatorVisitor.prototype.VisitBinaryExpression = function (expression) {
                expression.Left.Accept(this);
                var left = this.Result;
                if (left == null) {
                    this.Result = null;
                    return;
                }
                if (left == undefined) {
                    this.Result = undefined;
                    return;
                }
                expression.Right.Accept(this);
                var right = this.Result;
                if (right == null) {
                    this.Result = null;
                    return;
                }
                if (right == undefined) {
                    this.Result = undefined;
                    return;
                }
                var result;
                switch (expression.Operator) {
                    case "+":
                        result = left + right;
                        break;
                    case "-":
                        result = left - right;
                        break;
                    case "*":
                        result = left * right;
                        break;
                    case "/":
                        result = left / right;
                        break;
                    case "|":
                        result = left | right;
                        break;
                    case "^":
                        result = left ^ right;
                        break;
                    case "&":
                        result = left & right;
                        break;
                    case "==":
                        result = left == right;
                        break;
                    case "!=":
                        result = left != right;
                        break;
                    case "===":
                        result = this.CheckSimilarValue(left, right);
                        break;
                    case "!==":
                        result = left !== right;
                        break;
                    case "<":
                        result = left < right;
                        break;
                    case ">":
                        result = left > right;
                        break;
                    case "<=":
                        result = left <= right;
                        break;
                    case ">=":
                        result = left >= right;
                        break;
                    case "<<":
                        result = left << right;
                        break;
                    case ">>":
                        result = left >> right;
                        break;
                    case ">>>":
                        result = left >>> right;
                        break;
                    case "%":
                        result = left % right;
                        break;
                }
                this.Result = result;
            };
            EvaluatorVisitor.prototype.CheckSimilarValue = function (left, right) {
                var val = -1;
                $.each(left, function (i, v) {
                    val = jQuery.inArray(v, right);
                    if (val > -1)
                        return false;
                });
                if (left.length > 0 && val == -1) {
                    return false;
                }
                var checkValueAreSimilar = right.length && right.reduce(function (a, b) {
                    return (a === b) ? a : false;
                }) === right[0];
                if (!checkValueAreSimilar)
                    return false;
                return true;
            };
            EvaluatorVisitor.prototype.VisitLiteral = function (expression) {
                this.Result = expression.Value;
            };
            EvaluatorVisitor.prototype.GetValue = function (name) {
                var result = null;
                var binder = this.Binder;
                if (name.length > 2) {
                    if (name.substr(0, 2) == "$$") {
                        var globalName = name.substring(2);
                        result = this.GlobalBinder.GetBoundObject(name);
                        this.ParentBinder = this.Binder;
                        return result;
                    }
                }
                if (name.length > 1) {
                    if (name.substr(0, 1) == "$") {
                        name = name.substring(1);
                        binder = this.ParentBinder;
                        result = binder.GetBoundObject(name);
                        return result;
                    }
                }
                if (binder == null)
                    binder = this.GlobalBinder;
                if (typeof (this.BoundObject) != "undefined" && this.BoundObject != null)
                    result = binder.GetValue(this.BoundObject, name);
                else
                    result = binder.GetBoundObject(name);
                return result;
            };
            EvaluatorVisitor.prototype.VisitIdentifier = function (expression) {
                this.Result = this.GetValue(expression.Identifier);
            };
            return EvaluatorVisitor;
        })();
        Evaluator.EvaluatorVisitor = EvaluatorVisitor;
        // Class
        var ExpressionEvaluator = (function () {
            // Constructor
            function ExpressionEvaluator(binder, globalBinder) {
                this.binder = binder;
                this.globalBinder = globalBinder;
            }
            // Instance member
            ExpressionEvaluator.prototype.Evaluate = function (expression) {
                var visitor = new EvaluatorVisitor(this.binder, this.globalBinder);
                expression.Accept(visitor);
                var result = visitor.Result;
                return result;
            };
            return ExpressionEvaluator;
        })();
        Evaluator.ExpressionEvaluator = ExpressionEvaluator;
    })(Evaluator = Acidaes.Evaluator || (Acidaes.Evaluator = {}));
})(Acidaes || (Acidaes = {}));
//# sourceMappingURL=acidaes.exp-eval.js.map