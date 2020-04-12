<script>
  import { getContext } from 'svelte';
  import { onCreate } from '../../store/actions/todo';

  const store = getContext('store');
  const ENTER_KEY = 'Enter';
  let name = '';

  const handleChange = event => (name = event.target.value);

  const handleSubmit = event => {
    if (event.key !== ENTER_KEY) {
      return;
    }

    store.dispatch(onCreate(name));
    name = '';
  };
</script>

<header class="header">
  <h1>todos</h1>
  <input
    class="new-todo"
    placeholder="What needs to be done?"
    value={name}
    on:input={handleChange}
    on:keyup={handleSubmit}
    data-testid="todo-create" />
</header>
