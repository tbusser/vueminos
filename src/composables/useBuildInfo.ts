import { computed } from 'vue';
import { useGlobalI18n } from '@/i18n';

/* ========================================================================== */

export function useBuildInfo() {
	const { locale } = useGlobalI18n();
	// Take the values from the Vite define constants and give them a more
	// descriptive name.
	const appVersion = __APP_VERSION__;
	const buildTimestamp = __BUILD_TIMESTAMP__;

	const formattedBuildTimestamp = computed<string>(() => {
		const formatter = new Intl.DateTimeFormat(locale.value, {
			day: '2-digit',
			fractionalSecondDigits: 3,
			hour: '2-digit',
			hour12: false,
			minute: '2-digit',
			month: 'short',
			second: '2-digit',
			weekday: 'short',
			year: 'numeric'
		});

		return formatter.format(buildTimestamp);
	});

	/* ---------------------------------------------------------------------- */

	return {
		appVersion,
		buildTimestamp,
		formattedBuildTimestamp
	};
}
