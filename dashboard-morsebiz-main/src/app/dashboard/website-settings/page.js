'use client';

import { useRouter } from 'next/navigation';
import { Settings, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

const SettingsCard = ({ title, description, icon: Icon, href, onClick }) => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={onClick}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </CardHeader>
  </Card>
);

export default function WebsiteSettingsPage() {
  const router = useRouter();

  const settingsItems = [
    {
      title: 'Homepage Slider',
      description: 'Manage homepage slider images and content',
      icon: ImageIcon,
      href: '/dashboard/website-settings/homepage-slider',
      onClick: () => router.push('/dashboard/website-settings/homepage-slider')
    }
  ];

  return (
    <RoleProtectedRoute allowedRoles={['super-admin', 'admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Website Settings</h1>
            <p className="text-muted-foreground">Manage your website configuration and content</p>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {settingsItems.map((item) => (
            <SettingsCard
              key={item.title}
              title={item.title}
              description={item.description}
              icon={item.icon}
              href={item.href}
              onClick={item.onClick}
            />
          ))}
        </div>
      </div>
    </RoleProtectedRoute>
  );
}