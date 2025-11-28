import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import AppItem from './AppItem';

const mockApp = {
  id: 1,
  name: '테스트 앱',
  desc: 'Test App Description',
  icon: '🔧',
  size: 1024,
  url: '/test',
};

describe('AppItem', () => {
  it('should render app name', () => {
    render(<AppItem app={mockApp} />);
    expect(screen.getByText('테스트 앱')).toBeInTheDocument();
  });

  it('should have correct link', () => {
    render(<AppItem app={mockApp} />);
    const link = screen.getByRole('listitem');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should have accessible label', () => {
    render(<AppItem app={mockApp} />);
    const link = screen.getByRole('listitem');
    expect(link).toHaveAttribute(
      'aria-label',
      '테스트 앱 - Test App Description'
    );
  });
});
