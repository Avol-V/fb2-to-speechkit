import { settings } from './settings';
import { pause } from './markup/pause';
import { paragraph } from './markup/paragraph';
import { sentence } from './markup/sentence';
import { getTextSize } from './utils/get-text-size';

import type { Script } from './script';
import type { SpeechEmotion, SpeechLanguage, SpeechVoice } from './settings';

export type SpeechFragment = {
	lang: SpeechLanguage;
	voice: SpeechVoice;
	emotion: SpeechEmotion;
	speed: number;
	section: number;
	content: string;
};

const initialFragment: SpeechFragment = {
	lang: settings.language,
	voice: settings.voices.narrator,
	emotion: 'neutral',
	speed: settings.speed,
	section: 1,
	content: '',
};

export function scriptToSpeechFragments( script: Script )
{
	const fragments: SpeechFragment[] = [];
	let previousFragment: SpeechFragment = initialFragment;
	let current: SpeechFragment = {
		...previousFragment,
	};
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
		
		previousFragment = fragment;
		withText = false;
		content = '';
		fragments.push( fragment );
	};
	
	const addToFragment = ( properties: Partial<SpeechFragment> ) =>
	{
		if (
			!isPropertiesChanged( current, properties )
			|| !withText
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
	
	for ( const item of script.getList() )
	{
		switch ( item.type )
		{
			case 'section':
				addToFragment( { section: item.number } );
				break;
			
			case 'title':
				if ( !item.closing )
				{
					addToFragment( {
						voice: settings.voices.titles,
					} );
					content += pause( settings.titlePause );
				}
				
				break;
			
			case 'paragraph':
				if ( !item.closing )
				{
					if ( !item.inheritVoice )
					{
						addToFragment( {
							voice: settings.voices.narrator,
						} );
					}
					
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
				if ( !item.closing )
				{
					addToFragment( {
						voice: ( (item.number % 2) === 0 )
							? settings.voices.companion1
							: settings.voices.companion2,
					} );
				}
				
				break;
			
			case 'pause':
				if ( !item.as )
				{
					content += pause(
						item.seconds ? item.seconds : settings.defaultPause,
					);
				}
				else
				{
					switch ( item.as )
					{
						case 'title':
							content += pause( settings.titlePause );
							break;
						
						case 'paragraph':
							content += paragraph();
							break;
						
						case 'sentence':
							content += sentence();
							break;
						
						default:
							break;
					}
				}
				
				break;
			
			case 'text':
				content += item.text;
				withText = withText || ( getTextSize( item.text ) !== 0 );
				break;
			
			case 'note':
				if ( settings.readNotes )
				{
					const noteContent = processNote( item.name, script );
					
					if ( noteContent.length === 0 )
					{
						break;
					}
					
					const savedState = {
						voice: current.voice,
						speed: current.speed,
					};
					
					addToFragment( {
						voice: settings.voices.notes,
						speed: settings.notesSpeed,
					} );
					
					content += paragraph() + noteContent;
					withText = withText || ( getTextSize( noteContent ) !== 0 );
					
					addToFragment( savedState );
				}
				
				break;
			
			case 'image':
				if ( settings.readImageAs )
				{
					const imageText = settings.readImageAs.replace( '{name}', item.name );
					
					content += paragraph() + imageText + paragraph();
					withText = withText || ( getTextSize( imageText ) !== 0 );
				}
				
				break;
			
			case 'sup':
				if ( !item.closing && settings.readSupAs )
				{
					content += settings.readSupAs;
					withText = true;
				}
				
				break;
			
			
			case 'sub':
				if ( !item.closing && settings.readSubAs )
				{
					content += settings.readSubAs;
					withText = true;
				}
				
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

function processNote( name: string, script: Script ): string
{
	const list = script.getNote( name );
	
	if ( list.length === 0 )
	{
		return '';
	}
	
	return list.reduce(
		( result, item ) =>
		{
			if ( item.type === 'text' )
			{
				return result + item.text;
			}
			
			if (
				(
					( item.type === 'title' )
					|| ( item.type === 'paragraph' )
				)
				&& item.closing
			)
			{
				return result + paragraph();
			}
			
			return result;
		},
		'',
	).trim();
}
