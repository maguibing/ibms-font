/** 公式编辑器 Token 类型。 */
export type FormulaBuilderTokenType = 'point' | 'number' | 'operator' | 'paren' | 'function';

/** 公式编辑器中的不可拆分内容单元。 */
export interface FormulaBuilderToken {
  type: FormulaBuilderTokenType;
  value: string;
  label?: string;
}

export interface AppendFormulaTokenResult {
  tokens: FormulaBuilderToken[];
  error: string;
}

// 多字符运算符必须放在单字符运算符之前匹配。
const formulaOperators = [
  '==',
  '&&',
  '||',
  '>=',
  '<=',
  '+',
  '-',
  '*',
  '/',
  '?',
  ':',
  '!',
  '>',
  '<',
  '%',
  '&',
  '|',
  '^',
  ','
];

function isCloseParen(token?: FormulaBuilderToken) {
  return token?.type === 'paren' && [')', ']'].includes(token.value);
}

function isOpenParen(token?: FormulaBuilderToken) {
  return token?.type === 'paren' && ['(', '['].includes(token.value);
}

function isValueToken(token?: FormulaBuilderToken) {
  return token?.type === 'point' || token?.type === 'number' || isCloseParen(token);
}

function validateParenPairs(tokens: FormulaBuilderToken[], requireClosed = true) {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[' };

  for (const token of tokens) {
    if (isOpenParen(token)) stack.push(token.value);
    if (isCloseParen(token) && stack.pop() !== pairs[token.value]) return false;
  }

  return !requireClosed || stack.length === 0;
}

/**
 * 按数学规则向公式追加一个 Token。
 * @param tokens 当前 Token 列表
 * @param token 待追加 Token
 * @returns 追加结果和校验错误
 */
export function appendFormulaBuilderToken(
  tokens: FormulaBuilderToken[],
  token: FormulaBuilderToken
): AppendFormulaTokenResult {
  const previous = tokens.at(-1);

  if (token.type === 'number' && previous?.type === 'number') {
    const nextNumber = `${previous.value}${token.value}`;
    if (!/^\d+(?:\.\d*)?$/.test(nextNumber)) return { tokens, error: '请输入正确的数字' };

    return {
      tokens: [...tokens.slice(0, -1), { ...previous, value: nextNumber }],
      error: ''
    };
  }

  if (previous?.type === 'function' && !isOpenParen(token)) {
    return { tokens, error: '函数后必须使用左括号' };
  }

  if (token.type === 'point' || token.type === 'number' || token.type === 'function' || isOpenParen(token)) {
    if (isValueToken(previous)) return { tokens, error: '两个值之间必须有运算符' };
    return { tokens: [...tokens, token], error: '' };
  }

  if (isCloseParen(token)) {
    if (!previous || previous.type === 'operator' || previous.type === 'function' || isOpenParen(previous)) {
      return { tokens, error: '右括号前必须是数值或点位' };
    }
    if (!validateParenPairs([...tokens, token], false)) return { tokens, error: '括号未配对' };
    return { tokens: [...tokens, token], error: '' };
  }

  if (token.type === 'operator') {
    if (previous?.type === 'operator') return { tokens, error: '不能连续使用多个运算符' };
    if (['+', '-', '!'].includes(token.value)) {
      if (!previous || isOpenParen(previous)) return { tokens: [...tokens, token], error: '' };
    }
    if (token.value === '!') {
      return { tokens, error: '逻辑非运算符位置不正确' };
    }
    if (!previous) return { tokens, error: '表达式不能以该运算符开头' };
    if (isOpenParen(previous) || previous.type === 'function') {
      return { tokens, error: '运算符前必须是数值、点位或右括号' };
    }
    return { tokens: [...tokens, token], error: '' };
  }

  return { tokens, error: '无效的公式内容' };
}

/**
 * 按索引删除完整 Token。
 * @param tokens Token 列表
 * @param index 待删除索引
 * @returns 删除后的 Token 列表
 */
export function removeFormulaBuilderToken(tokens: FormulaBuilderToken[], index: number) {
  return tokens.filter((_, tokenIndex) => tokenIndex !== index);
}

/**
 * 将 Token 列表组合为后端表达式。
 * @param tokens Token 列表
 * @returns 公式表达式
 */
export function buildFormulaExpression(tokens: FormulaBuilderToken[]) {
  return tokens.map(token => token.value).join('');
}

/**
 * 校验完整 Token 列表的运算符、括号和三元表达式。
 * @param tokens Token 列表
 * @returns 错误提示，空字符串表示通过
 */
export function validateFormulaBuilderTokens(tokens: FormulaBuilderToken[]) {
  if (!tokens.length) return '请添加公式内容';

  let validatedTokens: FormulaBuilderToken[] = [];
  for (const token of tokens) {
    const result = appendFormulaBuilderToken(validatedTokens, token);
    if (result.error) return result.error;
    validatedTokens = result.tokens;
  }

  const lastToken = tokens.at(-1);
  if (lastToken?.type === 'operator') return '表达式不能以运算符结尾';
  if (lastToken?.type === 'function') return '函数后必须使用左括号';
  if (isOpenParen(lastToken)) return '表达式不能以左括号结尾';
  if (!validateParenPairs(tokens)) return '括号未配对';

  let ternaryCount = 0;
  for (const token of tokens) {
    if (token.value === '?') ternaryCount += 1;
    if (token.value === ':') ternaryCount -= 1;
    if (ternaryCount < 0) return '三元表达式未配对';
  }
  if (ternaryCount !== 0) return '三元表达式未配对';

  return '';
}

/**
 * 将已保存的表达式解析为可编辑 Token。
 * @param expression 公式表达式
 * @returns Token 列表
 */
export function parseFormulaExpression(expression: string): FormulaBuilderToken[] {
  const tokens: FormulaBuilderToken[] = [];
  let remaining = expression.replace(/\s+/g, '');

  while (remaining) {
    const pointMatch = remaining.match(/^\$\{([^{}]+)\}/);
    if (pointMatch) {
      tokens.push({ type: 'point', value: pointMatch[0], label: pointMatch[1] });
      remaining = remaining.slice(pointMatch[0].length);
      continue;
    }

    const functionMatch = remaining.match(/^(abs|bool|int)/);
    if (functionMatch) {
      tokens.push({ type: 'function', value: functionMatch[0] });
      remaining = remaining.slice(functionMatch[0].length);
      continue;
    }

    const numberMatch = remaining.match(/^\d+(?:\.\d*)?/);
    if (numberMatch) {
      tokens.push({ type: 'number', value: numberMatch[0] });
      remaining = remaining.slice(numberMatch[0].length);
      continue;
    }

    const operator = formulaOperators.find(item => remaining.startsWith(item));
    if (operator) {
      tokens.push({ type: 'operator', value: operator });
      remaining = remaining.slice(operator.length);
      continue;
    }

    const character = remaining[0];
    if ('()[]'.includes(character)) tokens.push({ type: 'paren', value: character });
    remaining = remaining.slice(1);
  }

  return tokens;
}

/**
 * 校验公式字符串是否可解析且符合运算规则。
 * @param expression 公式表达式
 * @returns 错误提示，空字符串表示通过
 */
export function validateFormulaExpression(expression: string) {
  const tokens = parseFormulaExpression(expression);
  if (buildFormulaExpression(tokens) !== expression.replace(/\s+/g, '')) return '表达式包含不支持的内容';

  return validateFormulaBuilderTokens(tokens);
}
