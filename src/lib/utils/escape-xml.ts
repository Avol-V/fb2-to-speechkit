const XML_CHAR_MAP: Record<string, string> = {
	'<': '&lt;',
	'>': '&gt;',
	'&': '&amp;',
	'"': '&quot;',
	"'": '&apos;',
};

export function escapeXml( text: string ): string
{
	return text.replace(
		/[<>&"']/g,
		( char ) => XML_CHAR_MAP[char]!,
	);
}
