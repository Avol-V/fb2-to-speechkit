import * as userSettings from '../settings.json';

export type SpeechVoice =
	| 'oksana' // F, RU
	| 'jane' // F, RU
	| 'omazh' // F, RU
	| 'zahar' // M, RU
	| 'ermil' // M, RU
	| 'alyss' // F, EN
	| 'nick' // M, EN
;
export type SpeechEmotion =
	| 'good'
	| 'evil'
	| 'neutral'
;
export type SpeechLanguage =
	| 'ru-RU'
	| 'en-US'
;

export type Transforms = {
	/**
	 * Restore "Ё"
	 */
	yoficator: boolean;
	/**
	 * Convert roman numerals to arabic numbers
	 */
	convertRomeToNumber: boolean;
	/**
	 * Replace unicode ellipsis char with tree dots
	 */
	convertEllipsisToDots: boolean;
	/**
	 * Remove footnotes, like "[1]"
	 */
	removeFootnotesFromText: boolean;
	/**
	 * Replace three (or more) asterisks in a row (chapter break)
	 */
	replaceDinkus: string | false;
	/**
	 * Remove different separators, like a set of "=" in a row
	 */
	removeSeparators: boolean;
};

export type Settings = {
	language: SpeechLanguage;
	voices: {
		narrator: SpeechVoice;
		companion1: SpeechVoice;
		companion2: SpeechVoice;
		titles: SpeechVoice;
	};
	speed: number;
	defaultPause: number;
	titlePause: number;
	transforms: Transforms;
};

const defaultSettings: Settings = {
	language: 'ru-RU',
	voices: {
		narrator: 'oksana',
		companion1: 'zahar',
		companion2: 'omazh',
		titles: 'zahar',
	},
	speed: 1,
	defaultPause: 1,
	titlePause: 3,
	transforms: {
		yoficator: true,
		convertRomeToNumber: true,
		convertEllipsisToDots: true,
		removeFootnotesFromText: false,
		replaceDinkus: '-',
		removeSeparators: true,
	},
};

export const settings: Readonly<Settings> = merge(
	defaultSettings,
	userSettings as Settings,
);

function merge<T extends Record<string, unknown>>( ...objects: T[] ): T
{
	return objects.reduce(
		( previous: Record<string, unknown>, object ) =>
		{
			for ( const key of Object.keys( object ) )
			{
				const previousValue = previous[key];
				const currentValue = object[key];
				
				if (
					Array.isArray( previousValue )
					&& Array.isArray( currentValue )
				)
				{
					previous[key] = previousValue.concat( ...currentValue );
				}
				else if (
					isObject( previousValue )
					&& isObject( currentValue )
				)
				{
					previous[key] = merge( previousValue, currentValue );
				}
				else
				{
					previous[key] = currentValue;
				}
			}
			
			return previous as T;
		},
		{} as T,
	);
}

function isObject( object: unknown ): object is Record<string, unknown>
{
	return object && typeof object === 'object';
}
