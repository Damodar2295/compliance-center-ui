import { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

export default function Section({ title, children, className }: Props) {
  return (
    <section className={clsx("card", className)}>
      <header className="card-header">
        <h2>{title}</h2>
      </header>
      <div className="card-body">{children}</div>
    </section>
  );
}

