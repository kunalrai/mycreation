/// <reference path="../typings/jsep/jsep.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
//WARNING: **** This code is qunit covered. ***
// 
//No change is allowed in this code without a unit test
//Please see the tests in QUnitTests / Evaluator before making changes.
// Contact - Dr. Manoj for review of your tests

// Module
module Acidaes.Evaluator {

    export interface IObjectBinder {
        Name: string;

        GetValue(o: any, property: string): any;
        SetValue(o: any, property: string, value: any): void;

        GetBoundObject(objectName: string): any;
        Bind(objectName: string, value: any): void;
        Unbind(objectName: string): void;
    }

    export class ObjectBinderBase implements IObjectBinder {
        private objects: any;

        constructor(name: string, o: any) {
            this.Name = name;
            this.objects = o;
        }

        public Name: string;

        public GetValue(o: any, property: string): any {

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
        }

        public SetValue(o: any, property: string, value: any): void {
            var v = o[property];

            if (v == null || v == undefined)
                return;

            if (typeof v === "function") {
                v(value);
            }
            else {
                o[property] = value;
            }
        }

        public GetBoundObject(objectName): any {
            var v = this.objects[objectName];

            if (v == null || v == undefined)
                return;

            if (typeof v === "function") {
                return v();
            }

            return v;
        }

        public Bind(objectName, value: any): void {
            this.objects[objectName] = value;
        }

        public Unbind(objectName: string): void {
            delete this.objects[objectName];
        }
    }

    export interface IVisitor {
        VisitBinaryExpression(expression: BinaryExpression): void;
        VisitLiteral(expression: Literal): void;
        VisitIdentifier(expression: Identifier): void;
        VisitMemberExpression(expression: MemberExpression): void;
        VisitThisExpression(expression: ThisExpression): void;
        VisitCallExpression(expression: CallExpression): void;
        VisitUnaryExpression(expression: UnaryExpression): void;
        VisitLogicalExpression(expression: LogicalExpression): void;
    }

    export class Expression {
        constructor() {
            this.Type = "";
        }

        public Type: string;

        Accept(visitor: IVisitor): void {
        }
    }

    export class BinaryExpression extends Expression {
        constructor() {
            super();
            this.Type = "BinaryExpression";
        }

        Accept(visitor: IVisitor): void {
            visitor.VisitBinaryExpression(this);
        }

        public Left: Expression;
        public Right: Expression;
        public Operator: string;
    }

    export class Literal extends Expression {
        constructor() {
            super();
            this.Type = "Literal";
        }

        Accept(visitor: IVisitor): void {
            visitor.VisitLiteral(this);
        }

        public Value: any;
    }

    export class Identifier extends Expression {
        constructor() {
            super();
            this.Type = "Identifier";
        }

        Accept(visitor: IVisitor): void {
            visitor.VisitIdentifier(this);
        }

        public Identifier: string;
    }

    export class ThisExpression extends Expression {
        constructor() {
            super();
            this.Type = "ThisExpression";
        }

        Accept(visitor: IVisitor): void {
            visitor.VisitThisExpression(this);
        }

        //    public Identifier: string;
    }

    export class CallExpression extends Expression {
        constructor() {
            super();
            this.Type = "CallExpression";
        }

        Accept(visitor: IVisitor): void {
            visitor.VisitCallExpression(this);
        }

        public Callee: Expression;
        public Arguments: Expression[];
    }

    export class LogicalExpression extends Expression {
        constructor() {
            super();
            this.Type = "LogicalExpression";
        }

        Accept(visitor: IVisitor): void {
            visitor.VisitLogicalExpression(this);
        }

        public Left: Expression;
        public Right: Expression;
        public Operator: string;
    }

    export class MemberExpression extends Expression {
        constructor() {
            super();
            this.Type = "MemberExpression";
        }

        Accept(visitor: IVisitor): void {
            visitor.VisitMemberExpression(this);
        }

        public Object: Expression;
        public IsComputed: boolean;
        public Property: Expression;
    }

    export class UnaryExpression extends Expression {
        constructor() {
            super();
            this.Type = "UnaryExpression";
        }

        Accept(visitor: IVisitor): void {
            visitor.VisitUnaryExpression(this);
        }

        public Operator: string;
        public Prefix: boolean;
        public Argument: Expression;
    }

    export class PageModelBinder extends ObjectBinderBase {
    }

    export class ExpressionParser {

        private CreateBinaryExpression(exp: IExpression): Expression {
            var expression = new BinaryExpression();

            expression.Operator = exp.operator;
            expression.Left = this.CreateExpression(exp.left);
            expression.Right = this.CreateExpression(exp.right);

            return expression;
        }

        private CreateLiteral(exp: IExpression): Expression {
            var expression = new Literal();

            expression.Value = exp.value;

            return expression;
        }

        private CreateIdentifier(exp: IExpression): Expression {
            var expression = new Identifier();

            expression.Identifier = exp.name;

            return expression;
        }

        private CreateLogicalExpression(exp: IExpression): Expression {
            var expression = new LogicalExpression();

            expression.Operator = exp.operator;
            expression.Left = this.CreateExpression(exp.left);
            expression.Right = this.CreateExpression(exp.right);

            return expression;
        }

        private CreateCallExpression(exp: IExpression): Expression {

            var self = this;

            var expression = new CallExpression();

            expression.Callee = self.CreateExpression(exp.callee);

            var args = new Array<Expression>();

            //exp.arguments.forEach((v, i, a) => {
            $.each(exp.arguments, function (i, v) {
                var arg = self.CreateExpression(v);
                args.push(arg);
            });

            expression.Arguments = args;

            return expression;
        }

        private CreateThisExpression(exp: IExpression): Expression {
            var expression = new ThisExpression();

            return expression;
        }

        private CreateMemberExpression(exp: IExpression): Expression {
            var expression = new MemberExpression();

            expression.IsComputed = exp.computed;
            expression.Object = this.CreateExpression(exp.object);
            expression.Property = this.CreateExpression(exp.property);

            return expression;
        }

        private CreateUnaryExpression(exp: IExpression): Expression {
            var expression = new UnaryExpression();

            expression.Operator = exp.operator;
            expression.Argument = this.CreateExpression(exp.argument);
            expression.Prefix = exp.prefix;

            return expression;
        }

        private CreateExpression(exp: IExpression): Expression {
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
        }

        private Build(exp: IExpression): Expression {
            return this.CreateExpression(exp);
        }

        public Parse(expression: string): Expression {
            var parsedExpression = window.jsep(expression);

            var expressionTree = this.Build(parsedExpression);

            return expressionTree;
        }
    }

    export class EvaluatorVisitor implements IVisitor {

        constructor(binder: IObjectBinder, globalBinder?: IObjectBinder) {
            this.Binder = binder;
            this.GlobalBinder = (globalBinder != null) ? globalBinder : binder;
        }

        public Result: any;
        private Binder: IObjectBinder;
        private GlobalBinder: IObjectBinder;
        private ParentBinder: IObjectBinder;
        private BoundObject: any;
        private iteratorName: string;
        private isCall: boolean;

        private isIterator(propertyName: string): boolean {

            if (!this.isCall)
                return false;

            if (propertyName == "select" ||
                propertyName == "where" ||
                propertyName == "avg" ||
                propertyName == "max" ||
                propertyName == "min" ||
                propertyName == "sum" ||
                propertyName == "count"||
                propertyName == "roundup" ||
                propertyName == "in"
                )
                return true;

            return false;
        }

        VisitThisExpression(expression: ThisExpression): void {
        }

        InvokeSystemFunction(functionName: string, args: any[]): boolean {

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
        }

        EvaluateExpression(expression: Expression): any {
            var old = this.Result;
            expression.Accept(this);

            var result = this.Result;
            this.Result = old;
            return result;
        }

        VisitIfExpression(expression: CallExpression): void {
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
        }

        private getFunctionName(callee: Expression): string {
            if (!(callee instanceof Identifier))
                return null;

            var functionName = (<Identifier>callee).Identifier;
            return functionName;
        }

        private EvaluateArguments(arguments: Expression[]) {
            var self = this;
            var args = new Array<any>();

            var result = self.Result;

            //arguments.forEach((v, i, a) => {
            $.each(arguments, function (i, v) {
                v.Accept(self);
                var r = self.Result;
                args.push(r);
            });

            self.Result = result;

            return args;
        }

        private InvokeUserFunction(o: any, functionName: string, args: any[]) {
            var f = this.Binder.GetValue(o, functionName);

            if (f != null)
                this.Result = f(args);
        }

        VisitGeneralCallExpression(expression: CallExpression): void {

            var functionName = this.getFunctionName(expression.Callee);
            var args = this.EvaluateArguments(expression.Arguments);

            if (!this.InvokeSystemFunction(functionName, args)) {
                this.InvokeUserFunction(null, functionName, args);
            }
        }

        private GetIterFunction(functionName: string): (self: EvaluatorVisitor, v: any, arguments: Expression[], result: any) => any {

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
        }

        private VisitIterItems(v: any, arguments: Expression[], previous: any, newCallback: () => any,
            computeCallback: (args: any[]) => any,
            accumulateCallback: (accumulator: any, result: any) => any) {
            var items: any;

            if (previous == null)
                items = newCallback();
            else
                items = previous;

            var oldBinder = this.Binder;
            var oldBoundObject = this.BoundObject;
            var oldParentBinder = this.ParentBinder;

            this.ParentBinder = this.Binder;

            if (v.GetBoundObject) {
                this.Binder = <IObjectBinder>v;
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
        }

        private SelectFunction(self: EvaluatorVisitor, v: any, arguments: Expression[], previous: any): any {

            return self.VisitIterItems(v, arguments, previous,
                () => {
                    return new Array<any>();
                },

                (args) => {
                    if (args.length == 1)
                        return args[0];

                    return v;
                },

                (accumulator, result) => {
                    accumulator.push(result);
                    return accumulator;
                }
                );
        }

        private WhereFunction(self: EvaluatorVisitor, v: any, arguments: Expression[], previous: any): any {

            return self.VisitIterItems(v, arguments, previous,
                () => {
                    return new Array<any>();
                },

                (args) => {
                    if (args.length == 1)
                        return (args[0]) ? v : null;

                    return v;
                },

                (accumulator, result) => {

                    if (result != null)
                        accumulator.push(result);

                    return accumulator;
                }
                );
        }

        private AggregateFunction(v: any, arguments: Expression[], previous: any,
            aggregateCallback: (accumulator: any, value: any) => any): any {
            return this.VisitIterItems(v, arguments, previous,
                () => {
                    return null;
                },

                (args) => {
                    if (args.length == 1)
                        return args[0];

                    return v;
                },

                aggregateCallback
                );
        }

        private SumFunction(self: EvaluatorVisitor, v: any, arguments: Expression[], previous: any): any {
            return self.AggregateFunction(v, arguments, previous, (aggregate, value) => {
                if (aggregate == null)
                    return value;

                return aggregate + value;
            });
        }
        private RoundUpFunction(self: EvaluatorVisitor, v: any, arguments: Expression[], previous: any): any {
            return self.AggregateFunction(v, arguments, previous, (aggregate, value) => {

                if (value == null)
                    value = 0;
                
                var arr = new Array();
                arr[0] = v;
                arr[1] = value;
                return self.InvokeSystemFunction("roundup", arr);
            });
        }
        private InFunction(self: EvaluatorVisitor, v: any, arguments: Expression[], previous: any): any {
            return self.AggregateFunction(v, arguments, previous, (aggregate, value) => {

                if (value === "" || value == 0 )
                    return 1;

                if (value == null )
                { value = 1; }

                if (aggregate == 1)
                    return 1;

                if (v.toLowerCase() == value.toLowerCase())
                {                  
                    return 1;
                }
                else
                {  return 0; }
            });
        }
        private CountFunction(self: EvaluatorVisitor, v: any, arguments: Expression[], previous: any): any {
            return self.AggregateFunction(v, arguments, previous, (aggregate, value) => {
                if (aggregate == null)
                    return 1;

                return aggregate + 1;
            });
        }

        private MinFunction(self: EvaluatorVisitor, v: any, arguments: Expression[], previous: any): any {
            return self.AggregateFunction(v, arguments, previous, (aggregate, value) => {
                if (aggregate == null)
                    return value;

                return (value < aggregate) ? value : aggregate;
            });
        }

        private MaxFunction(self: EvaluatorVisitor, v: any, arguments: Expression[], previous: any): any {
            return self.AggregateFunction(v, arguments, previous, (aggregate, value) => {
                if (aggregate == null)
                    return value;

                return (value > aggregate) ? value : aggregate;
            });
        }

        VisitIteratorFunction(expression: CallExpression): void {
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

            var result: any = null;

            if (o instanceof Array) {
                var items: any[] = <any[]> o;

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
        }

        VisitMemberExpression(expression: MemberExpression): void {
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
                property = (<Identifier>expression.Property).Identifier;

                if (this.isIterator(property)) {
                    this.iteratorName = property;
                    this.Result = o;
                    return;
                }
            }

            this.Result = this.GetValue(property);
            this.BoundObject = null;
        }

        VisitCallExpression(expression: CallExpression): void {

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
        }

        VisitUnaryExpression(expression: UnaryExpression): void {

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

            var result: any = null;

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
        }

        VisitLogicalExpression(expression: LogicalExpression): void {
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

            var result: any;

            switch (expression.Operator) {
                case "||":
                    result = left || right;
                    break;
                case "&&":
                    result = left && right;
                    break;
            }

            this.Result = result;
        }

        VisitBinaryExpression(expression: BinaryExpression): void {

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

            var result: any;

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
        }

        private CheckSimilarValue(left: any, right: any) {
            var val = -1;
            $.each(left, function (i, v) {
              
                val = jQuery.inArray(v, right);

                if (val > -1)
                    return false;
            });

           if (left.length > 0 && val == -1) {
                return false;
           }

            var checkValueAreSimilar = right.length && right.reduce(function (a, b) { return (a === b) ? a : false; }) === right[0];           
            if (!checkValueAreSimilar)
                return false;

            return true;
        }

        VisitLiteral(expression: Literal): void {
            this.Result = expression.Value;
        }

        private GetValue(name: string) {

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
        }

        VisitIdentifier(expression: Identifier): void {
            this.Result = this.GetValue(expression.Identifier);
        }
    }

    // Class
    export class ExpressionEvaluator {

        binder: IObjectBinder;
        globalBinder: IObjectBinder;

        // Constructor
        constructor(binder: IObjectBinder, globalBinder: IObjectBinder) {
            this.binder = binder;
            this.globalBinder = globalBinder;
        }

        // Instance member
        public Evaluate(expression: Expression): any {
            var visitor = new EvaluatorVisitor(this.binder, this.globalBinder);
            expression.Accept(visitor);
            var result = visitor.Result;
            return result;
        }
    }
}

