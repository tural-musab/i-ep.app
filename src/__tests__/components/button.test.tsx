// @ts-nocheck
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies default variant and size classes', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByText('Default Button');

    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-9');
  });

  describe('Variants', () => {
    it.each([
      ['default', 'bg-primary'],
      ['destructive', 'bg-destructive'],
      ['outline', 'border'],
      ['secondary', 'bg-secondary'],
      ['ghost', 'hover:bg-accent'],
      ['link', 'text-primary'],
    ])('renders %s variant with correct class', (variant, expectedClass) => {
      render(
        <Button variant={variant as VariantProps<typeof buttonVariants>['variant']}>Button</Button>
      );
      expect(screen.getByText('Button')).toHaveClass(expectedClass);
    });
  });

  describe('Sizes', () => {
    it.each([
      ['default', 'h-9'],
      ['sm', 'h-8'],
      ['lg', 'h-10'],
      ['icon', 'size-9'],
    ])('renders %s size with correct class', (size, expectedClass) => {
      render(<Button size={size as VariantProps<typeof buttonVariants>['size']}>Button</Button>);
      expect(screen.getByText('Button')).toHaveClass(expectedClass);
    });
  });

  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <Link href="/test">Link Button</Link>
      </Button>
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByText('Disabled Button');

    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    expect(screen.getByText('Custom Button')).toHaveClass('custom-class');
  });

  it('forwards additional props', () => {
    render(
      <Button data-testid="test-button" type="submit">
        Submit
      </Button>
    );
    const button = screen.getByTestId('test-button');

    expect(button).toHaveAttribute('type', 'submit');
  });
});

describe('buttonVariants', () => {
  it('generates correct classes for variant and size combinations', () => {
    const classes = buttonVariants({ variant: 'outline', size: 'sm' });
    expect(classes).toContain('border');
    expect(classes).toContain('h-8');
  });

  it('uses default values when no props provided', () => {
    const classes = buttonVariants();
    expect(classes).toContain('bg-primary');
    expect(classes).toContain('h-9');
  });
});
