import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AlertTriangle, Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateOrganization() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Create organization</h1>

      <form className="space-y-4">
        {/* {success === false && message && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Sign in failed!</AlertTitle>
            <AlertDescription>
              <p>{message}</p>
            </AlertDescription>
          </Alert>
        )} */}

        <div className="space-y-1">
          <Label htmlFor="name">Organization Name</Label>
          <Input name="name" type="text" id="name" />

          {/* {errors?.name && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {errors.name[0]}
            </p>
          )} */}
        </div>

        <div className="space-y-1">
          <Label htmlFor="domain">E-mail domain</Label>
          <Input
            name="domain"
            type="text"
            id="domain"
            inputMode="url"
            placeholder="example.com"
          />

          {/* {errors?.email && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {errors.email[0]}
            </p>
          )} */}
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <Checkbox
              name="shouldAttackUsersByDomain"
              id="shouldAttackUsersByDomain"
              className="translate-y-0.5"
            />
            <label htmlFor="shouldAttackUsersByDomain" className="space-y-1">
              <span className="text-sm leading-none font-medium">
                Auto-join new members
              </span>
              <p className="text-muted-foreground text-sm">
                This will automatically invite all members with same e-mail
                domain to this organization.
              </p>
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full">
          {/* {isPending && <Loader2 className="size-4 animate-spin" />} */}
          Save organization
        </Button>
      </form>
    </div>
  );
}
