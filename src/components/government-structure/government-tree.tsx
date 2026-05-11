"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Gavel,
  History,
  Landmark,
  ListChecks,
  Scale,
  Shield,
  UserRound,
  X,
} from "lucide-react";

type OfficeType =
  | "executive"
  | "legislative"
  | "judiciary"
  | "independent_office"
  | "ministry"
  | "department"
  | "county"
  | "local_office";

type AppointmentMethod = "elected" | "appointed" | "nominated" | "career_service";
type HolderStatus = "current" | "former";
type ProfileTab = "latestNews" | "merits" | "demerits";

type PositionHolder = {
  id: string;
  name: string;
  title: string;
  imageUrl?: string;
  servedFrom: string;
  servedTo?: string;
  status: HolderStatus;
  personalSummary: string;
  details: {
    dateOfBirth?: string;
    education?: string;
    profession?: string;
    politicalAffiliation?: string;
    homeRegion?: string;
  };
  latestNews: Array<{
    title: string;
    source: string;
    date: string;
    link: string;
  }>;
  merits: string[];
  demerits: string[];
};

type PositionNode = {
  id: string;
  title: string;
  description: string;
  icon: string;
  level: number;
  parentId?: string;
  officeType: OfficeType;
  currentHolderId?: string;
  location?: string;
  termLength?: string;
  appointmentMethod?: AppointmentMethod;
  responsibilities: string[];
  history: PositionHolder[];
  children?: PositionNode[];
};

type GovernmentTreeProps = {
  nodes: PositionNode[];
};

const iconMap = {
  badge: BadgeCheck,
  briefcase: BriefcaseBusiness,
  building: Building2,
  gavel: Gavel,
  landmark: Landmark,
  scale: Scale,
  shield: Shield,
};

export function GovernmentTree({ nodes }: GovernmentTreeProps) {
  const [responsibilityNode, setResponsibilityNode] =
    useState<PositionNode | null>(null);
  const [historyNode, setHistoryNode] = useState<PositionNode | null>(null);
  const [selectedHolder, setSelectedHolder] = useState<PositionHolder | null>(
    null,
  );

  const visibleNodes = useMemo(() => limitTreeDepth(nodes, 5), [nodes]);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 lg:px-8">
      <div className="border-b border-[#d9dfd2] pb-5">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#61705d]">
          Public offices
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#17201a] sm:text-4xl">
          Government Structure
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#53604f]">
          Explore five levels of government positions, responsibilities, and
          history of office holders.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#d9dfd2] bg-white p-4 shadow-sm">
        <div className="min-w-[920px] space-y-5">
          {visibleNodes.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              onHistory={(selectedNode) => {
                setHistoryNode(selectedNode);
                setSelectedHolder(null);
              }}
              onResponsibilities={setResponsibilityNode}
            />
          ))}
        </div>
      </div>

      {responsibilityNode ? (
        <ResponsibilitiesModal
          node={responsibilityNode}
          onClose={() => setResponsibilityNode(null)}
        />
      ) : null}

      {historyNode ? (
        <HistoryModal
          node={historyNode}
          onClose={() => {
            setHistoryNode(null);
            setSelectedHolder(null);
          }}
          onSelectHolder={setSelectedHolder}
          selectedHolder={selectedHolder}
        />
      ) : null}
    </section>
  );
}

function TreeNode({
  node,
  onHistory,
  onResponsibilities,
}: {
  node: PositionNode;
  onHistory: (node: PositionNode) => void;
  onResponsibilities: (node: PositionNode) => void;
}) {
  const Icon = iconMap[node.icon as keyof typeof iconMap] ?? Building2;
  const currentHolder = node.history.find(
    (holder) => holder.id === node.currentHolderId,
  );

  return (
    <div className="relative">
      <article className="rounded-lg border border-[#d9dfd2] bg-[#fbfcf8] p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#173c32] text-white">
            <Icon aria-hidden="true" size={23} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#61705d]">
                  Level {node.level} · {formatLabel(node.officeType)}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#17201a]">
                  {node.title}
                </h2>
              </div>
              <span className="rounded-full border border-[#cbd4c4] px-3 py-1 text-xs font-semibold capitalize text-[#61705d]">
                {node.appointmentMethod
                  ? formatLabel(node.appointmentMethod)
                  : "Official"}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-[#53604f]">
              {node.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#61705d]">
              {currentHolder ? (
                <span>Current holder: {currentHolder.name}</span>
              ) : (
                <span>Current holder unavailable</span>
              )}
              {node.location ? <span>{node.location}</span> : null}
              {node.termLength ? <span>{node.termLength}</span> : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cbd4c4] px-4 text-sm font-semibold text-[#34423a] transition hover:bg-[#e7ebe2]"
                onClick={() => onResponsibilities(node)}
                type="button"
              >
                <ListChecks aria-hidden="true" size={17} />
                Responsibilities
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#173c32] px-4 text-sm font-semibold text-white transition hover:bg-[#245548]"
                onClick={() => onHistory(node)}
                type="button"
              >
                <History aria-hidden="true" size={17} />
                History
              </button>
            </div>
          </div>
        </div>
      </article>

      {node.children?.length ? (
        <div className="ml-12 mt-4 border-l-2 border-[#d9dfd2] pl-6">
          <div className="space-y-4">
            {node.children.map((child) => (
              <div className="relative" key={child.id}>
                <span
                  aria-hidden="true"
                  className="absolute -left-6 top-8 h-0.5 w-6 bg-[#d9dfd2]"
                />
                <TreeNode
                  node={child}
                  onHistory={onHistory}
                  onResponsibilities={onResponsibilities}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );

}

function ResponsibilitiesModal({
  node,
  onClose,
}: {
  node: PositionNode;
  onClose: () => void;
}) {
  return (
    <Modal title={`${node.title} responsibilities`} onClose={onClose}>
      <div className="grid gap-5">
        <p className="text-sm leading-6 text-[#53604f]">{node.description}</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Detail label="Office type" value={formatLabel(node.officeType)} />
          <Detail
            label="Appointment"
            value={
              node.appointmentMethod
                ? formatLabel(node.appointmentMethod)
                : "Not specified"
            }
          />
          <Detail label="Term length" value={node.termLength ?? "Not specified"} />
          <Detail label="Location" value={node.location ?? "Not specified"} />
        </dl>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#61705d]">
            Responsibilities
          </h3>
          <ul className="mt-3 grid gap-3">
            {node.responsibilities.map((responsibility) => (
              <li
                className="rounded-md bg-[#f7f8f3] p-3 text-sm leading-6 text-[#34423a]"
                key={responsibility}
              >
                {responsibility}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}

function HistoryModal({
  node,
  onClose,
  onSelectHolder,
  selectedHolder,
}: {
  node: PositionNode;
  onClose: () => void;
  onSelectHolder: (holder: PositionHolder) => void;
  selectedHolder: PositionHolder | null;
}) {
  return (
    <Modal title={`${node.title} history`} onClose={onClose} wide>
      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-3">
          {node.history.map((holder) => (
            <button
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                selectedHolder?.id === holder.id
                  ? "border-[#2f6f5e] bg-[#eef3e9]"
                  : "border-[#d9dfd2] hover:bg-[#f7f8f3]"
              }`}
              key={holder.id}
              onClick={() => onSelectHolder(holder)}
              type="button"
            >
              <HolderAvatar holder={holder} size="small" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#17201a]">{holder.name}</p>
                <p className="text-sm text-[#61705d]">
                  {holder.servedFrom} to {holder.servedTo ?? "Current"}
                </p>
              </div>
              <span className="rounded-full bg-[#eef3e9] px-2 py-1 text-xs font-semibold capitalize text-[#2f6f5e]">
                {holder.status}
              </span>
            </button>
          ))}
        </div>

        {selectedHolder ? (
          <ProfileCard holder={selectedHolder} />
        ) : (
          <div className="grid min-h-72 place-items-center rounded-lg border border-[#d9dfd2] bg-[#f7f8f3] p-6 text-center text-sm text-[#61705d]">
            Select a person in the timeline to view their profile.
          </div>
        )}
      </div>
    </Modal>
  );
}

function ProfileCard({ holder }: { holder: PositionHolder }) {
  const [tab, setTab] = useState<ProfileTab>("latestNews");

  return (
    <article className="rounded-lg border border-[#d9dfd2] bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <HolderAvatar holder={holder} size="large" />
        <div>
          <p className="text-sm font-medium text-[#61705d]">{holder.title}</p>
          <h3 className="mt-1 text-2xl font-semibold text-[#17201a]">
            {holder.name}
          </h3>
          <p className="mt-1 text-sm text-[#61705d]">
            {holder.servedFrom} to {holder.servedTo ?? "Current"}
          </p>
          <p className="mt-3 text-sm leading-6 text-[#53604f]">
            {holder.personalSummary}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <Detail label="Date of birth" value={holder.details.dateOfBirth ?? "N/A"} />
        <Detail label="Education" value={holder.details.education ?? "N/A"} />
        <Detail label="Profession" value={holder.details.profession ?? "N/A"} />
        <Detail
          label="Affiliation"
          value={holder.details.politicalAffiliation ?? "N/A"}
        />
        <Detail label="Home region" value={holder.details.homeRegion ?? "N/A"} />
      </dl>

      <div className="mt-5 flex flex-wrap gap-2 border-b border-[#d9dfd2] pb-3">
        {(["latestNews", "merits", "demerits"] as ProfileTab[]).map((item) => (
          <button
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              tab === item
                ? "bg-[#173c32] text-white"
                : "bg-[#f7f8f3] text-[#34423a] hover:bg-[#e7ebe2]"
            }`}
            key={item}
            onClick={() => setTab(item)}
            type="button"
          >
            {tabLabel(item)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "latestNews" ? <NewsList holder={holder} /> : null}
        {tab === "merits" ? <BulletList items={holder.merits} /> : null}
        {tab === "demerits" ? <BulletList items={holder.demerits} /> : null}
      </div>
    </article>
  );
}

function HolderAvatar({
  holder,
  size,
}: {
  holder: PositionHolder;
  size: "small" | "large";
}) {
  const dimension = size === "large" ? 112 : 48;

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-md bg-[#e7ebe2]"
      style={{ height: dimension, width: dimension }}
    >
      {holder.imageUrl ? (
        <Image
          alt=""
          className="object-cover"
          fill
          sizes={`${dimension}px`}
          src={holder.imageUrl}
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-[#61705d]">
          <UserRound aria-hidden="true" size={size === "large" ? 44 : 22} />
        </div>
      )}
    </div>
  );
}

function NewsList({ holder }: { holder: PositionHolder }) {
  return (
    <div className="grid gap-3">
      {holder.latestNews.map((item) => (
        <Link
          className="rounded-md border border-[#d9dfd2] p-3 transition hover:bg-[#f7f8f3]"
          href={item.link}
          key={item.title}
        >
          <p className="font-semibold text-[#17201a]">{item.title}</p>
          <p className="mt-1 text-sm text-[#61705d]">
            {item.source} · {item.date}
          </p>
        </Link>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li
          className="rounded-md bg-[#f7f8f3] p-3 text-sm leading-6 text-[#34423a]"
          key={item}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Modal({
  children,
  onClose,
  title,
  wide = false,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
  wide?: boolean;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4 py-8"
      role="dialog"
    >
      <section
        className={`max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white p-5 shadow-xl ${
          wide ? "max-w-5xl" : "max-w-2xl"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#d9dfd2] pb-4">
          <h2 className="text-xl font-semibold text-[#17201a]">{title}</h2>
          <button
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#cbd4c4] text-[#34423a] transition hover:bg-[#e7ebe2]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f7f8f3] p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#61705d]">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[#17201a]">{value}</dd>
    </div>
  );
}

function limitTreeDepth(nodes: PositionNode[], depth: number): PositionNode[] {
  return nodes.map((node) => ({
    ...node,
    children:
      depth > 1 && node.children
        ? limitTreeDepth(node.children, depth - 1)
        : undefined,
  }));
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function tabLabel(tab: ProfileTab) {
  if (tab === "latestNews") {
    return "Latest News";
  }

  return tab.charAt(0).toUpperCase() + tab.slice(1);
}
