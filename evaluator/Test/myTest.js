/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/qunit/qunit.d.ts" />
/// <reference path="../lib/acidaes.exp-eval.ts" />
var Acidaes;
(function (Acidaes) {
    var Evaluator;
    (function (Evaluator) {
        var Tests;
        (function (Tests) {
            var EvaluatorTest = (function () {
                function EvaluatorTest() {
                }
                EvaluatorTest.prototype.Parser = function (assert) {
                    var parser = new Acidaes.Evaluator.ExpressionParser();
                    var result = parser.Parse("a");
                    assert.ok(result != null, "Parsed Identifier");
                    assert.ok(result instanceof Evaluator.Identifier, "The expression is Identifier");
                    assert.ok(result.Identifier == "a", "Value is parsed");
                    result = parser.Parse("10");
                    assert.ok(result != null, "Parsed Literal");
                    assert.ok(result instanceof Evaluator.Literal, "The expression is Literal");
                    assert.ok(result.Value == 10, "Value is parsed");
                    result = parser.Parse("a+b");
                    assert.ok(result != null, "Parsed Binary Expression");
                    assert.ok(result instanceof Evaluator.BinaryExpression, "The expression is Binary Expression");
                    assert.ok(result.Operator === "+", "Operator should be +");
                    result = parser.Parse("-a");
                    assert.ok(result != null, "Parsed -a");
                    assert.ok(result instanceof Evaluator.UnaryExpression, "The expression is Unary Expression");
                    assert.ok(result.Operator === "-", "Operator should be -");
                    result = parser.Parse("a.b");
                    assert.ok(result != null, "Parsed a.b");
                    assert.ok(result instanceof Evaluator.MemberExpression, "The expression is Member Expression");
                    assert.ok(!result.IsComputed, "IsComputed should be false");
                    assert.ok(result.Property.Identifier === "b", "Property should be b");
                    result = parser.Parse("a[1]");
                    assert.ok(result != null, "Parsed a[1]");
                    assert.ok(result instanceof Evaluator.MemberExpression, "The expression is Member Expression");
                    assert.ok(result.IsComputed, "IsComputed should be true");
                    assert.ok(result.Property.Value === 1, "Argument should be 1");
                };
                EvaluatorTest.prototype.Evaluator = function (assert) {
                    var binder = new Evaluator.PageModelBinder("page", {});
                    binder.Bind("a", 1);
                    binder.Bind("b", 2);
                    var evaluator = new Acidaes.Evaluator.ExpressionEvaluator(binder, null);
                    var parser = new Acidaes.Evaluator.ExpressionParser();
                    var expression = parser.Parse("a+b");
                    var result = evaluator.Evaluate(expression);
                    assert.ok(result == 3, "Add a+b");
                    binder.Bind("b", null);
                    result = evaluator.Evaluate(expression);
                    assert.ok(result == null, "Add a+null");
                    binder.Bind("b", undefined);
                    result = evaluator.Evaluate(expression);
                    assert.ok(result == undefined, "Add a+undefined");
                    binder.Bind("a", "Test");
                    binder.Bind("b", 2);
                    result = evaluator.Evaluate(expression);
                    assert.ok(result == "Test2", "Add a+string");
                    expression = parser.Parse("-b");
                    binder.Bind("b", 23);
                    result = evaluator.Evaluate(expression);
                    assert.ok(result == -23, "Result should be -23");
                    expression = parser.Parse("roundup(10.12345,2)");
                    result = evaluator.Evaluate(expression);
                    assert.ok(result == 10.12, "Result should be 10.12");
                };
                EvaluatorTest.prototype.Binder = function (assert) {
                    var binder = new Evaluator.PageModelBinder("page", {});
                    binder.Bind("a", function () {
                        return 1;
                    });
                    binder.Bind("b", function () {
                        return 2;
                    });
                    binder.Bind("c", 3);
                    binder.Bind("obj1", {
                        "a": 10,
                        "b": 20,
                        "d": function () {
                            return [
                                [11, 12, 13],
                                [21, 22, 23],
                                [31, 32, 33]
                            ];
                        }
                    });
                    var evaluator = new Acidaes.Evaluator.ExpressionEvaluator(binder, null);
                    var parser = new Acidaes.Evaluator.ExpressionParser();
                    var expression = parser.Parse("obj1.a");
                    var result = evaluator.Evaluate(expression);
                    assert.ok(result == 10, "Member access check");
                    expression = parser.Parse("a+obj1.a");
                    result = evaluator.Evaluate(expression);
                    assert.ok(result == 11, "a+obj1.a");
                    expression = parser.Parse("a+obj1.a+obj1.d[0][0]");
                    result = evaluator.Evaluate(expression);
                    assert.ok(result == 22, "Evaluated Complex expression");
                };
                EvaluatorTest.prototype.Aggregate = function (assert) {
                    var binder = new Evaluator.PageModelBinder("page", {});
                    binder.Bind("a", [1, 2, 3, 4, 5, 6]);
                    binder.Bind("b", [
                        { "d": 1, "e": 2 },
                        { "d": 2, "e": 3 },
                        { "d": 3, "e": 4 },
                        { "d": 5, "e": 5 },
                    ]);
                    var globalBinder = new Evaluator.ObjectBinderBase("$$edit", {});
                    globalBinder.Bind("a", [1, 2, 3, 4, 5, 6]);
                    var evaluator = new Acidaes.Evaluator.ExpressionEvaluator(binder, globalBinder);
                    var parser = new Acidaes.Evaluator.ExpressionParser();
                    var expression = parser.Parse("b.select()");
                    var result = evaluator.Evaluate(expression);
                    assert.ok(result.length == 4, "select should return same number of items");
                    expression = parser.Parse("b.select(e)");
                    result = evaluator.Evaluate(expression);
                    assert.ok(result[2] == 4, "it should select proper items");
                    expression = parser.Parse("b.select(e).sum()");
                    result = evaluator.Evaluate(expression);
                    assert.ok(result == 14, "b.select(e).sum()");
                };
                EvaluatorTest.prototype.GlobalContext = function (assert) {
                    var binder = new Evaluator.PageModelBinder("page", {});
                    binder.Bind("a", [1, 2, 3, 4, 5, 6]);
                    binder.Bind("b", [
                        { "d": 1, "e": 2 },
                        { "d": 2, "e": 3 },
                        { "d": 3, "e": 4 },
                        { "d": 5, "e": 5 },
                    ]);
                    var globalBinder = new Evaluator.ObjectBinderBase("$$edit", {});
                    globalBinder.Bind("$$a", [1, 2, 3, 4, 5, 6]);
                    var evaluator = new Acidaes.Evaluator.ExpressionEvaluator(binder, globalBinder);
                    var parser = new Acidaes.Evaluator.ExpressionParser();
                    var expression;
                    var result;
                    //expression = parser.Parse("b.where(e==$$a[2]).select(e).sum()");
                    //result = evaluator.Evaluate(expression);
                    //assert.ok(result == 3, "b.where(e==$$a[2]).select(e).sum()");
                    expression = parser.Parse("b.where(e==$a[2]).select(e).sum()");
                    result = evaluator.Evaluate(expression);
                    assert.ok(result == 3, "b.where(e==$a[2]).select(e).sum()");
                };
                EvaluatorTest.prototype.MyEvaluator = function (assert) {
                    var binder = new Evaluator.PageModelBinder("page", {});
                    binder.Bind("EmployeeType", "Salaried");
                    binder.Bind("IndustryType", "IT");
                    var evaluator = new Acidaes.Evaluator.ExpressionEvaluator(binder, null);
                    var parser = new Acidaes.Evaluator.ExpressionParser();
                    var expression = parser.Parse("(EmployeeType == 'Salaried' && IndustryType == 'IT') || (EmployeeType == 'Student' && IndustryType=='College')");
                    var result = evaluator.Evaluate(expression);
                    console.log(expression);
                    console.log(result);
                    assert.ok(result == true, "Result should be true");
                };
                EvaluatorTest.prototype.Register = function () {
                    QUnit.module("Evaluator");
                    //QUnit.test("Parser", this.Parser);
                    //QUnit.test("Evaluator", this.Evaluator);
                    //QUnit.test("Binder", this.Binder);
                    //QUnit.test("Aggregate", this.Aggregate);
                    //QUnit.test("GlobalContext", this.GlobalContext);
                    QUnit.test("MyEvaluator", this.MyEvaluator);
                };
                return EvaluatorTest;
            })();
            Tests.EvaluatorTest = EvaluatorTest;
        })(Tests = Evaluator.Tests || (Evaluator.Tests = {}));
    })(Evaluator = Acidaes.Evaluator || (Acidaes.Evaluator = {}));
})(Acidaes || (Acidaes = {}));
$(function () {
    var evaluatorTests = new Acidaes.Evaluator.Tests.EvaluatorTest();
    evaluatorTests.Register();
});
//# sourceMappingURL=myTest.js.map