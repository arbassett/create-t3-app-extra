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


const validationRegExp =
  /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

//Validate a string against allowed package.json names
export const validateAppName = (input: string) => {
  const paths = input.split("/");

  // If the first part is a @, it's a scoped package
  const indexOfDelimiter = paths.findIndex((p) => p.startsWith("@"));

  let appName = paths[paths.length - 1];
  if (paths.findIndex((p) => p.startsWith("@")) !== -1) {
    appName = paths.slice(indexOfDelimiter).join("/");
  }

  if (validationRegExp.test(appName ?? "")) {
    return true;
  } else {
    return "App name must be lowercase, alphanumeric, and only use -, _, and @";
  }
};
