import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SignInContext } from '../services/contexts/SignInContext';
import { useCart } from '../services/contexts/CartContext';
import SignInForm from '../components/customer/SignInForm';

// Mock all external dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));
jest.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <button>Google Login</button>
}));
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn()
}));
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <i>icon</i>
}));
jest.mock('../services/contexts/CartContext', () => ({
  useCart: jest.fn()
}));



describe('SignInForm', () => {
  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn();
  const mockOnSignIn = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mocks
    useNavigate.mockReturnValue(mockNavigate);
    useCart.mockReturnValue({ cartCount: 0 });
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
  });

  const renderComponent = (state = { data: null, isError: false, errorMessage: '' }) => {
    return render(
      <SignInContext.Provider value={{ state, dispatch: mockDispatch }}>
        <SignInForm onSignIn={mockOnSignIn} />
      </SignInContext.Provider>
    );
  };

  test('renders sign in form correctly', () => {
    renderComponent();
    
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  test('handles email input change', async () => {
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('Enter email');
    await userEvent.type(emailInput, 'test@example.com');
    
    expect(emailInput.value).toBe('test@example.com');
  });

  test('handles password input change', async () => {
    renderComponent();
    
    const passwordInput = screen.getByPlaceholderText('Enter password');
    await userEvent.type(passwordInput, 'password123');
    
    expect(passwordInput.value).toBe('password123');
  });

  test('handles forgot password flow', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'OTP sent successfully' } });
    
    renderComponent();
    
    // Click forgot password link
    await userEvent.click(screen.getByText('Forgot Password?'));
    
    // Enter email and submit
    await userEvent.type(screen.getByPlaceholderText('Enter email for OTP'), 'test@example.com');
    await userEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4000/customer/checkCustomerOtp',
        { email: 'test@example.com' }
      );
    });
  });

  test('handles successful sign in', async () => {
    const mockToken = 'mock-token';
    const mockState = {
      data: mockToken,
      isError: false,
      errorMessage: ''
    };

    renderComponent(mockState);
    
    await waitFor(() => {
      expect(mockOnSignIn).toHaveBeenCalledWith(mockToken, false);
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });
  test('handles sign in error', async () => {
    const mockErrorMessage = 'Invalid credentials';
    axios.post.mockRejectedValueOnce({
      response: { data: { message: mockErrorMessage } }
    });
  
    renderComponent();
  
    await userEvent.type(screen.getByPlaceholderText('Enter email'), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText('Enter password'), 'wrong-password');
    await userEvent.click(screen.getByText('Sign In'));
  
    await waitFor(() => {
      expect(screen.getByText(mockErrorMessage)).toBeInTheDocument();
    });
  });
 
});