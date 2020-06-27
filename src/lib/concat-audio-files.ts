import { concatAudioFilesFfmpeg } from './concat-audio-files-ffmpeg';
import { concatAudioFilesSox } from './concat-audio-files-sox';
import { settings } from './settings';

export function concatAudioFiles( baseDir: string, files: string[], output: string )
{
	if ( settings.concatTool === 'sox' )
	{
		return concatAudioFilesSox( baseDir, files, output );
	}
	
	return concatAudioFilesFfmpeg( baseDir, files, output );
}
