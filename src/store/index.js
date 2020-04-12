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

export const createStore = (state = { todos: [], filter: FILTERS.all }) => {
  const todosStore = reduce(todosReducer, state.todos);
  const filterStore = reduce(filterReducer, state.filter);

  return {
    state: {
      todos: todosStore.state,
      filter: filterStore.state
    },
    dispatch(action) {
      todosStore.dispatch(action);
      filterStore.dispatch(action);
    },
    selectors: {
      itemsLeft: derived(todosStore, todos => selectNotCompleted(todos).length),
      completedCount: derived(todosStore, todos => selectCompleted(todos).length),
      visibleTodos: derived([todosStore, filterStore], ([todos, filter]) => selectVisible(todos, filter)),
      areAllCompleted: derived(todosStore, todos => todos.length && todos.every(todo => todo.completed))
    }
  };
};
