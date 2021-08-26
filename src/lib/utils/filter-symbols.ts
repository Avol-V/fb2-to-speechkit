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
	// Greek
	'Α': 'Алфа ',
	'α': 'алфа ',
	'Β': 'Вита ',
	'β': 'вита ',
	'Γ': 'Гама ',
	'γ': 'гама ',
	'Δ': 'Делта ',
	'δ': 'делта ',
	'Ε': 'Эпсилон ',
	'ε': 'эпсилон ',
	'Ζ': 'Зита ',
	'ζ': 'зита ',
	'Η': 'Ита ',
	'η': 'ита ',
	'Θ': 'Тита ',
	'θ': 'тита ',
	'Ι': 'Йота ',
	'ι': 'йота ',
	'Κ': 'Капа ',
	'κ': 'капа ',
	'Λ': 'Лямбда ',
	'λ': 'лямбда ',
	'Μ': 'Ми ',
	'μ': 'ми ',
	'Ν': 'Ни ',
	'ν': 'ни ',
	'Ξ': 'Кси ',
	'ξ': 'кси ',
	'Ο': 'Омикрон ',
	'ο': 'омикрон ',
	'Π': 'Пи ',
	'π': 'пи ',
	'Ρ': 'Ро ',
	'ρ': 'ро ',
	'Σ': 'Сигма ',
	'σ': 'сигма ',
	'ς': 'сигма ',
	'Τ': 'Таф ',
	'τ': 'таф ',
	'Υ': 'Ипсилон ',
	'υ': 'ипсилон ',
	'Φ': 'Фи ',
	'φ': 'фи ',
	'Χ': 'Хи ',
	'χ': 'хи ',
	'Ψ': 'Пси ',
	'ψ': 'пси ',
	'Ω': 'Омега ',
	'ω': 'омега ',
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
