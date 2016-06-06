import Immutable from 'immutable'

/**
 * Tiny observable wrapper around Immutable JS with rewind/replay support.
 * Use normal Immutable JS methods to update the store.
 * Subscribe to be notified of changes.
 */
export default class ImmutableStore {
  constructor (initialData = {}) {
    const initialState = Immutable.fromJS(initialData)

    this._history = [initialState]
    this._historyIndex = 0
    this._subscribers = []

    // Setup proxy READ methods; these have no side effects.
    IMMUTABLE_READ_METHODS.forEach((method) => {
      this[method] = (...args) => {
        const state = this.getState()

        return state[method](...args)
      }
    })

    // Setup proxy WRITE methods; these update the inner store and notify subscribers.
    IMMUTABLE_WRITE_METHODS.forEach((method) => {
      this[method] = (...args) => {
        const state = this.getState()
        const newState = state[method](...args)

        this._history.push(newState)

        // Only advance state if we're currently at the head.
        // If user is replaying state, just add new actions to the end.
        if (this._historyIndex === this._history.length - 2) {
          this._historyIndex++
        }

        // @TODO What happens if the store is updated when in a detatched head state?
        // Should I disallow updates (by Erroring)?

        this._notifySubscribers()

        return newState
      }
    })
  }

  getState () {
    return this._history[this._historyIndex]
  }

  hasNext () {
    return this._historyIndex < this._history.length - 1
  }

  hasPrevious () {
    return this._historyIndex > 0
  }

  jumpToEnd () {
    return this._jumpTo(this._history.length - 1)
  }

  jumpToStart () {
    return this._jumpTo(0)
  }

  stepBack () {
    return this._jumpTo(this._historyIndex - 1)
  }

  stepForward () {
    return this._jumpTo(this._historyIndex + 1)
  }

  /**
   * Subscribe to store changes.
   * Subscribers will be passed a reference to the current store-state when updates are made.
   * Stepping backwards or forward will notify subscribers of the updated "current" state.
   */
  subscribe (subscriber) {
    this._subscribers.push(subscriber)

    return () => this._unsubscribe(subscriber)
  }

  /**
   * Memoized subscription to a specific path in the Immutable store.
   * Subscribers will be passed the value contained at the specified path within the current store-state.
   */
  subscribeIn (path, subscriber) {
    let cached = this.getIn(path)

    return this.subscribe((state) => {
      const value = state.getIn(path)

      if (cached !== value) {
        cached = value

        subscriber(value)
      }
    })
  }

  _jumpTo (index) {
    index = Math.min(Math.max(index, 0), this._history.length - 1)

    if (this._historyIndex !== index) {
      this._historyIndex = index

      this._notifySubscribers()

      return this.getState()
    }
  }

  _notifySubscribers () {
    const state = this.getState()

    // @TODO Should I catch Errors and do anything with them?
    this._subscribers.forEach(
      (subscribed) => subscribed(state)
    )
  }

  _unsubscribe (subscriber) {
    this._subscribers = this._subscribers.filter(
      (subscribed) => subscribed !== subscriber
    )
  }
}

// Immutable JS methods to proxy
const IMMUTABLE_WRITE_METHODS = [
  'delete',
  'deleteIn',
  'merge',
  'mergeDeep',
  'mergeDeepIn',
  'mergeIn',
  'remove',
  'removeIn',
  'set',
  'setIn',
  'update',
  'updateIn'
]
const IMMUTABLE_READ_METHODS = [
  'get',
  'getIn'
]
