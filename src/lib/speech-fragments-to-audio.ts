import {
	writeFile as writeFileCallback,
	readdir as readDirCallback,
	mkdir as mkDirCallback,
} from 'fs';
import {
	resolve as pathResolve,
	basename,
} from 'path';
import { promisify } from 'util';
import { speechKit } from './speech-kit';
import type { Options } from './speech-kit';
import { settings } from './settings';
import type { SpeechFragment } from './script-to-speech-fragments';
import { concatAudioFiles } from './concat-audio-files';

const writeFile = promisify( writeFileCallback );
const readDir = promisify( readDirCallback );
const mkDir = promisify( mkDirCallback );

const MAX_CONTENT_LENGTH = 4500;
const AUDIO_DIR_NAME = 'audio';
const PARTS_DIR_NAME = 'parts';

export async function speechFragmentsToAudio(
	fragments: SpeechFragment[],
	baseDir: string,
)
{
	const continueFromPart = await findLastPart( baseDir ).catch( () => '' );
	
	const options: Options = {
		iamToken: settings.iamToken,
		folderId: settings.folderId,
		format: 'oggopus',
		timeout: 5 * 60000,
		retries: 3,
	};
	
	let lastSection = 1;
	let partIndex = 0;
	let sectionName = String( lastSection ).padStart( 3, '0' );
	let sectionFiles: string[] = [];
	let skip: boolean = continueFromPart.length !== 0;
	
	if ( !skip )
	{
		await mkDir( pathResolve( baseDir, AUDIO_DIR_NAME ) );
		await mkDir( pathResolve( baseDir, PARTS_DIR_NAME ) );
	}
	
	const writeSection = async () =>
	{
		if (
			!skip
			&& ( sectionFiles.length !== 0 )
		)
		{
			await concatAudioFiles(
				baseDir,
				sectionFiles,
				`${AUDIO_DIR_NAME}/${sectionName}.ogg`,
			);
			console.log( 'Section done: ', sectionName );
		}
	};
	
	for ( const { section, content, ...speechOptions } of fragments )
	{
		if ( content.trim().length === 0 )
		{
			continue;
		}
		
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
			
			const partName = `${sectionName}-${String( partIndex ).padStart( 4, '0' )}`;
			const fileName = `${PARTS_DIR_NAME}/${partName}.ogg`;
			
			sectionFiles.push( fileName );
			
			if ( skip )
			{
				if ( partName === continueFromPart )
				{
					skip = false;
				}
				
				continue;
			}
			
			const data = await speechKit( {
				...options,
				...speechOptions,
				ssml: `<speak>${part}</speak>`,
			} );
			
			await writeFile( pathResolve( baseDir, fileName ), data );
			
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

async function findLastPart( baseDir: string )
{
	const files = (
		await readDir( pathResolve( baseDir, PARTS_DIR_NAME ) )
	)
		.filter( ( file ) => file.endsWith( '.ogg' ) )
		.sort();
	
	return basename( files[files.length - 1], '.ogg' );
}
