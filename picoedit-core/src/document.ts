import { IToken, ITokenizationEngine, PlaintextTokenizer } from './tokens'

export interface IDocument {
  /**
   * Id of this document. Can be anything - a uuid, a file path, as long
   * it's a string and it's unique.
   */
  readonly id: string

  /**
   * Whether this document can be written to.
   */
  readonly readonly: boolean

  /**
   * Tokenization engine used by this document. Defaults
   * to plaintext tokenization.
   */
  readonly engine: ITokenizationEngine

  /**
   * Contents of this document as a string.
   */
  get contents(): string
  set contents(value: string)

  /**
   * Last tokenization results. Tokenization is done on a line-by-line basis.
   * If undefined, call `.tokenize`.
   */
  get tokens(): readonly IToken[] | undefined

  /**
   * Lines of this document.
   */
  get lines(): readonly string[]

  /**
   * Tokenize this document. Results are cached into `.tokens`.
   */
  tokenize(): readonly IToken[]
}

interface PicoDocumentCreationOptions {
  /**
   * Tokenization engine used by this document. Defaults
   * to plaintext tokenization.
   */
  engine?: ITokenizationEngine

  /**
   * Whether this document can be written to.
   */
  readonly?: boolean

  /**
   * Default contents of the document.
   */
  contents?: string
}

export class PicoDocument implements IDocument {
  readonly id: string
  readonly readonly: boolean
  readonly engine: ITokenizationEngine

  private _contents: string = ''
  get contents(): string {
    return this._contents
  }

  set contents(value: string) {
    this._contents = value
    this._lines = value.split('\n')
  }

  private _tokens: readonly IToken[] | undefined
  get tokens() {
    return this._tokens
  }

  private _lines: readonly string[] = []
  get lines(): readonly string[] {
    return this._lines
  }

  tokenize(): readonly IToken[] {
    const doctokens = [] as IToken[]
    for (const line of this.lines) {
      doctokens.push(...this.engine.tokenize(line))
    }
    return (this._tokens = doctokens)
  }

  constructor(id: string, options?: PicoDocumentCreationOptions) {
    const final = {
      engine: PlaintextTokenizer,
      readonly: false,
      contents: '',
      ...(options ?? {}),
    }

    this.id = id
    this.engine = final.engine
    this.readonly = final.readonly
    this.contents = final.contents
  }
}
