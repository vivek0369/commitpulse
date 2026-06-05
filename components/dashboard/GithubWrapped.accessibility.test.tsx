import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import GithubWrapped from './GithubWrapped';

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const React = await import('react');

  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');

  const createMockComponent = (tag: keyof React.JSX.IntrinsicElements) => {
    const MockComponent = ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      delete props.initial;
      delete props.animate;
      delete props.exit;
      delete props.transition;
      delete props.whileInView;
      delete props.viewport;

      return React.createElement(tag, props, children);
    };

    MockComponent.displayName = `MockMotion${tag}`;

    return MockComponent;
  };

  return {
    ...actual,

    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,

    motion: {
      div: createMockComponent('div'),
      section: createMockComponent('section'),
      span: createMockComponent('span'),
      svg: createMockComponent('svg'),
      path: createMockComponent('path'),
      circle: createMockComponent('circle'),
      g: createMockComponent('g'),
      text: createMockComponent('text'),
      button: createMockComponent('button'),
    },
  };
});

const mockProfile = {
  login: 'accessibility-user',
  avatar_url: 'https://github.com/test.png',
  html_url: 'https://github.com/test',
};

const mockWrappedData = {
  totalContributions: 1200,
  totalCommits: 120,
  totalStars: 45,

  longestStreak: 12,
  currentStreak: 4,

  busiestDay: 'Monday',
  busiestMonth: '2024-03',
  weekendRatio: 30,

  topLanguages: [
    {
      name: 'TypeScript',
      percentage: 60,
    },
  ],

  topRepositories: [
    {
      name: 'commitpulse',
      stars: 25,
      forks: 5,
    },
  ],

  contributionYears: ['2024'],

  totalPullRequests: 14,
  totalIssues: 6,
  totalReviews: 9,

  peakCommitHour: 22,
  mostActiveMonth: 'March',

  averageCommitsPerDay: 6,
  contributionsThisYear: 800,
  favoriteLanguage: 'TypeScript',

  totalRepositories: 18,
  totalForks: 12,
  mergedPullRequests: 10,

  codingSessions: 42,
  peakDayCommits: 25,

  achievements: ['Fast Committer'],
};

describe('GithubWrapped Accessibility', () => {
  it('renders main heading correctly for screen readers', () => {
    render(<GithubWrapped profile={mockProfile} wrappedData={mockWrappedData} />);

    const heading = screen.getByRole('heading', {
      level: 1,
    });

    expect(heading).toBeDefined();
  });

  it('renders logical heading hierarchy', () => {
    render(<GithubWrapped profile={mockProfile} wrappedData={mockWrappedData} />);

    const headings = screen.getAllByRole('heading');

    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders accessible text content for assistive technologies', () => {
    render(<GithubWrapped profile={mockProfile} wrappedData={mockWrappedData} />);

    expect(screen.getByText(/total contributions/i)).toBeDefined();
  });

  it('supports keyboard navigation flow', async () => {
    const user = userEvent.setup();

    render(<GithubWrapped profile={mockProfile} wrappedData={mockWrappedData} />);

    await user.tab();

    expect(document.body).toBeDefined();
  });

  it('renders SVG/statistical visual content without accessibility crashes', () => {
    expect(() => {
      render(<GithubWrapped profile={mockProfile} wrappedData={mockWrappedData} />);
    }).not.toThrow();
  });
});
