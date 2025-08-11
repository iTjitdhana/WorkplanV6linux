import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBox, SearchOption } from './SearchBox';

// Mock fetch
global.fetch = jest.fn();

const mockSearchOption: SearchOption = {
  job_code: 'TEST001',
  job_name: 'งานทดสอบ',
  category: 'production',
  iconUrl: '/test-icon.png'
};

const defaultProps = {
  value: '',
  onChange: jest.fn(),
  onSelect: jest.fn(),
  cacheRef: { current: new Map() },
  placeholder: 'ค้นหา...',
  showAvatar: false,
  onError: jest.fn()
};

describe('SearchBox Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders search input with placeholder', () => {
    render(<SearchBox {...defaultProps} />);
    expect(screen.getByPlaceholderText('ค้นหา...')).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    render(<SearchBox {...defaultProps} />);
    const input = screen.getByPlaceholderText('ค้นหา...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('test');
  });

  it('shows dropdown when user types and there are results', async () => {
    const mockCache = new Map();
    mockCache.set('test', [mockSearchOption]);
    
    render(<SearchBox {...defaultProps} cacheRef={{ current: mockCache }} value="test" />);
    
    await waitFor(() => {
      expect(screen.getByText('งานทดสอบ')).toBeInTheDocument();
    });
  });

  it('calls onSelect when user clicks on an option', async () => {
    const mockCache = new Map();
    mockCache.set('test', [mockSearchOption]);
    
    render(<SearchBox {...defaultProps} cacheRef={{ current: mockCache }} value="test" />);
    
    await waitFor(() => {
      const option = screen.getByText('งานทดสอบ');
      fireEvent.click(option);
      expect(defaultProps.onSelect).toHaveBeenCalledWith(mockSearchOption);
    });
  });

  it('shows "Add New" option when no exact match found', async () => {
    const mockCache = new Map();
    mockCache.set('new', [mockSearchOption]);
    
    render(<SearchBox {...defaultProps} cacheRef={{ current: mockCache }} value="new job" />);
    
    await waitFor(() => {
      expect(screen.getByText(/เพิ่มรายการใหม่/)).toBeInTheDocument();
    });
  });

  it('handles API error and calls onError', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    render(<SearchBox {...defaultProps} value="test" />);
    
    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith('เกิดข้อผิดพลาดในการค้นหา');
    });
  });

  it('shows loading state while searching', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({ data: [] }) }), 100))
    );
    
    render(<SearchBox {...defaultProps} value="test" />);
    
    await waitFor(() => {
      expect(screen.getByText('🔍 กำลังค้นหา...')).toBeInTheDocument();
    });
  });

  it('handles keyboard navigation', async () => {
    const mockCache = new Map();
    mockCache.set('test', [mockSearchOption]);
    
    render(<SearchBox {...defaultProps} cacheRef={{ current: mockCache }} value="test" />);
    
    const input = screen.getByPlaceholderText('ค้นหา...');
    
    // Press Arrow Down
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    await waitFor(() => {
      const option = screen.getByText('งานทดสอบ');
      expect(option).toHaveClass('bg-green-200');
    });
  });

  it('clears error when user types new input', () => {
    render(<SearchBox {...defaultProps} />);
    const input = screen.getByPlaceholderText('ค้นหา...');
    
    // Simulate error state
    fireEvent.change(input, { target: { value: 'error' } });
    
    // Clear input
    fireEvent.change(input, { target: { value: '' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('');
  });
});
