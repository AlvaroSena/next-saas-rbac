import { Slack, Slash } from "lucide-react";
import { ProfileButton } from "./profile-button";
import { OrganizationSwitcher } from "./organization-switcher";
import { ability } from "@/auth/auth";
import { ThemeSwitcher } from "./theme/theme-switcher";
import { ProjectSwitcher } from "./project-switcher";
import { PendingInvites } from "./pending-invites";

export async function Header() {
  const permissions = await ability();

  return (
    <header className="ng mx-auto flex max-w-300 items-center justify-between">
      <div className="flex items-center gap-3">
        <Slack className="light:invert" />

        <Slash className="text-border size-3 -rotate-24" />

        <OrganizationSwitcher />

        {permissions?.can("get", "Project") && (
          <>
            <Slash className="text-border size-3 -rotate-24" />
            <ProjectSwitcher />
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <PendingInvites />
        <Slash className="text-border size-3 -rotate-45" />
        <ThemeSwitcher />
        <Slash className="text-border size-3 -rotate-45" />
        <ProfileButton />
      </div>
    </header>
  );
}
