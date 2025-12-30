import { Slack, Slash } from "lucide-react";
import { ProfileButton } from "./profile-button";
import { OrganizationSwitcher } from "./organization-switcher";
import { ability } from "@/auth/auth";
import { Separator } from "./ui/separator";
import { ThemeSwitcher } from "./theme/theme-switcher";

export async function Header() {
  const permissions = await ability();

  return (
    <header className="mx-auto flex max-w-300 items-center justify-between border-b pb-4">
      <div className="flex items-center gap-3">
        <Slack className="light:invert" />

        <Slash className="text-border size-3 -rotate-24" />

        <OrganizationSwitcher />

        {permissions?.can("get", "Project") && <p>projetos</p>}
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <Separator orientation="vertical" className="h-5" />
        <ProfileButton />
      </div>
    </header>
  );
}
