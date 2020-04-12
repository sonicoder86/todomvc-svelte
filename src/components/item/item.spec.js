import { render, fireEvent } from '@testing-library/svelte';
import Item from './item.svelte';

describe('Item', () => {
  it('should display todo item', () => {
    const todo = { id: 'e2bb892a-844a-47fb-a2b3-47f491af9d88', name: 'Demo', completed: false };

    const { getByTestId } = render(Item, { todo });

    expect(getByTestId('todo-name')).toHaveTextContent(todo.name);
  });

  it('should mark todo item as completed', () => {
    const todo = { id: 'e2bb892a-844a-47fb-a2b3-47f491af9d88', name: 'Demo', completed: true };

    const { getByTestId } = render(Item, { todo });

    expect(getByTestId('todo-item')).toHaveClass('completed');
  });

  it('should notify about delete button', () => {
    const todo = { id: 'e2bb892a-844a-47fb-a2b3-47f491af9d88', name: 'Demo', completed: false };

    const { getByTestId, component } = render(Item, { todo });

    let removeId;
    component.$on('remove', event => (removeId = event.detail));

    fireEvent.click(getByTestId('todo-remove'));

    expect(removeId).toEqual(todo.id);
  });
});
