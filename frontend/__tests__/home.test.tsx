import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../app/admin/home/page';

describe('Home page', () => {
  it('renders without crashing and shows heading', () => {
    render(<HomePage />);
    // Expect some text from Production_Planing wrapped page
    expect(screen.getByText(/เพิ่มงานที่ต้องการผลิต/i)).toBeInTheDocument();
  });
});


