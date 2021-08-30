import { request as httpsRequest } from 'https';
import { stringify } from 'querystring';

import type { SpeechEmotion, SpeechLanguage, SpeechVoice } from './settings';

export type Options = {
	iamToken: string;
	folderId: string;
	text?: string;
	ssml?: string;
	lang?: SpeechLanguage;
	voice?: SpeechVoice;
	emotion?: SpeechEmotion;
	speed?: number;
	format?: 'lpcm' | 'oggopus';
	sampleRateHertz?: 48000 | 16000 | 8000;
	timeout?: number;
	retries?: number;
};

const queryKeys = [
	'folderId',
	'text',
	'ssml',
	'lang',
	'voice',
	'emotion',
	'speed',
	'format',
	'sampleRateHertz',
] as const;

export function speechKit( options: Options ): Promise<Buffer>
{
	const parameters = queryKeys
		.map( ( key ) => [ key, options[key] ] )
		.filter( ( [, value] ) => value != null )
		.reduce(
			( previous, [key, value] ) => ( previous[key!] = value!, previous ),
			{} as Record<string, string | number>,
		);
	const body = stringify( parameters );
	let retryAttempt = 0;
	
	return new Promise<Buffer>(
		( resolve, reject ) =>
		{
			retryAttempt++;
			
			const sendRequest = () =>
			{
				const request = httpsRequest(
					{
						method: 'POST',
						hostname: 'tts.api.cloud.yandex.net',
						port: 443,
						path: '/speech/v1/tts:synthesize',
						headers: {
							'Authorization': 'Bearer ' + options.iamToken,
							'Content-Length': Buffer.byteLength(body),
						},
						timeout: options.timeout,
					},
					( response ) =>
					{
						const chunks: Uint8Array[] = [];
						
						response.on(
							'data',
							( chunk ) => chunks.push( chunk ),
						);
						response.on(
							'end',
							() =>
							{
								retryAttempt = 0;
								
								const data = Buffer.concat( chunks );
								
								if ( response.statusCode !== 200 )
								{
									reject(
										new Error(
											`${
												response.statusCode
											} ${
												response.statusMessage
											}: ${
												data.toString( 'utf8' )
											}\n"${
												body
											}"`
										)
									);
								}
								else
								{
									resolve( data );
								}
							},
						);
					},
				);
				
				request.on(
					'error',
					( error ) =>
					{
						reject( error );
					},
				);
				request.on(
					'timeout',
					() =>
					{
						request.abort();
						
						if ( options.retries && retryAttempt < options.retries )
						{
							console.warn( `Retry ${retryAttempt}` );
							retryAttempt++;
							
							sendRequest();
							
							return;
						}
						
						reject( new URIError( 'Timeout' ) );
					},
				);
				request.write( body );
				request.end();
			};
			
			sendRequest();
		},
	);
}
