declare namespace wasm_bindgen {
	/* tslint:disable */
	/* eslint-disable */
	
	export type TiktokenEmbedding = "gpt2" | "r50k_base" | "p50k_base" | "p50k_edit" | "cl100k_base"; 
	
	/**
	 * @param {TiktokenEmbedding} encoding
	 * @param {Record<string, number>} [extend_special_tokens]
	 * @returns {Tiktoken}
	 */
	export function get_encoding(encoding: TiktokenEmbedding, extend_special_tokens?: Record<string, number>): Tiktoken;
	
	
	
	export type TiktokenModel =
	    | "text-davinci-003"
	    | "text-davinci-002"
	    | "text-davinci-001"
	    | "text-curie-001"
	    | "text-babbage-001"
	    | "text-ada-001"
	    | "davinci"
	    | "curie"
	    | "babbage"
	    | "ada"
	    | "code-davinci-002"
	    | "code-davinci-001"
	    | "code-cushman-002"
	    | "code-cushman-001"
	    | "davinci-codex"
	    | "cushman-codex"
	    | "text-davinci-edit-001"
	    | "code-davinci-edit-001"
	    | "text-embedding-ada-002"
	    | "text-similarity-davinci-001"
	    | "text-similarity-curie-001"
	    | "text-similarity-babbage-001"
	    | "text-similarity-ada-001"
	    | "text-search-davinci-doc-001"
	    | "text-search-curie-doc-001"
	    | "text-search-babbage-doc-001"
	    | "text-search-ada-doc-001"
	    | "code-search-babbage-code-001"
	    | "code-search-ada-code-001"
	    | "gpt2";
	
	/**
	 * @param {TiktokenModel} encoding
	 * @param {Record<string, number>} [extend_special_tokens]
	 * @returns {Tiktoken}
	 */
	export function encoding_for_model(model: TiktokenModel, extend_special_tokens?: Record<string, number>): Tiktoken;
	
	
	/**
	*/
	export class Tiktoken {
	  free(): void;
	/**
	* @param {string} tiktoken_bfe
	* @param {any} special_tokens
	* @param {string} pat_str
	*/
	  constructor(tiktoken_bfe: string, special_tokens: any, pat_str: string);
	/**
	* @param {string} text
	* @param {any} allowed_special
	* @param {any} disallowed_special
	* @returns {Uint32Array}
	*/
	  encode(text: string, allowed_special: any, disallowed_special: any): Uint32Array;
	/**
	* @param {string} text
	* @returns {Uint32Array}
	*/
	  encode_ordinary(text: string): Uint32Array;
	/**
	* @param {string} text
	* @param {any} allowed_special
	* @param {any} disallowed_special
	* @returns {any}
	*/
	  encode_with_unstable(text: string, allowed_special: any, disallowed_special: any): any;
	/**
	* @param {Uint8Array} bytes
	* @returns {number}
	*/
	  encode_single_token(bytes: Uint8Array): number;
	/**
	* @param {Uint32Array} tokens
	* @returns {Uint8Array}
	*/
	  decode(tokens: Uint32Array): Uint8Array;
	/**
	* @param {number} token
	* @returns {Uint8Array}
	*/
	  decode_single_token_bytes(token: number): Uint8Array;
	/**
	* @returns {any}
	*/
	  token_byte_values(): any;
	/**
	*/
	  readonly name: string | undefined;
	}
	
}

declare type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

declare interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_tiktoken_free: (a: number) => void;
  readonly tiktoken_new: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly tiktoken_name: (a: number, b: number) => void;
  readonly tiktoken_encode: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly tiktoken_encode_ordinary: (a: number, b: number, c: number, d: number) => void;
  readonly tiktoken_encode_with_unstable: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly tiktoken_encode_single_token: (a: number, b: number, c: number) => number;
  readonly tiktoken__encode_single_piece: (a: number, b: number, c: number, d: number) => void;
  readonly tiktoken_decode: (a: number, b: number, c: number, d: number) => void;
  readonly tiktoken_decode_single_token_bytes: (a: number, b: number, c: number) => void;
  readonly tiktoken_token_byte_values: (a: number) => number;
  readonly get_encoding: (a: number, b: number, c: number, d: number) => void;
  readonly encoding_for_model: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
declare function wasm_bindgen (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
