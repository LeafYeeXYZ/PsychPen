export interface Meta {
    /** A 60-byte identifier of the SPSS version */
    product : string,
    /** File layout code */
    layout : number,
    /** The number of internal columns, not the actual count.
     * The displayed columns are often broken up into many internal columns,
     * so this number will be larger than the actual number of columns
     */
    variables : number,
    /** compression indicator. Should be 1 for this parser to work. Uncompressed
     * parser not yet supported
     */
    compression : number,
    /** case-weight variable index or 0 (none) or -1 (unknown) */
    weightIndex : number,
    /** the number of rows of data */
    cases : number,
    /** compression bias */
    bias : number,
    /** file creation data as fixed length string */
    createdDate : string,
    /** file creation time as fixed length string */
    createdTime : string,
    /** file label */
    label : string
}

export interface Header {
    /** byte index of start of header in raw file */
    start : number,
    /** 0 for numeric, 1-255 for strings (for length)
     * Each internal variable can only be up to 255 bytes long
     * and longer displayed columns are created by the concatenation of many
     * internal columns. These concatenation columns are marked with a code
     * -1, but these are never returned by savvy
     */
    code : number,
    /** A unique identifier for the column */
    name : string,
    /** A label for the column name */
    label : string,
    /** missingness indicators for the column */
    missing : {
        /** a set of values that represent a missing number */
        codes : Array<number>,
        /** a set of values that represent a missing string */
        strings : Array<string>,
        /** a range of numbers [min, max] to indicate a missing region */
        range : [number, number]
    },
    trailers : number
}

/** Scale levels and labels */
export interface Scale {
    /** key-value pairs for underlying numeric value and string label */
    map : Map<number, string>,
    /** a set of column indices which these scale labels apply to */
    indices : Set<number>
}

/** display parameters for a column */
export interface Display {
    /** 1 = nominal; 2 = ordinal; 3 = scale */
    type : 1 | 2 | 3,
    width : number,
    align : 0 | 1 | 2
}

export interface Internal {
    float : {
        missing : number,
        high : number,
        low : number
    },
    integer : {
        major : number,
        minor : number,
        revision : number,
        machine : number,
        float : number,
        compression : number,
        endianness : number,
        character : number
    },
    display : Array<Display>,
    documents : Array<Array<string>>,
    names : Map<string, string>,
    levels : Array<Scale>,
    longs : Map<string, number>,
    extra : Array<ArrayBuffer>,
    unrecognized : Array<[number, Array<ArrayBuffer>]>,
    finished : number
}

export interface Schema {
    meta : Meta,
    headers : Array<Header>,
    internal : Internal
}

export type Row = Map<string, string | number | boolean>;

export interface Parsed extends Schema {
    rows : Array<Row>
}