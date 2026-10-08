import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Trash2, UploadCloud } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProjectSelect } from "@/components/project-select";
import { SearchField, SegmentedFilter } from "@/components/filters";
import { Button } from "@/components/ui/button";
import { useEntries } from "@/hooks/use-entries";
import { newId } from "@/hooks/use-local-store";
import { useToast } from "@/hooks/use-toast";
import { formatBytes, kindOf, listFiles, removeFile, saveFile, type FileKind, type StoredFile } from "@/lib/file-store";
import { formatDate } from "@/lib/finance";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MAX_BYTES = 50 * 1024 * 1024;
const FILTERS = ["All", "Images", "Documents", "Other"] as const;
type Filter = (typeof FILTERS)[number];

const KIND_TINT: Record<FileKind, string> = {
  Images: "bg-violet/10 text-violet [--hatch-color:color-mix(in_srgb,var(--violet)_30%,transparent)]",
  Documents: "bg-primary/[0.08] text-primary [--hatch-color:color-mix(in_srgb,var(--primary)_30%,transparent)]",
  Other: "bg-ink/[0.04] text-muted-foreground hatch-soft",
};

function extension(name: string) {
  const ext = name.split(".").pop();
  return ext && ext !== name ? ext.slice(0, 4).toUpperCase() : "FILE";
}

function FileCard({ file, url, onDelete }: { file: StoredFile; url: string; onDelete: () => void }) {
  const kind = kindOf(file);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25, ease: easeOut }}
      className="panel group flex flex-col overflow-hidden"
    >
      <div className={cn("relative grid aspect-[4/3] place-items-center overflow-hidden", kind !== "Images" && cn("hatch", KIND_TINT[kind]))}>
        {kind === "Images" ? (
          <img src={url} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <span className="rounded-lg bg-card px-2.5 py-1 font-display text-sm font-semibold">{extension(file.name)}</span>
        )}
      </div>
      <div className="flex items-start gap-2 p-3.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" title={file.name}>
            {file.name}
          </p>
          <p className="tnum mt-0.5 text-xs text-muted-foreground">
            {formatBytes(file.size)}, added {formatDate(new Date(file.added), "d MMM")}
          </p>
          {file.project && <p className="mt-1.5 truncate text-xs text-primary">{file.project}</p>}
        </div>
        <a
          href={url}
          download={file.name}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-ink/[0.06] hover:text-foreground"
          aria-label={`Download ${file.name}`}
          title="Download"
        >
          <Download className="size-4" />
        </a>
        <button
          onClick={onDelete}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-vermilion/10 hover:text-vermilion"
          aria-label={`Delete ${file.name}`}
          title="Delete"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </motion.li>
  );
}

export default function Files() {
  const { entries } = useEntries();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [project, setProject] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null);

  const projects = useMemo(() => Array.from(new Set(entries.map((e) => e.project).filter(Boolean))).sort(), [entries]);

  const refresh = useCallback(async () => {
    try {
      const list = await listFiles();
      setFiles(list.sort((a, b) => b.added - a.added));
    } finally {
      setLoaded(true);
    }
    const est = await navigator.storage?.estimate?.();
    if (est?.quota) setUsage({ used: est.usage ?? 0, quota: est.quota });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // One object URL per file for previews and downloads, released when the list changes.
  const urls = useMemo(() => new Map(files.map((f) => [f.id, URL.createObjectURL(f.blob)])), [files]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  const addFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    const accepted = Array.from(list).filter((f) => f.size <= MAX_BYTES);
    const rejected = list.length - accepted.length;
    for (const f of accepted) {
      await saveFile({ id: newId(), name: f.name, size: f.size, type: f.type, added: Date.now(), project: project || undefined, blob: f });
    }
    await refresh();
    toast(
      rejected
        ? { variant: "destructive", title: `${rejected} file${rejected > 1 ? "s" : ""} too large`, description: "Files can be up to 50 MB." }
        : { title: `Added ${accepted.length} file${accepted.length > 1 ? "s" : ""}`, description: project ? `Linked to ${project}.` : undefined },
    );
  };

  const counts = useMemo(() => {
    const c: Partial<Record<Filter, number>> = { All: files.length };
    for (const k of ["Images", "Documents", "Other"] as FileKind[]) c[k] = files.filter((f) => kindOf(f) === k).length;
    return c;
  }, [files]);

  const q = search.trim().toLowerCase();
  const shown = files.filter(
    (f) => (filter === "All" || kindOf(f) === filter) && (!q || f.name.toLowerCase().includes(q) || f.project?.toLowerCase().includes(q)),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Files"
        description="Briefs, drafts and final artwork. Files are saved in this browser, not uploaded anywhere."
        actions={
          usage && (
            <div className="w-56">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Storage</span>
                <span className="tnum">
                  {formatBytes(usage.used)} of {formatBytes(usage.quota)}
                </span>
              </div>
              <div className="hatch hatch-soft mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.04]">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(1, (usage.used / usage.quota) * 100)}%` }} />
              </div>
            </div>
          )
        }
      />

      {/* Drop zone: the drafting-board hatch, turning blue while something is held over it */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "hatch flex flex-col items-center gap-4 rounded-[var(--radius-panel)] border-2 border-dashed px-6 py-10 text-center transition-[transform,background-color,border-color] duration-200 ease-[var(--ease-out)] sm:flex-row sm:text-left",
          dragging ? "scale-[0.995] border-primary bg-primary/[0.06] hatch-primary" : "hatch-faint border-line bg-card",
        )}
      >
        <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl transition-colors", dragging ? "bg-primary text-primary-foreground" : "bg-raised text-muted-foreground")}>
          <UploadCloud className="size-6" />
        </span>
        <div className="flex-1">
          <p className="font-medium">{dragging ? "Drop to add" : "Drop files here"}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Images, PDFs and documents up to 50 MB each.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <ProjectSelect value={project} onChange={setProject} projects={projects} label="Link to project" className="h-10 sm:w-56" />
          <Button onClick={() => inputRef.current?.click()}>Choose files</Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField value={search} onChange={setSearch} placeholder="Search files or projects" />
          <SegmentedFilter id="file-filter" label="Type" options={FILTERS} value={filter} onChange={setFilter} counts={counts} />
        </div>
      )}

      {loaded && files.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No files yet. Drop a brief or a draft above to start the library.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((f) => (
              <FileCard
                key={f.id}
                file={f}
                url={urls.get(f.id)!}
                onDelete={async () => {
                  await removeFile(f.id);
                  refresh();
                }}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
      {files.length > 0 && shown.length === 0 && <p className="text-center text-sm text-muted-foreground">No files match.</p>}
    </div>
  );
}
