import { createReadStream } from 'fs';
import * as xmlFlow from 'xml-flow';

type SectionResult =
	| {
		done: true,
		section: null,
	}
	| {
		done: false,
		section: xmlFlow.Markup,
	};
type SectionHandler = ( error: Error | null, result: SectionResult ) => void;

export function readFb2File(
	filePath: string,
	onSection: SectionHandler,
): void
{
	const fileStream = createReadStream( filePath );
	const xmlStream = xmlFlow(
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
	);
}
