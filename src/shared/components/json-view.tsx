type Props = {
  title: string;
  data: unknown;
};

export function JsonView({ title, data }: Props) {
  return (
    <section className="page-card">
      <h2 className="section-title">{title}</h2>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
}
