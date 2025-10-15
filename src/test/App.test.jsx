import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import App from '../App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Geography Quiz')).toBeInTheDocument();
  });

  test('shows welcome message', () => {
    render(<App />);
    expect(screen.getByText('Welcome to the Geography Quiz app!')).toBeInTheDocument();
  });

  test('has generate prompt button', () => {
    render(<App />);
    expect(screen.getByText('Generate Prompt')).toBeInTheDocument();
  });
});
