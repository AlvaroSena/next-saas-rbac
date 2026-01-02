import { NavLink } from "./nav-link";
import { Button } from "./ui/button";
import { ability, getCurrentOrg } from "@/auth/auth";

export async function Tabs() {
  const currentOrg = await getCurrentOrg();
  const permissions = await ability();

  const canUpdateOrganization = permissions?.can("update", "Organization");
  const canGetBilling = permissions?.can("get", "Billing");

  const canGetMembers = permissions?.can("get", "User");
  const canGetProjects = permissions?.can("get", "Project");

  return (
    <div className="border-b py-4">
      <nav className="mx-auto flex max-w-300 items-center gap-2">
        {canGetProjects && (
          <Button
            asChild
            size="sm"
            className="text-muted-foreground data-[current=true]:text-foreground data-[current=true]:border-border border border-transparent"
            variant="ghost"
          >
            <NavLink href={`/org/${currentOrg}`}>Projects</NavLink>
          </Button>
        )}

        {canGetMembers && (
          <Button
            asChild
            size="sm"
            className="text-muted-foreground data-[current=true]:text-foreground data-[current=true]:border-border border border-transparent"
            variant="ghost"
          >
            <NavLink href={`/org/${currentOrg}/members`}>Members</NavLink>
          </Button>
        )}

        {(canUpdateOrganization || canGetBilling) && (
          <Button
            asChild
            size="sm"
            className="text-muted-foreground data-[current=true]:text-foreground data-[current=true]:border-border border border-transparent"
            variant="ghost"
          >
            <NavLink href={`/org/${currentOrg}/settings`}>
              Settings & Billing
            </NavLink>
          </Button>
        )}
      </nav>
    </div>
  );
}
