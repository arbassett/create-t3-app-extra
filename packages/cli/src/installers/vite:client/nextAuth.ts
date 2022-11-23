import path from "path";
import fs from "fs-extra";
import jsc from "jscodeshift";
import { PKG_ROOT } from "~/consts.js";
import { Installer } from "../index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import { getObjectProperties } from "../utils.js";

export const nextAuthInstaller: Installer<"vite:client"> = ({
  projectDir,
  packages,
}) => {
  addPackageDependency({
    projectDir,
    dependencies: ["next-auth"],
    devMode: false,
  });

  const nextAuthAssetDir = path.join(
    PKG_ROOT,
    "templates/vite:client/nextAuth",
  );

  const appPath = path.join(projectDir, "src/App.tsx");
  const appFile = jsc(fs.readFileSync(appPath, "utf-8"));

  appFile
    .find(jsc.ImportDeclaration)
    .filter((path) => path.node.source.value === "@tanstack/react-router")
    .insertAfter(
      jsc.importDeclaration(
        [jsc.importSpecifier(jsc.identifier("SessionProvider"))],
        jsc.stringLiteral("next-auth/react"),
      ),
    );

  appFile
    .find(jsc.VariableDeclarator)
    .filter(
      (vd) => vd.node.id.type === "Identifier" && vd.node.id.name === "App",
    )
    .findJSXElements()
    .at(0)
    .forEach((jsx) => {
      const wrappedJsx = jsc.jsxElement(
        jsc.jsxOpeningElement(jsc.jsxIdentifier("SessionProvider"), []),
        jsc.jsxClosingElement(jsc.jsxIdentifier("SessionProvider")),
        [jsc.jsxElement.from(jsx.value)],
      );
      jsc(jsx).replaceWith(jsc.parenthesizedExpression(wrappedJsx));
    });

  const viteConfigPath = path.join(projectDir, "vite.config.ts");
  const viteCOnfigFile = jsc(fs.readFileSync(viteConfigPath, "utf-8"));

  viteCOnfigFile
    .find(
      jsc.CallExpression,
      (ce) =>
        ce.callee.type === "Identifier" && ce.callee.name === "defineConfig",
    )
    .find(jsc.ObjectExpression)
    .at(0)
    .forEach((oe) => {
      jsc(oe).replaceWith(
        jsc.objectExpression([
          ...oe.node.properties,
          jsc.objectProperty(
            jsc.identifier("define"),
            jsc.objectExpression([
              ...getObjectProperties(
                "({ 'process.env.NEXTAUTH_URL': JSON.stringify(process.env.VITE_NEXTAUTH_URL)})",
              ),
            ]),
          ),
        ]),
      );
    });

  if (packages.includes("trpc")) {
    const indexRoutePath = path.join(projectDir, "src/routes/index.tsx");
    const indexRouteFile = jsc(fs.readFileSync(indexRoutePath, "utf-8"));
    const nextAuthIndexFile = jsc(
      fs.readFileSync(
        path.join(
          nextAuthAssetDir,
          `routes/index${packages.includes("tailwind") ? ".tw" : ""}.tsx`,
        ),
        "utf-8",
      ),
    )
      .find(jsc.Program)
      .get("body", 0).node;

    indexRouteFile
      .find(jsc.ImportDeclaration)
      .filter((path) => path.node.source.value === "@tanstack/react-router")
      .insertAfter(
        jsc.importDeclaration(
          [
            jsc.importSpecifier(jsc.identifier("signIn")),
            jsc.importSpecifier(jsc.identifier("signOut")),
            jsc.importSpecifier(jsc.identifier("useSession")),
          ],
          jsc.stringLiteral("next-auth/react"),
        ),
      );

    const indexRouteHomeFunction = indexRouteFile
      .find(jsc.FunctionDeclaration)
      .filter(
        (vd) => vd.node.id?.type === "Identifier" && vd.node.id.name === "Home",
      );

    indexRouteHomeFunction.insertAfter(nextAuthIndexFile);

    indexRouteHomeFunction
      .find(jsc.ReturnStatement)
      .findJSXElements("main")
      .findJSXElements("div")
      .at(0)
      .forEach((div) => {
        const authShowCaseElement = jsc.jsxElement(
          jsc.jsxOpeningElement(jsc.jsxIdentifier("AuthShowcase /")),
          null,
        );

        authShowCaseElement.selfClosing = true;
        jsc(div).replaceWith(
          jsc.jsxElement(div.node.openingElement, div.node.closingElement, [
            ...(div.node.children ? div.node.children : []), // Copy existing children
            // Create a new li element containing our new entry
            authShowCaseElement,
          ]),
        );
      });

    fs.writeFileSync(indexRoutePath, indexRouteFile.toSource());
  }

  fs.writeFileSync(appPath, appFile.toSource());
  fs.writeFileSync(viteConfigPath, viteCOnfigFile.toSource());
};
