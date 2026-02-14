import { fireEvent } from '@testing-library/dom';
import { waitFor } from '@testing-library/react';
import { GttCreatePage } from '@/features/gtt/pages/gtt-create-page';
import { GttListPage } from '@/features/gtt/pages/gtt-list-page';
import { gttService } from '@/services/api/gtt.service';
import { renderWithQueryClient } from '@/test/test-utils';

vi.mock('@/services/api/gtt.service', () => ({
  gttService: {
    getTriggers: vi.fn(),
    createTrigger: vi.fn(),
  },
}));

const mockedGttService = vi.mocked(gttService);

describe('GTT critical flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and renders GTT list data', async () => {
    mockedGttService.getTriggers.mockResolvedValue([{ id: 1, status: 'active' }]);

    const view = renderWithQueryClient(<GttListPage />);

    expect(await view.findByText('GTT Triggers')).toBeInTheDocument();
    expect(view.getByText(/"status": "active"/)).toBeInTheDocument();
  });

  it('submits create trigger and shows response', async () => {
    mockedGttService.createTrigger.mockResolvedValue({ trigger_id: 101 });

    const view = renderWithQueryClient(<GttCreatePage />);

    fireEvent.click(view.getByRole('button', { name: 'Create Trigger' }));

    await waitFor(() => {
      expect(mockedGttService.createTrigger).toHaveBeenCalledTimes(1);
    });
    expect(await view.findByText('Create GTT Result')).toBeInTheDocument();
  });

  it('does not call create trigger for invalid JSON payload', () => {
    const view = renderWithQueryClient(<GttCreatePage />);

    fireEvent.change(view.getByRole('textbox'), { target: { value: '{' } });
    fireEvent.click(view.getByRole('button', { name: 'Create Trigger' }));

    expect(mockedGttService.createTrigger).not.toHaveBeenCalled();
  });
});
