import {
	writeFile as writeFileCallback,
} from 'fs';
import { resolve as pathResolve } from 'path';
import { promisify } from 'util';
import { speechKit } from './speech-kit';
import type { Options } from './speech-kit';
import { settings } from './settings';
import type { SpeechFragment } from './script-to-speech-fragments';
import { concatAudioFiles } from './concat-audio-files';

const writeFile = promisify( writeFileCallback );

const MAX_CONTENT_LENGTH = 4500;

export async function speechFragmentsToAudio( fragments: SpeechFragment[] )
{
	const options: Options = {
		iamToken: settings.iamToken,
		folderId: settings.folderId,
		format: 'oggopus',
		// format: 'lpcm',
		// sampleRateHertz: 48000,
	};
	
	const workDir = pathResolve( process.cwd(), '_test/Dzhonston_Asoka/' );
	let lastSection = 1;
	let partIndex = 0;
	let sectionName = String( lastSection ).padStart( 3, '0' );
	let sectionFiles: string[] = [];
	
	const writeSection = async () =>
	{
		if ( sectionFiles )
		{
			await concatAudioFiles( workDir, sectionFiles, sectionName + '.ogg' );
			console.log( 'Section done: ', sectionName );
		}
	};
	
	for ( const { section, content, ...speechOptions } of fragments )
	{
		if ( section !== lastSection )
		{
			await writeSection();
			partIndex = 0;
			lastSection = section;
			sectionName = String( lastSection ).padStart( 3, '0' );
			sectionFiles = [];
		}
		
		const parts = splitContent( content );
		
		for ( const part of parts )
		{
			partIndex++;
			
			const data = await speechKit( {
				...options,
				...speechOptions,
				ssml: `<speak>${part}</speak>`,
			} );
			
			const partName = `${sectionName}-${String( partIndex ).padStart( 4, '0' )}`;
			const fileName = `parts/${partName}.ogg`;
			
			sectionFiles.push( fileName );
			
			await writeFile( pathResolve( workDir, fileName ), data );
			
			console.log( 'Fragment', partName );
		}
	}
	
	await writeSection();
}

function splitContent( text: string ): string[]
{
	let content = text;
	const parts: string[] = [];
	
	while ( content.length > MAX_CONTENT_LENGTH )
	{
		for ( let i = MAX_CONTENT_LENGTH; i >= 0; i-- )
		{
			if (
				( ( content[i] === '>' ) && ( content[i - 1] === '/' ) )
				|| ( ( content[i] === ' ' ) && ( content[i - 1] === '.' ) )
			)
			{
				parts.push( content.slice( 0, i + 1 ) );
				content = content.slice( i + 1 );
				
				break;
			}
		}
	}
	
	parts.push( content );
	
	return parts;
}
