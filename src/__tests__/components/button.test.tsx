import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Button from '@/components/ui/button';

describe('Button Component', () => {
  it('butonu doğru bir şekilde render etmelidir', () => {
    // Arrange
    render(<Button>Test Butonu</Button>);
    
    // Act & Assert
    expect(screen.getByRole('button', { name: /test butonu/i })).toBeInTheDocument();
  });
  
  it('onClick olayını işlemelidir', async () => {
    // Arrange
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Tıkla</Button>);
    
    // Act
    await user.click(screen.getByRole('button', { name: /tıkla/i }));
    
    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('variant prop\'una göre doğru sınıfı uygulamalıdır', () => {
    // Arrange
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    
    // Act & Assert - Primary variant
    const primaryButton = screen.getByRole('button', { name: /primary/i });
    expect(primaryButton).toHaveClass('bg-primary');
    
    // Act & Assert - Secondary variant
    rerender(<Button variant="secondary">Secondary</Button>);
    const secondaryButton = screen.getByRole('button', { name: /secondary/i });
    expect(secondaryButton).toHaveClass('bg-secondary');
    
    // Act & Assert - Danger variant
    rerender(<Button variant="danger">Danger</Button>);
    const dangerButton = screen.getByRole('button', { name: /danger/i });
    expect(dangerButton).toHaveClass('bg-red-600');
  });
  
  it('size prop\'una göre doğru boyutu uygulamalıdır', () => {
    // Arrange
    const { rerender } = render(<Button size="sm">Small</Button>);
    
    // Act & Assert - Small size
    const smallButton = screen.getByRole('button', { name: /small/i });
    expect(smallButton).toHaveClass('text-sm');
    
    // Act & Assert - Medium size (default)
    rerender(<Button size="md">Medium</Button>);
    const mediumButton = screen.getByRole('button', { name: /medium/i });
    expect(mediumButton).toHaveClass('text-base');
    
    // Act & Assert - Large size
    rerender(<Button size="lg">Large</Button>);
    const largeButton = screen.getByRole('button', { name: /large/i });
    expect(largeButton).toHaveClass('text-lg');
  });
  
  it('disabled durumunda doğru stilleri ve davranışı uygulamalıdır', async () => {
    // Arrange
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    // Act
    const button = screen.getByRole('button', { name: /disabled/i });
    await user.click(button);
    
    // Assert
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
    expect(handleClick).not.toHaveBeenCalled();
  });
}); 