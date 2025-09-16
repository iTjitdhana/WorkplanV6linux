import React from 'react';
import { render, screen } from '@testing-library/react';
import TrackerPage from '../app/tracker/page';

describe('Tracker page', () => {
  it('renders and shows production plan text', () => {
    render(<TrackerPage />);
    // title from translations or fallback text on the page
    expect(screen.getByText(/แผนผลิต/i)).toBeInTheDocument();
  });
});


