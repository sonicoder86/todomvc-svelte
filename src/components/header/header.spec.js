import { render, fireEvent } from '@testing-library/svelte';
import HeaderTest from './header-test.svelte';
import { FILTERS } from '../../constants/filter';

describe('Header', () => {
  it('should add new element to store', () => {
    const { getByTestId, component } = render(HeaderTest, {
      state: {
        todos: [],
        filter: FILTERS.all
      }
    });

    let todos;
    component.$on('todos', event => (todos = event.detail));

    const input = getByTestId('todo-create');
    input.value = 'Demo';
    fireEvent.input(input);
    fireEvent.keyUp(input, { key: 'Enter' });

    expect(todos).toHaveLength(1);
    expect(todos[0].id).toBeString();
    expect(todos[0].name).toEqual('Demo');
    expect(todos[0].completed).toEqual(false);
  });
});
