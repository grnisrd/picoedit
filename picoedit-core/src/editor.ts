import { PicoEditStyle, defaultStyle } from './style'
import { IDocument, PicoDocument } from './document'
import { lerp, smoothstep } from './lerp'

export type PicoEditCreationOptions = {
  /**
   * Width and height. If set to 'automatic', the canvas will scale autonomously
   * to the width and height of its container.
   */
  size: 'automatic' | [number, number]

  /**
   * Initial contents.
   */
  contents: string

  /**
   * Should we show the line count?
   */
  enableLineCount?: boolean

  /**
   * Should we show the gutter?
   */
  enableGutter?: boolean

  /**
   * Should the cursor have smooth animations?
   */
  animatedCursor?: boolean
}

export type PicoEditCreationOpts = string | PicoEditCreationOptions

type Ctx = CanvasRenderingContext2D

/**
 * RENDERING
 * ==============================================================================
 */

function characterDimensions(ctx: Ctx) {
  const measured = ctx.measureText('A')
  return [measured.width, measured.actualBoundingBoxDescent + 2]
}

/**
 * EDIT CLASS
 * ==============================================================================
 */

export class PicoEdit {
  /**
   * Root container that includes the picoedit canvas.
   */
  readonly root: HTMLElement

  /**
   * Canvas element.
   */
  readonly canvas: HTMLCanvasElement

  /**
   * The current document.
   */
  readonly document: IDocument

  /**
   * Invisible text area used for holding text.
   */
  private _internalTextArea: HTMLTextAreaElement

  /**
   * Options.
   */
  private _options: PicoEditCreationOptions

  /**
   * ===================================================
   * Rendering behavior
   * ===================================================
   */

  /**
   * Cursor anim lerp state.
   */
  private _cursorAnimLerpState = 0
  private _cursorX = 0
  private _cursorFromX = 0
  private _cursorToX = 0
  private _cursorY = 0
  private _cursorFromY = 0
  private _cursorToY = 0

  private _useFont(ctx: Ctx, mode: 'text' | 'notice') {
    if (mode === 'text') {
      ctx.font = `${this._textSize}px monospace`
    } else if (mode === 'notice') {
      ctx.font = `${this._textSize}px sans-serif`
    }
    ctx.textBaseline = 'top'
    ctx.fillStyle = this.style.text
  }

  /**
   * Render the line count.
   */
  private _renderLineCount(
    ctx: Ctx,
    startAt: number,
    count: number,
    fromX: number
  ) {
    this._useFont(ctx, 'text')
    const dims = characterDimensions(ctx)
    const lcWidth =
      dims[0] * 3 +
      (count.toString().length > 3 ? count.toString().length : 1) * dims[0]
    ctx.fillStyle = this.style.lineCountBg
    ctx.fillRect(fromX, 0, lcWidth, this.canvas.height)

    ctx.fillStyle = this.style.lineCountText
    ctx.textAlign = 'right'
    Array(count)
      .fill(0)
      .forEach((_, i) => {
        ctx.fillText(
          (startAt + i + 1).toString(),
          fromX + (lcWidth - dims[0]),
          i * dims[1]
        )
      })
    ctx.textAlign = 'left'
    ctx.fillStyle = this.style.text

    return lcWidth
  }

  /**
   * Render the gutter.
   * TODO: Breakpoints.
   */
  private _renderGutter(ctx: Ctx, fromX: number) {
    this._useFont(ctx, 'text')
    const dims = characterDimensions(ctx)
    const gutterWidth = dims[0] * 1
    ctx.fillStyle = this.style.gutterBg
    ctx.fillRect(fromX, 0, gutterWidth, this.canvas.height)

    return gutterWidth
  }

  private _render(doNotRequestExtraFrame = false, event?: 'cursor') {
    if (!doNotRequestExtraFrame) {
      window.requestAnimationFrame((x) => this._render())
    }

    const ctx = this.canvas.getContext('2d')
    if (ctx) {
      // Clear the canvas.
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      // Scale the canvas accordingly.
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      // Use the default font.
      this._useFont(ctx, 'text')

      // Measure a single character width.
      const [charWidth, charHeight] = characterDimensions(ctx)

      // Calculate how many lines we can display.
      const linesInView = Math.floor(this.canvas.height / charHeight)

      // Calculate how many lines we should render.
      const lineCount = Math.min(this.document.lines.length, linesInView)

      // Variable containing the current X position of the content.
      let contentX = 0

      if (this._options.enableLineCount) {
        contentX += this._renderLineCount(ctx, this.scroll, lineCount, contentX)
      }

      if (this._options.enableGutter) {
        contentX += this._renderGutter(ctx, contentX)
      }

      // Start printing the lines depending on the view.
      let lineStart = 0
      this.document.lines.slice(this.scroll, lineCount).forEach((line, i) => {
        const yIndex = i * charHeight

        // Draw text.
        const contents = this.document.lines[i + this.scroll]
        ctx.fillStyle = this.style.text
        ctx.fillText(contents, contentX, yIndex)

        if (
          this.focused &&
          this.index >= lineStart &&
          this.index <= lineStart + contents.length
        ) {
          const cursorIndexInLine = this.index - lineStart
          //ctx.globalAlpha = (Math.sin(performance.now() / 200) + 1) / 2

          if (this._options.animatedCursor) {
            if (this._cursorX === 0 && this._cursorY === 0) {
              this._cursorX = contentX + cursorIndexInLine * charWidth
              this._cursorY = yIndex + 2
            }

            if (event === 'cursor') {
              this._cursorFromX = this._cursorX
              this._cursorFromY = this._cursorY
              this._cursorToX = contentX + cursorIndexInLine * charWidth
              this._cursorToY = yIndex + 2
              this._cursorAnimLerpState = 0
            } else {
              if (this._cursorAnimLerpState < 1) {
                this._cursorAnimLerpState += 0.2
                this._cursorX = lerp(
                  this._cursorFromX,
                  this._cursorToX,
                  this._cursorAnimLerpState
                )
                this._cursorY = lerp(
                  this._cursorFromY,
                  this._cursorToY,
                  this._cursorAnimLerpState
                )
              }
            }
            ctx.fillRect(this._cursorX, this._cursorY, 2, charHeight)
          } else {
            this._cursorX = contentX + cursorIndexInLine * charWidth
            this._cursorY = yIndex + 2
            ctx.fillRect(this._cursorX, this._cursorY, 2, charHeight)
          }
          ctx.globalAlpha = 1
        }

        lineStart += contents.length + 1
      })
    }
  }

  /**
   * ===================================================
   * Cursor behavior
   * ===================================================
   */

  /**
   * Index of the cursor.
   */
  get index() {
    return this._internalTextArea.selectionStart
  }
  set index(value: number) {
    this._internalTextArea.selectionStart = value
    this._internalTextArea.selectionEnd = value
  }

  /**
   * ===================================================
   * Scroll behavior
   * ===================================================
   */

  private _scroll = 0
  get scroll() {
    return this._scroll
  }
  set scroll(value: number) {
    this._scroll = value
  }

  /**
   * ===================================================
   * Styling behavior
   * ===================================================
   */

  private _style: PicoEditStyle
  get style() {
    return this._style
  }
  set style(value: PicoEditStyle) {
    this._style = value
  }

  private _textSize = 16
  get textSize() {
    return this._textSize
  }
  set textSize(value: number) {
    this._textSize = value
    this._render(true)
  }

  private _focused = false
  get focused() {
    return this._focused
  }

  constructor(
    root: HTMLElement,
    canvas: HTMLCanvasElement,
    options: PicoEditCreationOptions
  ) {
    this.root = root
    this.canvas = canvas
    this._options = options

    // Create fake text area.
    this._internalTextArea = document.createElement('textarea')
    this._internalTextArea.value = options.contents
    this._internalTextArea.style.opacity = '0'
    this._internalTextArea.style.position = 'absolute'
    this._internalTextArea.style.pointerEvents = 'none'
    this.root.append(this._internalTextArea)

    // Listen to text changes.
    this._internalTextArea.addEventListener('input', () => {
      this.document.contents = this._internalTextArea.value
      this._render(true)
    })

    this._internalTextArea.addEventListener('selectionchange', () => {
      this._render(true, 'cursor')
    })

    this._internalTextArea.addEventListener('blur', () => {
      this._focused = false
      this._render(true)
    })

    this.root.addEventListener('mousedown', (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      this._focused = true
      this._internalTextArea.focus()
      this._render(true)
    })

    this.root.addEventListener('wheel', (ev) => {
      this.scroll = Math.max(
        0,
        Math.min((this.scroll += ev.deltaY), this.document.lines.length - 1)
      )
    })

    if (options.size === 'automatic') {
      new ResizeObserver(() => {
        canvas.width = root.clientWidth * window.devicePixelRatio
        canvas.height = root.clientHeight * window.devicePixelRatio
        canvas.style.width = `${root.clientWidth}px`
        canvas.style.height = `${root.clientHeight}px`
      }).observe(root)
    } else {
      canvas.width = root.clientWidth * window.devicePixelRatio
      canvas.height = root.clientHeight * window.devicePixelRatio
      canvas.style.width = `${root.clientWidth}px`
      canvas.style.height = `${root.clientHeight}px`
    }

    this.document = new PicoDocument('init', {
      contents: options.contents,
    })

    this._style = defaultStyle

    this._render()
  }
}
