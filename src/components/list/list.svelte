<script>
  import { getContext } from 'svelte';
  import { onCompleteAll, onRemove, onUpdate } from '../../store/actions/todo';
  import Item from '../item/item.svelte';

  const store = getContext('store');

  const completeAll = () => store.dispatch(onCompleteAll());

  const remove = event => store.dispatch(onRemove(event.detail));

  const update = event => store.dispatch(onUpdate(event.detail));

  const { visibleTodos } = store.selectors;
  const { areAllCompleted } = store.selectors;
</script>

<section class="main">
  <input id="toggle-all" class="toggle-all" type="checkbox" checked={$areAllCompleted} readonly />
  <label for="toggle-all" on:click={completeAll} />

  <ul class="todo-list">
    {#each $visibleTodos as todo}
      <Item {todo} on:remove={remove} on:update={update} />
    {/each}
  </ul>
</section>
