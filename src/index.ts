import {
	writeFile as writeFileCallback,
	readFile as readFileCallback,
	mkdir as mkDirCallback,
	access as accessCallback,
} from 'fs';
import {
	resolve as pathResolve,
	parse as pathParse,
} from 'path';
import { promisify } from 'util';
import { readFb2File } from './lib/read-fb2-file';
import { Script } from './lib/script';
import { scriptToSpeechFragments } from './lib/script-to-speech-fragments';
import { setSettings, Settings } from './lib/settings';
import { speechFragmentsToAudio } from './lib/speech-fragments-to-audio';
import { processMarkup } from './lib/process-markup';

const writeFile = promisify( writeFileCallback );
const readFile = promisify( readFileCallback );
const mkDir = promisify( mkDirCallback );
const access = promisify( accessCallback );

export async function main( inputPath: string, userSettings: Settings ): Promise<void>
{
	await setSettings( userSettings );
	
	const parsedInputPath = pathParse( inputPath );
	const outputDir = pathResolve( parsedInputPath.dir, parsedInputPath.name );
	const outputJson = pathResolve( outputDir, 'book.json' );
	
	const continueParsing = await access( outputJson )
		.then( () => true )
		.catch( () => false );
	
	if ( continueParsing )
	{
		const fragments = JSON.parse( await readFile( outputJson, 'utf8' ) );
		
		speechFragmentsToAudio( fragments, outputDir )
			.then( () => console.log( 'Done.' ) )
			.catch( ( error ) => console.error( error ) );
		
		return;
	}
	
	await mkDir( outputDir );
	
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
				
				writeFile( outputJson, JSON.stringify( fragments, null, '\t' ), 'utf8' )
					.then( () => console.log( 'JSON Done.' ) );
				
				speechFragmentsToAudio( fragments, outputDir )
					.then( () => console.log( 'Done.' ) )
					.catch( ( error ) => console.error( error ) );
				
				return;
			}
			
			processMarkup( result, script );
		},
	);
}
