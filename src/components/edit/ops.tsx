// Kleine bewerk-knopjes die de server in edit-modus ín de blokken rendert.
// De EditMode-client vangt kliks op [data-op] af en voert de actie uit
// (verwijderen, toevoegen, afbeelding kiezen, icoon wisselen, link bewerken).
import { Icon } from "@/components/icons";

export function ItemX({ field, index, title }: { field: string; index: number; title?: string }) {
  return (
    <button
      type="button"
      className="eb-op eb-x"
      data-op="remove-item"
      data-field={field}
      data-index={index}
      title={title ?? "Verwijderen"}
    >
      ✕
    </button>
  );
}

export function AddItem({ field, def, label }: { field: string; def: Record<string, unknown>; label: string }) {
  return (
    <button type="button" className="eb-op eb-additem" data-op="add-item" data-field={field} data-default={JSON.stringify(def)}>
      + {label}
    </button>
  );
}

export function IconBtn({ field, index, name }: { field: string; index: number; name?: string }) {
  return (
    <button
      type="button"
      className="eb-op eb-icoop"
      data-op="pick-icon"
      data-field={field}
      data-index={index}
      title="Icoon wisselen"
    >
      <Icon name={name} />
    </button>
  );
}

export function LinkOp({
  field,
  index,
  singleField,
}: {
  field?: string;
  index?: number;
  singleField?: string;
}) {
  return (
    <button
      type="button"
      className="eb-op eb-linkop"
      data-op="edit-link"
      data-field={field}
      data-index={index}
      data-single-field={singleField}
      title="Link en stijl van deze knop"
    >
      link
    </button>
  );
}

export function ImageOps({ field, hasImage }: { field: string; hasImage: boolean }) {
  return (
    <span className="eb-imgops">
      <button type="button" className="eb-op" data-op="set-image" data-field={field}>
        {hasImage ? "Afbeelding vervangen" : "Afbeelding kiezen"}
      </button>
      {hasImage && (
        <button type="button" className="eb-op eb-x" data-op="clear-image" data-field={field} title="Afbeelding weghalen">
          ✕
        </button>
      )}
    </span>
  );
}
