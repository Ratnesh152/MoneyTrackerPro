import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLoanPayment, updateLoanPayment } from '../../services/business-central/loan-payment.service';
import * as client from '../../services/business-central/client';
import { BCLoanPaymentCreateDTO, BCLoanPaymentUpdateDTO } from '../../types/loan-payment.types';

// Mock the bcFetch module
vi.mock('../../services/business-central/client', () => ({
  bcFetch: vi.fn(),
}));

describe('Loan Payment Service (Pre-flight checks)', () => {
  const mockEntraId = 'user-123';
  
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('prevents duplicate EMI payments during creation', async () => {
    // Mock the initial GET request to check for existing payments
    vi.mocked(client.bcFetch).mockResolvedValueOnce({
      value: [
        {
          systemId: 'existing-id',
          ownerEntraObjectId: mockEntraId,
          loanSystemId: 'loan-123',
          emiNumber: 5,
          status: 'Paid',
        }
      ]
    });

    const createDto: BCLoanPaymentCreateDTO = {
      ownerEntraObjectId: mockEntraId,
      loanSystemId: 'loan-123',
      emiNumber: 5, // Attempting to pay EMI 5 again
      paymentDate: '2023-10-01',
      amountPaid: 5000,
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
    };

    await expect(createLoanPayment(createDto)).rejects.toThrow('A payment record for this EMI number already exists.');
    
    // Ensure the POST request (second call) was never made
    expect(client.bcFetch).toHaveBeenCalledTimes(1); 
  });

  it('allows creation if EMI is not duplicated', async () => {
    // Mock the initial GET request returning empty
    vi.mocked(client.bcFetch).mockResolvedValueOnce({ value: [] });
    // Mock the POST request
    vi.mocked(client.bcFetch).mockResolvedValueOnce({});

    const createDto: BCLoanPaymentCreateDTO = {
      ownerEntraObjectId: mockEntraId,
      loanSystemId: 'loan-123',
      emiNumber: 6,
      paymentDate: '2023-10-01',
      amountPaid: 5000,
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
    };

    await createLoanPayment(createDto);
    
    expect(client.bcFetch).toHaveBeenCalledTimes(2);
    expect(client.bcFetch).toHaveBeenNthCalledWith(2, expect.stringContaining('/loanPayments'), expect.objectContaining({ method: 'POST' }));
  });

  it('prevents changing EMI number to an existing one during update', async () => {
    // Mock getLoanPayment (fetches the payment being updated)
    vi.mocked(client.bcFetch).mockResolvedValueOnce({
      systemId: 'my-system-id',
      ownerEntraObjectId: mockEntraId,
      loanSystemId: 'loan-123',
      emiNumber: 1,
      status: 'Paid',
    });

    // Mock getLoanPayments (checks for duplicates)
    vi.mocked(client.bcFetch).mockResolvedValueOnce({
      value: [
        {
          systemId: 'other-payment-id',
          ownerEntraObjectId: mockEntraId,
          loanSystemId: 'loan-123',
          emiNumber: 2, // Someone else already paid EMI 2
          status: 'Paid',
        }
      ]
    });

    const updateDto: BCLoanPaymentUpdateDTO = {
      emiNumber: 2, // Trying to change my EMI to 2
      amountPaid: 5000,
      status: 'Paid',
      paymentMethod: 'Bank Transfer'
    };

    await expect(updateLoanPayment('my-system-id', mockEntraId, updateDto, 'W/1')).rejects.toThrow('Another payment record with this EMI number already exists.');
    expect(client.bcFetch).toHaveBeenCalledTimes(2); 
  });
});
