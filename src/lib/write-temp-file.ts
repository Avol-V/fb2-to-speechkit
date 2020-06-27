import { tmpdir } from 'os';
import { randomBytes, pseudoRandomBytes } from 'crypto';
import { writeFile as writeFileCallback } from 'fs';
import type { WriteFileOptions } from 'fs';
import { promisify } from 'util';
import { join } from 'path';

const writeFile = promisify( writeFileCallback );

const RANDOM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export async function writeTempFile(
	data: string | NodeJS.ArrayBufferView,
	options?: WriteFileOptions,
): Promise<string>
{
	const name = `tmp-${process.pid}-${randomChars( 12 )}`;
	const fileName = join( tmpdir(), name );
	
	await writeFile(
		fileName,
		data,
		options,
	);
	
	return fileName;
}

function randomChars( howMany: number ): string
{
	let rnd = null;
	
	try
	{
		rnd = randomBytes( howMany );
	}
	catch (error)
	{
		rnd = pseudoRandomBytes( howMany );
	}
	
	let value = '';
	
	for ( let i = 0; i < howMany; i++ )
	{
		value += RANDOM_CHARS[ rnd[i] % RANDOM_CHARS.length ];
	}
	
	return value;
}
