// spell-checker:ignore wasm

import { createReadStream, readFile as readFileCallback } from 'fs';
import { promisify } from 'util';
// import * as xmlFlow from 'xml-flow';
import { SaxEventType, SAXParser, Tag, Text, StringReader } from 'sax-wasm';

const readFile = promisify( readFileCallback );

// type SectionResult =
// 	| {
// 		done: true,
// 		section: null,
// 	}
// 	| {
// 		done: false,
// 		section: xmlFlow.Markup,
// 	};
// type SectionHandler = ( error: Error | null, result: SectionResult ) => void;

export type MarkupOpenTag = {
	type: 'open';
	value: string;
	attributes: Map<string, string>;
};
export type MarkupCloseTag = {
	type: 'close';
	value: string;
};
export type MarkupText = {
	type: 'text';
	value: string;
};
export type MarkupDone = {
	type: 'done';
};
export type MarkupEventResult =
	| MarkupOpenTag
	| MarkupCloseTag
	| MarkupText
	| MarkupDone
;
export type MarkupEventHandler = ( error: Error | null, result: MarkupEventResult ) => void;

export async function readFb2File(
	filePath: string,
	onMarkupEvent: MarkupEventHandler,
): Promise<void>
{
	const streamOptions = {
		highWaterMark: 32 * 1024,
	};
	
	const saxPath = require.resolve( 'sax-wasm/lib/sax-wasm.wasm' );
	const saxWasmBuffer = await readFile( saxPath );
	
	const parser = new SAXParser(
		SaxEventType.OpenTag
		| SaxEventType.CloseTag
		| SaxEventType.Text
		| SaxEventType.Cdata,
		streamOptions,
	);
	
	parser.eventHandler = ( event, data ) =>
	{
		switch ( event )
		{
			case SaxEventType.OpenTag:
				onMarkupEvent(
					null,
					{
						type: 'open',
						value: (data as Tag).value,
						attributes: new Map<string, string>(
							(data as Tag).attributes.map(
								( { name, value } ) => [name, value],
							),
						),
					},
				);
				break;
			
			case SaxEventType.CloseTag:
				onMarkupEvent(
					null,
					{
						type: 'close',
						value: (data as Tag).value,
					},
				);
				break;
			
			case SaxEventType.Text:
			case SaxEventType.Cdata:
				onMarkupEvent(
					null,
					{
						type: 'text',
						value: (data as (Text | StringReader)).value,
					},
				);
				break;
			
			default:
				break;
		}
	};
	
	const ready = await parser.prepareWasm( saxWasmBuffer );
	
	if ( !ready )
	{
		return;
	}
	
	const fileStream = createReadStream( filePath, streamOptions );
	
	const doneEvent: MarkupDone = {
		type: 'done',
	};
	
	fileStream.on(
		'data',
		( chunk: Buffer ) =>
		{
			parser.write( chunk );
		},
	);
	fileStream.on(
		'end',
		() =>
		{
			parser.end();
			onMarkupEvent( null, doneEvent );
		},
	);
	fileStream.on(
		'error',
		( error ) =>
		{
			onMarkupEvent( error, doneEvent );
		},
	);
	
	
	/* const xmlStream = xmlFlow(
		fileStream,
		{
			strict: true,
			trim: false,
			preserveMarkup: xmlFlow.ALWAYS,
			useArrays: xmlFlow.ALWAYS,
			cdataAsText: true,
		},
	);
	
	xmlStream.on(
		'tag:section',
		( section: xmlFlow.Markup ) =>
		{
			onSection(
				null,
				{
					done: false,
					section,
				},
			);
		},
	);
	
	xmlStream.on(
		'error',
		( error ) =>
		{
			onSection(
				error,
				{
					done: true,
					section: null,
				},
			);
		},
	);
	
	xmlStream.on(
		'end',
		() =>
		{
			onSection(
				null,
				{
					done: true,
					section: null,
				},
			);
		},
	); */
}
