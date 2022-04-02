import { createReadStream } from 'fs';
import { Parser } from 'node-expat';

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
		highWaterMark: 64 * 1024,
	};
	
	const parser = new Parser( 'UTF-8' );
	
	parser.on(
		'startElement',
		( name: string, attrs: Record<string, string> ) =>
		{
			onMarkupEvent(
				null,
				{
					type: 'open',
					value: name,
					attributes: new Map<string, string>(
						Object.entries( attrs ),
					),
				},
			);
		},
	);

	parser.on(
		'endElement',
		( name: string ) =>
		{
			onMarkupEvent(
				null,
				{
					type: 'close',
					value: name,
				},
			);
		},
	);
	
	parser.on(
		'text',
		( text: string ) =>
		{
			onMarkupEvent(
				null,
				{
					type: 'text',
					value: text,
				},
			);
		},
	);
	
	parser.on(
		'error',
		( error: Error ) =>
		{
			parser.end();
			onMarkupEvent( error, doneEvent );
		},
	);
	
	const fileStream = createReadStream( filePath, streamOptions );
	
	const doneEvent: MarkupDone = {
		type: 'done',
	};
	
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
			parser.end();
			onMarkupEvent( error, doneEvent );
		},
	);
	
	fileStream.pipe( parser );
}
