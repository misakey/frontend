### @misakey/store

```shell
yarn add @misakey/store
```

#### Add reducers

You can either:
1. import one by one the reducers you want
2. import all the reducers and combine them your way
3. use the helper function wrapping combineReducers


##### 1 - import one by one the reducers you want

In your main reducers file
<!-- eslint-skip -->
```js static
import { combineReducers } from 'redux';

// for instance import entities reducer
import entities from '@misakey/store/reducers/entities';

// ...

const rootReducer = combineReducers({
  entities,
  // ...
});

export default rootReducer;
```

##### 2 - import all the reducers and combine them your way

In your main reducers file
<!-- eslint-skip -->
```js static
import { combineReducers } from 'redux';

// import all reducers in object from @misakey/store
import reducers from '@misakey/store/reducers';

// import your reducers
import myReducer from 'reducers/myReducer';

// ...

const rootReducer = combineReducers({ myReducer, ...reducers });
// equivalent to combineReducers({myReducer, entities, global, ...})

export default rootReducer;
```

##### 3 - use the helper function wrapping combineReducers

In your main reducers file
<!-- eslint-skip -->
```js static
// import wrapper
import { combineWithReducers } from '@misakey/store/reducers';

// import your reducers
import myReducer from 'reducers/myReducer';

// ...

const rootReducer = combineWithReducers({ myReducer });
// equivalent to combineReducers({myReducer, entities, global, ...})

export default rootReducer;
```

