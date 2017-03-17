var str = "\'la'";
console.log(str);
var result = str
   .replace(/\\/g, "\\\\")
   .replace(/\$/g, "\\$")
   .replace(/'/g, "\\'")
   .replace(/"/g, "\\\"");

console.log(result);
