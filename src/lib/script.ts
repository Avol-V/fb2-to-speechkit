const MIN_SECTION_SIZE = 1000;

export type ScriptSectionItem = {
	type: 'section';
	number: number;
};
export type ScriptParagraphItem = {
	type: 'paragraph';
	size: number;
	closing: boolean;
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
export type ScriptPauseItem = {
	type: 'pause';
	seconds?: number;
};
export type ScriptDialogueItem = {
	type: 'dialogue';
	number: number;
	closing: boolean;
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
;
export type ScriptState = {
	inParagraph: boolean;
	inTitle: boolean;
	inEmphasis: boolean;
	inStrong: boolean;
};

export class Script
{
	private _list: ScriptItem[] = [];
	private _state: ScriptState = {
		inParagraph: false,
		inTitle: false,
		inEmphasis: false,
		inStrong: false,
	};
	private _lastSection: ScriptSectionItem;
	private _lastBlock: ScriptBlockItem | null = null;
	private _lastDialogue: ScriptDialogueItem | null = null;
	private _sectionSize: number = 0;
	
	constructor()
	{
		const section: ScriptSectionItem = {
			type: 'section',
			number: 1,
		};
		
		this._list.push( section );
		this._lastSection = section;
	}
	
	addText( text: string )
	{
		if (
			!this._state.inParagraph
			&& !this._state.inTitle
			&& ( text === ' ' )
		)
		{
			return;
		}
		
		this._list.push( {
			type: 'text',
			text,
		} );
	}
	
	openParagraph()
	{
		this.closeParagraph();
		this.closeTitle();
		this.closeEmphasis();
		this.closeStrong();
		
		const paragraph: ScriptParagraphItem = {
			type: 'paragraph',
			size: 0,
			closing: false,
		};
		
		this._lastBlock = paragraph;
		this._list.push( paragraph );
		this._state.inParagraph = true;
	}
	
	closeParagraph()
	{
		if ( this._state.inParagraph )
		{
			this._state.inParagraph = false;
			this._list.push( {
				type: 'paragraph',
				size: 0,
				closing: true,
			} );
		}
	}
	
	openTitle()
	{
		this.closeParagraph();
		this.closeTitle();
		this.closeEmphasis();
		this.closeStrong();
		
		const title: ScriptTitleItem = {
			type: 'title',
			size: 0,
			closing: false,
		};
		
		this._lastBlock = title;
		this._list.push( title );
		this._state.inTitle = true;
	}
	
	closeTitle()
	{
		if ( this._state.inTitle )
		{
			this._state.inTitle = false;
			this._list.push( {
				type: 'title',
				size: 0,
				closing: true,
			} );
		}
	}
	
	addBlockSize( size: number )
	{
		if ( this._lastBlock )
		{
			this._lastBlock.size += size;
		}
		
		this._sectionSize += size;
	}
	
	breakSection()
	{
		if ( this._sectionSize < MIN_SECTION_SIZE )
		{
			return;
		}
		
		const section: ScriptSectionItem = {
			type: 'section',
			number: this._lastSection.number + 1,
		};
		
		this._lastSection = section;
		this._sectionSize = 0;
		this._list.push( section );
	}
	
	openEmphasis()
	{
		if ( this._state.inEmphasis )
		{
			return;
		}
		
		this._list.push( {
			type: 'emphasis',
			closing: false,
		} );
		this._state.inEmphasis = true;
	}
	
	closeEmphasis()
	{
		if ( this._state.inEmphasis )
		{
			this._state.inEmphasis = false;
			this._list.push( {
				type: 'emphasis',
				closing: true,
			} );
		}
	}
	
	openStrong()
	{
		if ( this._state.inStrong )
		{
			return;
		}
		
		this._list.push( {
			type: 'strong',
			closing: false,
		} );
		this._state.inStrong = true;
	}
	
	closeStrong()
	{
		if ( this._state.inStrong )
		{
			this._state.inStrong = false;
			this._list.push( {
				type: 'strong',
				closing: true,
			} );
		}
	}
	
	asDialogue()
	{
		if ( !this._atBeginningOfParagraph() )
		{
			return;
		}
		
		const dialogue: ScriptDialogueItem = {
			type: 'dialogue',
			number: this._lastDialogue ? this._lastDialogue.number + 1 : 0,
			closing: false,
		} ;
		
		this._lastDialogue = dialogue;
		this._list.push( dialogue );
	}
	
	stopDialogue()
	{
		if (
			!this._lastDialogue
			|| !this._atBeginningOfParagraph()
		)
		{
			return;
		}
		
		this._lastDialogue = null;
		this._list.push( {
			type: 'dialogue',
			number: 0,
			closing: true,
		} );
	}
	
	addPause( seconds?: number )
	{
		this._list.push( {
			type: 'pause',
			seconds,
		} );
	}
	
	getList()
	{
		return this._list;
	}
	
	private _atBeginningOfParagraph(): boolean
	{
		return Boolean(
			this._state.inParagraph
			&& this._lastBlock
			&& ( this._lastBlock.size === 0 )
		);
	}
}
