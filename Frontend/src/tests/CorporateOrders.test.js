// CorporateOrders.test.js

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import CorporateOrders from '../components/corporate/CorporateOrders'; // Adjust the path as necessary

jest.mock('axios');

describe('CorporateOrders Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<CorporateOrders />);
    expect(screen.getByText(/my orders/i)).toBeInTheDocument();
  });

  test('displays loading state', () => {
    render(<CorporateOrders />);
    expect(screen.getByText(/loading orders.../i)).toBeInTheDocument();
  });

  test('displays error message on fetch failure', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch orders.'));
    
    render(<CorporateOrders />);
    
    await waitFor(() => expect(screen.getByText(/failed to fetch orders/i)).toBeInTheDocument());
  });

  test('displays order data when fetched successfully', async () => {
    const mockOrders = {
      data: {
        data: [
          {
            corporateorder_generated_id: '123',
            ordered_at: '2024-11-04T12:00:00Z',
            order_details: [
              {
                category_id: '1',
                delivery_status: 'processing',
                processing_date: '2024-11-05',
                quantity: 10,
                active_quantity: 8,
                status: 'active'
              }
            ]
          }
        ]
      }
    };

    axios.get.mockResolvedValueOnce(mockOrders);
    axios.post.mockResolvedValueOnce({ data: { categoryname: { category_name: 'Test Category' } } });

    render(<CorporateOrders />);
    
    await waitFor(() => {
      expect(screen.getByText(/order id: 123/i)).toBeInTheDocument();
      expect(screen.getByText(/test category/i)).toBeInTheDocument();
      expect(screen.getByText(/10/i)).toBeInTheDocument();
    });
  });

  test('toggles order details on click', async () => {
    const mockOrders = {
      data: {
        data: [
          {
            corporateorder_generated_id: '123',
            ordered_at: '2024-11-04T12:00:00Z',
            order_details: [
              {
                category_id: '1',
                delivery_status: 'processing',
                processing_date: '2024-11-05',
                quantity: 10,
                active_quantity: 8,
                status: 'active'
              }
            ]
          }
        ]
      }
    };

    axios.get.mockResolvedValueOnce(mockOrders);
    axios.post.mockResolvedValueOnce({ data: { categoryname: { category_name: 'Test Category' } } });

    render(<CorporateOrders />);
    
    await waitFor(() => expect(screen.getByText(/order id: 123/i)).toBeInTheDocument());

    // Click to expand order details
    fireEvent.click(screen.getByText(/order id: 123/i));

    // Check if the details are displayed
    expect(screen.getByText(/test category/i)).toBeInTheDocument();
    expect(screen.getByText(/10/i)).toBeInTheDocument();

    // Click again to collapse order details
    fireEvent.click(screen.getByText(/order id: 123/i));
    
    // Check if the details are not displayed
    expect(screen.queryByText(/test category/i)).not.toBeInTheDocument();
  });
});
