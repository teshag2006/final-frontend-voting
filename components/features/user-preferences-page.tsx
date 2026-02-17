'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, Eye, Lock, Save } from 'lucide-react'

interface UserPreferencesPageProps {
  preferences: {
    emailNotifications: boolean
    pushNotifications: boolean
    smsNotifications: boolean
    marketingEmails: boolean
    dataSharing: boolean
    defaultLanguage: string
    theme: 'light' | 'dark' | 'system'
    compactView: boolean
  }
  onSave?: (preferences: Record<string, boolean | string>) => Promise<void>
}

export function UserPreferencesPage({
  preferences: initialPreferences,
  onSave,
}: UserPreferencesPageProps) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleToggle = (key: string) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key as keyof typeof prev] }
      setHasChanges(true)
      return updated
    })
  }

  const handleSelect = (key: string, value: string | boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave?.(preferences)
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notif" className="font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                id="email-notif"
                checked={preferences.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notif" className="font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Get real-time updates in browser</p>
              </div>
              <Switch
                id="push-notif"
                checked={preferences.pushNotifications}
                onCheckedChange={() => handleToggle('pushNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notif" className="font-medium">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive important alerts via SMS</p>
              </div>
              <Switch
                id="sms-notif"
                checked={preferences.smsNotifications}
                onCheckedChange={() => handleToggle('smsNotifications')}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label htmlFor="marketing" className="font-medium">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Promotional offers and news</p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketingEmails}
                onCheckedChange={() => handleToggle('marketingEmails')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Privacy & Data
          </CardTitle>
          <CardDescription>Control how your data is used</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="data-sharing" className="font-medium">Data Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Allow us to improve services with your anonymized data
              </p>
            </div>
            <Switch
              id="data-sharing"
              checked={preferences.dataSharing}
              onCheckedChange={() => handleToggle('dataSharing')}
            />
          </div>

          <Alert>
            <AlertDescription>
              Your data is always encrypted and never sold to third parties. Read our{' '}
              <a href="#" className="text-accent hover:underline">
                privacy policy
              </a>
              .
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Display Settings
          </CardTitle>
          <CardDescription>Customize your app appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme */}
          <div>
            <Label className="font-medium mb-3 block">Theme</Label>
            <RadioGroup
              value={preferences.theme}
              onValueChange={(value) => handleSelect('theme', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">System</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Language */}
          <div>
            <Label className="font-medium mb-3 block">Language</Label>
            <RadioGroup
              value={preferences.defaultLanguage}
              onValueChange={(value) => handleSelect('defaultLanguage', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en">English</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fr" id="fr" />
                <Label htmlFor="fr">Français</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sw" id="sw" />
                <Label htmlFor="sw">Kiswahili</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Compact View */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact" className="font-medium">Compact View</Label>
                <p className="text-sm text-muted-foreground">Show more content per page</p>
              </div>
              <Switch
                id="compact"
                checked={preferences.compactView}
                onCheckedChange={() => handleToggle('compactView')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2 justify-end sticky bottom-6">
        {hasChanges && (
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        )}
      </div>
    </div>
  )
}
