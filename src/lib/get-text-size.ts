const NOT_VALUABLE_CHARS_REGEXP = /[^A-ZА-ЯЁ0-9]+/gi;

export function getTextSize( text: string ): number
{
	const valuable = text.replace( NOT_VALUABLE_CHARS_REGEXP, '' );
	
	return valuable.length;
}
