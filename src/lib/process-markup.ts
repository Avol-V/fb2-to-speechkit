import { prepareText } from './prepare-text';
import { getTextSize } from './utils/get-text-size';

import type { Script } from './script';
import type {
	MarkupOpenTag,
	MarkupCloseTag,
	MarkupText,
} from './read-fb2-file'

export function processMarkup(
	markup: MarkupOpenTag | MarkupCloseTag | MarkupText,
	script: Script,
): void
{
	if ( markup.type === 'text' )
	{
		const text = prepareText( markup.value.replace( /�/g, '' ) );
		
		if ( /^ *[-–—](?![\r\n])\s/.test( text ) )
		{
			script.asDialogue();
		}
		else
		{
			script.stopDialogue();
		}
		
		script.addBlockSize( getTextSize( text ) );
		script.addText( text );
		
		return;
	}
	
	if ( markup.type === 'open' )
	{
		openTag( markup, script );
		
		return;
	}
	
	if ( markup.type === 'close' )
	{
		closeTag( markup, script );
		
		return;
	}
}

function openTag(
	{ value, attributes }: MarkupOpenTag,
	script: Script,
): void
{
	switch ( value )
	{
		case 'body':
			script.openBody(
				attributes.get( 'name' ) === 'notes'
			);
			break;
		
		case 'section':
			script.breakSection();
			
			{
				const id = attributes.get( 'id' );
				
				if ( id )
				{
					script.openNote( id );
				}
			}
			
			break;
		
		case 'title':
			script.breakSection();
			script.openTitle();
			break;
		
		case 'subtitle':
			script.breakSection();
			script.openSubtitle();
			break;
		
		case 'epigraph':
			script.openEpigraph();
			break;
		
		case 'p':
		case 'text-author':
			script.openParagraph();
			break;
		
		case 'empty-line':
			script.addPause();
			break;
		
		case 'emphasis':
			script.openEmphasis();
			break;
		
		case 'strong':
			script.openStrong();
			break;
		
		case 'a':
			{
				const type = attributes.get( 'type' );
				
				if (
					type
					&& ( type === 'note' )
				)
				{
					for ( const [attribute, value] of attributes )
					{
						if ( /\b:href$/.test( attribute ) )
						{
							script.addNote( value.substring( 1 ) );
							script.startIgnoreContent();
							break;
						}
					}
				}
			}
			
			break;
		
		default:
			break;
	}
}

function closeTag(
	{ value }: MarkupCloseTag,
	script: Script,
): void
{
	switch ( value )
	{
		case 'body':
			script.closeBody();
			break;
		
		case 'section':
			script.closeNote();
			break;
		
		case 'title':
			script.closeTitle();
			break;
		
		case 'subtitle':
			script.closeSubtitle();
			break;
		
		case 'epigraph':
			script.closeEpigraph();
			break;
		
		case 'p':
		case 'text-author':
			script.closeParagraph();
			break;
		
		case 'emphasis':
			script.closeEmphasis();
			break;
		
		case 'strong':
			script.closeStrong();
			break;
		
		case 'a':
			if ( script.isIgnoreContent() )
			{
				script.stopIgnoreContent();
			}
			
			break;
		
		default:
			break;
	}
}
