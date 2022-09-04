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

  for (i of file.projects) {
    console.log("Compiling '%s' -> '%s'", i.path, i.out);

    if (!i.path.endsWith(".js")) {
      console.error("error: File does not end in JS! Skipping...");
      continue;
    }

    const data = compile(i.path);
    
    const dirPath = i.out.split("/");
    dirPath.pop();

    try {
      await Deno.mkdir(dirPath, { recursive: true });
    } catch (e) {
      console.warn("WARN <Step::Mkdir>:", e);
    }

    await Deno.writeTextFile(i.out, data);
  }
} else {
  console.error("error: Invalid file type!");
}