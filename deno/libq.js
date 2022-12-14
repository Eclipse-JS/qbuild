function stringParser(str) {
  return str.split(str[0])[1];
}

export function compile(path, disableWelcome) {
  const rootPathArr = path.split("/");
  rootPathArr.pop();

  const rootPath = rootPathArr.join("/");

  const file = Deno.readTextFileSync(path);

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