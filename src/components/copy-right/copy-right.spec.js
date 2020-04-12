import { render } from '@testing-library/svelte';
import CopyRight from './copy-right.svelte';

describe('CopyRight', () => {
  it('should render component', () => {
    const { getByTestId } = render(CopyRight);

    expect(getByTestId('instruction')).toHaveTextContent('Double-click to edit a todo');
  });
});
