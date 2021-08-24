import { normalizeUnicodeText } from 'normalize-unicode-text';

const WHITELIST = /^[- a-z0-9а-яё?!.,:;=+@#$%^&*~'"±<>§°£₽€®™_\/]$/i;
const REPLACE_MAP: Record<string, string> = {
	'—': '-',
	'–': '-',
	'−': '-',
	'«': '"',
	'»': '"',
	'„': '"',
	'“': '"',
	'”': '"',
	'‘': '\'',
	'’': '\'',
	'`': '\'',
	'\\': '/',
};

export function filterSymbols( text: string ): string
{
	let output = '';
	
	for ( const char of normalizeUnicodeText( text ) )
	{
		if ( WHITELIST.test( char ) )
		{
			output += char;
			
			continue;
		}
		
		const newChar = REPLACE_MAP[char];
		
		if ( newChar !== undefined )
		{
			output += newChar;
		}
	}
	
	return output;
}
