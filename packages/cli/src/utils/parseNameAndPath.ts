// MIT License

// Copyright (c) 2022 Shoubhit Dash

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
import pathModule from "path";

/**
 *  Parses the appName and its path from the user input.
 * Returns an array of [appName, path] where appName is the name put in the package.json and
 *   path is the path to the directory where the app will be created.
 * If the appName is '.', the name of the directory will be used instead.
 * Handles the case where the input includes a scoped package name
 * in which case that is being parsed as the name, but not included as the path
 * e.g. dir/@mono/app => ["@mono/app", "dir/app"]
 * e.g. dir/app => ["app", "dir/app"]
 **/
export const parseNameAndPath = (input: string) => {
  const paths = input.split("/");

  let appName = paths[paths.length - 1];

  // If the user ran `npx create-t3-app .` or similar, the appName should be the current directory
  if (appName === ".") {
    const parsedCwd = pathModule.resolve(process.cwd());
    appName = pathModule.basename(parsedCwd);
  }

  // If the first part is a @, it's a scoped package
  const indexOfDelimiter = paths.findIndex((p) => p.startsWith("@"));
  if (paths.findIndex((p) => p.startsWith("@")) !== -1) {
    appName = paths.slice(indexOfDelimiter).join("/");
  }

  const path = paths.filter((p) => !p.startsWith("@")).join("/");

  return [appName, path] as const;
};
