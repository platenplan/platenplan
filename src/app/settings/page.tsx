import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ExportDataButton from "@/components/ExportDataButton";
import ManageCategoriesDialog from "@/components/forms/ManageCategoriesDialog";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span>Dark Mode</span>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
              <span>Export Expenses (CSV)</span>
              <ExportDataButton />
          </div>
          <div className="flex items-center justify-between">
              <span>Categories</span>
              <ManageCategoriesDialog />
          </div>
          <div className="flex items-center justify-between">
              <span>Budgets</span>
              <Button variant="outline" disabled>Coming Soon</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
