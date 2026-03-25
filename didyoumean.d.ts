declare module 'didyoumean' {
  export default function didYouMean(
    input: string,
    matchList: readonly string[]
  ): string | null;
}
