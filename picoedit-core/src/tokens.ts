/**
 * Represents a token.
 */
export type IToken = [tokenId: number, start: number, end: number]

/**
 * A tokenization engine that produces tokens.
 */
export interface ITokenizationEngine {
  /**
   * Types of tokens.
   */
  readonly types: Record<number, string>

  /**
   * Generates tokens for the given line.
   */
  tokenize: (contents: string) => readonly IToken[]
}

/**
 * ============================================================
 * (default) Plaintext tokenization engine
 * ============================================================
 */

export const PlaintextTokenizer = {
  types: { 0: 'Word' },
  tokenize(contents) {
    const tokens = [] as IToken[]

    let i = 0
    while (i < contents.length) {
      if (contents[i].match(/\w/)) {
        let start = i
        while (contents[i++]?.match(/\w/));
        tokens.push([0, start, i])
      }
      i++
    }

    return tokens
  },
} as ITokenizationEngine
