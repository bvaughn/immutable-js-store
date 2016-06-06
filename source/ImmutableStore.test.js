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
  store.subscribe((state) => notifications.push(state))
  t.equal(notifications.length, 0)
  store.set('foo', 'bar')
  t.equal(notifications.length, 1)
  t.equal(notifications[0].get('foo'), 'bar')
  store.set('foo', 'baz')
  t.equal(notifications.length, 2)
  t.equal(notifications[1].get('foo'), 'baz')
  t.end()
})

test('ImmutableStore should notify :subscribeIn subscribers if their store node has chagned', (t) => {
  const notifications = []
  const store = new ImmutableStore({
    user: {
      name: 'Brian'
    }
  })
  store.subscribeIn(['user', 'name'], (state) => notifications.push(state))
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
  const notifications = []
  const store = new ImmutableStore({ counter: 0 })
  store.subscribe((state) => notifications.push(state))
  t.equal(notifications.length, 0)
  store.set('counter', 1)
  t.equal(notifications.length, 1)
  t.equal(notifications[0].get('counter'), 1)
  store.stepBack()
  t.equal(notifications.length, 2)
  t.equal(notifications[1].get('counter'), 0)
  store.stepForward()
  t.equal(notifications.length, 3)
  t.equal(notifications[2].get('counter'), 1)
  t.end()
})

// @TODO Test updates when store is in a detatched head state
