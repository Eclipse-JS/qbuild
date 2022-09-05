const os = require("os");
const fs = require("fs");

function stringParser(str) {
  return str.split(str[0])[1];
}

function compile(path, disableWelcome) {
  const rootPathArr = path.split("/");
  rootPathArr.pop();

  const rootPath = rootPathArr.join("/");

  const file = fs.readFileSync(path, "utf-8");

  const fileSplit = file.split("\n");
  let isRegularRequireEnabled = false;

  let newLines = disableWelcome ? [] : ["// Compiled by QBuild", "// https://github.com/greysoh/qbuild :3", ""];

  for (const file of fileSplit) {
    const trim = file.trim();
    const newDelimiter = isRegularRequireEnabled ? "require(" : "qb.require(";

    if (trim.startsWith("qb")) {
      newLines.push("// QBuild Omitted: " + file);

      if (trim.startsWith("qb.enableRegularRequire()")) {
        isRegularRequireEnabled = true;
      }
    } else if (trim.includes(newDelimiter)) {
      const rawCommand = newDelimiter + trim.split(newDelimiter)[1].split(")")[0] + ")";
      
      const line = rawCommand.split("(")[1].split(")")[0];
      const path = stringParser(line).replace("./", "/");

      const newPath = rootPath + path;
      
      const compiled = file.replace(rawCommand, compile(newPath, true));
      newLines.push(compiled);
    } else {
      newLines.push(file);
    }
  }

  return newLines.join("\n");
}

module.exports = compile;

if (require.main == module) {
  const path = process.argv[2];

  if (!path) {
    console.error("error: File not specified.")
    process.exit(1);
  }
  
  if (!fs.existsSync(path)) {
    console.error("error: File does not exist!");
  }
  
  if (path.endsWith(".js")) {
    const data = compile(path);
  
    fs.writeFileSync("a.out.js", data)
  } else if (path.endsWith(".json")) {
    const file = JSON.parse((path));
  
    for (const i of file.projects) {
      console.log("Compiling '%s' -> '%s'", i.path, i.out);
  
      const data = typeof i.type == "string" && i.type == "static" ? fs.readFileSync(i.path) : compile(i.path);
      
      const dirPath = i.out.split("/");
      dirPath.pop();
  
      try {
        fs.mkdirSync(dirPath.join("/"), { recursive: true });
      } catch (e) {
        console.warn("WARN <Step::Mkdir>:", e);
      }
  
      try {
        fs.writeFileSync(i.out, data);
      } catch (e) {
        console.error("ERR <Step::Write>:", e);
      }
      
    }
  } else {
    console.error("error: Invalid file type!");
  }
}