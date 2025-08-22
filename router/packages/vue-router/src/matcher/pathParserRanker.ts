export interface _PathParserOptions {
  sensitive?: boolean
  strict?: boolean
  start?: boolean
  end?: boolean
}

export type PathParserOptions = Pick<
  _PathParserOptions,
  'end' | 'sensitive' | 'strict'
>

export type PathParams = Record<string, string | string[]>

interface PathParserParamKey {
  name: string
  repeatable: boolean
  optional: boolean
}

export interface PathParser {
  re: RegExp
  score: Array<number[]>
  keys: PathParserParamKey[]
  parse(path: string): PathParams | null
  stringifyQuery(params: PathParams): string
}

const enum PathScore {
  _multiplier = 10,
  Root = 9 * _multiplier,
  Segment = 4 * _multiplier,
  SubSegment = 3 * _multiplier,
  Static = 4 * _multiplier,
  Dynamic = 2 * _multiplier,
  BonusCustomRegRxp = 1 * _multiplier,
  BonusWildcard = -4 * _multiplier,
  BonusRepeatable = -2 * _multiplier,
  BonusOptional = -0.8 * _multiplier,
  BonusStrict = 0.07 * _multiplier,
  BonusCaseSensitive = 0.025 * _multiplier,
}

export function tokensToParser(
  tokens: any,
  options: PathParserOptions
): PathParser { 

  return {} as PathParser
}

export function comparePathParserScore(
  a: PathParser,
  b: PathParser
) {
  let i = 0
  const aScore = a.score || []
  const bScore = b.score || []
  while (i < aScore.length && i < bScore.length) {
    const comp = compareScoreArray(aScore[i], bScore[i])
    if (comp) return comp
    i++
  }
  if (Math.abs(bScore.length - aScore.length) === 1) {
    if (isLastScoreNegative(aScore)) return 1
    if (isLastScoreNegative(bScore)) return -1
  }

  return bScore.length - aScore.length
}

export function compareScoreArray(
  a: number[],
  b: number[]
): number {
  let i = 0
  while (i < a.length && i < b.length) {
    const diff = b[i] - a[i]
    if (diff) return diff
    i++
  }

  if (a.length < b.length) {
    return a.length === 1 && a[0] === PathScore.Static + PathScore.Segment
      ? -1
      : 1
  } else if (a.length > b.length) {
    return b.length === 1 && b[0] === PathScore.Static + PathScore.Segment
      ? 1
      : -1
  }
  return 0
}

function isLastScoreNegative(score: PathParser['score']): boolean {
  const last = score[score.length - 1]
  return score.length > 0 && last[last.length - 1] < 0
}