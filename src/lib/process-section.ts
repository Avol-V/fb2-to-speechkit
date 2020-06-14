import { pause } from './markup/pause';
import { prepareText } from './prepare-text';

import type { Markup } from 'xml-flow';
import type { SpeakParts } from './speak-parts';

export function processSection( section: Markup, parts: SpeakParts ): void
{
	const items = section.$markup;
	
	if ( !items )
	{
		return;
	}
	
	debugger;
	
	parts.nextSection();
	
	if ( typeof items === 'string' )
	{
		return;
	}
	
	processMarkupItems( items, parts );
}

/**
 * Обрабатывает элементы разметки
 * 
 * @param items Элементы разметки
 */
function processMarkupItems( items: Markup['$markup'], parts: SpeakParts ): void
{
	if ( !items )
	{
		return;
	}
	
	for ( const item of items )
	{
		processMarkupItem( item, parts );
	}
}

/**
 * Обрабатывает элемент разметки
 * 
 * @param markup Элемент разметки
 */
function processMarkupItem( markup: Markup | string, parts: SpeakParts ): void
{
	if ( typeof markup === 'string' )
	{
		if ( parts.isInParagraph() )
		{
			if (
				( parts.getIndexInParagraph() === 0 )
				&& /^ *[-–—] /.test( markup )
			)
			{
				parts.startDialogue();
			}
			else
			{
				parts.stopDialogue();
			}
		}
		
		parts.addToIndexInParagraph( markup.trim().length );
		parts.add( prepareText( markup ) );
		
		return;
	}
	
	switch ( markup.$name )
	{
		case 'title':
		case 'subtitle':
			// if (
			// 	( typeof markup.$markup === 'string' )
			// 	&& ( /^\s*\*\s*\*\s*\*\s*$/.test( markup.$markup ) )
			// )
			// {
			// 	parts.add( pause( 4 ) );
			// }
			// else
			// {
				parts.nextSection();
				parts.add( pause( 3 ) );
				parts.setContext( {
					voice: 'zahar',
				} );
				processMarkupItems( markup.$markup, parts );
				parts.resetContext();
			// }
			
			break;
		
		case 'p':
			parts.startParagraph();
			processMarkupItems( markup.$markup, parts );
			break;
		
		case 'empty-line':
			parts.add( pause( 1 ) );
			processMarkupItems( markup.$markup, parts );
			break;
		
		case 'emphasis':
			parts.setContext( {
				emotion: 'good',
			} );
			processMarkupItems( markup.$markup, parts );
			parts.resetContext();
			break;
		
		case 'strong':
			parts.setContext( {
				emotion: 'evil',
			} );
			processMarkupItems( markup.$markup, parts );
			parts.resetContext();
			break;
		
		default:
			processMarkupItems( markup.$markup, parts );
			break;
	}
}
