ImmutableStore
-----
Tiny observable wrapper around Immutable JS with rewind/replay support.
Use normal Immutable JS methods to update the store.
Subscribe to be notified of changes.

### Installation
```
npm install immutable-js-store
```

### Api

##### constructor(initialState: ?Object)
Initialize the store (with an optional default state).

##### getState(): Immutable.Collection
Returns the reference to the `Immutable` state at the current cursor.
By default the cursor will point to the most recent state.
Use the "step" methods to modify the cursor and undo or replay events.

##### hasNext(): boolean
Is there a newer state (after) the current cursor?

##### hasPrevious(): boolean
Is there an older state (before) the current cursor?

##### stepBack(): Immutable.Collection
Decrease the cursor by 1, to the state that came before the current one.
This will notify all current subscribers.
This method returns the value of the state at the updated cursor.

##### stepForward(): Immutable.Collection
Increase the cursor by 1, to the state that came after the current one.
This will notify all current subscribers.
This method returns the value of the state at the updated cursor.

##### stepTo(index: number): Immutable.Collection
Move the cursor to a specific position.
This will notify all current subscribers.
This method returns the value of the state at the updated cursor.

##### stepToEnd(): Immutable.Collection
Move the cursor to the most recent (last) state.
This will notify all current subscribers.
This method returns the value of the state at the updated cursor.

##### stepToStart(): Immutable.Collection
Move the cursor to the very first (initial) state.
This will notify all current subscribers.
This method returns the value of the state at the updated cursor.

##### subscribe(subscriber): Function
Subscribe to store changes.
Subscribers will be passed a reference to the current store-state when updates are made.
Stepping backwards or forward will notify subscribers of the updated "current" state.

##### subscribesubscribeIn(path, subscriber): Function
Memoized subscription to a specific path in the Immutable store.
Subscribers will be passed the value contained at the specified path within the current store-state.

### Example
```js
// Simple example store with a default state
const store = new ImmutableStore({
  user: {
    id: 1,
    name: 'Brian'
  },
  counter: 0
})

// Subscribe to any top-level store changes
store.subscribe(
  (store) => console.log(JSON.stringify(store.toJS()))
)

// Subscribe only to changes below store.user.name
store.subscribeIn(['user', 'name'],
  (name) => console.log('name:', name)
)

store.set('counter', store.get('counter') + 1) // {"user":{"id":1,"name":"Brian"},"counter":1}
store.set('counter', store.get('counter') + 1) // {"user":{"id":1,"name":"Brian"},"counter":2}
store.setIn(['user', 'name'], 'Brian Vaughn') // {"user":{"id":1,"name":"Brian Vaughn"},"counter":2}, "name: Brian Vaughn"
store.stepBack() // {"user":{"id":1,"name":"Brian"},"counter":2}, "name: Brian"
store.stepBack() // {"user":{"id":1,"name":"Brian"},"counter":1}
store.stepForward() // {"user":{"id":1,"name":"Brian"},"counter":2}
store.stepForward() // {"user":{"id":1,"name":"Brian Vaughn"},"counter":2}, "name: Brian Vaughn"
```
