const MIN_SECTION_SIZE = 10000;

export type ScriptSectionItem = {
	type: 'section';
	number: number;
};
export type ScriptParagraphItem = {
	type: 'paragraph';
	size: number;
	closing: boolean;
	inheritVoice: boolean;
};
export type ScriptTitleItem = {
	type: 'title';
	size: number;
	closing: boolean;
};
export type ScriptEmphasisItem = {
	type: 'emphasis';
	closing: boolean;
};
export type ScriptStrongItem = {
	type: 'strong';
	closing: boolean;
};
export type ScriptTextItem = {
	type: 'text';
	text: string;
};
export type ScriptPauseItem ={
	type: 'pause';
	seconds?: number;
	as?: 'title' | 'paragraph' | 'sentence';
};
export type ScriptDialogueItem = {
	type: 'dialogue';
	number: number;
	closing: boolean;
};
export type ScriptNoteItem = {
	type: 'note';
	name: string;
};
export type ScriptBlockItem =
	| ScriptParagraphItem
	| ScriptTitleItem
;
export type ScriptItem =
	| ScriptBlockItem
	| ScriptSectionItem
	| ScriptTextItem
	| ScriptEmphasisItem
	| ScriptStrongItem
	| ScriptPauseItem
	| ScriptDialogueItem
	| ScriptNoteItem
;

export class Script
{
	private _list: ScriptItem[] = [];
	private _notes = new Map<string, ScriptItem[]>();
	private _state = {
		inParagraph: false,
		inTitle: false,
		inSubtitle: false,
		inEmphasis: false,
		inStrong: false,
		inBody: false,
		inNotes: false,
	};
	private _lastSection: ScriptSectionItem;
	private _lastBlock: ScriptBlockItem | null = null;
	private _lastDialogue: ScriptDialogueItem | null = null;
	private _sectionSize: number = 0;
	private _currentNote: string = '';
	private _ignoreContent: boolean = false;
	private _binaryName: string | undefined;
	private _binaryData: string = '';
	private _images = new Map<string, Buffer>();
	
	constructor()
	{
		const section: ScriptSectionItem = {
			type: 'section',
			number: 1,
		};
		
		this._pushItem( section );
		this._lastSection = section;
	}
	
	isInBody(): boolean
	{
		return this._state.inBody;
	}
	
	isInNotes(): boolean
	{
		return this._state.inNotes;
	}
	
	isInBinary(): boolean
	{
		return Boolean( this._binaryName );
	}
	
	openBody( notes: boolean = false ): void
	{
		if ( this._ignoreContent )
		{
			return;
		}
		
		this._state.inBody = true;
		
		if ( notes )
		{
			this._state.inNotes = true;
		}
	}
	
	closeBody(): void
	{
		if ( this._ignoreContent )
		{
			return;
		}
		
		this._state.inBody = false;
		this._state.inNotes = false;
		this._closeAllContentTags();
	}
	
	openNote( name: string ): void
	{
		if (
			this._ignoreContent
			|| !this.isInNotes()
		)
		{
			return;
		}
		
		this._currentNote = name;
	}
	
	closeNote(): void
	{
		if ( this._ignoreContent )
		{
			return;
		}
		
		this._currentNote = '';
	}
	
	addText( text: string ): void
	{
		if ( this._binaryName )
		{
			console.log('--- text length:', text.length);
			this._binaryData += text;
			
			return;
		}
		
		if (
			this._ignoreContent
			|| !this.isInBody()
			|| (
				!this._state.inParagraph
				&& !this._state.inSubtitle
				&& ( text === ' ' )
			)
		)
		{
			return;
		}
		
		this._pushItem( {
			type: 'text',
			text,
		} );
	}
	
	openParagraph(): void
	{
		if (
			this._ignoreContent
			|| !this.isInBody()
		)
		{
			return;
		}
		
		this._closeAllContentTags();
		
		const paragraph: ScriptParagraphItem = {
			type: 'paragraph',
			size: 0,
			closing: false,
			inheritVoice: this._state.inTitle,
		};
		
		this._lastBlock = paragraph;
		this._pushItem( paragraph );
		this._state.inParagraph = true;
	}
	
	closeParagraph(): void
	{
		if (
			this._ignoreContent
			|| !this._state.inParagraph
		)
		{
			return;
		}
		
		this._state.inParagraph = false;
		this._pushItem( {
			type: 'paragraph',
			size: 0,
			closing: true,
			inheritVoice: this._state.inTitle,
		} );
	}
	
	openTitle(): void
	{
		if (
			this._ignoreContent
			|| !this.isInBody()
		)
		{
			return;
		}
		
		this._closeAllContentTags();
		
		const title: ScriptTitleItem = {
			type: 'title',
			size: 0,
			closing: false,
		};
		
		this._lastBlock = title;
		this._pushItem( title );
		this._state.inTitle = true;
	}
	
	closeTitle(): void
	{
		if (
			this._ignoreContent
			|| !this._state.inTitle
		)
		{
			return;
		}
		
		this._closeAllContentTags();
		
		this._state.inTitle = false;
		this._pushItem( {
			type: 'title',
			size: 0,
			closing: true,
		} );
	}
	
	openSubtitle(): void
	{
		if (
			this._ignoreContent
			|| !this.isInBody()
		)
		{
			return;
		}
		
		this._closeAllContentTags();
		
		const title: ScriptTitleItem = {
			type: 'title',
			size: 0,
			closing: false,
		};
		
		this._lastBlock = title;
		this._pushItem( title );
		this._state.inSubtitle = true;
	}
	
	closeSubtitle(): void
	{
		if (
			this._ignoreContent
			|| !this._state.inSubtitle
		)
		{
			return;
		}
		
		this._state.inSubtitle = false;
		this._pushItem( {
			type: 'title',
			size: 0,
			closing: true,
		} );
	}
	
	openEpigraph(): void
	{
		if (
			this._ignoreContent
			|| !this.isInBody()
			|| (
				this._lastBlock
				&& this._lastBlock.type === 'title'
			)
		)
		{
			return;
		}
		
		this._pushItem( {
			type: 'pause',
			as: 'title',
		} );
	}
	
	closeEpigraph(): void
	{
		if (
			this._ignoreContent
			|| !this.isInBody()
		)
		{
			return;
		}
		
		this._pushItem( {
			type: 'pause',
			as: 'paragraph',
		} );
	}
	
	addBlockSize( size: number ): void
	{
		if (
			this._ignoreContent
			|| !this.isInBody()
		)
		{
			return;
		}
		
		if ( this._lastBlock )
		{
			this._lastBlock.size += size;
		}
		
		this._sectionSize += size;
	}
	
	breakSection(): void
	{
		if (
			this._ignoreContent
			|| !this.isInBody()
			|| this.isInNotes()
			|| ( this._sectionSize < MIN_SECTION_SIZE )
		)
		{
			return;
		}
		
		const section: ScriptSectionItem = {
			type: 'section',
			number: this._lastSection.number + 1,
		};
		
		this._lastSection = section;
		this._sectionSize = 0;
		this._pushItem( section );
	}
	
	openEmphasis(): void
	{
		if (
			this._ignoreContent
			|| !this.isInBody()
			|| this._state.inEmphasis
		)
		{
			return;
		}
		
		this._pushItem( {
			type: 'emphasis',
			closing: false,
		} );
		this._state.inEmphasis = true;
	}
	
	closeEmphasis(): void
	{
		if (
			this._ignoreContent
			|| !this._state.inEmphasis
		)
		{
			return;
		}
		
		this._state.inEmphasis = false;
		this._pushItem( {
			type: 'emphasis',
			closing: true,
		} );
	}
	
	openStrong(): void
	{
		if (
			this._ignoreContent
			|| !this.isInBody()
			|| this._state.inStrong
		)
		{
			return;
		}
		
		this._pushItem( {
			type: 'strong',
			closing: false,
		} );
		this._state.inStrong = true;
	}
	
	closeStrong(): void
	{
		if (
			this._ignoreContent
			|| !this._state.inStrong
		)
		{
			return;
		}
		
		this._state.inStrong = false;
		this._pushItem( {
			type: 'strong',
			closing: true,
		} );
	}
	
	openBinary( name: string ): void
	{
		if ( this._binaryName )
		{
			return;
		}
		
		this._binaryName = name;
	}
	
	closeBinary(): void
	{
		if ( !this._binaryName )
		{
			return;
		}
		
		if ( this._binaryData )
		{
			this.addImage( this._binaryName, this._binaryData );
		}
		
		this._binaryName = undefined;
		this._binaryData = '';
	}
	
	asDialogue(): void
	{
		if (
			this._ignoreContent
			|| !this._atBeginningOfParagraph()
		)
		{
			return;
		}
		
		const dialogue: ScriptDialogueItem = {
			type: 'dialogue',
			number: this._lastDialogue ? this._lastDialogue.number + 1 : 0,
			closing: false,
		} ;
		
		this._lastDialogue = dialogue;
		this._pushItem( dialogue );
	}
	
	stopDialogue(): void
	{
		if (
			this._ignoreContent
			|| !this._lastDialogue
			|| !this._atBeginningOfParagraph()
		)
		{
			return;
		}
		
		this._lastDialogue = null;
		this._pushItem( {
			type: 'dialogue',
			number: 0,
			closing: true,
		} );
	}
	
	addPause( seconds?: number ): void
	{
		if ( this._ignoreContent )
		{
			return;
		}
		
		this._pushItem( {
			type: 'pause',
			seconds,
		} );
	}
	
	addNote( name: string ): void
	{
		if ( this._ignoreContent )
		{
			return;
		}
		
		this._pushItem( {
			type: 'note',
			name,
		} );
	}
	
	addImage( name: string, data: string ): void
	{
		const binary = Buffer.from( data, 'base64' );
		
		this._images.set( name, binary );
	}
	
	startIgnoreContent(): void
	{
		this._ignoreContent = true;
	}
	
	stopIgnoreContent(): void
	{
		this._ignoreContent = false;
	}
	
	isIgnoreContent(): boolean
	{
		return this._ignoreContent;
	}
	
	getList(): ScriptItem[]
	{
		return this._list;
	}
	
	getNote( name: string ): ScriptItem[]
	{
		return this._notes.get( name ) || [];
	}
	
	*fetchImages(): Generator<[string, Buffer], void, void>
	{
		for ( const imageData of this._images )
		{
			yield imageData;
		}
	}
	
	private _atBeginningOfParagraph(): boolean
	{
		return Boolean(
			this._state.inParagraph
			&& this._lastBlock
			&& ( this._lastBlock.size === 0 )
		);
	}
	
	private _pushItem( item: ScriptItem ): void
	{
		if ( this.isInNotes() )
		{
			if ( this._currentNote )
			{
				if ( this._notes.has( this._currentNote ) )
				{
					this._notes.get( this._currentNote )!.push( item );
				}
				else
				{
					this._notes.set(
						this._currentNote,
						[item],
					);
				}
			}
			
			return;
		}
		
		this._list.push( item );
	}
	
	private _closeAllContentTags(): void
	{
		this.closeParagraph();
		this.closeSubtitle();
		this.closeEmphasis();
		this.closeStrong();
	}
}
