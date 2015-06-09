
interface IExpression {
    operator: string;
    type: string;
    name: string;
    callee: IExpression;
    property: IExpression;
    raw: string;
    value: string;
    left: IExpression;
    right: IExpression;
    object: IExpression;
    computed: boolean;
    argument: IExpression;
    arguments: IExpression[];
    prefix: boolean;
}

interface Window {
    jsep(input: string): IExpression;
}
