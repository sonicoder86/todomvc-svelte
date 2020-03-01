import { writable, derived } from 'svelte/store';
import { FILTERS } from '../constants/filter';
import { todosReducer } from './reducers/todo';
import { filterReducer } from './reducers/filter';
import { selectNotCompleted, selectCompleted, selectVisible } from './selectors/todo';

function reduce(reducer, initial) {
  const state = writable(initial);

  const subscribe = run => state.subscribe(run);
  const dispatch = action => {
    state.update(value => reducer(value, action));
  };

  return { state, subscribe, dispatch };
}

const todos = reduce(todosReducer, []);
const filter = reduce(filterReducer, FILTERS.all);

export const store = {
  state: {
    todos: todos.state,
    filter: filter.state
  },
  dispatch(action) {
    todos.dispatch(action);
    filter.dispatch(action);
  },
  selectors: {
    itemsLeft: derived(todos, todos => selectNotCompleted(todos).length),
    completedCount: derived(todos, todos => selectCompleted(todos).length),
    visibleTodos: derived([todos, filter], ([todos, filter]) => selectVisible(todos, filter)),
    areAllCompleted: derived(todos, todos => todos.length && todos.every(todo => todo.completed))
  }
};
