import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FearGreedIndex from '../components/FearGreedIndex.jsx';

describe('FearGreedIndex', () => {
  const mockData = { value: '45', value_classification: 'Fear' };
  const mockOnRefresh = vi.fn();

  it('should render collapsed toggle button', () => {
    render(<FearGreedIndex fearGreedData={null} isLoading={false} onRefresh={mockOnRefresh} />);
    expect(screen.getByText('F&G')).toBeInTheDocument();
  });

  it('should expand on toggle click', () => {
    render(<FearGreedIndex fearGreedData={mockData} isLoading={false} onRefresh={mockOnRefresh} />);
    
    const toggle = screen.getByText('F&G');
    fireEvent.click(toggle);
    
    expect(screen.getByText('Fear & Greed')).toBeInTheDocument();
  });

  it('should show classification when expanded', () => {
    render(<FearGreedIndex fearGreedData={mockData} isLoading={false} onRefresh={mockOnRefresh} />);
    
    fireEvent.click(screen.getByText('F&G'));
    
    expect(screen.getByText('Fear')).toBeInTheDocument();
  });

  it('should show loading skeleton when loading', () => {
    render(<FearGreedIndex fearGreedData={null} isLoading={true} onRefresh={mockOnRefresh} />);
    
    fireEvent.click(screen.getByText('F&G'));
    
    expect(document.querySelector('.skeleton')).toBeInTheDocument();
  });

  it('should show error when data is null and not loading', () => {
    render(<FearGreedIndex fearGreedData={null} isLoading={false} onRefresh={mockOnRefresh} />);
    
    fireEvent.click(screen.getByText('F&G'));
    
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
  });

  it('should show Extreme Fear for value <= 25', () => {
    render(<FearGreedIndex fearGreedData={{ value: '20' }} isLoading={false} onRefresh={mockOnRefresh} />);
    
    fireEvent.click(screen.getByText('F&G'));
    
    expect(screen.getByText('Extreme Fear')).toBeInTheDocument();
  });

  it('should show Extreme Greed for value > 75', () => {
    render(<FearGreedIndex fearGreedData={{ value: '80' }} isLoading={false} onRefresh={mockOnRefresh} />);
    
    fireEvent.click(screen.getByText('F&G'));
    
    expect(screen.getByText('Extreme Greed')).toBeInTheDocument();
  });

  it('should show Neutral for value between 45-55', () => {
    render(<FearGreedIndex fearGreedData={{ value: '50' }} isLoading={false} onRefresh={mockOnRefresh} />);
    
    fireEvent.click(screen.getByText('F&G'));
    
    expect(screen.getByText('Neutral')).toBeInTheDocument();
  });

  it('should call onRefresh when refresh button clicked', () => {
    render(<FearGreedIndex fearGreedData={mockData} isLoading={false} onRefresh={mockOnRefresh} />);
    
    fireEvent.click(screen.getByText('F&G'));
    
    const refreshButton = screen.getByLabelText('Refresh');
    fireEvent.click(refreshButton);
    
    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it('should close when close button clicked', () => {
    render(<FearGreedIndex fearGreedData={mockData} isLoading={false} onRefresh={mockOnRefresh} />);
    
    fireEvent.click(screen.getByText('F&G'));
    expect(screen.getByText('Fear & Greed')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('✕'));
    expect(screen.queryByText('Fear & Greed')).toBeNull();
  });

  it('should display value and percentage bar', () => {
    render(<FearGreedIndex fearGreedData={{ value: '45' }} isLoading={false} onRefresh={mockOnRefresh} />);
    
    fireEvent.click(screen.getByText('F&G'));
    
    expect(screen.getByText('45')).toBeInTheDocument();
    const bar = document.querySelector('.fear-greed-bar-fill');
    expect(bar).toHaveStyle({ width: '45%' });
  });
});