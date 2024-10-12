import { Display, Scale, Header, Internal, Meta, Parsed, Row, Schema } from './types';

/**
 * An object that stores an {@link ArrayBuffer} and returns subsequent portions on demand
 */
export class Feeder {
    private buffer : ArrayBuffer;
    private cursor : number;
    /**
     *
     * @param buffer An {@link ArrayBuffer} that will be fed out by the object
     */
    constructor(buffer : ArrayBuffer) {
        this.buffer = buffer;
        this.cursor = 0;
    }
    /**
     * Jump the cursor to a position in the buffer.
     * @param position the position in the {@link ArrayBuffer} to jump to
     */
    public jump(position : number) : void {
        if (position < 0 || position > this.buffer.byteLength){
            throw new Error(
                'Jump to out-of-bounds position'
            )
        }
        this.cursor = position;
    }
    /**
     * Get the next chunk of the ArrayBuffer from the current cursor position
     * and move the cursor.
     * @param size the number of bytes to read from the {@link ArrayBuffer}
     * @returns an {@link ArrayBuffer} of the requested `size` from the cursor position
     */
    public next(size : number) : ArrayBuffer {
        if (!this.buffer || this.cursor + size > this.buffer.byteLength){
            throw new Error(
                'Unexpected End of File'
            );
        } else {
            this.cursor += size;
            return(
                this.buffer.slice(
                    this.cursor - size,
                    this.cursor
                )
            );
        }
    }
    /**
     * Get the current position of the cursor
     * @returns the current cursor position as a number
     */
    public position() : number {
        return(this.cursor);
    }
    /**
     * Check whether the {@link ArrayBuffer} has been exhausted
     * @returns a boolean, whether the {@link ArrayBuffer} is exhausted
     */
    public done() : boolean {
        return(this.cursor === this.buffer.byteLength);
    }
}

class DataReader {
    private feeder : Feeder;
    private schema : Schema;
    private position : number;
    private instructions : DataView;
    private cursor : number;
    private decoder : TextDecoder;
    private log : Array<string>;
    constructor(schema : Schema, feeder : Feeder, log : Array<string> = []) {
        this.feeder = feeder;
        this.position = feeder.position();
        this.cursor = 8;
        this.schema = schema;
        this.decoder = new TextDecoder();
        this.log = log;
    }
    private compressedCodes() : number {
        let instruction : number;
        do {
            if (this.cursor > 7){
                this.instructions = new DataView(this.feeder.next(8));
                this.cursor = 0;
            }
            instruction = this.instructions.getUint8(this.cursor++);
        } while (instruction === 0);
        return(instruction);
    }
    private uncompressedNumber() : number {
        return(
            new DataView(this.feeder.next(8)).getFloat64(
                0,
                this.schema.internal.integer.endianness === 2
            )
        )
    }
    private uncompressedString(length : number) : string {
        const pieces : Array<string> = [];
        do {
            pieces.concat(this.decoder.decode(this.feeder.next(8)));
        } while (--length);
        return(pieces.join(''));
    }
    private compressedNumber() : number {
        const code = this.compressedCodes();
        switch(code){
            case 252: throw new Error('Unexpected end of records.');
            case 253: return(new DataView(this.feeder.next(8)).getFloat64(0, true));
            case 254: throw new Error('Cell code type mismatch');
            case 255: return(null);
            default: return(code - this.schema.meta.bias);
        }
    }
    private compressedString(length : number) : string {
        const pieces : Array<string> = [];
        do {
            const code = this.compressedCodes();
            switch(code){
                case 252: throw new Error('Unexpected end of records.');
                case 253:
                    pieces.push(this.decoder.decode(this.feeder.next(8)));
                    break
                case 254:
                    pieces.push('');
                    break;
                case 255: return(null);
                default: throw new Error('Default code not supported for strings.')
            }
        } while (--length);
        return(pieces.join(''));
    }
    private readNumber() : number {
        if (this.schema.meta.compression) {
            return(this.compressedNumber());
        } else {
            return(this.uncompressedNumber());
        }
    }
    private readString(length : number) : string {
        if (this.schema.meta.compression) {
            return(this.compressedString(length));
        } else {
            return(this.uncompressedString(length));
        }
    }
    private readCell(header : Header) : number | string {
        this.log.push('Cell: ' + header.name);
        if (header.code) {
            return(this.readString(Math.ceil(header.code / 8)));
        } else {
            return(this.readNumber());
        }
    }
    private readRow() : Row {
        return(new Map(
            this.schema.headers.map(header => [header.name, this.readCell(header)])
        ))
    }
    public read() : Array<Row> {
        this.feeder.jump(this.schema.internal.finished);
        const readArray = new Array(this.schema.meta.cases).fill(0).map(
            (_, idx) => {
                this.log.push('Row: ' + idx);
                return(this.readRow())
            }
        )
        this.feeder.jump(this.position);
        return(readArray);
    }
}

/**
 * A parser for .sav files
 */
export class SavParser {
    private decoder : TextDecoder;
    private log : Array<string>;
    private readFieldLabel(feeder : Feeder) : string {
        let length = new DataView(feeder.next(4)).getInt32(0, true);
        if (length % 4){
            length = length + (4 - (length % 4));
        }
        return(this.decoder.decode(feeder.next(length)).trim());
    }
    private readFieldMissingCodes(view : DataView, count : number) : Array<number> {
        const readArray = new Array(count).fill(0);
        return(
            readArray.map((_, idx) => view.getFloat64(8 * idx))
        );
    }
    private readFieldMissingStrings(chunk : ArrayBuffer, count : number) : Array<string> {
        const readArray = new Array(count).fill(0);
        return(
            readArray.map((_, idx) => this.decoder.decode(
                chunk.slice(8 * idx, 8 * idx + 8)
            ))
        );
    }
    private readFieldMissingRange(view : DataView) : [number, number] {
        return([
            view.getFloat64(0, true),
            view.getFloat64(8, true)
        ]);
    }
    private readFieldMissing(feeder : Feeder, numeric : boolean, code : number) : Header['missing'] {
        const chunk = feeder.next(8 * Math.abs(code));
        const view = new DataView(chunk);
        return({
            codes : (numeric && code > 0
                ? this.readFieldMissingCodes(view, code)
                : (numeric && code === -3
                    ? this.readFieldMissingCodes(view, 3).slice(2)
                    : []
                )
            ),
            range : (numeric && code < 0
                ? this.readFieldMissingRange(view)
                : [undefined, undefined]
            ),
            strings : (!numeric && code > 0
                ? this.readFieldMissingStrings(chunk, code)
                : []
            )
        })
    }
    private readField(feeder : Feeder) : Header {
        this.log.push('Reading Field at ' + feeder.position());
        const start = feeder.position();
        const chunk = feeder.next(28);
        const view = new DataView(chunk);
        const code = view.getInt32(0, true);
        const labeled = view.getInt32(4, true);
        const missings = view.getInt32(8, true);
        const name = this.decoder.decode(chunk.slice(20, 28)).trim();
        const label = (labeled
            ? this.readFieldLabel(feeder)
            : ''
        );
        const missing = (missings
            ? this.readFieldMissing(feeder, code === 0, missings)
            : {
                codes : [],
                range : [undefined, undefined] as [number, number],
                strings : []
            }
        );
        return({
            start : start,
            code : code,
            name : name,
            label : label,
            missing : missing,
            trailers : 0
        });
    }
    private getLevel(feeder : Feeder) : [number, string] {
        this.log.push('Scale level at ' + feeder.position());
        const view = new DataView(feeder.next(9));
        const length = view.getInt8(8);
        const size = ((length + 1) % 8
            ? length + (8 - ((length + 1) % 8))
            : length
        );
        return([
            view.getFloat64(0, true),
            this.decoder.decode(feeder.next(size)).substring(0, length).trim()
        ]);
    }
    private readScale(feeder : Feeder) : Scale {
        this.log.push('Scale definition at ' + feeder.position());
        const count = (new DataView(feeder.next(4))).getInt32(0, true);
        const readArray = new Array(count).fill(0);
        const levels = new Map(readArray.map(() => this.getLevel(feeder)));
        const view = new DataView(feeder.next(8));
        const magic = view.getInt32(0, true);
        const icount = view.getInt32(4, true);
        if (magic !== 4){
            throw new Error(
                'Levels read error. ' +
                'Magic value Expected: 4 ' +
                'Actual: ' + magic
            )
        }
        const iview = new DataView(feeder.next(4 * icount));
        const indices = new Set((new Array(icount).fill(0)).map(
            (_, idx) => iview.getInt32(idx * 4, true)
        ));
        return({
            map : levels,
            indices : indices
        });
    }
    private readDocument(feeder : Feeder) : Array<string> {
        this.log.push('Sys Document at ' + feeder.position());
        const count = new DataView(feeder.next(4)).getInt32(0, true);
        const chunk = feeder.next(count * 80);
        const docArray = new Array(count).fill(0);
        return(
            docArray.map(
                (_, idx) => this.decoder.decode(
                    chunk.slice(idx * 80, idx * 80 + 80)
                )
            )
        );
    }
    private readSysInteger(feeder : Feeder) : Internal['integer'] {
        this.log.push('Sys Integer at ' + feeder.position());
        const view = new DataView(feeder.next(32));
        return({
            major : view.getInt32(0, true),
            minor : view.getInt32(4, true),
            revision : view.getInt32(8, true),
            machine : view.getInt32(12, true),
            float : view.getInt32(16, true),
            compression : view.getInt32(20, true),
            endianness : view.getInt32(24, true),
            character : view.getInt32(28, true)
        });
    }
    private readSysFloat(feeder : Feeder) : Internal['float'] {
        this.log.push('Sys Float at ' + feeder.position());
        const view = new DataView(feeder.next(24));
        return({
            missing : view.getFloat64(0, true),
            high : view.getFloat64(8, true),
            low : view.getFloat64(16, true)
        });
    }
    private readSysDisplay(feeder : Feeder, count : number) : Array<Display> {
        this.log.push('Sys Display at ' + feeder.position());
        const view = new DataView(feeder.next(count * 12));
        const dispArray = new Array(count).fill(0);
        return(
            dispArray.map(
                (_, idx) => ({
                    type : view.getInt32(idx * 12, true) as 1 | 2 | 3,
                    width : view.getInt32(idx * 12 + 4, true),
                    align : view.getInt32(idx * 12 + 8, true) as 0 | 1 | 2
                })
            )
        );
    }
    private readNames(feeder : Feeder, size : number) : Map<string, string> {
        this.log.push('Names at ' + feeder.position());
        const raw = this.decoder.decode(feeder.next(size));
        return(
            new Map(
                raw.split('\t').map(
                    str => str.split('=') as [string, string]
                )
            )
        );
    }
    private readLongWidths(feeder : Feeder, size : number) : Map<string, number> {
        this.log.push('Long Widths at ' + feeder.position());
        const raw = this.decoder.decode(feeder.next(size));
        const rows = raw.split('\t');
        return(
            new Map(
                rows.slice(0, rows.length - 1).map(
                    str => str.split('=') as [string, string]
                ).map(
                    ([name, length]) => [name, parseInt(length, 10)]
                )
            )
        );
    }
    private readLongNames(feeder : Feeder, size : number) : ArrayBuffer {
        this.log.push('Long Names at ' + feeder.position());
        // need to figure out how this works
        return(feeder.next(size));
    }
    private readUnrecognized(feeder : Feeder, count : number, length : number) : Array<ArrayBuffer> {
        const chunk = feeder.next(count * length);
        const readArray = (new Array(count)).fill(0);
        return(
            readArray.map((_, idx) => chunk.slice(idx * length, idx * length + length))
        );
    }
    private readInternal(feeder : Feeder) : Internal {
        this.log.push('Reading Internal');
        const partial : Partial<Internal> = {};
        let code : number;
        let subcode : number;
        let subview : DataView;
        let length : number;
        let count : number;
        while(!partial.finished){
            code = (new DataView(feeder.next(4))).getInt32(0, true);
            switch(code){
                case 3:
                    partial.levels = (partial.levels ?? []).concat(
                        this.readScale(feeder)
                    );
                    break;
                case 6:
                    partial.documents = (partial.documents ?? []).concat(
                        this.readDocument(feeder)
                    );
                    break;
                case 7:
                    subview = new DataView(feeder.next(12));
                    subcode = subview.getInt32(0, true);
                    length = subview.getInt32(4, true);
                    count = subview.getInt32(8, true);
                    switch(subcode){
                        case 3:
                            this.log.push('Subcode 3');
                            if (length * count !== 32){
                                throw new Error(
                                    'Special code 3 ' +
                                    'Expected: 32 bytes; ' +
                                    'Actual: ' + (length * count)
                                )
                            }
                            partial.integer = this.readSysInteger(feeder);
                            break;
                        case 4:
                            this.log.push('Subcode 4');
                            if (length * count !== 24){
                                throw new Error(
                                    'Special code 4 ' +
                                    'Expected: 24 bytes; ' +
                                    'Actual: ' + (length * count)
                                )
                            }
                            partial.float = this.readSysFloat(feeder);
                            break;
                        case 11:
                            this.log.push('Subcode 11');
                            if (length !== 4) {
                                throw new Error(
                                    'Special code 11 ' +
                                    'Expected: 4 bytes; ' +
                                    'Actual: ' + length
                                )
                            }
                            if (count % 3) {
                                throw new Error(
                                    'Special code 11 ' +
                                    'Expected: Length factor of 3; ' +
                                    'Actual: ' + length
                                )
                            }
                            partial.display = (partial.display ?? []).concat(
                                this.readSysDisplay(feeder, count / 3)
                            );
                            break;
                        case 13:
                            this.log.push('Subcode 13');
                            partial.names = new Map([
                                ...(partial.names ?? []),
                                ...this.readNames(feeder, count * length)
                            ]);
                            break;
                        case 14:
                            this.log.push('Subcode 14');
                            partial.longs = new Map([
                                ...(partial.longs ?? []),
                                ...this.readLongWidths(feeder, count * length)
                            ]);
                            break;
                        case 21:
                            this.log.push('Subcode 21');
                            partial.extra = (partial.extra ?? []).concat(
                                this.readLongNames(feeder, count * length)
                            );
                            break;
                        default:
                            this.log.push('Unrecognized Subcode');
                            partial.unrecognized = (partial.unrecognized ?? []).concat(
                                [[subcode, this.readUnrecognized(feeder, count, length)]]
                            );
                            break;
                    }
                    break;
                case 999:
                    feeder.next(4);
                    partial.finished = feeder.position();
                    break;
                default:
                    throw new Error(
                        'Internal Code Expected : [3, 6, 7, 999]; Actual : ' +
                        code
                    );
            }
        }
        return({
            float : partial.float ?? {
                missing : undefined,
                high : undefined,
                low : undefined
            },
            integer : partial.integer ?? {
                major : undefined,
                minor : undefined,
                revision : undefined,
                machine : undefined,
                float : undefined,
                compression : undefined,
                endianness : undefined,
                character : undefined
            },
            display : partial.display ?? [],
            documents : partial.documents ?? [],
            names : partial.names ?? new Map(),
            longs : partial.longs ?? new Map(),
            levels : partial.levels ?? [],
            extra : partial.extra ?? [],
            unrecognized : partial.unrecognized ?? [],
            finished : partial.finished
        });
    }
    private readFields(feeder : Feeder) : Array<Header> {
        this.log.push('Reading Field at ' + feeder.position());
        let code : number;
        const fields : Array<Header> = [];
        let field : Header;
        while(true){
            code = (new DataView(feeder.next(4))).getInt32(0, true);
            if (code !== 2){
                feeder.jump(feeder.position() - 4);
                break;
            }
            field = this.readField(feeder);
            if (field.code > -1){
                fields.push(field);
            } else {
                fields[fields.length - 1].trailers++;
            }
        }
        return(fields);
    }
    /**
     * Create a new parser
     * @param log a string array that will be populated by parse calls
     */
    constructor(log : Array<string> = []) {
        this.decoder = new TextDecoder();
        this.log = log;
    }
    /**
     * Read the meta fields from a .sav file
     * @param feeder A {@link Feeder} object encoding the sav file
     * @remarks
     * From a node.js {@link Buffer} using `fs.readFile`
     * ```
     * fs = require('fs');
     *
     * let meta;
     * const parser = new SavParser()
     * // with async readFile
     * fs.readFile('some/path/to/file.sav', (err, data) => {
     *     parser.meta(new Feeder(data.buffer)).then(
     *         result => meta = result
     *     )
     * });
     * // with syncronous readFileSync
     * parser.meta(
     *     new Feeder(fs.readFileSync('/some/path/to/file.sav').buffer)
     * ).then(
     *     parsed => meta = parsed
     * );
     * ```
     *
     * In the browser with a File API
     * ```
     *     <input type="file" onchange = "onChange(event)"></input>
     * ```
     * ```
     * const meta;
     * function onChange(event){
     *     const file = event.target.files[0];
     *     const reader = new FileReader();
     *     const parser = new SavParser();
     *     reader.onload = function(data){
     *         data.arrayBuffer().then(
     *             buffer => parser.meta(new Feeder(buffer))
     *         ).then(
     *             parsed => meta = parsed
     *         );
     *     }
     *     reader.readAsArrayBuffer(file);
     * }
     * ```
     * @return A promise resolving with a {@link Meta} object
     */
    public meta(feeder : Feeder) : Promise<Meta> {
        this.log.splice(0, this.log.length);
        const position = feeder.position();
        feeder.jump(0);
        return(
            new Promise<Meta>((resolve, reject) => {
                const chunk = feeder.next(176);
                const view = new DataView(chunk);
                const magic = this.decoder.decode(chunk.slice(0, 4));
                if (magic !== '$FL2'){
                    reject(new Error(
                        'File is not a sav. ' +
                        'Magic key Expected: "$FL2"; ' +
                        'Actual: ' + magic
                    ))
                }
                resolve({
                    product : this.decoder.decode(chunk.slice(4, 64)).trim(),
                    layout : view.getInt32(64, true),
                    variables : view.getInt32(68, true),
                    compression : view.getInt32(72, true),
                    weightIndex : view.getInt32(76, true),
                    cases : view.getInt32(80, true),
                    bias : view.getFloat64(84, true),
                    createdDate : this.decoder.decode(chunk.slice(92, 101)),
                    createdTime : this.decoder.decode(chunk.slice(101, 109)),
                    label : this.decoder.decode(chunk.slice(109, 173)).trim()
                })
            }).finally(() => feeder.jump(position))
        )
    }
    /**
     * Read the column header fields from a .sav file.
     * Header here refers to the head of the columns of the data, i.e.
     * properties of the variables in the data file
     * @param feeder A {@link Feeder} object encoding the sav file
     * @remarks
     * From a node.js {@link Buffer} using `fs.readFile`
     * ```
     * fs = require('fs');
     *
     * let headers;
     * const parser = new SavParser()
     * // with async readFile
     * fs.readFile('some/path/to/file.sav', (err, data) => {
     *     parser.headers(new Feeder(data.buffer)).then(
     *         result => headers = result
     *     )
     * });
     * // with syncronous readFileSync
     * parser.headers(
     *     new Feeder(fs.readFileSync('/some/path/to/file.sav').buffer)
     * ).then(
     *     parsed => headers = parsed
     * );
     * ```
     *
     * In the browser with a File API
     * ```
     *     <input type="file" onchange = "onChange(event)"></input>
     * ```
     * ```
     * const headers;
     * function onChange(event){
     *     const file = event.target.files[0];
     *     const reader = new FileReader();
     *     const parser = new SavParser();
     *     reader.onload = function(data){
     *         data.arrayBuffer().then(
     *             buffer => parser.headers(new Feeder(buffer))
     *         ).then(
     *             parsed => headers = parsed
     *         );
     *     }
     *     reader.readAsArrayBuffer(file);
     * }
     * ```
     * @return A promise resolving with an Array<{@link Meta}> object
     */
    public headers(feeder : Feeder) : Promise<Array<Header>> {
        this.log.splice(0, this.log.length);
        const position = feeder.position();
        feeder.jump(176);
        return(
            Promise.resolve(
                this.readFields(feeder)
            ).finally(() => feeder.jump(position))
        );
    }
    /**
     * Read all schema fields from a .sav file.
     * Schema here refers to all information except for the data cells themselves
     * @param feeder A {@link Feeder} object encoding the sav file
     * @remarks
     * From a node.js {@link Buffer} using `fs.readFile`
     * ```
     * fs = require('fs');
     *
     * let schema;
     * const parser = new SavParser()
     * // with async readFile
     * fs.readFile('some/path/to/file.sav', (err, data) => {
     *     parser.schema(new Feeder(data.buffer)).then(
     *         result => schema = result
     *     )
     * });
     * // with syncronous readFileSync
     * parser.schema(
     *     new Feeder(fs.readFileSync('/some/path/to/file.sav').buffer)
     * ).then(
     *     parsed => schema = parsed
     * );
     * ```
     *
     * In the browser with a File API
     * ```
     *     <input type="file" onchange = "onChange(event)"></input>
     * ```
     * ```
     * const schema;
     * function onChange(event){
     *     const file = event.target.files[0];
     *     const reader = new FileReader();
     *     const parser = new SavParser();
     *     reader.onload = function(data){
     *         data.arrayBuffer().then(
     *             buffer => parser.schema(new Feeder(buffer))
     *         ).then(
     *             parsed => schema = parsed
     *         );
     *     }
     *     reader.readAsArrayBuffer(file);
     * }
     * ```
     * @return A promise resolving with an {@link Schema} object
     */
    public schema(feeder : Feeder) : Promise<Schema> {
        this.log.splice(0, this.log.length);
        const position = feeder.position();
        return(
            this.meta(feeder).then(
                meta => ({
                    meta : meta
                })
            ).then(
                partial => {
                    feeder.jump(176);
                    return({
                        ...partial,
                        headers : this.readFields(feeder)
                    })
                }
            ).then(
                partial => ({
                    ...partial,
                    internal : this.readInternal(feeder)
                })
            ).finally(() => feeder.jump(position))
        );
    }
    /**
     * Read all fields from a .sav file.
     * All fields include the full {@link Schema} and all data cells as an
     * Array<{@link Row}.
     * @param feeder A {@link Feeder} object encoding the sav file
     * @remarks
     * From a node.js {@link Buffer} using `fs.readFile`
     * ```
     * fs = require('fs');
     *
     * let all;
     * const parser = new SavParser()
     * // with async readFile
     * fs.readFile('some/path/to/file.sav', (err, data) => {
     *     parser.all(new Feeder(data.buffer)).then(
     *         result => all = result
     *     )
     * });
     * // with syncronous readFileSync
     * parser.all(
     *     new Feeder(fs.readFileSync('/some/path/to/file.sav').buffer)
     * ).then(
     *     parsed => all = parsed
     * );
     * ```
     *
     * In the browser with a File API
     * ```
     *     <input type="file" onchange = "onChange(event)"></input>
     * ```
     * ```
     * const all;
     * function onChange(event){
     *     const file = event.target.files[0];
     *     const reader = new FileReader();
     *     const parser = new SavParser();
     *     reader.onload = function(data){
     *         data.arrayBuffer().then(
     *             buffer => parser.all(new Feeder(buffer))
     *         ).then(
     *             parsed => all = parsed
     *         );
     *     }
     *     reader.readAsArrayBuffer(file);
     * }
     * ```
     * @return A promise resolving with an {@link Parsed} object
     */
    public all(feeder : Feeder) : Promise<Parsed> {
        this.log.splice(0, this.log.length);
        const position = feeder.position();
        return(
            this.schema(feeder).then(
                schema => ({
                    ...schema,
                    rows : new DataReader(
                        schema,
                        feeder,
                        this.log
                    ).read()
                })
            ).finally(() => feeder.jump(position))
        );
    }
}

export type {Display, Scale, Header, Internal, Meta, Parsed, Row, Schema};
export {Savvy} from './dataset';