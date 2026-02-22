'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { UserNav } from '@/components/auth/user-nav';
import { Edit, Lock, Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function ProfileContent() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <UserNav />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Profile Card */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-white text-2xl">Profile Information</CardTitle>
                <CardDescription className="text-slate-400">
                  View and manage your profile details
                </CardDescription>
              </div>
              <Link href="/profile/edit">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <img
                  src={user.avatar || 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Default%20Ethiopia'}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-2 border-slate-600"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-slate-400 mt-1">{user.email}</p>
                <div className="mt-3 flex gap-2">
                  <span className={`inline-block px-3 py-1 text-sm rounded-full font-semibold
                    ${user.role === 'admin' ? 'bg-amber-950 text-amber-300' :
                      user.role === 'contestant' ? 'bg-green-950 text-green-300' :
                      user.role === 'media' ? 'bg-purple-950 text-purple-300' :
                      'bg-cyan-950 text-cyan-300'}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  {user.profile?.verified && (
                    <span className="inline-block px-3 py-1 text-sm rounded-full font-semibold bg-green-950 text-green-300">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.profile?.bio && (
                <div>
                  <label className="text-sm font-semibold text-slate-400">Bio</label>
                  <p className="text-white mt-1">{user.profile.bio}</p>
                </div>
              )}
              {user.profile?.location && (
                <div>
                  <label className="text-sm font-semibold text-slate-400">Location</label>
                  <p className="text-white mt-1">{user.profile.location}</p>
                </div>
              )}
              {user.profile?.phone && (
                <div>
                  <label className="text-sm font-semibold text-slate-400">Phone</label>
                  <p className="text-white mt-1">{user.profile.phone}</p>
                </div>
              )}
            </div>

            {/* Account Details */}
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-400">Email</label>
                  <p className="text-white mt-1">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-400">Account Type</label>
                  <p className="text-white mt-1 capitalize">{user.role}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-400">Member Since</label>
                  <p className="text-white mt-1">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-400">Verification Status</label>
                  <p className="text-white mt-1">
                    {user.profile?.verified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/profile/edit">
            <Card className="border-slate-700 bg-slate-800 hover:border-blue-600 transition cursor-pointer h-full">
              <CardContent className="pt-6">
                <Edit className="w-6 h-6 text-blue-400 mb-2" />
                <h3 className="font-semibold text-white">Edit Profile</h3>
                <p className="text-sm text-slate-400 mt-1">Update your profile information</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/settings">
            <Card className="border-slate-700 bg-slate-800 hover:border-purple-600 transition cursor-pointer h-full">
              <CardContent className="pt-6">
                <Settings className="w-6 h-6 text-purple-400 mb-2" />
                <h3 className="font-semibold text-white">Preferences</h3>
                <p className="text-sm text-slate-400 mt-1">Manage your settings</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/security">
            <Card className="border-slate-700 bg-slate-800 hover:border-red-600 transition cursor-pointer h-full">
              <CardContent className="pt-6">
                <Lock className="w-6 h-6 text-red-400 mb-2" />
                <h3 className="font-semibold text-white">Security</h3>
                <p className="text-sm text-slate-400 mt-1">Change password & sessions</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRouteWrapper>
      <ProfileContent />
    </ProtectedRouteWrapper>
  );
}

