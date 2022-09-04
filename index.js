import { exists } from "https://deno.land/std@0.154.0/fs/exists.ts";
import { compile } from "./libq.js";

const path = Deno.args[0];

if (!path) {
  console.error("error: File not specified.")
  Deno.exit(1);
}

if (!await exists(path)) {
  console.error("error: File does not exist!");
}

if (path.endsWith(".js")) {
  const data = compile(path);

  await Deno.writeTextFile("a.out.js", data)
} else if (path.endsWith(".json")) {
  const file = JSON.parse(await Deno.readTextFile(path));

  for (const i of file.projects) {
    console.log("Compiling '%s' -> '%s'", i.path, i.out);

    const data = typeof i.type == "string" && i.type == "static" ? await Deno.readTextFile(i.path) : compile(i.path);
    
    const dirPath = i.out.split("/");
    dirPath.pop();

    try {
      await Deno.mkdir(dirPath.join("/"), { recursive: true });
    } catch (e) {
      console.warn("WARN <Step::Mkdir>:", e);
    }

    try {
      await Deno.writeTextFile(i.out, data);
    } catch (e) {
      console.error("ERR <Step::Write>:", e);
    }
    
  }
} else {
  console.error("error: Invalid file type!");
}