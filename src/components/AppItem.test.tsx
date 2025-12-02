import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import AppItem from './AppItem';

const mockApp = {
  id: 1,
  name: {
    ko: '테스트 앱',
    en: 'Test App',
  },
  desc: {
    ko: '테스트 앱 설명',
    en: 'Test App Description',
  },
  icon: '🔧',
  size: 1024,
  url: '/test',
};

describe('AppItem', () => {
  it('should render app name in Korean', () => {
    render(<AppItem app={mockApp} language="ko" />);
    expect(screen.getByText('테스트 앱')).toBeInTheDocument();
  });

  it('should render app name in English', () => {
    render(<AppItem app={mockApp} language="en" />);
    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  it('should have correct link', () => {
    render(<AppItem app={mockApp} language="ko" />);
    const link = screen.getByRole('listitem');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should have accessible label in Korean', () => {
    render(<AppItem app={mockApp} language="ko" />);
    const link = screen.getByRole('listitem');
    expect(link).toHaveAttribute('aria-label', '테스트 앱 - 테스트 앱 설명');
  });

  it('should have accessible label in English', () => {
    render(<AppItem app={mockApp} language="en" />);
    const link = screen.getByRole('listitem');
    expect(link).toHaveAttribute(
      'aria-label',
      'Test App - Test App Description'
    );
  });
});
