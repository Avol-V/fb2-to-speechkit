// spell-checker:ignore IVXLCDM

import { numberFromRome } from './utils/number-from-rome';
import { settings } from './settings';

import type { Transforms } from './settings';

/**
 * Настройки замен
 */
export const replacers: {
	[TKey in keyof Transforms]?: [
		RegExp | string,
		string | ( ( value: string, ...args: unknown[] ) => string )
	]
} = {
	removeFootnotesFromText: [/\[\d+\]/g, ''],
	convertEllipsisToDots: [/…/g, '...'],
	convertRomeToNumber: [/\b(?!I\s+[a-z])[IVXLCDM]+\b/g, numberFromRome],
	replaceDinkus: [/^\s*(?:\*\s*){3,}$/, settings.transforms.replaceDinkus || ''],
	removeSeparators: [/^\s*([#=_-])\s*(?:\1\s*)+$/, '-'],
};
