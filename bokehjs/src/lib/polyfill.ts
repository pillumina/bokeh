declare function require(moduleName: string): any

require("es5-ext/object/assign/implement")
require("es5-ext/number/is-integer/implement")
require("es5-ext/string/#/repeat/implement")
require("es5-ext/array/from/implement")
require("es5-ext/math/log10/implement")
require("es6-set/implement")
require("es6-map/implement")
require("es6-weak-map/implement")

if (typeof Promise === "undefined") {
  require("es6-promise").polyfill()
}

// fixes up a problem with some versions of IE11
// ref: http://stackoverflow.com/questions/22062313/imagedata-set-in-internetexplorer
if (typeof CanvasPixelArray !== "undefined") {
  CanvasPixelArray.prototype.set = function(this: any, arr: any[]): void {
    for (let i = 0; i < this.length; i++) {
      this[i] = arr[i]
    }
  }
}
