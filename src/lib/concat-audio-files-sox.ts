import { spawn } from 'child_process';

export function concatAudioFilesSox( baseDir: string, files: string[], output: string )
{
	const child = spawn(
		'sox',
		[
			...files,
			output,
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
				( code ) =>
				{
					if ( code === 0 )
					{
						resolve();
					}
					else
					{
						reject(
							new Error( `SOX Error: ${code}` ),
						);
					}
				},
			);
		},
	);
}
