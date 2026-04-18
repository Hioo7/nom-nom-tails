export default function DogIllustration() {
  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <pre className="font-mono text-base-content/25 text-sm leading-snug text-center">{`
 / \\__
(    @\\___
 /         O
/   (_____/
/_____/   U
      `.trim()}</pre>
      <p className="text-base-content/30 text-xs font-mono mt-1">* woof *</p>
    </div>
  );
}
