import { writeFile as writeFileCallback } from 'fs';
import { resolve as pathResolve } from 'path';
import { promisify } from 'util';
import { readFb2File } from './lib/read-fb2-file';
import { processSection } from './lib/process-section';
import { SpeakParts } from './lib/speak-parts';

const writeFile = promisify( writeFileCallback );

const inputPath = pathResolve( process.cwd(), '_test/test3.fb2' );
const outputPath = pathResolve( process.cwd(), '_test/book.json' );

const parts = new SpeakParts();

readFb2File(
	inputPath,
	( error, result ) =>
	{
		if ( error )
		{
			console.error( error );
			
			return;
		}
		
		if ( result.done )
		{
			writeFile( outputPath, JSON.stringify( parts.get(), null, '\t' ), 'utf8' )
				.then( () => console.log( 'Done.' ) );
			
				return;
		}
		
		processSection( result.section, parts );
	},
);
