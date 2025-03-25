import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';

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
    const { rerender } = render(<Button variant="default">Default</Button>);
    
    // Act & Assert - Default variant
    const defaultButton = screen.getByRole('button', { name: /default/i });
    expect(defaultButton).toHaveClass('bg-primary');
    
    // Act & Assert - Secondary variant
    rerender(<Button variant="secondary">Secondary</Button>);
    const secondaryButton = screen.getByRole('button', { name: /secondary/i });
    expect(secondaryButton).toHaveClass('bg-secondary');
    
    // Act & Assert - Destructive variant
    rerender(<Button variant="destructive">Destructive</Button>);
    const destructiveButton = screen.getByRole('button', { name: /destructive/i });
    expect(destructiveButton).toHaveClass('bg-destructive');
  });
  
  it('size prop\'una göre doğru boyutu uygulamalıdır', () => {
    // Arrange
    const { rerender } = render(<Button size="sm">Small</Button>);
    
    // Act & Assert - Small size
    const smallButton = screen.getByRole('button', { name: /small/i });
    expect(smallButton).toHaveClass('rounded-md');
    
    // Act & Assert - Default size
    rerender(<Button size="default">Default</Button>);
    const defaultButton = screen.getByRole('button', { name: /default/i });
    expect(defaultButton).toHaveClass('h-10');
    
    // Act & Assert - Large size
    rerender(<Button size="lg">Large</Button>);
    const largeButton = screen.getByRole('button', { name: /large/i });
    expect(largeButton).toHaveClass('h-11');
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
    expect(button).toHaveClass('disabled:opacity-50');
    expect(handleClick).not.toHaveBeenCalled();
  });
}); 