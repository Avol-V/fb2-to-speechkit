#!/usr/bin/env node

import { readFile as readFileCallback } from 'fs';
import { resolve as pathResolve } from 'path';
import { promisify } from 'util';
import { main } from './index';

const readFile = promisify( readFileCallback );

void async function ()
{
	if ( !process.argv[2] )
	{
		console.error( 'Path to FB2 file is required' );
		
		return;
	}
	
	const configPath = pathResolve( process.cwd(), 'settings.json' );
	const userSettings = JSON.parse( await readFile( configPath, 'utf8' ) );
	const bookPath = pathResolve( process.cwd(), process.argv[2]! );
	
	await main( bookPath, userSettings );
}()
	.catch( ( error ) => console.error( error ) );
