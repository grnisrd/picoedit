type Listener = (...args: any[]) => void

export class EventEmitter<Events extends { [k: string]: Listener }> {
  private _listeners: Record<string, Listener[]> = {}

  on(ev: keyof Events, listener: Events[typeof ev]) {
    ;(this._listeners[ev as string] ||= []).push(listener)
  }

  off(ev: keyof Events, listener: Events[typeof ev]) {
    const listeners = this._listeners[ev as string]
    if (listeners !== undefined) {
      const ix = listeners.indexOf(listener)
      if (ix > -1) {
        listeners.splice(ix, 1)
      }
    }
  }

  clearListeners(ev: keyof Events) {
    delete this._listeners[ev as string]
  }

  emit(ev: keyof Events, ...params: Parameters<Events[typeof ev]>) {
    const listeners = this._listeners[ev as string]
    if (listeners !== undefined) {
      listeners.forEach((l) => l(...params))
    }
  }
}

export default EventEmitter
