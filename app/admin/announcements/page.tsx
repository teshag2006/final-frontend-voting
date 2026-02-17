'use client';

import React, { useState, useEffect } from 'react';
import { announcementService, Announcement, AnnouncementType } from '@/lib/services/announcementService';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus, Edit2, Trash2, Calendar } from 'lucide-react';

export default function AnnouncementsPage() {
  return (
    <ProtectedRouteWrapper requiredRole="admin">
      <AnnouncementsContent />
    </ProtectedRouteWrapper>
  );
}

function AnnouncementsContent() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as AnnouncementType,
    priority: 50,
    isDismissible: true,
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = () => {
    const all = announcementService.getAllAnnouncements();
    setAnnouncements(all);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const updated = announcementService.updateAnnouncement(editingId, formData);
      if (updated) {
        loadAnnouncements();
        setEditingId(null);
        setShowForm(false);
      }
    } else {
      announcementService.createAnnouncement(
        formData.title,
        formData.message,
        formData.type,
        {
          priority: formData.priority,
          isDismissible: formData.isDismissible,
          createdBy: 'admin-001',
        }
      );
      loadAnnouncements();
      setShowForm(false);
    }

    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 50,
      isDismissible: true,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this announcement?')) {
      announcementService.deleteAnnouncement(id);
      loadAnnouncements();
    }
  };

  const handleEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setFormData({
      title: ann.title,
      message: ann.message,
      type: ann.type,
      priority: ann.priority,
      isDismissible: ann.isDismissible,
    });
    setShowForm(true);
  };

  const getTypeColor = (type: AnnouncementType) => {
    const colors: Record<AnnouncementType, string> = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800',
      maintenance: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || colors.info;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-slate-400 mt-1">Manage system announcements and banners</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Create'} Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="success">Success</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isDismissible}
                  onChange={(e) => setFormData({ ...formData, isDismissible: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm">Users can dismiss this announcement</label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Save Announcement</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {announcements.map((ann) => {
          const isActive = new Date(ann.startDate) < new Date() && new Date() < new Date(ann.endDate);

          return (
            <Card key={ann.id} className={`bg-slate-800 border-slate-700 ${!isActive ? 'opacity-50' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(ann.type)}`}>
                        {ann.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">Priority: {ann.priority}</span>
                      {!isActive && <span className="text-xs text-yellow-400">Inactive</span>}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{ann.title}</h3>
                    <p className="text-slate-300 text-sm mb-3">{ann.message}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(ann.startDate).toLocaleDateString()}
                      </span>
                      <span>Target: {ann.targetRoles.join(', ')}</span>
                      <span>{ann.isDismissible ? 'Dismissible' : 'Persistent'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(ann)}
                      className="gap-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(ann.id)}
                      className="gap-1 text-red-400 hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
