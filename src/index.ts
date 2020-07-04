import {
	writeFile as writeFileCallback,
	readFile as readFileCallback,
} from 'fs';
import { resolve as pathResolve } from 'path';
import { promisify } from 'util';
import { readFb2File } from './lib/read-fb2-file';
import { Script } from './lib/script';
import { scriptToSpeechFragments } from './lib/script-to-speech-fragments';
import { setSettings } from './lib/settings';
import { speechFragmentsToAudio } from './lib/speech-fragments-to-audio';
import { processMarkup } from './lib/process-markup';

const writeFile = promisify( writeFileCallback );
const readFile = promisify( readFileCallback );

main();

async function main()
{
	const userSettings = JSON.parse( await readFile( pathResolve( process.cwd(), 'settings.json' ), 'utf8' ) );
	
	await setSettings( userSettings );
	
	const inputPath = pathResolve( process.cwd(), '_test/test4.fb2' );
	const outputPath = pathResolve( process.cwd(), '_test/book.json' );
	
	const script = new Script();
	
	readFb2File(
		inputPath,
		( error, result ) =>
		{
			if ( error )
			{
				console.error( error );
				
				return;
			}
			
			if ( result.type === 'done' )
			{
				const fragments = scriptToSpeechFragments( script );
				
				writeFile( outputPath, JSON.stringify( fragments, null, '\t' ), 'utf8' )
					.then( () => console.log( 'Done.' ) );
				
				speechFragmentsToAudio( fragments )
					.then( () => console.log( 'Done.' ) )
					.catch( ( error ) => console.error( error ) );
				
				return;
			}
			
			processMarkup( result, script );
		},
	);
}
