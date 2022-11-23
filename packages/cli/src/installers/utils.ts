import jsc from "jscodeshift";

//TODO: can we type this better than any?
export const getObjectProperties = (source: string): jsc.ObjectProperty[] =>
  jsc(source).find(jsc.ObjectExpression).get().node.properties;
