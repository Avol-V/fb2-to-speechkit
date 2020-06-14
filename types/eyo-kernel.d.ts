declare module 'eyo-kernel'
{
	class Eyo
	{
		public dictionary: Eyo.Dictionary;
		
		/**
		 * Ищет варианты замены буквы «е» на «ё»
		 * 
		 * @param text Текст
		 * @param groupByWords Группировать по словам
		 */
		lint( text: string, groupByWords?: boolean ): Eyo.Replacement[];
		
		/**
		 * Восстанавливает букву «ё» в тексте
		 */
		restore( text: string ): string;
	}
	
	namespace Eyo
	{
		interface Dictionary
		{
			/**
			 * Загружает словарь
			 */
			load: ( filename: string, callback: DictionaryLoadCallback) => void;
			/**
			 * Синхронно загружает словарь
			 */
			loadSync: ( filename: string ) => void;
			/**
			 * Загружает безопасный встроенный словарь
			 */
			loadSafe: ( callback: DictionaryLoadCallback ) => void;
			/**
			 * Синхронно загружает безопасный встроенный словарь
			 */
			loadSafeSync: () => void;
			/**
			 * Загружает небезопасный встроенный словарь
			 */
			loadNotSafe: ( callback: DictionaryLoadCallback ) => void;
			/**
			 * Синхронно загружает небезопасный встроенный словарь
			 */
			loadNotSafeSync: () => void;
			/**
			 * Очищает словарь
			 */
			clear: () => void;
			/**
			 * Восстанавливает в слове букву «ё»
			 */
			restoreWord: ( word: string ) => string;
			/**
			 * Добавляет слово в словарь
			 */
			addWord: ( rawWord: string ) => void;
			/**
			 * Удаляет слово из словаря
			 */
			removeWord: ( word: string ) => void;
			/**
			 * Установить словарь
			 */
			set: ( dict: string | string[] ) => void;
			/**
			 * Получить словарь
			 */
			get: () => any;
		}
		
		type DictionaryLoadCallback = ( error: any, dict: string ) => void;
		
		interface Replacement
		{
			before: string;
			after: string;
			position: ReplacementPosition;
		}
		
		interface ReplacementPosition
		{
			line: number;
			column: number;
			index: number;
		}
	}
	
	export = Eyo;
}
