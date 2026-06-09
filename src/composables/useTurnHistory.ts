import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { usePlayersStore, type Player } from '@/stores/players';
import { useTurnsStore } from '@/stores/turns';

/* ========================================================================== */

export function useTurnHistory() {
	const playersStore = usePlayersStore();
	const turnsStore = useTurnsStore();

	const { activePlayers } = storeToRefs(playersStore);
	const { turns } = storeToRefs(turnsStore);

	/* ---------------------------------------------------------------------- */

	const index = ref<number | null>(null);
	const navigableTurns = computed<Turn[]>(() => {
		if (activePlayers.value.length === 0) return [];

		// The navigable turns are the last X turns, where X is the number of
		// active players.
		return turns.value.slice(-activePlayers.value.length);
	});

	const selectedTurn = computed<Turn | null>(() =>
		(index.value === null) ? null : navigableTurns.value[index.value] ?? null
	);
	const selectedPlayer = computed<Player | null>(() =>
		(selectedTurn.value === null) ? null : playersStore.getPlayerById(selectedTurn.value.playerId) ?? null
	);

	const canGoBack = computed<boolean>(() => {
		// When there are no navigable turns, we cannot go back.
		if (navigableTurns.value.length === 0) return false;
		// When there are previous turns, and no navigation has occurred yet,
		// we can go back.
		if (index.value === null) return true;

		// As long as the index is not pointing to the first navigable turn at
		// index 0, we can go back.
		return index.value > 0;
	});

	const canGoForward = computed<boolean>(() => {
		// When there are no navigable turns, we cannot go forward.
		if (navigableTurns.value.length === 0) return false;
		// When the active turn ID is not set, the UI should be presenting a
		// fresh turn, so we cannot go forward.
		if (index.value === null) return false;

		// It is always possible to go forward when a historical turn is
		// selected, including from the most recent played turn. Navigating
		// forward will bring the user back to the live round.
		return true;
	});

	/* ---------------------------------------------------------------------- */

	function goBack(): void {
		if (!canGoBack.value) return;

		if (index.value === null) {
			index.value = navigableTurns.value.length - 1;
		} else {
			index.value = index.value - 1;
		}
	}

	function goForward(): void {
		if (!canGoForward.value) return;
		if (index.value === null) return;

		if (index.value === navigableTurns.value.length - 1) {
			index.value = null;
		} else {
			index.value = index.value + 1;
		}
	}

	/* ---------------------------------------------------------------------- */

	return {
		canGoBack,
		canGoForward,
		goBack,
		goForward,
		selectedPlayer,
		selectedTurn
	};
}
