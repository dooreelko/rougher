import { JSDOM } from "jsdom";
import { Options } from "roughjs/bin/core";
import serializer from "w3c-xmlserializer";

import roughUp, { Customiser } from "../shared";

export default (input: string, options: Options & Customiser = {}): string => {
  const { window } = new JSDOM(input, { contentType: "image/svg+xml" });

  const svg = window.document.querySelector("svg") as SVGSVGElement;

  roughUp(svg, options);

  return serializer(window.document);
};

export * from "../shared/index";
