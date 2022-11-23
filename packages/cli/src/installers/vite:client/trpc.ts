import path from "path";
import fs from "fs-extra";
import jsc from "jscodeshift";
import {
  hasImportDeclaration,
  hasImportSpecifier,
  insertImportSpecifier,
} from "@codeshift/utils";
import { PKG_ROOT } from "~/consts.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import { Installer } from "../index.js";
import { getObjectProperties } from "../utils.js";

export const trpcInstaller: Installer<"vite:client"> = ({
  projectDir,
  packages,
}) => {
  addPackageDependency({
    projectDir,
    dependencies: [
      "@tanstack/react-query",
      "superjson",
      "@trpc/server",
      "@trpc/client",
      "@trpc/react-query",
    ],
    devMode: false,
  });

  const trpcAssetDir = path.join(PKG_ROOT, "templates/vite:client/trpc");

  const appPath = path.join(projectDir, "src/App.tsx");
  const appFile = jsc(fs.readFileSync(appPath, "utf-8"));
  const trpcAppStateFile = jsc(
    fs.readFileSync(path.join(trpcAssetDir, "appState.txt"), "utf-8"),
  );

  if (hasImportDeclaration(jsc, appFile, "react")) {
    if (!hasImportSpecifier(jsc, appFile, "react", "useState")) {
      insertImportSpecifier(
        jsc,
        appFile,
        jsc.importSpecifier(jsc.identifier("useState")),
        "react",
      );
    }
  } else {
    const newImport = jsc.importDeclaration(
      [jsc.importSpecifier(jsc.identifier("useState"))],
      jsc.stringLiteral("react"),
    );

    // Insert it at the top of the document
    appFile.get().node.program.body.unshift(newImport);
  }

  appFile
    .find(jsc.ImportDeclaration)
    .filter((path) => path.node.source.value === "@tanstack/react-router")
    .insertAfter(
      jsc.importDeclaration(
        [
          jsc.importSpecifier(jsc.identifier("QueryClient")),
          jsc.importSpecifier(jsc.identifier("QueryClientProvider ")),
        ],
        jsc.stringLiteral("@tanstack/react-query"),
      ),
    )
    .insertAfter(
      jsc.importDeclaration(
        [jsc.importDefaultSpecifier(jsc.identifier("superjson"))],
        jsc.stringLiteral("superjson"),
      ),
    )
    .insertAfter(
      jsc.importDeclaration(
        [
          jsc.importSpecifier(jsc.identifier("httpBatchLink")),
          jsc.importSpecifier(jsc.identifier("loggerLink")),
        ],
        jsc.stringLiteral("@trpc/client"),
      ),
    );

  appFile
    .find(jsc.ImportDeclaration)
    .at(-1)
    .insertAfter(
      jsc.importDeclaration(
        [
          jsc.importSpecifier(jsc.identifier("trpc")),
          jsc.importSpecifier(jsc.identifier("getBaseUrl")),
        ],
        jsc.stringLiteral("./utils/trpc"),
      ),
    );

  const appFileAppFunction = appFile
    .find(jsc.VariableDeclarator)
    .filter(
      (vd) => vd.node.id.type === "Identifier" && vd.node.id.name === "App",
    )
    .find(jsc.ArrowFunctionExpression);

  appFileAppFunction.forEach((vd) => {
    if (vd.node.body.type === "JSXElement") {
      jsc(vd).replaceWith(
        jsc.arrowFunctionExpression(
          vd.node.params,
          jsc.blockStatement([
            jsc.returnStatement(jsc.parenthesizedExpression(vd.node.body)),
          ]),
        ),
      );
    }
    if (vd.node.body.type === "BlockStatement") {
      jsc(vd)
        .find(jsc.BlockStatement)
        .replaceWith(
          jsc.blockStatement([
            ...trpcAppStateFile
              .find(jsc.Program)
              .get("body")
              .map((v) => v.node),
            ...vd.node.body.body,
          ]),
        );
    }
  });

  appFileAppFunction
    .find(jsc.ReturnStatement)
    .findJSXElements()
    .at(0)
    .forEach((jsx) => {
      const wrappedElement = jsc.jsxElement(
        jsc.jsxOpeningElement(jsc.jsxIdentifier("trpc.Provider"), [
          jsc.jsxAttribute(
            jsc.jsxIdentifier("client"),
            jsc.jsxExpressionContainer(jsc.identifier("trpcClient")),
          ),
          jsc.jsxAttribute(
            jsc.jsxIdentifier("queryClient"),
            jsc.jsxExpressionContainer(jsc.identifier("queryClient")),
          ),
        ]),
        jsc.jsxClosingElement(jsc.jsxIdentifier("trpc.Provider")),
        [
          jsc.jsxElement(
            jsc.jsxOpeningElement(jsc.jsxIdentifier("QueryClientProvider "), [
              jsc.jsxAttribute(
                jsc.jsxIdentifier("client"),
                jsc.jsxExpressionContainer(jsc.identifier("queryClient")),
              ),
            ]),
            jsc.jsxClosingElement(jsc.jsxIdentifier("QueryClientProvider ")),
            [jsc.jsxElement.from(jsx.value)],
          ),
        ],
      );
      jsc(jsx).replaceWith(wrappedElement);
    });

  const indexRoutePath = path.join(projectDir, "src/routes/index.tsx");
  const indexRouteFile = jsc(fs.readFileSync(indexRoutePath, "utf-8"));
  const trpcIndexRouteFile = jsc(
    fs.readFileSync(
      path.join(
        trpcAssetDir,
        `/routes/index${packages.includes("tailwind") ? ".tw" : ""}.txt`,
      ),
      "utf-8",
    ),
  );

  indexRouteFile
    .find(jsc.ImportDeclaration)
    .at(0)
    .insertAfter(
      jsc.importDeclaration(
        [jsc.importSpecifier(jsc.identifier("trpc"))],
        jsc.stringLiteral("../utils/trpc"),
      ),
    );

  const indexRouteHomeFunction = indexRouteFile
    .find(jsc.FunctionDeclaration)
    .filter(
      (vd) => vd.node.id?.type === "Identifier" && vd.node.id.name === "Home",
    );

  indexRouteHomeFunction
    .find(jsc.ReturnStatement)
    .insertBefore(
      jsc('const hello = trpc.example.hello.useQuery({ text: "from tRPC" });')
        .find(jsc.Program)
        .get("body", 0).node,
    );

  indexRouteHomeFunction
    .find(jsc.ReturnStatement)
    .findJSXElements("main")
    .findJSXElements("div")
    .at(0)
    .forEach((div) => {
      jsc(div).replaceWith(
        jsc.jsxElement(div.node.openingElement, div.node.closingElement, [
          ...(div.node.children ? div.node.children : []), // Copy existing children
          // Create a new li element containing our new entry
          trpcIndexRouteFile.find(jsc.Program).get("body", 0).node.expression,
        ]),
      );
    });

  const envSchemaPath = path.join(projectDir, "src/env/schema.mjs");
  const envSchemaFile = jsc(fs.readFileSync(envSchemaPath, "utf-8"));

  envSchemaFile
    .find(jsc.VariableDeclarator)
    .filter(
      (vd) =>
        vd.node.id.type === "Identifier" && vd.node.id.name === "clientSchema",
    )
    .find(jsc.ObjectExpression)
    .forEach((oe) => {
      jsc(oe).replaceWith(
        jsc.objectExpression([
          ...oe.node.properties,
          ...getObjectProperties(
            "({VITE_API_URL: z.string().url().optional(), VITE_DEV_API_PORT: z.string().optional()})",
          ),
        ]),
      );
    });

  envSchemaFile
    .find(jsc.VariableDeclarator)
    .filter(
      (vd) =>
        vd.node.id.type === "Identifier" && vd.node.id.name === "clientEnv",
    )
    .find(jsc.ObjectExpression)
    .forEach((oe) => {
      jsc(oe).replaceWith(
        jsc.objectExpression([
          ...oe.node.properties,
          ...getObjectProperties(
            "({VITE_API_URL: import.meta.env.VITE_API_URL, VITE_DEV_API_PORT: import.meta.VITE_DEV_API_PORT})",
          ),
        ]),
      );
    });
  fs.copySync(
    path.join(trpcAssetDir, "utils"),
    path.join(projectDir, "src/utils"),
  );
  fs.writeFileSync(appPath, appFile.toSource());
  fs.writeFileSync(indexRoutePath, indexRouteFile.toSource());
  fs.writeFileSync(envSchemaPath, envSchemaFile.toSource());
};
