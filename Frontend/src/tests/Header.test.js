import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../components/corporate/Header';
import { CartProvider } from '../services/contexts/CartContext';

// Mock modules
jest.mock('axios');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock CartContext
jest.mock('../../services/contexts/CartContext', () => ({
  useCart: () => ({
    cartCount: 0,
    updateCartCount: jest.fn()
  })
}));

describe('Header Navigation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890'
    };
    localStorage.setItem('userDP', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-token');
  });

  test('opens sidenav when user profile icon is clicked', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <Header user={{ name: 'Test User' }} />
        </CartProvider>
      </BrowserRouter>
    );

    const userIcon = screen.getByTestId('user-circle-icon');
    fireEvent.click(userIcon);

    expect(screen.getByText('My Orders')).toBeInTheDocument();
    expect(screen.getByText('LogOut →')).toBeInTheDocument();
  });

  test('navigates to cart page when shopping cart icon is clicked', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <Header user={{ name: 'Test User' }} />
        </CartProvider>
      </BrowserRouter>
    );

    const cartIcon = screen.getByTestId('shopping-cart-icon');
    fireEvent.click(cartIcon);

    expect(mockNavigate).toHaveBeenCalledWith('/cart');
  });
});