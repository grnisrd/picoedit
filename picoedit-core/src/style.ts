export interface PicoEditStyle {
  /**
   * Base text color.
   */
  text: string

  /**
   * Base background color.
   */
  bg: string

  /**
   * Selection text color.
   */
  selectionText: string

  /**
   * Selection background color.
   */
  selectionBg: string

  /**
   * Line count text color.
   */
  lineCountText: string

  /**
   * Line count background color.
   */
  lineCountBg: string

  /**
   * Gutter background color.
   */
  gutterBg: string
}

export const defaultStyle = {
  text: '#000000',
  bg: '#ffffff',
  selectionText: '#ffffff',
  selectionBg: '#0055ff',
  lineCountText: '#808080',
  lineCountBg: '#e0e0e0',
  gutterBg: '#e9e9e9',
} as PicoEditStyle
