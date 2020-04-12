<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let todo;
  let editing = false;
  let { name } = todo;

  const handleEdit = () => (editing = true);

  const handleCompleted = () => {
    dispatch('update', {
      id: todo.id,
      completed: !todo.completed
    });
  };

  const handleRemove = () => dispatch('remove', todo.id);

  const handleChange = event => (name = event.target.value);

  const handleBlur = () => {
    dispatch('update', {
      id: todo.id,
      name
    });
    editing = false;
  };
</script>

<li class:editing class:completed={todo.completed} data-testid="todo-item">
  <div class="view">
    <input class="toggle" type="checkbox" checked={todo.completed} on:change={handleCompleted} />
    <label on:dblclick={handleEdit} data-testid="todo-name">{todo.name}</label>
    <button class="destroy" on:click={handleRemove} data-testid="todo-remove" />
  </div>
  <input class="edit" value={name} on:input={handleChange} on:blur={handleBlur} />
</li>
