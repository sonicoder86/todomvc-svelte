import CopyRight from './copy-right.svelte';
import { render } from '@testing-library/svelte';

describe('CopyRight', () => {
  it('should render component', () => {
    const { getByTestId } = render(CopyRight);

    expect(getByTestId('instruction')).toHaveTextContent('Double-click to edit a todo');
  });
});
