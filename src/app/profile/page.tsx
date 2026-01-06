import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
      redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          {profile ? (
              <>
                <p><strong>Name:</strong> {profile.full_name || 'Not set'}</p>
                <p><strong>Role:</strong> {profile.role}</p>
                <p><strong>Relation:</strong> {profile.relation || 'Not set'}</p>
              </>
          ) : (
              <p className="text-muted-foreground">Profile details not found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
