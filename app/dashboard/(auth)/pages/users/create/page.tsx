import AddUserForm from "./add-user-form";



export default function Page() {
  return (
    <div className="mx-auto max-w-(--breakpoint-lg)">
      <div className="space-y-4">
        <AddUserForm />
      </div>
    </div>
  );
}