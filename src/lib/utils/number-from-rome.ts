// spell-checker:ignore MDLV

/**
 * Выражение для проверки корректности римского числа
 */
const ROME_NUMBER_REGEXP = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/;
/**
 * Выражение дял выделения составляющих числа
 */
const ROME_NUMBER_PARTS_REGEXP = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g;

const ROME_MAP = {
	M: 1000,
	CM: 900,
	D: 500,
	CD: 400,
	C: 100,
	XC: 90,
	L: 50,
	XL: 40,
	X: 10,
	IX: 9,
	V: 5,
	IV: 4,
	I: 1,
};

/**
 * Переводит римское число в арабское
 * 
 * @param rome Римское число
 */
export function numberFromRome( rome: string ): string
{
	const romeUpper = rome.toUpperCase();
	
	if (
		!romeUpper
		|| !ROME_NUMBER_REGEXP.test( romeUpper )
	)
	{
		return rome;
	}
	
	let result: number = 0;
	let matches: RegExpExecArray | null;
	
	while (
		( matches = ROME_NUMBER_PARTS_REGEXP.exec( romeUpper ) ) !== null
	)
	{
		result += ROME_MAP[matches[0] as keyof typeof ROME_MAP];
	}
	
	return String( result );
}
