import * as Eyo from 'eyo-kernel';

import { settings } from './settings';
import { replacers } from './replacers';
import { escapeXml } from './utils/escape-xml';

const yoficator = new Eyo();

if ( settings.transforms.yoficator )
{
	yoficator.dictionary.loadSafeSync();
}

const transforms = settings.transforms;

export function prepareText( text: string ): string
{
	let output: string = text;
	
	for ( const option of Object.keys( transforms ) as Array<keyof typeof transforms> )
	{
		if ( transforms[option] === false )
		{
			continue;
		}
		
		if ( option in replacers )
		{
			const replacer = replacers[option]!;
			
			output = output.replace( replacer[0], replacer[1] as string );
		}
		else
		{
			output = applyOption( output, option );
		}
	}
	
	return escapeXml( output );
}

/**
 * Apply special transformation
 * 
 * @param text Input text
 * @param transformation Transformation name
 */
function applyOption(
	text: string,
	transformation: keyof typeof transforms,
): string
{
	switch ( transformation )
	{
		case 'yoficator':
			return yoficator.restore( text );
		
		default:
			return text;
	}
}
