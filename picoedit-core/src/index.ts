import {
  PicoEdit,
  PicoEditCreationOpts,
  PicoEditCreationOptions,
} from './editor'

const defaultCreationOptions = <PicoEditCreationOptions>{
  size: 'automatic',
  enableLineCount: true,
  enableGutter: true,
  animatedCursor: false,
}

export const picoedit = {
  create(root: HTMLElement, options?: PicoEditCreationOpts) {
    // Set options.
    const finalOptions = {
      ...defaultCreationOptions,
      ...(typeof options !== 'string' ? options : {}),
    } as PicoEditCreationOptions

    // Set initial contents.
    if (typeof options === 'string') {
      finalOptions.contents = options
    }

    // Create a new canvas element.
    const canvasElement = document.createElement('canvas')
    canvasElement.style.cursor = 'text'

    // Create canvas behavior.
    if (finalOptions.size === 'automatic') {
      root.addEventListener('resize', () => {
        canvasElement.width = root.clientWidth * window.devicePixelRatio
        canvasElement.height = root.clientHeight * window.devicePixelRatio
        canvasElement.style.width = `${root.clientWidth}px`
        canvasElement.style.height = `${root.clientHeight}px`
      })
      canvasElement.width = root.clientWidth * window.devicePixelRatio
      canvasElement.height = root.clientHeight * window.devicePixelRatio
      canvasElement.style.width = `${root.clientWidth}px`
      canvasElement.style.height = `${root.clientHeight}px`
    } else {
      canvasElement.width = finalOptions.size[0] * window.devicePixelRatio
      canvasElement.height = finalOptions.size[1] * window.devicePixelRatio
    }

    // Insert the canvas element into the root.
    root.append(canvasElement)

    return new PicoEdit(root, canvasElement, finalOptions)
  },
}

export default picoedit
