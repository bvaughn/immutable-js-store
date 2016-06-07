import ImmutableStore from './ImmutableStore'
import test from 'tape'

test('ImmutableStore should initialize with the specified default', (t) => {
  const store = new ImmutableStore({ foo: 'bar' })

  t.equal(store.get('foo'), 'bar')
  t.end()
})

test('ImmutableStore should notify subscribers of changes to store', (t) => {
  const notifications = []
  const store = new ImmutableStore()
  const unsubscribe = store.subscribe((state) => notifications.push(state))
  t.equal(notifications.length, 0)
  store.set('foo', 'bar')
  t.equal(notifications.length, 1)
  t.equal(notifications[0].get('foo'), 'bar')
  store.set('foo', 'baz')
  t.equal(notifications.length, 2)
  t.equal(notifications[1].get('foo'), 'baz')
  unsubscribe()
  store.set('foo', 'what comes after baz?')
  t.equal(notifications.length, 2)
  t.end()
})

test('ImmutableStore should not notify subscribers if store has not been changed', (t) => {
  const notifications = []
  const store = new ImmutableStore()
  store.subscribe((state) => notifications.push(state))
  t.equal(notifications.length, 0)
  store.set('foo', 'bar')
  t.equal(notifications.length, 1)
  t.equal(notifications[0].get('foo'), 'bar')
  store.set('foo', 'bar')
  t.equal(notifications.length, 1)
  t.equal(notifications[0].get('foo'), 'bar')
  t.end()
})

test('ImmutableStore should notify :subscribeIn subscribers if their store node has changed', (t) => {
  const notifications = []
  const store = new ImmutableStore({
    user: {
      name: 'Brian'
    }
  })
  const unsubscribe = store.subscribeIn(['user', 'name'], (state) => notifications.push(state))
  t.equal(notifications.length, 0)
  store.setIn(['user', 'location'], 'San Jose')
  t.equal(notifications.length, 0)
  store.setIn(['user', 'name'], 'Brian Vaughn')
  t.equal(notifications.length, 1)
  t.equal(notifications[0], 'Brian Vaughn')
  store.mergeIn(['user'], { name: 'Brian Vaughn' })
  t.equal(notifications.length, 1)
  store.setIn(['user', 'name'], 'Brian')
  t.equal(notifications.length, 2)
  t.equal(notifications[1], 'Brian')
  unsubscribe()
  store.mergeIn(['user'], { name: 'Someone other than Brian' })
  t.equal(notifications.length, 2)
  t.end()
})

test('ImmutableStore should step backwards and forwards or to the beginning and end of the store', (t) => {
  const store = new ImmutableStore({ counter: 0 })
  store.set('counter', 1)
  store.set('counter', 2)
  t.equal(store.get('counter'), 2)
  store.stepBack()
  t.equal(store.get('counter'), 1)
  store.stepBack()
  t.equal(store.get('counter'), 0)
  store.stepBack()
  t.equal(store.get('counter'), 0)
  store.stepForward()
  t.equal(store.get('counter'), 1)
  store.stepForward()
  t.equal(store.get('counter'), 2)
  store.stepForward()
  t.equal(store.get('counter'), 2)
  t.end()
})

test('ImmutableStore should notify :hasNext and :hasPrevious based on the current position', (t) => {
  const store = new ImmutableStore()
  store.set('counter', 1)
  store.set('counter', 2)
  t.equal(store.hasPrevious(), true)
  t.equal(store.hasNext(), false)
  store.stepBack()
  t.equal(store.hasPrevious(), true)
  t.equal(store.hasNext(), true)
  store.stepBack()
  t.equal(store.hasPrevious(), false)
  t.equal(store.hasNext(), true)
  t.end()
})

test('ImmutableStore should notify subscribers when the store changes due to stepping backward or forward', (t) => {
  const store = new ImmutableStore({ counter: 0 })
  store.set('counter', 1)
  store.set('counter', 2)
  const notifications = []
  store.subscribe((state) => notifications.push(state))
  t.equal(notifications.length, 0)
  while (store.stepBack()) {}
  t.equal(notifications.length, 2)
  t.equal(notifications[1].get('counter'), 0)
  store.stepBack()
  t.equal(notifications.length, 2)
  while (store.stepForward()) {}
  t.equal(notifications.length, 4)
  t.equal(notifications[3].get('counter'), 2)
  store.stepForward()
  t.equal(notifications.length, 4)
  t.end()
})

test('ImmutableStore should notify jump to start or end', (t) => {
  const store = new ImmutableStore({ counter: 0 })
  store.set('counter', 1)
  store.set('counter', 2)
  const notifications = []
  store.subscribe((state) => notifications.push(state))
  t.equal(notifications.length, 0)
  store.jumpToStart()
  t.equal(notifications.length, 1)
  t.equal(notifications[0].get('counter'), 0)
  store.jumpToStart()
  t.equal(notifications.length, 1)
  store.jumpToEnd()
  t.equal(notifications.length, 2)
  t.equal(notifications[1].get('counter'), 2)
  store.jumpToEnd()
  t.equal(notifications.length, 2)
  t.end()
})

test('ImmutableStore should clear history after the current index if the store is updated', (t) => {
  const store = new ImmutableStore({ counter: 0 })
  store.set('counter', 1)
  store.set('counter', 2)
  store.set('counter', 3)
  store.stepBack()
  store.stepBack()
  t.equal(store.get('counter'), 1)
  store.set('counter', 4)
  t.equal(store.hasPrevious(), true)
  t.equal(store.hasNext(), false)
  t.equal(store.get('counter'), 4)
  store.stepBack()
  t.equal(store.get('counter'), 1)
  t.equal(store.hasPrevious(), true)
  t.equal(store.hasNext(), true)
  t.end()
})

test('ImmutableStore should clear all history before the index if it is flushed', (t) => {
  const store = new ImmutableStore({ counter: 0 })
  store.set('counter', 1)
  store.set('counter', 2)
  t.equal(store.hasPrevious(), true)
  t.equal(store.hasNext(), false)
  store.clearHistory()
  t.equal(store.hasPrevious(), false)
  t.equal(store.hasNext(), false)
  t.equal(store.get('counter'), 2)
  t.end()
})

// @TODO Test updates when store is in a detatched head state
