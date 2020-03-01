<script>
  import { onMount } from 'svelte';

  import Header from '../header/header.svelte';
  import List from '../list/list.svelte';
  import Footer from '../footer/footer.svelte';
  import CopyRight from '../copy-right/copy-right.svelte';
  import { TodoLocal } from '../../services/todo-local';
  import { store } from '../../store';
  import { onLoad } from '../../store/actions/todo';

  const { todos } = store.state;

  onMount(() => {
    store.dispatch(onLoad(TodoLocal.loadTodos()));
    todos.subscribe(todos => TodoLocal.storeTodos(todos));
  });
</script>

<div id="app">
  <section class="todoapp">
    <Header />
    {#if $todos.length}
      <List />
    {/if}
    {#if $todos.length}
      <Footer />
    {/if}
  </section>
  <CopyRight />
</div>
