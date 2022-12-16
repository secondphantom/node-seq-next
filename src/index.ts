export type Prev<T = any> = {
  data: T;
  [key: string]: any;
};

export type SeqFn<T = any, P = string> = (
  prev: T,
  ret: ReturnFn,
  next: NextFn<P>
) => Promise<any> | any;

export type NextFn<T = string> = (path?: T) => void;

export type ReturnFn = (val?: any) => void;

export type IterPath<T extends string | number | symbol> = {
  [key in T]: Array<any> | IterableIterator<any>;
};
type AnyObj = {
  [key: string]: any;
};

export type ExtendData<T> = AnyObj & {
  [key in keyof T]: any;
};

export default class SeqNext<
  T extends { [key: string]: any } = Prev,
  P = string
> {
  private iterPath: IterPath<string> = {};
  private curIter: IterableIterator<any> = [][Symbol.iterator]();
  prev: T | undefined;
  autoReset = true;
  private isRetExist = false;
  private cur: any;
  static NextFn: any;

  constructor(options?: { initPrev?: T; autoReset?: boolean }) {
    if (options && options.initPrev) {
      this.prev = options.initPrev;
    }
    if (options) {
      this.autoReset =
        options.autoReset === undefined ? true : options.autoReset;
    }
  }

  seq = async <TS extends { [key: string]: any } = T, R = Promise<TS>>(
    data?: TS | SeqFn<TS, P>,
    ...iterable: SeqFn<ExtendData<TS>, P>[]
  ) => {
    this.isRetExist = false;

    if (!data) {
      if (!this.iterPath["root"]) throw new Error("need root path");
      this.curIter = this.iterPath["root"][Symbol.iterator]();
      if (!this.prev) this.prev = { data: {} } as any as T;
      return this.next() as R;
    }
    if (
      data.constructor.name === "AsyncFunction" ||
      data.constructor.name === "Function"
    ) {
      this.curIter = [data, ...iterable][Symbol.iterator]();
      if (!this.prev) this.prev = { data: {} } as any as T;
      return this.next() as R;
    }

    this.prev = data as any as T & { [key: string]: any };

    if (iterable.length == 0) {
      if (!this.iterPath["root"]) throw new Error("need root path");
      this.curIter = this.iterPath["root"][Symbol.iterator]();
      return this.next() as R;
    }
    this.curIter = iterable[Symbol.iterator]();
    return this.next() as R;
  };

  path = <TP extends { [key: string]: any } = T>(
    path: P,
    ...iterable: SeqFn<ExtendData<TP>, P>[]
  ) => {
    if (this.iterPath[path as string])
      throw new Error("path need to be unique");
    if (this.autoReset) {
      this.iterPath[path as string] = iterable;
      return;
    }
    this.iterPath[path as string] = iterable[Symbol.iterator]();
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
    if (path) this.curIter = this.iterPath[path][Symbol.iterator]();
  };

  private ret = (val?: any) => {
    this.isRetExist = true;
    this.prev = val;
  };
}
