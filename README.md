
# SeqNext

SeqNext is a library that can sequentially execute fn combined with previous values.

SeqNext는 이전 값과 함께 결합된 fn을 순차적으로 실행할 수 있는 라이브러리 입니다.

<!-- > These docs have been translated into [English](./README_EN.md). -->

## Table of contents
- [SeqNext](#seqnext)
	- [Table of contents](#table-of-contents)
	- [Usage](#usage)
		- [Set Previous Value](#set-previous-value)
		- [`.seq(data?, seqFn()[])`](#seqdata-seqfn)
		- [`.path(path:string, seqFn[])`](#pathpathstring-seqfn)
		- [`seqFn(prev, ret(), next())`](#seqfnprev-ret-next)
			- [`prev`](#prev)
			- [`ret(value)`](#retvalue)
			- [`next(path?)`](#nextpath)
	- [Examples](#examples)
		- [Create Sequence Fn](#create-sequence-fn)
		- [Create Path](#create-path)
		- [Immediately Return](#immediately-return)

<!-- ## Installation

### From `npm` 
```sh
npm install seq-next       # npm
``` -->
## Usage
### Set Previous Value
```ts
//set primitive value at prev
const seqNext = new SeqNext({ data: 1, etc: 1 });
seqNext.prev = { data: 1, etc: 1 };
const result = await seqNext.seq({ data: 1, etc: 1 },) 
```
### `.seq(data?, seqFn()[])`
Use .seq run sequentially run Fn ans Async Fn.

```ts
await seqNext.seq(
	(prev, ret, next) => {
		console.log("Basic:", prev);
		prev.data = ++prev.data;
	},
	async (prev, ret, next) => {
		console.log("Basic:", prev);
		prev.data = ++prev.data;
	},
)
// run root path
await seqNext.seq()
```
### `.path(path:string, seqFn[])`
Use .path register sequentially run Fn ans Async Fn.
```ts
seqNext.path(
	"pathName", // path name required
	(prev, ret, next) => {
		console.log("Path:", prev);
		prev.data = ++prev.data;
	},
	async (prev, ret, next) => {
		console.log("Path:", prev);
		prev.data = ++prev.data;
	},
)
await seqNext.seq(
	(prev, ret, next) => {
		console.log("Basic:", prev);
		prev.data = ++prev.data;
		// run path fn
		next("pathName")
	},
	// didn't run fn below
	async (prev, ret, next) => {
		console.log("Basic:", prev);
		prev.data = ++prev.data;
	},
)
```
### `seqFn(prev, ret(), next())`
```ts
await seqNext.seq(
	{data: "first"}
	// seqFn()
	(prev, ret, next) => {
		// you can access previous data
		console.log(prev.data);// "first"
		prev.setValue = "setValue"
		// automatically run next() so next() is optional
		
	},
	// support async
	async (prev, ret, next) => {
		console.log(prev.setValue);// "setValue"
		ret(1) // immediately return value
	},
)
```
#### `prev`
Can access previous data.
#### `ret(value)`
Immediately return value.
#### `next(path?)`
Run next sequence fn default is automatically run.<br>
If input `path` value run registered path fn.



## Examples
### Create Sequence Fn
```ts
// basic
(async () => {
  // Set prev or init value
  // don't set primitive value at prev
  const seqNext = new SeqNext({ data: 1, etc: 1 });
  seqNext.prev = { data: 1, etc: 1 };

  // run sequence
  const result = await seqNext.seq(
    { data: 1, etc: 1 }, // set prev value is optional
    (prev, ret, next) => {
      console.log("Basic:", prev);
      prev.data = ++prev.data;
      // next() Fn is optional automate run next() Fn
    },
    (prev, ret, next) => {
      console.log("Basic:", prev);
      prev.data = ++prev.data;
      next();
    },
    // support async
    async (prev, ret, next) => {
      console.log("Basic:", prev);
      console.log("Basic: delayed");
      await delay(1000);
      prev.data = ++prev.data;
      // If not add execute next() return prev.
    }
  );

  console.log("Basic Eg. result:", result);
  /* 	
		Basic: { data: 1, etc: 1 }
		Basic: { data: 2, etc: 1 }
		Basic: { data: 3, etc: 1 }
		Basic: delayed
		Basic Eg. result: { data: 3, etc: 1 } 
	*/
})();
```
### Create Path
```ts
// basic
(async () => {
  // Set prev or init value
  // don't set primitive value at prev
  const seqNext = new SeqNext({ data: 1, etc: 1 });
  seqNext.prev = { data: 1, etc: 1 };

  // run sequence
  const result = await seqNext.seq(
    { data: 1, etc: 1 }, // set prev value is optional
    (prev, ret, next) => {
      console.log("Basic:", prev);
      prev.data = ++prev.data;
      // next() Fn is optional automate run next() Fn
    },
    (prev, ret, next) => {
      console.log("Basic:", prev);
      prev.data = ++prev.data;
      next();
    },
    // support async
    async (prev, ret, next) => {
      console.log("Basic:", prev);
      console.log("Basic: delayed");
      await delay(1000);
      prev.data = ++prev.data;
      // If not add execute next() return prev.
    }
  );

  console.log("Basic Eg. result:", result);
  /* 	
		Basic: { data: 1, etc: 1 }
		Basic: { data: 2, etc: 1 }
		Basic: { data: 3, etc: 1 }
		Basic: delayed
		Basic Eg. result: { data: 3, etc: 1 } 
	*/
})();
```
### Immediately Return
```ts
// immediately return
(async () => {
  const seqNext = new SeqNext({ data: 1, etc: 1 });
  const result = await seqNext.seq(
    (prev, ret, next) => {
      console.log("Return:", prev);
      prev.data = ++prev.data;
      // return immediately value
      ret("immediately value");
      // next() not is executed but If place next() above ret() will executing
      next();
    },
    (prev, ret, next) => {
      // didn't fun fn below
      console.log("Return:", prev);
      prev.data = ++prev.data;
    }
  );

  console.log("Return Eg. result:", result);
  /* 
		Return: { data: 1, etc: 1 }
		Return Eg. result: immediately value 
	*/
})();
```




