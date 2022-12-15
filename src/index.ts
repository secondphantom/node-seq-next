export type Prev = {
  data: any;
  [key: string]: any;
};

export type SeqFn<T> = (
  prev: T,
  ret: ReturnFn,
  next: NextFn,
  branch?: string
) => Promise<any> | any;

export type NextFn = (path?: string) => void;

export type ReturnFn = (val: any) => void;

export type IterPath = {
  [key: string]: IterableIterator<any>;
};
type AnyObj = {
  [key: string]: any;
};

export type ExtendData<T> = AnyObj & {
  [key in keyof T]: any;
};

export default class SeqNext<T extends { [key: string]: any } = Prev> {
  private iterPath: IterPath = {};
  private curIter: IterableIterator<any> = [][Symbol.iterator]();
  prev: T | undefined;
  private isRetExist = false;
  private cur: any;
  static NextFn: any;

  constructor(data?: T) {
    if (data) {
      this.prev = data;
    }
  }

  seq = async <TS extends { [key: string]: any } = T, R = Promise<TS>>(
    data?: TS | SeqFn<ExtendData<TS>>,
    ...iterable: SeqFn<ExtendData<TS>>[]
  ) => {
    if (!data) {
      if (!this.iterPath["root"]) throw new Error("need root path");
      this.curIter = this.iterPath["root"];
      if (!this.prev) this.prev = { data: null } as any as T;
      return this.next() as R;
    }
    if (
      data.constructor.name === "AsyncFunction" ||
      data.constructor.name === "Function"
    ) {
      this.curIter = [data, ...iterable][Symbol.iterator]();
      if (!this.prev) this.prev = { data: null } as any as T;
      return this.next() as R;
    }

    this.prev = data as any as T & { [key: string]: any };

    if (iterable.length == 0) {
      if (!this.iterPath["root"]) throw new Error("need root path");
      this.curIter = this.iterPath["root"];
      return this.next() as R;
    }
    this.curIter = iterable[Symbol.iterator]();
    return this.next() as R;
  };

  path = <TP extends { [key: string]: any } = T>(
    path: string,
    ...iterable: SeqFn<ExtendData<TP>>[]
  ) => {
    if (this.iterPath[path]) throw new Error("path need to be unique");

    this.iterPath[path] = iterable[Symbol.iterator]();
  };

  private next = () => {
    this.cur = this.curIter.next();
    const asyncNext = (): any => {
      if (this.isRetExist) return this.prev;
      if (this.cur.done) return this.prev;
      if (this.cur.value.constructor.name === "AsyncFunction") {
        return this.cur.value(this.prev, this.ret, this.nextPath)?.then(() => {
          return this.next();
        });
      } else {
        this.cur.value(this.prev, this.ret, this.nextPath);
        return this.next();
      }
    };
    return asyncNext();
  };

  private nextPath = (path?: string) => {
    if (path) this.curIter = this.iterPath[path];
  };

  private ret = (val: any) => {
    this.isRetExist = true;
    this.prev = val;
  };
}
