import { createReadStream } from 'fs';
import { SaxesParser } from 'saxes';

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
	const parser = new SaxesParser();
	
	parser.on(
		'opentag',
		( tag ) =>
		{
			onMarkupEvent(
				null,
				{
					type: 'open',
					value: tag.name,
					attributes: new Map<string, string>(
						Object.entries( tag.attributes ),
					),
				},
			);
		},
	);
	
	parser.on(
		'closetag',
		( tag ) =>
		{
			onMarkupEvent(
				null,
				{
					type: 'close',
					value: tag.name,
				},
			);
		},
	);
	
	parser.on(
		'text',
		( text ) =>
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
		'cdata',
		( cdata ) =>
		{
			onMarkupEvent(
				null,
				{
					type: 'text',
					value: cdata,
				},
			);
		},
	);
	
	const doneEvent: MarkupDone = {
		type: 'done',
	};
	
	parser.on(
		'end',
		() =>
		{
			onMarkupEvent( null, doneEvent );
		},
	);
	
	parser.on(
		'error',
		( error ) =>
		{
			onMarkupEvent( error, doneEvent );
		},
	);
	
	const fileStream = createReadStream( filePath );
	
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
			parser.close();
		},
	);
	fileStream.on(
		'error',
		( error ) =>
		{
			parser.close();
			onMarkupEvent( error, doneEvent );
		},
	);
}
