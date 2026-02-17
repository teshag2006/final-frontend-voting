'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Lock, CreditCard, Bell, Download } from 'lucide-react'

interface UserProfilePageProps {
  userData: {
    id: string
    name: string
    email: string
    phone?: string
    joinDate: string
    avatar?: string
  }
  paymentHistory?: Array<{
    id: string
    date: string
    amount: number
    status: 'completed' | 'pending' | 'failed'
    description: string
  }>
  voteHistory?: Array<{
    id: string
    date: string
    contestant: string
    votes: number
  }>
  onProfileUpdate?: (data: Partial<typeof userData>) => Promise<void>
  onPasswordChange?: (oldPassword: string, newPassword: string) => Promise<void>
}

export function UserProfilePage({
  userData,
  paymentHistory = [],
  voteHistory = [],
  onProfileUpdate,
  onPasswordChange,
}: UserProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState(userData)
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '', confirm: '' })
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await onProfileUpdate?.(formData)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert('Passwords do not match')
      return
    }
    setIsSaving(true)
    try {
      await onPasswordChange?.(passwordForm.old, passwordForm.new)
      setPasswordForm({ old: '', new: '', confirm: '' })
      setShowPasswordForm(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="votes" className="gap-2">
            <Badge variant="outline">Votes</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </div>
                <Button
                  variant={isEditing ? 'outline' : 'default'}
                  onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Member Since</Label>
                  <Input value={formData.joinDate} disabled className="bg-muted" />
                </div>
              </div>

              {isEditing && (
                <Alert>
                  <AlertDescription>
                    Changes will be saved to your account. Make sure all information is correct.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div>
                <h3 className="font-semibold mb-4">Change Password</h3>
                {!showPasswordForm ? (
                  <Button onClick={() => setShowPasswordForm(true)} variant="outline">
                    Change Password
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="old-password">Current Password</Label>
                      <Input
                        id="old-password"
                        type="password"
                        value={passwordForm.old}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, old: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordForm.new}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, new: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handlePasswordChange} disabled={isSaving}>
                        {isSaving ? 'Updating...' : 'Update Password'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowPasswordForm(false)}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Two-Factor Authentication */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>

              {/* Active Sessions */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Active Sessions</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium text-sm">Current Session</p>
                      <p className="text-xs text-muted-foreground">Chrome • Mac OS</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </div>
                <Button variant="outline" className="mt-3">
                  Sign Out from All Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View and manage your payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No payment history yet</p>
              ) : (
                <div className="space-y-2">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">{payment.description}</p>
                        <p className="text-xs text-muted-foreground">{payment.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                        <Badge
                          variant={
                            payment.status === 'completed'
                              ? 'default'
                              : payment.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" className="w-full mt-4 gap-2">
                <Download className="h-4 w-4" />
                Download Receipts
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Votes Tab */}
        <TabsContent value="votes">
          <Card>
            <CardHeader>
              <CardTitle>Vote History</CardTitle>
              <CardDescription>View your recent voting activity</CardDescription>
            </CardHeader>
            <CardContent>
              {voteHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No votes recorded yet</p>
              ) : (
                <div className="space-y-2">
                  {voteHistory.map((vote) => (
                    <div key={vote.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{vote.contestant}</p>
                        <p className="text-xs text-muted-foreground">{vote.date}</p>
                      </div>
                      <div className="font-semibold">{vote.votes} votes</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
