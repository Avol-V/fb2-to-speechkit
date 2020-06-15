import { settings } from './settings';
import { pause } from './markup/pause';
import { paragraph } from './markup/paragraph';

import type { ScriptItem } from './script';
import type { SpeechEmotion, SpeechLanguage, SpeechVoice } from './settings';

export type SpeechFragment = {
	lang: SpeechLanguage;
	voice: SpeechVoice;
	emotion: SpeechEmotion;
	speed: number;
	section: number;
	number: number;
	content: string;
};

const initialFragment: SpeechFragment = {
	lang: settings.language,
	voice: settings.voices.narrator,
	emotion: 'neutral',
	speed: settings.speed,
	section: 1,
	number: 0,
	content: '',
};

export function scriptToSpeechFragments( scriptList: ScriptItem[] )
{
	const fragments: SpeechFragment[] = [];
	let previousFragment: SpeechFragment = initialFragment;
	let current: SpeechFragment = {
		...previousFragment,
	};
	// let fragmentSize: number = 0;
	let content: string = '';
	let withText: boolean = false;
	let inEmphasis: boolean = false;
	let inStrong: boolean = false;
	
	const pushFragment = () =>
	{
		const fragment: SpeechFragment = {
			...current,
			content,
		};
		
		fragment.number++;
		previousFragment = fragment;
		// fragmentSize = 0;
		withText = false;
		content = '';
		fragments.push( fragment );
	};
	
	// TODO: fragmentSize оказывается 0, т. к. paragraph был в предыдущем фрагменте
	const addToFragment = ( properties: Partial<SpeechFragment> ) =>
	{
		if (
			!isPropertiesChanged( current, properties )
			|| !withText //( fragmentSize === 0 )
		)
		{
			Object.assign( current, properties );
			
			return;
		}
		
		pushFragment();
		current = {
			...previousFragment,
			content: '',
			...properties,
		};
	};
	
	debugger; // TODO: Убрать
	
	for ( const item of scriptList )
	{
		switch ( item.type )
		{
			case 'section':
				addToFragment( { section: item.number } );
				break;
			
			case 'title':
				if ( item.closing )
				{
					addToFragment( {
						voice: settings.voices.narrator,
					} );
				}
				else
				{
					addToFragment( {
						voice: settings.voices.titles,
					} );
					// fragmentSize += item.size;
					content += pause( settings.titlePause );
				}
				
				break;
			
			case 'paragraph':
				if ( !item.closing )
				{
					addToFragment( {
						voice: settings.voices.narrator,
					} );
					// fragmentSize += item.size;
					content += paragraph();
				}
				
				break;
			
			case 'emphasis':
				if ( item.closing )
				{
					addToFragment( {
						emotion: inStrong ? 'evil' : 'neutral',
					} );
				}
				else
				{
					addToFragment( {
						emotion: 'good',
					} );
				}
				
				break;
			
			case 'strong':
				if ( item.closing )
				{
					addToFragment( {
						emotion: inEmphasis ? 'good' : 'neutral',
					} );
				}
				else
				{
					addToFragment( {
						emotion: 'evil',
					} );
				}
				
				break;
			
			case 'dialogue':
				if ( item.closing )
				{
					addToFragment( {
						voice: settings.voices.narrator,
					} );
				}
				else
				{
					addToFragment( {
						voice: ( (item.number % 2) === 0 )
							? settings.voices.companion1
							: settings.voices.companion2,
					} );
				}
				
				break;
			
			case 'pause':
				content += pause(
					item.seconds ? item.seconds : settings.defaultPause,
				);
				break;
			
			case 'text':
				content += item.text;
				withText = true;
				break;
			
			default:
				{
					const unknownItem: never = item;
					
					throw new Error( `Unknown item: "${JSON.stringify( unknownItem )}"` );
				}
		}
	}
	
	pushFragment();
	
	return fragments;
}

function isPropertiesChanged(
	target: Record<string, unknown>,
	properties: Record<string, unknown>,
)
{
	for ( const key of Object.keys( properties ) )
	{
		if (
			target.hasOwnProperty( key )
			&& ( target[key] !== properties[key] )
		)
		{
			return true;
		}
	}
	
	return false;
}
