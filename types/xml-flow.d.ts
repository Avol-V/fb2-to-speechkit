declare module 'xml-flow'
{
	type ReadStream = import( 'fs' ).ReadStream;
	type EventEmitter = import( 'events' ).EventEmitter;
	
	enum When
	{
		ALWAYS = 1,
		SOMETIMES = 0,
		NEVER = -1,
	}
	
	function xmlFlow(
		inStream: ReadStream,
		options?: Partial<xmlFlow.Options>,
	): EventEmitter;
	
	namespace xmlFlow
	{
		interface Options
		{
			preserveMarkup: When;
			simplifyNodes: boolean;
			useArrays: When;
			lowercase: boolean;
			trim: boolean;
			normalize: boolean;
			cdataAsText: boolean;
			strict: boolean;
		}
		
		const ALWAYS: When.ALWAYS;
		const SOMETIMES: When.SOMETIMES;
		const NEVER: When.NEVER;
		
		interface Markup
		{
			$name: string;
			$attrs: {
				[key: string]: string;
			};
			$markup?: Array<Markup | string>;
		}
	}
	
	export = xmlFlow;
}
