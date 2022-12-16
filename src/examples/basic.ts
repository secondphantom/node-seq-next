import SeqNext from "../index";

const delay = (ms: number, res?: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res);
    }, ms);
  });
};

// basic
const basicFn = async () => {
  // Set prev or init value
  // don't set primitive value at prev
  const seqNext = new SeqNext({ initPrev: { data: 1, etc: 1 } });
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

      ret(prev);
      // If not add execute next() return prev.
    }
  );

  console.log("Basic Eg. result:", result);
  /* 	
		Basic: { data: 1, etc: 1 }
		Basic: { data: 2, etc: 1 }
		Basic Eg. result: { data: 4, etc: 1 }
		Basic: delayed
		Basic Eg. result: { data: 3, etc: 1 } 
	*/
};

// path
const pathFn = async () => {
  const seqNext = new SeqNext({ initPrev: { data: 1, etc: 1 } });

  // root is basic path if not set seq Fn run root path
  seqNext.path(
    "root",
    (prev, ret, next) => {
      console.log("Root:", prev);
      prev.data = ++prev.data;
    },
    (prev, ret, next) => {
      console.log("Root:", prev);
      prev.data = ++prev.data;
      // you can route other path fn
      if (prev.data) {
        next("otherPath");
      }
    },
    (prev, ret, next) => {
      // It will be optionally run
      console.log("Root:", "optional running");
      prev.data = ++prev.data;
    }
  );

  seqNext.path(
    "otherPath",
    (prev, ret, next) => {
      console.log("OtherPath:", prev);
      prev.data = ++prev.data;
    },
    async (prev, ret, next) => {
      console.log("OtherPath:", prev);
      prev.data = ++prev.data;
    }
  );

  // If not input seq Fn value run basic root
  const result = await seqNext.seq();
  console.log("Path result", result);
  /* 
		Root: { data: 1, etc: 1 }
		Root: { data: 2, etc: 1 }
		OtherPath: { data: 3, etc: 1 }
		OtherPath: { data: 4, etc: 1 }
		Path result { data: 5, etc: 1 } 
	*/
};

// immediately return
const returnFn = async () => {
  const seqNext = new SeqNext({ initPrev: { data: 1, etc: 1 } });
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
};

(async () => {
  await basicFn();
  console.log("-------------------------------------");
  await pathFn();
  console.log("-------------------------------------");
  await returnFn();

  /* 
		Basic: { data: 1, etc: 1 }
		Basic: { data: 2, etc: 1 }
		Basic: { data: 3, etc: 1 }
		Basic: delayed
		Basic Eg. result: { data: 4, etc: 1 }
		-------------------------------------
		Root: { data: 1, etc: 1 }
		Root: { data: 2, etc: 1 }
		OtherPath: { data: 3, etc: 1 }
		OtherPath: { data: 4, etc: 1 }
		Path result { data: 5, etc: 1 }
		-------------------------------------
		Return: { data: 1, etc: 1 }
		Return Eg. result: immediately value 
	*/
})();
