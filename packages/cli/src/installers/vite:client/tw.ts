import fs from "fs-extra";
import jsc from "jscodeshift";
import path from "path";
import { PKG_ROOT } from "~/consts.js";
import { Installer } from "../index.js";

export const tailwindInstaller: Installer<"vite:client"> = ({
  projectDir,
  projectName,
}) => {
  const twAssetDir = path.join(PKG_ROOT, "templates/vite:client/tw");

  const indexRoutePath = path.join(projectDir, "src/routes/index.tsx");
  const twIndexRoute = jsc(
    fs.readFileSync(path.join(twAssetDir, "routes/index.txt"), "utf-8"),
  );
  const indexRoute = jsc(fs.readFileSync(indexRoutePath, "utf-8"));

  indexRoute
    .find(
      jsc.ImportDeclaration,
      (id) => id.source.value === "./index.module.css",
    )
    .remove();

  indexRoute
    .find(jsc.FunctionDeclaration, (fd) => fd.id?.name === "Home")
    .find(jsc.ReturnStatement)
    .replaceWith(
      jsc.returnStatement(
        jsc.parenthesizedExpression(
          twIndexRoute.find(jsc.Program).get("body", 0).node.expression,
        ),
      ),
    );

  const twCfgSrc = path.join(twAssetDir, "tailwind.config.cjs");
  const twCfgDest = path.join(projectDir, "tailwind.config.cjs");

  const postcssCfgSrc = path.join(twAssetDir, "postcss.config.cjs");
  const postcssCfgDest = path.join(projectDir, "postcss.config.cjs");

  const prettierSrc = path.join(twAssetDir, "prettier.config.cjs");
  const prettierDest = path.join(projectDir, "prettier.config.cjs");

  const cssSrc = path.join(twAssetDir, "styles/globals.css");
  const cssDest = path.join(projectDir, "src/styles/globals.css");

  const indexModuleCss = path.join(projectDir, "src/routes/index.module.css");

  fs.copySync(twCfgSrc, twCfgDest);
  fs.copySync(postcssCfgSrc, postcssCfgDest);
  fs.copySync(cssSrc, cssDest);
  fs.unlinkSync(indexModuleCss);
  fs.copySync(prettierSrc, prettierDest);

  fs.writeFileSync(indexRoutePath, indexRoute.toSource());
};
