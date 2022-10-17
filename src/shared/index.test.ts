import { readFileSync } from "fs";
import { resolve } from "path";

import roughUp from ".";

const readFixture = (fixture: string) =>
  readFileSync(resolve(__dirname, "__fixtures__", fixture)).toString();

describe("roughUp", () => {
  let svg: SVGSVGElement;

  describe.each`
    name                        | fixture
    ${"a circle"}               | ${readFixture("circle.svg")}
    ${"an ellipse"}             | ${readFixture("ellipse.svg")}
    ${"a line"}                 | ${readFixture("line.svg")}
    ${"a path"}                 | ${readFixture("path.svg")}
    ${"a polygon"}              | ${readFixture("polygon.svg")}
    ${"a polyline"}             | ${readFixture("polyline.svg")}
    ${"a rect"}                 | ${readFixture("rect.svg")}
    ${"a complex illustration"} | ${readFixture("complex.svg")}
  `("with $name", ({ fixture }: { fixture: string }) => {
    beforeEach(() => {
      window.document.body.innerHTML = fixture;
      svg = window.document.querySelector("svg") as SVGSVGElement;
      roughUp(svg);
    });

    it("returns a roughed up version", () => {
      expect(svg).toMatchSnapshot();
    });
  });
});

describe("custom roughUp", () => {
  let svg: SVGSVGElement;

  it("returns a roughed up version with custom options", () => {
    window.document.body.innerHTML = readFixture("circle.svg");
    svg = window.document.querySelector("svg") as SVGSVGElement;
    roughUp(svg, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      customOptions: (_path, _elem, options) => ({ ...options, fillStyle: "solid" }),
    });

    expect(svg).toMatchSnapshot();
  });

  it("returns a roughed up version with custom decider", () => {
    window.document.body.innerHTML = readFixture("circle.svg");
    svg = window.document.querySelector("svg") as SVGSVGElement;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    roughUp(svg, { decider: (_, before) => before });

    expect(svg).toMatchSnapshot();
  });
});
