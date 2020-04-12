<script>
  import { setContext, createEventDispatcher } from 'svelte';
  import Header from './header.svelte';
  import { createStore } from '../../store';

  export let state;

  const dispatch = createEventDispatcher();

  const store = createStore(state);
  setContext('store', store);

  const { todos } = store.state;
  todos.subscribe(todoItems => dispatch('todos', todoItems));
</script>

<Header />
