// Home.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../components/corporate/Home';
import Header from '../components/corporate/Header'; // Import Header to check if it gets rendered correctly

jest.mock('../components/corporate/Home', () => {
  return function MockHeader({ user }) {
    return <div data-testid="mock-header">Mock Header for {user ? user.name : 'Guest'}</div>;
  };
});

describe('Home Component', () => {
  test('renders Header with user prop', () => {
    const user = { name: 'John Doe' };
    
    render(<Home user={user} />);
    
    // Check if the Header is rendered with the user prop
    const headerElement = screen.getByTestId('mock-header');
    expect(headerElement).toBeInTheDocument();
    expect(headerElement).toHaveTextContent('Mock Header for John Doe');
  });

  test('renders Header for guest user', () => {
    render(<Home user={null} />); // Simulate a guest user
    
    // Check if the Header renders correctly for a guest user
    const headerElement = screen.getByTestId('mock-header');
    expect(headerElement).toBeInTheDocument();
    expect(headerElement).toHaveTextContent('Mock Header for Guest');
  });
});
