import rough from "roughjs";
import { Options } from "roughjs/bin/core";
import { RoughSVG } from "roughjs/bin/svg";

import {
  getAttribute,
  getAttributes,
  getCoordinates,
  getDiameter,
  getNumber,
  getOptions,
} from "./utils";

export interface Customiser {
  /**
   * hook to return custom options for element. return nothing to proceed with the default.
   */
  customOptions?: (path: string[], element: SVGElement, options: Options) => Options | undefined;

  /**
   * hook to return custom svg element. return nothing to proceed with the default.
   */
  decider?: (path: string[], before: SVGGElement, after: SVGGElement) => SVGGElement | undefined;
}

const nodePath: (node: Element | null) => string[] = (node: Element | null) => {
  if (!node) {
    return [];
  }

  return nodePath(node.parentElement)
    .concat([`${node.nodeName}.${node.id}`])
    .filter((el) => Boolean(el));
};

const blacklist = [
  "cx",
  "cy",
  "d",
  "height",
  "points",
  "r",
  "rx",
  "ry",
  "width",
  "x",
  "x1",
  "x2",
  "y",
  "y1",
  "y2",
  "fill",
  "stroke",
  "stroke-width",
];

enum RoughSupportedTag {
  Circle = "circle",
  Ellipse = "ellipse",
  Line = "line",
  Path = "path",
  Polygon = "polygon",
  Polyline = "polyline",
  Rect = "rect",
}

type RoughSupportedElement =
  | SVGCircleElement
  | SVGEllipseElement
  | SVGLineElement
  | SVGPathElement
  | SVGPolygonElement
  | SVGPolylineElement
  | SVGRectElement;

const getReplacement = (original: RoughSupportedElement, roughSvg: RoughSVG) => {
  switch (original.tagName) {
    case "circle":
      return roughSvg.circle(
        getNumber(original, "cx"),
        getNumber(original, "cy"),
        getDiameter(original, "r"),
        getOptions(original)
      );
    case "ellipse":
      return roughSvg.ellipse(
        getNumber(original, "cx"),
        getNumber(original, "cy"),
        getDiameter(original, "rx"),
        getDiameter(original, "ry"),
        getOptions(original)
      );
    case "line":
      return roughSvg.line(
        getNumber(original, "x1"),
        getNumber(original, "y1"),
        getNumber(original, "x2"),
        getNumber(original, "y2"),
        getOptions(original)
      );
    case "path":
      return roughSvg.path(getAttribute(original, "d"), getOptions(original));
    case "polygon":
      return roughSvg.polygon(getCoordinates(original, "points"), getOptions(original));
    case "polyline":
      return roughSvg.linearPath(getCoordinates(original, "points"), getOptions(original));
    case "rect":
      return roughSvg.rectangle(
        getNumber(original, "x"),
        getNumber(original, "y"),
        getNumber(original, "width"),
        getNumber(original, "height"),
        getOptions(original)
      );
    // istanbul ignore next
    default:
      throw new Error(`Unsupported tag name '${original.tagName}'`);
  }
};

export default (svg: SVGSVGElement, options: Options & Customiser = {}): void => {
  const roughSvg = rough.svg(svg, { options });

  const children = svg.querySelectorAll<RoughSupportedElement>(
    Object.values(RoughSupportedTag).join(",")
  );

  const decider = options.decider ?? (() => undefined);
  const optionator = options.customOptions ?? (() => undefined);

  for (const original of children) {
    const path = nodePath(original);

    const customOptions = optionator(path, original, options);

    const replacement = getReplacement(
      original,
      !customOptions ? roughSvg : rough.svg(svg, { options: customOptions })
    );

    const attributes = getAttributes(original).filter(
      (attribute) => !blacklist.includes(attribute.name)
    );

    attributes.forEach(({ name, value }) => {
      replacement.setAttribute(name, value);
    });

    original.replaceWith(decider(path, original, replacement) ?? replacement);
  }
};

export { Options } from "roughjs/bin/core";
