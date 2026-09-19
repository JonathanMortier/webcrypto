import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardSkeletonGrid } from '../components/Status.jsx';

describe('CardSkeletonGrid', () => {
  it('should render 12 csk-block cards by default', () => {
    const { container } = render(<CardSkeletonGrid />);
    expect(container.querySelectorAll('.csk-card')).toHaveLength(12);
  });

  it('should render the requested number of csk-block cards', () => {
    const { container } = render(<CardSkeletonGrid count={3} />);
    expect(container.querySelectorAll('.csk-card')).toHaveLength(3);
  });

  it('should expose a busy status with an accessible loading label', () => {
    render(<CardSkeletonGrid count={1} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Chargement des données...')).toBeInTheDocument();
  });

  it('should hide the decorative cards from assistive technology', () => {
    const { container } = render(<CardSkeletonGrid count={2} />);
    container.querySelectorAll('.csk-card').forEach((card) => {
      expect(card).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
