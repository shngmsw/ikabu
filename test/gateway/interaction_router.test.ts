import { expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ autocomplete: vi.fn(), call: vi.fn() }));
vi.mock('@/gateway/command_handler', () => mocks);
vi.mock('@/gateway/button_handler', () => ({ call: vi.fn() }));
vi.mock('@/gateway/modal_handler', () => ({ call: vi.fn() }));
vi.mock('@/gateway/context_handler', () => ({ call: vi.fn() }));

import { routeInteraction } from '@/gateway/interaction_router';

it('isRepliableではないautocompleteもルーティングする', async () => {
    const interaction = { isAutocomplete: () => true, isRepliable: () => false };
    await routeInteraction({} as never, interaction as never);
    expect(mocks.autocomplete).toHaveBeenCalledWith(interaction);
    expect(mocks.call).not.toHaveBeenCalled();
});
