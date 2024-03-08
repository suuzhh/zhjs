const loader = new zhjs.ModuleLoader();

console.log('circular reference', loader);
const modAPath = "./example/a.js";
const modBPath = "./example/b.js";
const modCPath = "./example/c.js";
loader.define("a", modAPath, ["b"]);
loader.define("b", modBPath, ["c"]);
loader.define("c", modCPath, ["d"]);
loader.define("d", modBPath, ["e"]);
loader.define("e", modBPath, ['a']);

loader.require(["a"]).then(() => {
  console.log('circular reference done');
});