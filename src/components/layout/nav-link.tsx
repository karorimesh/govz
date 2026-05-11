import Link from "next/link";

type NavLinkProps = {
  href: string;
  label: string;
};

export function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link
      className="rounded-md px-3 py-2 text-sm font-medium text-[#34423a] transition hover:bg-[#e7ebe2] hover:text-[#102118] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6f5e]"
      href={href}
    >
      {label}
    </Link>
  );
}
