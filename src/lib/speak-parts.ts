// spell-checker:ignore oksana omazh zahar ermil alyss

import { paragraph } from './markup/paragraph';

type SpeakContext = {
	lang: 'ru-RU' | 'en-US';
	voice:
		| 'oksana' // F, RU
		| 'jane' // F, RU
		| 'omazh' // F, RU
		| 'zahar' // M, RU
		| 'ermil' // M, RU
		| 'alyss' // F, EN
		| 'nick'; // M, EN
	emotion: 'good' | 'evil' | 'neutral';
	speed: number;
	section: number;
};

type SpeakPart = SpeakContext & {
	text: string;
};

type SpeakState = {
	dialogue: 'none' | 'first' | 'second';
	indexInParagraph: number;
	inParagraph: boolean;
};

export class SpeakParts
{
	private _parts: SpeakPart[] = [];
	private _current: SpeakPart;
	private _stack: SpeakContext[] = [];
	private _state: SpeakState = {
		dialogue: 'none',
		indexInParagraph: 0,
		inParagraph: false,
	};
	
	constructor()
	{
		this._current = {
			lang: 'ru-RU',
			voice: 'jane',
			emotion: 'neutral',
			speed: 1,
			section: 1,
			text: '',
		};
		this._parts.push( this._current );
	}
	
	add( text: string ): void
	{
		this._current.text += text;
	}
	
	setContext( context: Partial<SpeakContext>, overwrite: boolean = false ): void
	{
		if ( !this._compareContext( context ) )
		{
			if (
				( this._current.text !== '' )
				&& (
					!this._state.inParagraph
					|| ( this._state.indexInParagraph !== 0 )
				)
			)
			{
				if ( !overwrite )
				{
					this._stack.push( this._current );
				}
				
				this._current = {
					...this._current,
					...context,
					text: '',
				};
				this._parts.push( this._current );
			}
			else
			{
				Object.assign( this._current, context );
			}
		}
	}
	
	resetContext(): void
	{
		if ( this._stack.length !== 0 )
		{
			this.setContext( this._stack.pop()! );
		}
	}
	
	get(): SpeakPart[]
	{
		return this._parts;
	}
	
	nextSection(): void
	{
		if ( this._current.text.length > 1000 )
		{
			this._current = {
				...this._current,
				section: this._current.section + 1,
				text: '',
			};
			this._parts.push( this._current );
		}
	}
	
	startParagraph(): void
	{
		this._state.indexInParagraph = 0;
		this._state.inParagraph = true;
		this.add( paragraph() );
	}
	
	stopParagraph(): void
	{
		this._state.inParagraph = false;
	}
	
	isInParagraph(): boolean
	{
		return this._state.inParagraph;
	}
	
	addToIndexInParagraph( length: number ): void
	{
		if ( this._state.inParagraph )
		{
			this._state.indexInParagraph += length;
		}
	}
	
	getIndexInParagraph(): number
	{
		return this._state.indexInParagraph;
	}
	
	startDialogue(): void
	{
		switch ( this._state.dialogue )
		{
			case 'first':
				this._state.dialogue = 'second';
				this.setContext(
					{
						voice: 'zahar',
					},
					true,
				);
				break;
			
			case 'second':
			case 'none':
			default:
				this._state.dialogue = 'first';
				this.setContext(
					{
						voice: 'oksana',
					},
					true,
				);
				break;
		}
	}
	
	stopDialogue(): void
	{
		this._state.dialogue = 'none';
		this.setContext(
			{
				voice: 'jane',
			},
			true,
		);
	}
	
	private _compareContext( context: Partial<SpeakContext> ): boolean
	{
		for ( const key of Object.keys( context ) as Array<keyof SpeakContext> )
		{
			if ( context[key] !== this._current[key] )
			{
				return false;
			}
		}
		
		return true;
	}
}
