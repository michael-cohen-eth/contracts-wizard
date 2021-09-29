import 'array.prototype.flatmap/auto';

export type Lines = string | typeof whitespace | Lines[];

const whitespace = Symbol('whitespace');

export function formatLines(isMultiContract = false, ...lines: Lines[]): string {
  return [...indentEach(0, lines, isMultiContract)].join('\n') + '\n';
}

function* indentEach(
  indent: number,
  lines: Lines[],
  isMultiContract = false,
): Generator<string | typeof whitespace> {
  for (const line of lines) {
    if (line === whitespace) {
      yield '';
    } else if (Array.isArray(line) && !isMultiContract) {
      yield* indentEach(indent + 1, line, isMultiContract);
    } else if (Array.isArray(line)) {
      yield* indentEach(indent, line, false);
    } else {
      yield '    '.repeat(indent) + line;
    }
  }
}

export function spaceBetween(...lines: Lines[][]): Lines[] {
  return lines
    .filter(l => l.length > 0)
    .flatMap<Lines>(l => [whitespace, ...l])
    .slice(1);
}
