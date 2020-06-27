import { spawn } from 'child_process';
import { join } from 'path';
import { writeTempFile } from './write-temp-file';
import { unlink as unlinkCallback } from 'fs';
import { promisify } from 'util';

const unlink = promisify( unlinkCallback );

export async function concatAudioFilesFfmpeg( baseDir: string, files: string[], output: string )
{
	const inputList = files.map( ( file ) => `file '${join( baseDir, file )}'` ).join( '\n' );
	const inputFile = await writeTempFile( inputList, 'utf8' );
	
	const child = spawn(
		'ffmpeg',
		[
			'-f',
			'concat',
			'-safe',
			'0',
			'-i',
			inputFile,
			'-c',
			'copy',
			join( baseDir, output ),
		],
		{
			stdio: 'inherit',
			cwd: baseDir,
		},
	);
	
	return new Promise<void>(
		( resolve, reject ) =>
		{
			child.on(
				'close',
				async ( code ) =>
				{
					await unlink( inputFile );
					
					if ( code === 0 )
					{
						resolve();
					}
					else
					{
						reject(
							new Error( `FFMPEG Error: ${code}` ),
						);
					}
				},
			);
		},
	);
}
