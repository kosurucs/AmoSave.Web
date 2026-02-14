import { fireEvent } from '@testing-library/dom';
import { waitFor } from '@testing-library/react';
import { MfOrdersPage } from '@/features/mutual-funds/pages/mf-orders-page';
import { MfPlaceOrderPage } from '@/features/mutual-funds/pages/mf-place-order-page';
import { mutualFundsService } from '@/services/api/mutual-funds.service';
import { renderWithQueryClient } from '@/test/test-utils';

vi.mock('@/services/api/mutual-funds.service', () => ({
  mutualFundsService: {
    getOrders: vi.fn(),
    placeOrder: vi.fn(),
  },
}));

const mockedMutualFundsService = vi.mocked(mutualFundsService);

describe('Mutual Funds critical flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and renders MF orders', async () => {
    mockedMutualFundsService.getOrders.mockResolvedValue([{ order_id: 'mf-1', status: 'open' }]);

    const view = renderWithQueryClient(<MfOrdersPage />);

    expect(await view.findByText('Mutual Funds Orders')).toBeInTheDocument();
    expect(view.getByText(/"order_id": "mf-1"/)).toBeInTheDocument();
  });

  it('places MF order and renders response payload', async () => {
    mockedMutualFundsService.placeOrder.mockResolvedValue({ order_id: 'mf-2' });

    const view = renderWithQueryClient(<MfPlaceOrderPage />);

    fireEvent.click(view.getByRole('button', { name: 'Place MF Order' }));

    await waitFor(() => {
      expect(mockedMutualFundsService.placeOrder).toHaveBeenCalledTimes(1);
    });
    expect(await view.findByText('MF Place Order Result')).toBeInTheDocument();
  });

  it('shows failure message when place MF order fails', async () => {
    mockedMutualFundsService.placeOrder.mockRejectedValue(new Error('MF order rejected'));

    const view = renderWithQueryClient(<MfPlaceOrderPage />);

    fireEvent.click(view.getByRole('button', { name: 'Place MF Order' }));

    expect(await view.findByText('MF order rejected')).toBeInTheDocument();
  });
});
