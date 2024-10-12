import { Parsed, Row } from "./types";

/**
 * An tabular object with rows and columns and cells values of either
 * number, string, or boolean
 */
export interface DataSet {
    /** The number of cases */
    n : number,
    /** keys of columns */
    keys : Array<string>,
    /** The names of the columns */
    names : Map<string, string>,
    /** The map of unique column names to descriptive labels */
    labels : Map<string, string>,
    /**
     * Get a single row of data as a {@link Map} dictionary of key-values
     * @param index the row index
     * @returns a {@link Row}
     */
    row(index : number) : Row,
    /**
     * Get a single column of data as an Array
     * @param key the key of the column
     * @returns an Array of either numbers, strings or booleans
     */
    col(key : string) : Array<number> | Array<string> | Array<boolean>
    /**
     *
     * @param index row index
     * @param keys column key
     * @returns a string number or boolean at the cell address
     */
    cell(index : number, key : string) : string | number | boolean
    /**
     * Subset the object by row and/or column identifiers
     * @param indices an optional Array of row indices
     * @param keys an optional Array of column names
     * @returns a subset {@link DataSet}
     */
    view(indices? : Array<number>, keys? : Array<string>) : DataSet
}

abstract class Column<U extends number | string | boolean, T extends U | string = U> {
    protected parent : Savvy;
    protected key : string;
    protected nulls : Set<U>;
    constructor(parent : Savvy, key : string, nulls : Set<U>) {
        this.parent = parent;
        this.key = key;
        this.nulls = nulls;
    }
    public abstract cast(value : U) : T;
    public abstract measure : 'nominal' | 'ordinal' | 'scale' | 'null';
    public abstract levels : Map<U, T>;
    public raw() : Array<U> {
        return(
            (new Array(this.parent.n)).fill(0).map(
                (_, idx) => this.parent.cell(idx, this.key, false) as U
            )
        )
    }
    public get values() : Array<T> {
        return(this.raw().map(value => this.cast(value)));
    }
    public exists() : boolean {
        return(true);
    }
    public get name() : string {
        return(this.parent.names.get(this.key) ?? this.key);
    }
    public get label() : string {
        return(this.parent.labels.get(this.key) ?? '');
    }
    public get missing() : Set<U> {
        return(new Set(this.nulls));
    }
    public set missing(nulls : Set<U>) {
        this.nulls = new Set(nulls);
    }
    public ismissing(value : U) : boolean {
        return(this.nulls.has(value));
    }
}

class NullColumn extends Column<boolean> {
    constructor(parent : Savvy) {
        super(parent, '<NULL>', new Set());
    }
    public exists() : boolean {
        return(false);
    }
    public raw() : Array<boolean> {
        return((new Array(this.parent.n)).fill(null));
    }
    public get values() : Array<boolean> {
        return((new Array(this.parent.n)).fill(null));
    }
    public cast(value : boolean) : boolean {
        return(null);
    }
    public get measure() : 'null' {
        return('null');
    }
    public get levels() : Map<boolean, boolean> {
        return(new Map());
    }
}

class StrColumn extends Column<string> {
    public cast(value : string) : string {
        return(this.ismissing(value) ? null : value);
    }
    public get measure() : 'nominal' {
        return('nominal');
    }
    public get levels() : Map<string, string> {
        return(new Map());
    }
}

class FacColumn extends Column<number, string> {
    private _levels : Map<number, string>;
    private type : number;
    constructor(
        parent : Savvy,
        key : string,
        levels : Map<number, string>,
        nulls : Set<number>,
        type : number
    ){
        super(parent, key, nulls);
        this._levels = levels;
        this.type = type;
    }
    public cast(value : number) : string {
        return(this.ismissing(value) ? null : this._levels.get(value))
    }
    public get measure() : 'nominal' | 'ordinal' | 'scale' {
        switch(this.type){
            case 3: return('scale');
            case 2: return('ordinal');
            default: return('nominal');
        }
    }
    public get levels() : Map<number, string> {
        return(new Map([...this._levels]));
    }
    public set levels(levels : Map<number, string>) {
        levels.forEach((value, key) => {
            if (this._levels.has(key)) {
                this._levels.set(key, value);
            }
        });
    }
}

class NumColumn extends Column<number> {
    private nullrange : [number, number];
    private type : number;
    constructor(
        parent : Savvy,
        key : string,
        nulls : Set<number>,
        nullrange : [number, number],
        type : number
    ){
        super(parent, key, nulls);
        this.nullrange = nullrange;
        this.type = type;
    }
    public cast(value : number) : number {
        return(this.ismissing(value) ? null : value);
    }
    public get measure() : 'ordinal' | 'scale' {
        switch(this.type){
            case 2: return('ordinal');
            default: return('scale');
        }
    }
    public get levels() : Map<number, number> {
        return(new Map());
    }
    public ismissing(value : number) : boolean {
        return(
            this.nulls.has(value) || (
                value > this.nullrange[0] &&
                value < this.nullrange[1]
            )
        )
    }
}

class View implements DataSet {
    private parent : Savvy;
    private indices : Array<number>;
    private _keys : Array<string>;
    constructor(parent : Savvy, indices : Array<number>, keys : Array<string>){
        this.parent = parent;
        this.indices = indices?.slice() ?? new Array(parent.n).fill(0).map((_, idx) => idx);
        this._keys = keys?.slice() ?? Array.from(parent.names.keys());
    }
    public get n() : number {
        return(this.indices.length);
    }
    public get keys() : Array<string> {
        return([...this._keys]);
    }
    public get names() : Map<string, string> {
        const names = this.parent.names;
        return(
            new Map(this.keys.map(key => [key, names.get(key) ?? key]))
        )
    }
    public get labels() : Map<string, string> {
        const labels = this.parent.labels;
        return(
            new Map(this.keys.map(key => [key, labels.get(key) ?? '']))
        )
    }
    public row(index : number) : Row {
        return(this.parent.row(this.indices[index]));
    }
    public col(key : string) : Array<string> | Array<number> | Array<boolean> {
        const all = this.parent.col(key);
        return(
            this.indices.map(index => all[index])
        ) as Array<string> | Array<number> | Array<boolean>;
    }
    public cell(index : number, key : string) : string | number | boolean {
        return(this.parent.cell(this.indices[index], key));
    }
    public view(indices : Array<number>, keys : Array<string>) : DataSet {
        return(
            new View(
                this.parent,
                indices.map(index => this.indices[index]),
                keys
            )
        )
    }
}

/**
 * A DataSet subclass that can be constructed from a {@link Parsed} object
 */
export class Savvy implements DataSet {
    private cases : number;
    private data : Array<Row>;
    private overflows : Map<string, Array<string>>;
    private fields : Map<string, Column<string | number | boolean>>;
    private _names : Map<string, string>;
    private _labels : Map<string, string>;
    /**
     *
     * @param parsed a {@link Parsed} object generated with a {@link SavParser}
     */
    constructor(parsed : Parsed) {
        this.cases = parsed.meta.cases;
        this._names = parsed.internal.names;
        this.data = parsed.rows;
        const levels = new Map(
            parsed.headers.map(header => [header.name, new Map()])
        );
        let cursor = 0;
        const indexmap = new Map(parsed.headers.map((header, idx) => {
            const offset = cursor + 1;
            cursor++;
            cursor += header.trailers;
            return([offset, idx]);
        }));
        parsed.internal.levels.forEach(
            entry => entry.indices.forEach(
                index => indexmap.has(index) && levels.set(
                    parsed.headers[indexmap.get(index)].name,
                    entry.map
                )
            )
        );
        this.fields = new Map();
        this.overflows = new Map();
        this._labels = new Map();
        let j : number = 0;
        for (let i = 0; i < parsed.headers.length; i++){
            j = i;
            const header = parsed.headers[i];
            this._labels.set(header.name, header.label);
            if (header.code){
                const overflow : Array<string> = [];
                if (parsed.internal.longs.has(header.name)) {
                    let segs = Math.floor(parsed.internal.longs.get(header.name) / 252);
                    while (segs > 0) {
                        segs -= 1;
                        overflow.push(parsed.headers[++i].name);
                    }
                }
                this.overflows.set(header.name, overflow);
                this.fields.set(
                    header.name,
                    new StrColumn(
                        this,
                        header.name,
                        new Set(header.missing.strings)
                    )
                );
            } else {
                if (levels.get(header.name)?.size) {
                    this.fields.set(
                        header.name,
                        new FacColumn(
                            this,
                            header.name,
                            levels.get(header.name),
                            new Set(header.missing.codes),
                            parsed.internal.display[j].type
                        )
                    )
                } else {
                    this.fields.set(
                        header.name,
                        new NumColumn(
                            this,
                            header.name,
                            new Set(header.missing.codes),
                            header.missing.range,
                            parsed.internal.display[j].type
                        )
                    )
                }
            }
        }
    }
    public get n() : number {
        return(this.cases);
    }
    public get keys() : Array<string> {
        return(Array.from(this.fields.keys()));
    }
    /**
     * A map of of unique column keys to variable names
     */
    public get names() : Map<string, string> {
        return(new Map([...this._names]))
    }
    public set names(names : Map<string, string>) {
        names.forEach((value, key) => {
            if (this._names.has(key)) {
                this._names.set(key, value);
            }
        });
    }
    /**
     * A map of of unique column keys to longer labels
     */
    public get labels() : Map<string, string> {
        return(new Map([...this._labels]));
    }
    public set labels(labels : Map<string, string>) {
        labels.forEach((value, key) => {
            if (this._labels.has(key)) {
                this._labels.set(key, value);
            }
        });
    }
    public row(index : number, cast : boolean = true) : Row {
        const row = new Map();
        this.keys.forEach(key => row.set(key, this.cell(index, key, cast)));
        return(row);
    }
    public field(key : string) : Column<string | number | boolean> {
        return(this.fields.get(key) ?? new NullColumn(this))
    }
    public col(key : string, cast : boolean = true) : Array<number> | Array<string> | Array<boolean> {
        return(
            (new Array(this.n).fill(0).map(
                (_, idx) => this.cell(idx, key, cast))
            ) as Array<number> | Array<string> | Array<boolean>
        )
    }
    public cell(index : number, key : string, cast : boolean = true) : number | string | boolean {
        const field = this.field(key);
        const row = this.data[index];
        let raw = row.get(key);
        this.overflows.get(key)?.forEach(overflow => {
            raw = raw.toString() + (row.get(overflow) ?? '')
        })
        return(cast ? field.cast(raw) : raw)
    }
    public view(indices? : Array<number>, fields? : Array<string>) : DataSet {
        return(
            new View(
                this,
                indices,
                fields
            )
        )
    }
}