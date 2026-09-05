import { $t } from '@/locales';

/** Formula editor token types. */
export type FormulaBuilderTokenType = 'point' | 'number' | 'operator' | 'paren' | 'function';

/** An indivisible content unit in the formula editor. */
export interface FormulaBuilderToken {
  type: FormulaBuilderTokenType;
  value: string;
  label?: string;
}

export interface AppendFormulaTokenResult {
  tokens: FormulaBuilderToken[];
  error: string;
}

// Match multi-character operators before single-character operators.
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
 * Append a token to the formula using math rules.
 * @param tokens Current token list
 * @param token Token to append
 * @returns Append result and validation error
 */
export function appendFormulaBuilderToken(
  tokens: FormulaBuilderToken[],
  token: FormulaBuilderToken
): AppendFormulaTokenResult {
  const previous = tokens.at(-1);

  if (token.type === 'number' && previous?.type === 'number') {
    const nextNumber = `${previous.value}${token.value}`;
    if (!/^\d+(?:\.\d*)?$/.test(nextNumber)) return { tokens, error: $t('virtualPoint.formulaErrors.invalidNumber') };

    return {
      tokens: [...tokens.slice(0, -1), { ...previous, value: nextNumber }],
      error: ''
    };
  }

  if (previous?.type === 'function' && !isOpenParen(token)) {
    return { tokens, error: $t('virtualPoint.formulaErrors.functionAfterParen') };
  }

  if (token.type === 'point' || token.type === 'number' || token.type === 'function' || isOpenParen(token)) {
    if (isValueToken(previous)) return { tokens, error: $t('virtualPoint.formulaErrors.twoValuesNeedOperator') };
    return { tokens: [...tokens, token], error: '' };
  }

  if (isCloseParen(token)) {
    if (!previous || previous.type === 'operator' || previous.type === 'function' || isOpenParen(previous)) {
      return { tokens, error: $t('virtualPoint.formulaErrors.rightParenBeforeValue') };
    }
    if (!validateParenPairs([...tokens, token], false))
      return { tokens, error: $t('virtualPoint.formulaErrors.parenMismatch') };
    return { tokens: [...tokens, token], error: '' };
  }

  if (token.type === 'operator') {
    if (previous?.type === 'operator') return { tokens, error: $t('virtualPoint.formulaErrors.consecutiveOperator') };
    if (['+', '-', '!'].includes(token.value)) {
      if (!previous || isOpenParen(previous)) return { tokens: [...tokens, token], error: '' };
    }
    if (token.value === '!') {
      return { tokens, error: $t('virtualPoint.formulaErrors.logicalNotPosition') };
    }
    if (!previous) return { tokens, error: $t('virtualPoint.formulaErrors.operatorAtStart') };
    if (isOpenParen(previous) || previous.type === 'function') {
      return { tokens, error: $t('virtualPoint.formulaErrors.operatorBeforeValue') };
    }
    return { tokens: [...tokens, token], error: '' };
  }

  return { tokens, error: $t('virtualPoint.formulaErrors.invalidContent') };
}

/**
 * Remove a token by index.
 * @param tokens Token list
 * @param index Index to remove
 * @returns Token list after removal
 */
export function removeFormulaBuilderToken(tokens: FormulaBuilderToken[], index: number) {
  return tokens.filter((_, tokenIndex) => tokenIndex !== index);
}

/**
 * Join tokens into a backend expression string.
 * @param tokens Token list
 * @returns Formula expression
 */
export function buildFormulaExpression(tokens: FormulaBuilderToken[]) {
  return tokens.map(token => token.value).join('');
}

/**
 * Validate operators, parentheses, and ternary expressions across the full token list.
 * @param tokens Token list
 * @returns Error message, or an empty string when valid
 */
export function validateFormulaBuilderTokens(tokens: FormulaBuilderToken[]) {
  if (!tokens.length) return $t('virtualPoint.formulaErrors.empty');

  let validatedTokens: FormulaBuilderToken[] = [];
  for (const token of tokens) {
    const result = appendFormulaBuilderToken(validatedTokens, token);
    if (result.error) return result.error;
    validatedTokens = result.tokens;
  }

  const lastToken = tokens.at(-1);
  if (lastToken?.type === 'operator') return $t('virtualPoint.formulaErrors.operatorAtEnd');
  if (lastToken?.type === 'function') return $t('virtualPoint.formulaErrors.functionAfterParen');
  if (isOpenParen(lastToken)) return $t('virtualPoint.formulaErrors.openParenAtEnd');
  if (!validateParenPairs(tokens)) return $t('virtualPoint.formulaErrors.parenMismatch');

  let ternaryCount = 0;
  for (const token of tokens) {
    if (token.value === '?') ternaryCount += 1;
    if (token.value === ':') ternaryCount -= 1;
    if (ternaryCount < 0) return $t('virtualPoint.formulaErrors.ternaryMismatch');
  }
  if (ternaryCount !== 0) return $t('virtualPoint.formulaErrors.ternaryMismatch');

  return '';
}

/**
 * Parse a saved expression into editable tokens.
 * @param expression Formula expression
 * @returns Token list
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
 * Validate whether a formula string is parsable and follows the operator rules.
 * @param expression Formula expression
 * @returns Error message, or an empty string when valid
 */
export function validateFormulaExpression(expression: string) {
  const tokens = parseFormulaExpression(expression);
  if (buildFormulaExpression(tokens) !== expression.replace(/\s+/g, '')) {
    return $t('virtualPoint.formulaErrors.unsupportedContent');
  }

  return validateFormulaBuilderTokens(tokens);
}
