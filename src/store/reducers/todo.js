import { ACTION_TYPES } from '../../constants/action-type';
import { v4 as uuidv4 } from 'uuid';
import { selectCompleted, selectNotCompleted } from '../selectors/todo';

export const todosReducer = (state = [], action) => {
  switch (action.type) {
    case ACTION_TYPES.load:
      return [...action.todos];
    case ACTION_TYPES.create:
      return [...state, { id: uuidv4(), name: action.name, completed: false }];
    case ACTION_TYPES.update:
      return state.map(
        todo => todo.id === action.values.id ? { ...todo, ...action.values } : todo
      );
    case ACTION_TYPES.remove:
      return state.filter(todo => todo.id !== action.id);
    case ACTION_TYPES.completeAll:
      const areAllCompleted = state.length && selectCompleted(state).length === state.length;
      return state.map(
        todo => ({ ...todo, ...{ completed: !areAllCompleted } })
      );
    case ACTION_TYPES.clearCompleted:
      return selectNotCompleted(state);
    default:
      return state;
  }
};
