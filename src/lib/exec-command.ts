import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify( execCallback );

export async function execCommand( command: string ): Promise<string>
{
	const { stdout, stderr } = await exec( command );
	
	if ( stderr )
	{
		console.error( stderr );
	}
	
	return stdout.trim();
}
