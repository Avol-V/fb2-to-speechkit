export function pause( seconds: number ): string
{
	const time = ( /\.0$/.test( seconds.toFixed( 1 ) ) )
		? seconds.toFixed( 0 ) + 's'
		: (seconds * 1000).toFixed( 0 ) + 'ms';
	
	return /* xml */`<break time="${time}"/>`;
}
