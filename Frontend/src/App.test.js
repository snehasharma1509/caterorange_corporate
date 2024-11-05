// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import App from './App';
// import { BrowserRouter } from 'react-router-dom';
// import axios from 'axios';
// import { useCart } from './services/contexts/CartContext';
// import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider

// jest.mock('axios');
// jest.mock('./services/contexts/CartContext', () => ({
//   useCart: jest.fn(),
// }));

// describe('App component', () => {
//   beforeEach(() => {
//     useCart.mockReturnValue({ cartCount: 3 }); // Mocking cart count
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   test('renders SignInForm when user is not signed in', () => {
//     render(
//       <BrowserRouter>
//         <GoogleOAuthProvider clientId="636281200529-dl48re3g9q9221e7dcruuqls3f46v311.apps.googleusercontent.com"> {/* Add your Google client ID */}
//           <App />
//         </GoogleOAuthProvider>
//       </BrowserRouter>
//     );

//     // Check that SignInForm renders when user is null
//     expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
//   });

//   test('navigates to Home when user is signed in', async () => {
//     const mockToken = 'mock-token';
//     const mockResponse = {
//       data: {
//         customer_name: 'John Doe',
//         customer_phonenumber: '1234567890',
//         customer_email: 'john@example.com',
//       },
//     };

//     axios.get.mockResolvedValueOnce(mockResponse);

//     const { rerender } = render(
//       <BrowserRouter>
//         <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID"> {/* Add your Google client ID */}
//           <App />
//         </GoogleOAuthProvider>
//       </BrowserRouter>
//     );

//     // Simulate handleSignIn call
//     const signInForm = screen.getByText(/Sign In/i);
//     fireEvent.click(signInForm); // Simulate a click (this will depend on your SignInForm component setup)

//     await waitFor(() => {
//       expect(axios.get).toHaveBeenCalledWith('http://localhost:4000/customer/info', {
//         headers: { token: mockToken },
//       });
//     });

//     rerender(
//       <BrowserRouter>
//         <GoogleOAuthProvider clientId="636281200529-dl48re3g9q9221e7dcruuqls3f46v311.apps.googleusercontent.com"> {/* Add your Google client ID */}
//           <App />
//         </GoogleOAuthProvider>
//       </BrowserRouter>
//     );

//     // Check that the Home component now renders
//     expect(screen.getByText(/Welcome, John Doe!/i)).toBeInTheDocument();
//   });
// });


import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import App from './App';
import { CartProvider } from './services/contexts/CartContext';

// Mock all the required components and contexts
jest.mock('axios');
jest.mock('./components/customer/SignInForm', () => {
  return function MockSignInForm({ onSignIn }) {
    return <div data-testid="mock-signin" onClick={() => onSignIn('test-token', false)}>Mock SignIn</div>;
  };
});
jest.mock('./components/corporate/Home', () => {
  return function MockHome() {
    return <div data-testid="mock-home">Mock Home</div>;
  };
});
jest.mock('./components/events/Menu', () => {
  return function MockMenu() {
    return <div data-testid="mock-menu">Mock Menu</div>;
  };
});
jest.mock('./components/corporate/Cart', () => {
  return function MockCart() {
    return <div data-testid="mock-cart">Mock Cart</div>;
  };
});

// Mock the contexts
jest.mock('./services/contexts/CartContext', () => ({
  useCart: () => ({ cartCount: 0 }),
  CartProvider: ({ children }) => <div>{children}</div>
}));

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    jest.clearAllMocks();
  });

  test('renders SignInForm when user is not logged in', () => {
    render(
      <CartProvider>
        <App />
      </CartProvider>
    );
    expect(screen.getByTestId('mock-signin')).toBeInTheDocument();
  });

  test('handles successful manual sign in', async () => {
    const mockUserData = {
      data: {
        customer_name: 'Test User',
        customer_phonenumber: '1234567890',
        customer_email: 'test@example.com'
      }
    };

    axios.get.mockResolvedValueOnce(mockUserData);

    render(
      <CartProvider>
        <App />
      </CartProvider>
    );

    const signInComponent = screen.getByTestId('mock-signin');

    await act(async () => {
      fireEvent.click(signInComponent);
    });

    await waitFor(() => {
      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:4000/customer/info',
        { headers: { token: 'test-token' } }
      );

      // Verify user data was stored in localStorage
      const storedProfile = JSON.parse(localStorage.getItem('userDP'));
      expect(storedProfile).toEqual({
        name: mockUserData.data.customer_name,
        phone: mockUserData.data.customer_phonenumber,
        email: mockUserData.data.customer_email,
        cartCount: 0
      });

      // Verify token was stored
      expect(localStorage.getItem('token')).toBe('test-token');
    });
  });

  test('handles failed sign in', async () => {
    const mockError = new Error('Failed to fetch user info');
    axios.get.mockRejectedValueOnce(mockError);

    render(
      <CartProvider>
        <App />
      </CartProvider>
    );

    const signInComponent = screen.getByTestId('mock-signin');

    await act(async () => {
      fireEvent.click(signInComponent);
    });

    await waitFor(() => {
      // Verify axios was called
      expect(axios.get).toHaveBeenCalled();
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalledWith('Error fetching user info:', mockError);
    });
  });

  test('redirects to home page after successful sign in', async () => {
    const mockUserData = {
      data: {
        customer_name: 'Test User',
        customer_phonenumber: '1234567890',
        customer_email: 'test@example.com'
      }
    };

    axios.get.mockResolvedValueOnce(mockUserData);

    render(
      <CartProvider>
        <App />
      </CartProvider>
    );

    const signInComponent = screen.getByTestId('mock-signin');

    await act(async () => {
      fireEvent.click(signInComponent);
    });

    await waitFor(() => {
      // Verify Home component is rendered
      expect(screen.getByTestId('mock-home')).toBeInTheDocument();
    });
  });
});