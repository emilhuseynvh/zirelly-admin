import AddTagForm from "./add-tag-form";


export default function Page() {
  return (
    <div className="mx-auto max-w-(--breakpoint-lg)">
      <div className="space-y-4">
        <AddTagForm />
      </div>
    </div>
  );
}