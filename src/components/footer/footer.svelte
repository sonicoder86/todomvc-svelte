<script>
  import { getContext } from 'svelte';
  import { derived } from 'svelte/store';
  import { FILTERS } from '../../constants/filter';
  import { onFilterSelect } from '../../store/actions/filter';
  import { onClearCompleted } from '../../store/actions/todo';

  const store = getContext('store');
  const filterTitles = [
    { key: FILTERS.all, value: 'All' },
    { key: FILTERS.active, value: 'Active' },
    { key: FILTERS.completed, value: 'Completed' }
  ];

  const { filter } = store.state;
  const { itemsLeft, completedCount } = store.selectors;
  const itemText = derived(itemsLeft, itemCount => (itemCount === 1 ? 'item' : 'items'));

  const filterSelect = selectedFilter => store.dispatch(onFilterSelect(selectedFilter));
  const clearCompleted = () => store.dispatch(onClearCompleted());
</script>

<footer class="footer">
  <span class="todo-count">
    <strong>{$itemsLeft}</strong>
    <span>{$itemText} left</span>
  </span>
  <ul class="filters">
    {#each filterTitles as filterTitle}
      <li>
        <a href="./#" class:selected={filterTitle.key === $filter} on:click={() => filterSelect(filterTitle.key)}>
          {filterTitle.value}
        </a>
      </li>
    {/each}
  </ul>
  {#if $completedCount}
    <button class="clear-completed" on:click={clearCompleted}>Clear completed</button>
  {/if}
</footer>
