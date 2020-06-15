import { prepareText } from './prepare-text';
import { getTextSize } from './utils/get-text-size';

import type { Markup } from 'xml-flow';
import type { Script } from './script';

export function processSection( section: Markup, script: Script ): void
{
	const items = section.$markup;
	
	if ( !items )
	{
		return;
	}
	
	script.breakSection();
	
	if ( typeof items === 'string' )
	{
		return;
	}
	
	processMarkupItems( items, script );
}

/**
 * Обрабатывает элементы разметки
 * 
 * @param items Элементы разметки
 */
function processMarkupItems( items: Markup['$markup'], script: Script ): void
{
	if ( !items )
	{
		return;
	}
	
	for ( const item of items )
	{
		processMarkupItem( item, script );
	}
}

/**
 * Обрабатывает элемент разметки
 * 
 * @param markup Элемент разметки
 */
function processMarkupItem( markup: Markup | string, script: Script ): void
{
	if ( typeof markup === 'string' )
	{
		if ( /^ *[-–—] /.test( markup ) )
		{
			script.asDialogue();
		}
		else
		{
			script.stopDialogue();
		}
		
		script.addBlockSize( getTextSize( markup ) );
		script.addText( prepareText( markup ) );
		
		return;
	}
	
	switch ( markup.$name )
	{
		case 'title':
		case 'subtitle':
			script.breakSection();
			script.openTitle();
			processMarkupItems( markup.$markup, script );
			script.closeTitle();
			break;
		
		case 'p':
			script.openParagraph();
			processMarkupItems( markup.$markup, script );
			script.closeParagraph();
			break;
		
		case 'empty-line':
			script.addPause();
			processMarkupItems( markup.$markup, script );
			break;
		
		case 'emphasis':
			script.openEmphasis();
			processMarkupItems( markup.$markup, script );
			script.closeEmphasis();
			break;
		
		case 'strong':
			script.openStrong();
			processMarkupItems( markup.$markup, script );
			script.closeStrong();
			break;
		
		default:
			processMarkupItems( markup.$markup, script );
			break;
	}
}
